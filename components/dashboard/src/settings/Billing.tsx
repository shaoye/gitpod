/**
 * Copyright (c) 2022 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { useContext, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { PageWithSubMenu } from "../components/PageWithSubMenu";
import { PaymentContext } from "../payment-context";
import { getGitpodService } from "../service/service";
import getSettingsMenu from "./settings-menu";

// Stripe publishable key
const stripePromise = loadStripe(
    "pk_test_51Kxur7GadRXm50o3I5rJA3ony1tcfu3d3CNwpTXTzADdY2HJioFMWLgSkc5whtRFQjo9Pnd3zXaGerKPqtf7DDCy00XAoMdn6a",
);

export default function Billing() {
    const { showPaymentUI } = useContext(PaymentContext);
    const [stripeClientSecret, setStripeClientSecret] = useState<string | undefined>();

    useEffect(() => {
        (async () => {
            const secret = await getGitpodService().server.getStripeClientSecret();
            if (secret) {
                setStripeClientSecret(secret);
            }
        })();
    }, []);

    return (
        <PageWithSubMenu
            subMenu={getSettingsMenu({ showPaymentUI })}
            title="Billing"
            subtitle="Usage-Based / Pay-As-You-Go"
        >
            <h3>Billing</h3>
            {stripeClientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                    <CheckoutForm />
                </Elements>
            )}
        </PageWithSubMenu>
    );
}

function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) {
            return;
        }
        const result = await stripe.confirmSetup({
            //`Elements` instance that was used to create the Payment Element
            elements,
            confirmParams: {
                return_url: window.location.href + "#success",
            },
        });
        if (result.error) {
            // Show error to your customer (for example, payment details incomplete)
            console.error(result.error.message);
        } else {
            // Your customer will be redirected to your `return_url`. For some payment
            // methods like iDEAL, your customer will be redirected to an intermediate
            // site first to authorize the payment, then redirected to the `return_url`.
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <button disabled={!stripe}>Submit</button>
        </form>
    );
}
