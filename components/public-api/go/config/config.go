// Copyright (c) 2022 Gitpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package config

type Configuration struct {
	GitpodServiceURL string `json:"gitpodServiceURL"`
	GRPCPort         int    `json:"grpcPort"`
	PProfPort        int    `json:"pprofPort"`
}
