import { assign, createMachine } from 'xstate';

import { DocumentUploadSettings } from '@onefootprint/types';
import type { MachineContext, MachineEvents } from './types';

const createTransferMachine = (initialContext: MachineContext) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'mobile',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      // eslint-disable-next-line
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: { ...initialContext },
      states: {
        init: {
          always: [
            {
              description: 'If not running on mobile or tablet, and can transfer from desktop to mobile',
              cond: context =>
                context.device.type !== 'mobile' &&
                context.device.type !== 'tablet' &&
                !context.isTransferFromDesktopToMobileDisabled,
              target: 'qrRegister',
            },
            {
              cond: context => !!context.isSocialMediaBrowser,
              target: 'socialMediaBrowser',
            },
            {
              description:
                'We are on non-social media browser on mobile or desktop browser that has feature flag set to skip transfer to mobile',
              target: 'nonSocialMediaBrowser',
            },
          ],
        },
        nonSocialMediaBrowser: {
          always: [
            {
              target: 'newTabRequest',
              cond: context => !!context.missingRequirements.liveness && context.device.hasSupportForWebauthn,
            },
            {
              target: 'complete',
            },
          ],
        },
        socialMediaBrowser: {
          always: [
            {
              target: 'sms',
              description: 'If running in social media',
              cond: context => !!context.missingRequirements.documents.length,
            },
            {
              target: 'complete',
            },
          ],
        },
        sms: {
          on: {
            scopedAuthTokenGenerated: {
              actions: ['assignScopedAuthToken'],
            },
            d2pSessionStarted: {
              target: 'smsProcessing',
            },
            d2pSessionCompleted: {
              target: 'complete',
            },
            d2pSessionFailed: {
              target: 'complete',
            },
            d2pSessionExpired: {
              actions: ['clearScopedAuthToken'],
            },
          },
        },
        qrRegister: {
          on: {
            scopedAuthTokenGenerated: {
              actions: ['assignScopedAuthToken'],
            },
            d2pSessionStarted: {
              target: 'qrProcessing',
            },
            d2pSessionCompleted: {
              target: 'complete',
            },
            d2pSessionFailed: {
              target: 'complete',
            },
            d2pSessionCanceled: {
              actions: ['clearScopedAuthToken'],
            },
            d2pSessionExpired: {
              actions: ['clearScopedAuthToken'],
            },
            continueOnDesktop: [
              {
                target: 'confirmContinueOnDesktop',
                cond: ctx =>
                  !!ctx.missingRequirements.documents.length &&
                  !ctx.missingRequirements.documents.some(
                    req => req.uploadSettings === DocumentUploadSettings.preferUpload,
                  ),
                description:
                  'The document upload experience is better on mobile, so if the user is trying to upload on desktop, warn them we recommend they continue on mobile.',
              },
              {
                target: 'newTabRequest',
                actions: ['assignIsContinuingOnDesktop'],
                cond: ctx => !!ctx.missingRequirements.liveness && ctx.isInIframe && ctx.device.hasSupportForWebauthn,
                description:
                  'If the user wants to continue on desktop, and we have a passkey requirement in an iframe, open a new tab',
              },
              {
                target: 'complete',
              },
            ],
          },
        },
        confirmContinueOnDesktop: {
          on: {
            continueOnDesktop: [
              {
                target: 'newTabRequest',
                actions: ['assignIsContinuingOnDesktop'],
                cond: ctx => !!ctx.missingRequirements.liveness && ctx.isInIframe && ctx.device.hasSupportForWebauthn,
                description:
                  'If the user wants to continue on desktop, and we have a passkey requirement in an iframe, open a new tab',
              },
              {
                target: 'complete',
              },
            ],
            continueOnMobile: {
              target: 'qrRegister',
            },
          },
        },
        newTabRequest: {
          on: {
            scopedAuthTokenGenerated: {
              actions: ['assignScopedAuthToken'],
            },
            newTabOpened: {
              target: 'newTabProcessing',
              actions: ['assignTab'],
            },
          },
        },
        qrProcessing: {
          on: {
            d2pSessionCanceled: {
              target: 'qrRegister',
              actions: ['clearScopedAuthToken'],
            },
            d2pSessionCompleted: {
              target: 'complete',
            },
            d2pSessionFailed: {
              target: 'complete',
            },
            d2pSessionExpired: {
              target: 'qrRegister',
              actions: ['clearScopedAuthToken'],
            },
          },
        },
        smsProcessing: {
          on: {
            d2pSessionCanceled: {
              target: 'sms',
              actions: ['clearScopedAuthToken'],
            },
            d2pSessionCompleted: {
              target: 'complete',
            },
            d2pSessionFailed: {
              target: 'complete',
            },
            d2pSessionExpired: {
              target: 'sms',
              actions: ['clearScopedAuthToken'],
            },
          },
        },
        newTabProcessing: {
          on: {
            tabClosed: {
              actions: ['clearTab'],
            },
            d2pSessionCanceled: {
              target: 'newTabRequest',
              actions: ['clearScopedAuthToken'],
            },
            d2pSessionCompleted: {
              target: 'complete',
            },
            d2pSessionFailed: {
              target: 'complete',
            },
            d2pSessionExpired: {
              target: 'newTabRequest',
              actions: ['clearScopedAuthToken'],
            },
          },
        },
        complete: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignScopedAuthToken: assign((context, event) => ({
          ...context,
          scopedAuthToken: event.payload.scopedAuthToken,
        })),
        assignTab: assign((context, event) => ({
          ...context,
          tab: event.payload.tab,
        })),
        assignIsContinuingOnDesktop: assign(context => ({
          ...context,
          isContinuingOnDesktop: true,
        })),
        clearScopedAuthToken: assign(context => ({
          ...context,
          scopedAuthToken: undefined,
        })),
        clearTab: assign(context => ({
          ...context,
          tab: undefined,
        })),
      },
    },
  );

export default createTransferMachine;
