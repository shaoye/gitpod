/*
Copyright © 2022 NAME HERE <EMAIL ADDRESS>

*/

package preview

import "fmt"

type Preview struct {
	Name           string
	KubeconfigPath string
}

func New() *Preview {
	return &Preview{
		Name:           "",
		KubeconfigPath: "",
	}
}

func (p *Preview) InstallContext(shouldWait bool) error {
	fmt.Println("Install Context isn't implemented")
	return nil
}
