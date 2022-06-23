// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CallComposite, createAzureCommunicationCallAdapter, toFlatCommunicationIdentifier } from '@azure/communication-react';
import { Spinner } from '@fluentui/react';
import React, { useEffect, useRef, useState } from 'react';
import { useSwitchableFluentTheme } from '../theming/SwitchableFluentThemeProvider';
import { createAutoRefreshingCredential } from '../utils/credential';
import MobileDetect from 'mobile-detect';
const detectMobileSession = () => !!new MobileDetect(window.navigator.userAgent).mobile();
export const CallScreen = (props) => {
    const { token, userId, callLocator, displayName, webAppTitle, onCallEnded } = props;
    const [adapter, setAdapter] = useState();
    const callIdRef = useRef();
    const adapterRef = useRef();
    const { currentTheme, currentRtl } = useSwitchableFluentTheme();
    const [isMobileSession, setIsMobileSession] = useState(detectMobileSession());
    useEffect(() => {
        if (!callIdRef.current) {
            return;
        }
        console.log(`Call Id: ${callIdRef.current}`);
    }, [callIdRef.current]);
    // Whenever the sample is changed from desktop -> mobile using the emulator, make sure we update the formFactor.
    useEffect(() => {
        const updateIsMobile = () => setIsMobileSession(detectMobileSession());
        window.addEventListener('resize', updateIsMobile);
        return () => window.removeEventListener('resize', updateIsMobile);
    }, []);
    useEffect(() => {
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const adapter = yield createAzureCommunicationCallAdapter({
                userId,
                displayName,
                credential: createAutoRefreshingCredential(toFlatCommunicationIdentifier(userId), token),
                locator: callLocator
            });
            adapter.on('callEnded', () => {
                onCallEnded();
            });
            adapter.on('error', (e) => {
                // Error is already acted upon by the Call composite, but the surrounding application could
                // add top-level error handling logic here (e.g. reporting telemetry).
                console.log('Adapter error event:', e);
            });
            adapter.onStateChange((state) => {
                var _a;
                const pageTitle = convertPageStateToString(state);
                document.title = `${pageTitle} - ${webAppTitle}`;
                callIdRef.current = (_a = state === null || state === void 0 ? void 0 : state.call) === null || _a === void 0 ? void 0 : _a.id;
            });
            setAdapter(adapter);
            adapterRef.current = adapter;
        }))();
        return () => {
            var _a;
            (_a = adapterRef === null || adapterRef === void 0 ? void 0 : adapterRef.current) === null || _a === void 0 ? void 0 : _a.dispose();
        };
    }, [callLocator, displayName, token, userId, onCallEnded]);
    if (!adapter) {
        return React.createElement(Spinner, { label: 'Creating adapter', ariaLive: "assertive", labelPosition: "top" });
    }
    return (React.createElement(CallComposite, { adapter: adapter, fluentTheme: currentTheme.theme, rtl: currentRtl, callInvitationUrl: window.location.href, formFactor: isMobileSession ? 'mobile' : 'desktop' }));
};
const convertPageStateToString = (state) => {
    switch (state.page) {
        case 'accessDeniedTeamsMeeting':
            return 'error';
        case 'leftCall':
            return 'end call';
        case 'removedFromCall':
            return 'end call';
        default:
            return `${state.page}`;
    }
};
//# sourceMappingURL=CallScreen.js.map