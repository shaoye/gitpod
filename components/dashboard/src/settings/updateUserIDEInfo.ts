/**
 * Copyright (c) 2022 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { User } from "@gitpod/gitpod-protocol";
import { getGitpodService } from "../service/service";

const updateUserIDEInfo = async (user: User, selectedIde: string, useLatestVersion: boolean) => {
    const additionalData = user?.additionalData ?? {};
    const settings = additionalData.ideSettings ?? {};
    settings.settingVersion = "2.0";
    settings.defaultIde = selectedIde;
    settings.useLatestVersion = useLatestVersion;
    additionalData.ideSettings = settings;
    getGitpodService()
        .server.trackEvent({
            event: "ide_configuration_changed",
            properties: settings,
        })
        .then()
        .catch(console.error);
    await getGitpodService().server.updateLoggedInUser({ additionalData });
};

export default updateUserIDEInfo;
