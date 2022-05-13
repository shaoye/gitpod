// Copyright (c) 2020 Gitpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package cmd

import (
	"context"
	"fmt"
	"time"

	"github.com/heptiolabs/healthcheck"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"github.com/spf13/cobra"
	"golang.org/x/xerrors"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	grpc_health "google.golang.org/grpc/health"
	"google.golang.org/grpc/health/grpc_health_v1"

	"github.com/gitpod-io/gitpod/common-go/baseserver"
	common_grpc "github.com/gitpod-io/gitpod/common-go/grpc"
	"github.com/gitpod-io/gitpod/common-go/log"
	"github.com/gitpod-io/gitpod/ws-daemon/pkg/config"
	"github.com/gitpod-io/gitpod/ws-daemon/pkg/daemon"
)

const grpcServerName = "wsdaemon"

// serveCmd represents the serve command
var runCmd = &cobra.Command{
	Use:   "run",
	Short: "Connects to the messagebus and starts the workspace monitor",

	Run: func(cmd *cobra.Command, args []string) {
		cfg, err := config.Read(configFile)
		if err != nil {
			log.WithError(err).Fatal("cannot read configuration. Maybe missing --config?")
		}

		reg := prometheus.NewRegistry()
		reg.MustRegister(
			collectors.NewGoCollector(),
			collectors.NewProcessCollector(collectors.ProcessCollectorOpts{}),
		)

		dmn, err := daemon.NewDaemon(cfg.Daemon, prometheus.WrapRegistererWithPrefix("gitpod_ws_daemon_", reg))
		if err != nil {
			log.WithError(err).Fatal("cannot create daemon")
		}

		health := healthcheck.NewHandler()
		srv, err := baseserver.New(grpcServerName,
			baseserver.WithGRPC(&cfg.Service),
			baseserver.WithMetricsRegistry(reg),
			baseserver.WithHealthHandler(health),
			baseserver.WithGRPCHealthService(grpc_health.NewServer()),
		)
		if err != nil {
			log.WithError(err).Fatal("cannot set up server")
		}

		common_grpc.SetupLogging()
		dmn.Register(srv.GRPC())

		health.AddReadinessCheck("grpc-server", grpcProbe(cfg.Service))
		health.AddReadinessCheck("ws-daemon", dmn.ReadinessProbe())

		err = dmn.Start()
		if err != nil {
			log.WithError(err).Fatal("cannot start daemon")
		}

		go config.Watch(configFile, dmn.ReloadConfig)

		err = srv.ListenAndServe()
		if err != nil {
			log.Fatal(err)
		}
	},
}

func init() {
	rootCmd.AddCommand(runCmd)
}

func grpcProbe(cfg baseserver.ServerConfiguration) func() error {
	return func() error {
		secopt := grpc.WithInsecure()
		if cfg.TLS != nil && cfg.TLS.CertPath != "" {
			tlsConfig, err := common_grpc.ClientAuthTLSConfig(
				cfg.TLS.CAPath, cfg.TLS.CertPath, cfg.TLS.KeyPath,
				common_grpc.WithSetRootCAs(true),
				common_grpc.WithServerName(grpcServerName),
			)
			if err != nil {
				return xerrors.Errorf("cannot load ws-daemon certificate: %w", err)
			}

			secopt = grpc.WithTransportCredentials(credentials.NewTLS(tlsConfig))
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()

		conn, err := grpc.DialContext(ctx, cfg.Address, secopt)
		if err != nil {
			return err
		}
		defer conn.Close()

		client := grpc_health_v1.NewHealthClient(conn)
		check, err := client.Check(ctx, &grpc_health_v1.HealthCheckRequest{})
		if err != nil {
			return err
		}

		if check.Status == grpc_health_v1.HealthCheckResponse_SERVING {
			return nil
		}

		return fmt.Errorf("grpc service not ready")
	}
}
