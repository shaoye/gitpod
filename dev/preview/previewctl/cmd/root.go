/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>

*/
package cmd

import (
	"github.com/spf13/cobra"
)

func RootCmd() *cobra.Command {
	cmd := &cobra.Command{
		Use:   "previewctl",
		Short: "Your best friend when interacting with Preview Environments :)",
		Long: `A longer description that spans multiple lines and likely contains
	examples and usage of using our application.`,
		// Uncomment the following line if your bare application
		// has an action associated with it:
		// Run: func(cmd *cobra.Command, args []string) { },
	}
	cmd.AddCommand(
	// installContextCmd()
	)
	return cmd
}
