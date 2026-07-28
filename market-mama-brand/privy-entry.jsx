import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { PrivyProvider, usePrivy, useLogin, useLogout } from '@privy-io/react-auth';

const PRIVY_APP_ID = "5QTVCAo3hoBRmse1JXmPwghbfeSmcAGcj7pMmwgqhNsnsvVzK1dgPy9B9Gud7f874NzJXTtgrXtLdRoJzG3fwvQG";

let pendingOpenModal = false;

if (typeof window !== 'undefined') {
    window.openPrivyModal = function() {
        console.log("🔒 Triggering Official Privy React Modal...");
        if (typeof window._privyLoginFn === 'function') {
            window._privyLoginFn();
        } else {
            console.log("⏳ Privy SDK initializing, queuing modal open request...");
            pendingOpenModal = true;
        }
    };
}

function PrivyBridgeComponent() {
    const { ready, authenticated, user } = usePrivy();
    const { login } = useLogin({
        onComplete: (u) => {
            const userObj = u.user || u;
            const identity = userObj.email?.address || userObj.phone?.number || userObj.wallet?.address || userObj.google?.email || 'Privy User';
            const displayName = userObj.google?.name || userObj.email?.address?.split('@')[0] || identity;
            window.dispatchEvent(new CustomEvent('privy:login', { detail: { user: userObj, identity, displayName } }));
        }
    });
    const { logout } = useLogout({
        onSuccess: () => {
            window.dispatchEvent(new CustomEvent('privy:logout'));
        }
    });

    useEffect(() => {
        window._privyLoginFn = login;
        window.privyLogout = logout;

        if (pendingOpenModal) {
            pendingOpenModal = false;
            login();
        }
    }, [login, logout]);

    useEffect(() => {
        if (ready && authenticated && user) {
            const identity = user.email?.address || user.phone?.number || user.wallet?.address || user.google?.email || 'Privy User';
            const displayName = user.google?.name || user.email?.address?.split('@')[0] || identity;
            window.dispatchEvent(new CustomEvent('privy:restore', { detail: { user, identity, displayName } }));
        }
    }, [ready, authenticated, user]);

    return null;
}

if (typeof window !== 'undefined') {
    const initPrivyRoot = () => {
        let container = document.getElementById('privy-root');
        if (!container) {
            container = document.createElement('div');
            container.id = 'privy-root';
            document.body.appendChild(container);
        }
        const root = createRoot(container);
        root.render(
            React.createElement(PrivyProvider, {
                appId: PRIVY_APP_ID,
                config: {
                    loginMethods: ['email', 'sms', 'google', 'twitter', 'telegram', 'wallet'],
                    appearance: {
                        theme: 'light',
                        accentColor: '#6366f1'
                    }
                }
            }, React.createElement(PrivyBridgeComponent))
        );
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPrivyRoot);
    } else {
        initPrivyRoot();
    }
}
