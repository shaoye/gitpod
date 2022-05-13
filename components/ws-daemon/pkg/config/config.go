// Copyright (c) 2021 Gitpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package config

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"os"
	"time"

	"golang.org/x/xerrors"

	"github.com/gitpod-io/gitpod/common-go/baseserver"
	"github.com/gitpod-io/gitpod/common-go/log"
	"github.com/gitpod-io/gitpod/ws-daemon/pkg/daemon"
)

func Read(fn string) (*Config, error) {
	ctnt, err := os.ReadFile(fn)
	if err != nil {
		return nil, xerrors.Errorf("cannot read config file: %w", err)
	}

	var cfg Config
	dec := json.NewDecoder(bytes.NewReader(ctnt))
	dec.DisallowUnknownFields()
	err = dec.Decode(&cfg)
	if err != nil {
		return nil, xerrors.Errorf("cannot parse config file: %w", err)
	}

	return &cfg, nil
}

// watchConfig watches the configuration file and if changed reloads the static layer
func Watch(fn string, cb func(context.Context, *daemon.Config) error) {
	hashConfig := func() (hash string, err error) {
		f, err := os.Open(fn)
		if err != nil {
			return "", err
		}
		defer f.Close()

		h := sha256.New()
		_, err = io.Copy(h, f)
		if err != nil {
			return "", err
		}

		return hex.EncodeToString(h.Sum(nil)), nil
	}
	reloadConfig := func() error {
		cfg, err := Read(fn)
		if err != nil {
			return err
		}

		ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
		defer cancel()

		return cb(ctx, &cfg.Daemon)
	}

	var (
		tick    = time.NewTicker(30 * time.Second)
		oldHash string
	)
	defer tick.Stop()
	for range tick.C {
		currentHash, err := hashConfig()
		if err != nil {
			log.WithError(err).Warn("cannot check if config has changed")
		}

		if oldHash == "" {
			oldHash = currentHash
		}
		if currentHash == oldHash {
			continue
		}
		oldHash = currentHash

		err = reloadConfig()
		if err == nil {
			log.Info("configuration was updated - reloaded static layer config")
		} else {
			log.WithError(err).Error("cannot reload config - config hot reloading did not work")
		}
	}
}

type Config struct {
	Daemon  daemon.Config                  `json:"daemon"`
	Service baseserver.ServerConfiguration `json:"service"`
}
