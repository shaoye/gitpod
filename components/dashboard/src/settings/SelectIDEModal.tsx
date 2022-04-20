/**
 * Copyright (c) 2022 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { User } from "@gitpod/gitpod-protocol";
import SelectIDE from "./SelectIDE";
import Modal from "../components/Modal";
import updateUserIDEInfo from "./updateUserIDEInfo";
import { UserContext } from "../user-context";

export default function () {
    const { user, setUser } = useContext(UserContext);
    const [visible, setVisible] = useState(true);
    const [useLatest, setUseLatest] = useState(false);

    const handleContinue = async () => {
        setVisible(false);

        if (!user || !User.isOnboardingUser(user)) {
            return;
        }

        const defaultIde = "code";

        await updateUserIDEInfo(user, defaultIde, useLatest);

        setUser({ ...user });
    };

    return (
        <Modal visible={visible} onClose={handleContinue} closeable={true} className="_max-w-xl">
            <h3 className="pb-2">Select Editor</h3>
            <div className="border-t border-b border-gray-200 dark:border-gray-800 mt-2 -mx-6 px-6 py-4">
                <p className="text-gray-500 text-base pb-3">
                    Choose the editor for opening workspaces. You can always change later the editor in{" "}
                    <Link
                        to={"/preferences"}
                        className="text-blue-400 dark:text-blue-600 hover:text-blue-600 dark:hover:text-blue-400 truncate"
                    >
                        user preferences
                    </Link>
                    .
                </p>
                <SelectIDE onSelectUseLatest={setUseLatest} />
            </div>
            <div className="flex justify-end mt-6">
                <button onClick={handleContinue} className="ml-2">
                    Continue
                </button>
            </div>
        </Modal>
    );
}
