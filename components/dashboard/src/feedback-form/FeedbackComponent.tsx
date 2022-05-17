/**
 * Copyright (c) 2022 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { useState } from "react";
import starryEyed from "../images/feedback/starry-eyed-emoji.svg";
import happy from "../images/feedback/happy-emoji.svg";
import meh from "../images/feedback/meh-emoji.svg";
import crying from "../images/feedback/crying-emoji.svg";
import { trackEvent } from "../Analytics";

function FeedbackComponent(props: { onClose: () => void; onSubmit: () => void }) {
    const [text, setText] = useState<string>("");
    const [selectedEmoji, setSelectedEmoji] = useState<number | undefined>();

    const emojiScore: any = {
        starry: 4,
        happy: 3,
        meh: 2,
        crying: 1,
    };

    const onSubmit = () => {
        if (selectedEmoji) {
            const feedbackObj = {
                selectedEmoji,
                text,
                href: window.location.href,
                path: window.location.pathname,
            };
            trackEvent("feedback_submitted", feedbackObj);
        }

        props.onSubmit();
    };

    const handleClick = (target: any) => {
        const title = target.title;
        setSelectedEmoji(emojiScore[title]);
    };

    const emojiGroup = (width: number) => {
        return (
            <>
                <button
                    className={
                        "hover:scale-150 transform bg-transparent bottom-5 right-5 cursor-pointer " +
                        (selectedEmoji === emojiScore["starry"] ? "" : "grayed")
                    }
                    onClick={(e) => handleClick(e.target)}
                >
                    <img src={starryEyed} alt="starry eyed emoji" width={width || "24px"} title="starry" />
                </button>
                <button
                    className={
                        "hover:scale-150 transform bg-transparent bottom-5 right-5 cursor-pointer " +
                        (selectedEmoji === emojiScore["happy"] ? "" : "grayed")
                    }
                    onClick={(e) => handleClick(e.target)}
                >
                    <img
                        className="bottom-5 right-5 cursor-pointer"
                        title="happy"
                        src={happy}
                        alt="happy emoji"
                        width={width}
                    />
                </button>
                <button
                    className={
                        "hover:scale-150 transform bg-transparent bottom-5 right-5 cursor-pointer " +
                        (selectedEmoji === emojiScore["meh"] ? "" : "grayed")
                    }
                    onClick={(e) => handleClick(e.target)}
                >
                    <img
                        className="bottom-5 right-5 cursor-pointer"
                        title="meh"
                        src={meh}
                        alt="meh emoji"
                        width={width}
                    />
                </button>
                <button
                    className={
                        "hover:scale-150 transform bg-transparent bottom-5 right-5 cursor-pointer " +
                        (selectedEmoji === emojiScore["crying"] ? "" : "grayed")
                    }
                    onClick={(e) => handleClick(e.target)}
                >
                    <img
                        className="bottom-5 right-5 cursor-pointer"
                        title="crying"
                        src={crying}
                        alt="crying emoji"
                        width={width}
                    />
                </button>
            </>
        );
    };
    return (
        <>
            <h3 className="mb-4">Send Feedback</h3>
            {selectedEmoji ? (
                <div className="flex flex-col -mx-6 px-6 py-4 border-t border-b border-gray-200 dark:border-gray-800">
                    <div className="relative">
                        <div className="absolute flex bottom-5 right-5 gap-3">{emojiGroup(24)}</div>
                        <textarea
                            style={{ height: "160px", borderRadius: "6px" }}
                            autoFocus
                            className="w-full"
                            name="name"
                            value={text}
                            placeholder="Your feedback..."
                            onChange={(e) => setText(e.target.value)}
                        />
                    </div>
                    <div>
                        <p className="pt-4">
                            Alternatively, consider opening{" "}
                            <a
                                className="gp-link"
                                href="https://github.com/gitpod-io/gitpod/issues/new?assignees=&labels=type%3A+bug&template=bug_report.yml"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {" "}
                                a bug report{" "}
                            </a>
                            or
                            <a
                                className="gp-link"
                                href="https://github.com/gitpod-io/gitpod/issues/new?assignees=&labels=&template=feature_request.md&title="
                                target="_blank"
                                rel="noreferrer"
                            >
                                {" "}
                                a feature request{" "}
                            </a>{" "}
                            in our issue tracker.
                        </p>
                    </div>
                    <div className="flex justify-end mt-6">
                        <button className="secondary" onClick={props.onClose}>
                            Cancel
                        </button>
                        <button className="ml-2" onClick={onSubmit}>
                            Send Feedback
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col -mx-6 px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                    <h4 className="text-center text-xl mb-4">We'd love to know what you think!</h4>

                    <div className="flex items-center justify-center w-full space-x-3">{emojiGroup(50)}</div>
                </div>
            )}
        </>
    );
}

export default FeedbackComponent;
