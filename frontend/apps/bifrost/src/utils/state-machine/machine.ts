import { assign, createMachine } from 'xstate';

import type { MachineContext, MachineEvents } from './types';
import isContextReady from './utils/is-context-ready';

const isUndefined = (x: unknown): x is undefined => x === undefined;

export const createBifrostMachine = () =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'bifrost',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      // eslint-disable-next-line
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {},
      on: {
        reset: {
          target: 'init',
          actions: ['resetContext'],
        },
      },
      states: {
        init: {
          on: {
            configRequestFailed: { target: 'idv' },
            initError: { target: 'initError' },
            initContextUpdated: [
              {
                cond: isContextReady,
                target: 'idv',
                actions: ['assignInitContext'],
              },
              { actions: ['assignInitContext'] },
            ],
          },
        },
        idv: {
          on: {
            idvComplete: [
              {
                target: 'complete',
                actions: ['assignIdvCompletePayload'],
              },
            ],
          },
        },
        initError: { type: 'final' },
        complete: { type: 'final' },
      },
    },
    {
      actions: {
        resetContext: assign(() => ({})),
        assignInitContext: assign((context: MachineContext, event) => {
          const {
            bootstrapData,
            config,
            l10n,
            showCompletionPage,
            showLogo,
            authToken,
            publicKey,
            isComponentsSdk,
            fixtureResult,
            documentFixtureResult,
          } = event.payload;

          let sandboxOutcome = undefined;
          if (fixtureResult || documentFixtureResult) {
            sandboxOutcome = {
              overallOutcome: fixtureResult,
              idDocOutcome: documentFixtureResult,
            };
          }

          context.config = isUndefined(config) ? context.config : config;
          context.l10n = isUndefined(l10n) ? context.l10n : l10n;

          context.bootstrapData = isUndefined(bootstrapData) ? context.bootstrapData : bootstrapData;

          context.showCompletionPage = isUndefined(showCompletionPage)
            ? context.showCompletionPage
            : showCompletionPage;

          context.showLogo = isUndefined(showLogo) ? context.showLogo : showLogo;

          context.authToken = isUndefined(authToken) ? context.authToken : authToken;

          context.publicKey = isUndefined(publicKey) ? context.publicKey : publicKey;

          context.isComponentsSdk = isUndefined(isComponentsSdk) ? context.isComponentsSdk : isComponentsSdk;

          context.sandboxOutcome = isUndefined(sandboxOutcome) ? context.sandboxOutcome : sandboxOutcome;

          return context;
        }),
        assignIdvCompletePayload: assign((context, event) => {
          context.idvCompletePayload = event.payload;
          return context;
        }),
      },
    },
  );

const BifrostMachine = createBifrostMachine();

export default BifrostMachine;
