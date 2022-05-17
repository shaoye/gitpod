/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>

*/

package cmd

import (
	"log"

	"github.com/gitpod-io/gitpod/dev/preview/previewctl/pkg/preview"
	"github.com/spf13/cobra"
)

var shouldWait = false

func installContextCmd() *cobra.Command {
	p := preview.New()

	cmd := &cobra.Command{
		Use:   "install-context",
		Short: "Installs the kubectl context of a preview environment.",
		PreRunE: func(cmd *cobra.Command, args []string) error {
			// getGitBranch
			// Parses preview name

			return nil
		},
		Run: func(cmd *cobra.Command, args []string) {
			err := p.InstallContext(shouldWait)
			if err != nil {
				log.Fatalf("Couldn't install context for the '%s' preview", p.Name)
			}
		},
	}

	cmd.Flags().BoolVar(&shouldWait, "wait", false, "If wait is enabled, previewctl will keep trying to install the kube-context every 30 seconds.")
	return cmd
}
