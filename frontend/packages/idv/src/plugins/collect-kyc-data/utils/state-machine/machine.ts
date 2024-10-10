import type { CollectKycDataRequirement } from '@onefootprint/types';
import { CollectedKycDataOption } from '@onefootprint/types';
import type { StateValue } from 'xstate';
import { assign, createMachine } from 'xstate';

import type { KycData } from '../data-types';
import isMissing from '../missing-attributes';
import type { MachineContext, MachineEvents } from './types';
import isCountryUsOrTerritories from './utils/is-country-us-or-territories';
import mergeUpdatedData from './utils/merge-data';
import mergeInitialData from './utils/merge-initial-data';

// TODO make sure we have coverage of optional SSN?
type Screen = {
  screen: StateValue;
  /** The CDOs that this screen is responsible for collecting */
  cdos: CollectedKycDataOption[];
  addlCond?: (allData: KycData) => boolean;
};

const ORDERED_SCREENS: Screen[] = [
  {
    screen: 'email',
    cdos: [CollectedKycDataOption.email],
  },
  {
    screen: 'basicInformation',
    cdos: [CollectedKycDataOption.name, CollectedKycDataOption.dob, CollectedKycDataOption.nationality],
  },
  {
    screen: 'residentialAddress',
    cdos: [CollectedKycDataOption.address],
  },
  {
    screen: 'usLegalStatus',
    cdos: [CollectedKycDataOption.usLegalStatus],
    addlCond: (allData: KycData) => isCountryUsOrTerritories(allData),
  },
  {
    screen: 'ssn',
    cdos: [CollectedKycDataOption.usTaxId, CollectedKycDataOption.ssn9, CollectedKycDataOption.ssn4],
    addlCond: (allData: KycData) => isCountryUsOrTerritories(allData),
  },
  {
    screen: 'confirm',
    cdos: [],
  },
];

export const getScreenOrder = (screen: StateValue) => ORDERED_SCREENS.findIndex(s => s.screen === screen) ?? -1;

/**
 * Given the CollectKycDataRequirement and initial data, computes the static set of screens we
 * might show. The state machine transitions will only navigate forward and backward through this
 * set of static pages of data that need to be collected.
 */
export const getDataCollectionScreensToShow = (req: CollectKycDataRequirement, initialData: KycData): StateValue[] => {
  const missingAttributes = [...req.missingAttributes, ...req.optionalAttributes];
  return ORDERED_SCREENS.filter(s => isMissing(s.cdos, missingAttributes, initialData) || s.screen === 'confirm').map(
    s => s.screen,
  );
};

/**
 * The forward transitions made for the specific `currentScreen`.
 * They don't allow transitioning to a screen that is before the `currentScreen`.
 */
export const nextScreenTransitions = (currentScreen: StateValue) => {
  const currentScreenOrder = getScreenOrder(currentScreen);

  return ORDERED_SCREENS.map(s => ({
    target: s.screen as string,
    actions: ['assignData'],
    cond: (ctx: MachineContext, e: MachineEvents) => {
      let allData;
      if (e.type === 'dataSubmitted') {
        allData = mergeUpdatedData(ctx.data, e.payload);
      } else {
        allData = ctx.data;
      }
      return (
        // The requirement from the backend says there's info to collect on this screen
        ctx.dataCollectionScreensToShow.includes(s.screen) &&
        // The current screen came before this screen
        getScreenOrder(s.screen) > currentScreenOrder &&
        // Any additional condition for the screen
        (s.addlCond?.(allData) ?? true)
      );
    },
  }));
};

/**
 * The backward transitions made for the specific `currentScreen` when the back button is hit.
 * They don't allow transitioning to a screen that is after the `currentScreen`.
 */
const prevScreenTransitions = (currentScreen: StateValue) => {
  const currentScreenOrder = getScreenOrder(currentScreen);

  const reversedScreens = [...ORDERED_SCREENS].reverse();
  return reversedScreens.map(s => ({
    target: s.screen as string,
    cond: (ctx: MachineContext) =>
      // The requirement from the backend said there was info to collect on this screen
      ctx.dataCollectionScreensToShow.includes(s.screen) &&
      // The current screen came after this screen
      getScreenOrder(s.screen) < currentScreenOrder &&
      // Any additional condition for the screen
      (s.addlCond?.(ctx.data) ?? true),
  }));
};

export type InitMachineArgs = Omit<MachineContext, 'dataCollectionScreensToShow'>;

const createCollectKycDataMachine = (initialContext: InitMachineArgs, initState?: string) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'collect-kyc-data',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: initState ?? 'init',
      context: {
        ...initialContext,
        /**
         * Snapshot the set of data we have before starting to collect from users.
         * This helps us decide the pages to visit when navigated forward and backward */
        dataCollectionScreensToShow: getDataCollectionScreensToShow(initialContext.requirement, initialContext.data),
        /** Whether the user can skip the confirm screen */
        isConfirmScreenVisible: !initialContext.config?.skipConfirm === true,
      },
      states: {
        init: {
          on: {
            initialized: {
              actions: ['assignInitialData'],
              target: 'router',
            },
          },
        },
        router: {
          always: [
            ...nextScreenTransitions('router'),
            {
              target: 'completed',
            },
          ],
        },
        email: {
          on: {
            dataSubmitted: nextScreenTransitions('email'),
          },
        },
        basicInformation: {
          on: {
            dataSubmitted: nextScreenTransitions('basicInformation'),
            navigatedToPrevPage: prevScreenTransitions('basicInformation'),
          },
        },
        residentialAddress: {
          on: {
            dataSubmitted: nextScreenTransitions('residentialAddress'),
            navigatedToPrevPage: prevScreenTransitions('residentialAddress'),
          },
        },
        usLegalStatus: {
          on: {
            dataSubmitted: nextScreenTransitions('usLegalStatus'),
            navigatedToPrevPage: prevScreenTransitions('usLegalStatus'),
          },
        },
        ssn: {
          on: {
            dataSubmitted: nextScreenTransitions('ssn'),
            navigatedToPrevPage: prevScreenTransitions('ssn'),
          },
        },
        confirm: {
          on: {
            stepUpCompleted: {
              actions: ['assignAuthToken'],
            },
            decryptedData: {
              actions: ['assignData'],
            },
            confirmFailed: {
              actions: ['assignConfirmScreenVisibility'],
            },
            confirmed: [{ target: 'completed' }],
            navigatedToPrevPage: prevScreenTransitions('confirm'),
            dataSubmitted: {
              actions: ['assignData'],
            },
            addVerification: [
              {
                cond: (_c, { payload }) => payload === 'phone',
                target: 'addVerificationPhone',
              },
              {
                cond: (_c, { payload }) => payload === 'email',
                target: 'addVerificationEmail',
              },
            ],
          },
        },
        addVerificationPhone: {
          on: { navigatedToPrevPage: { target: 'confirm' } },
        },
        addVerificationEmail: {
          on: { navigatedToPrevPage: { target: 'confirm' } },
        },
        completed: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignData: assign((context, event) => {
          context.data = mergeUpdatedData(context.data, event.payload);
          return context;
        }),
        assignAuthToken: assign((context, event) => ({
          ...context,
          authToken: event.payload.authToken,
        })),
        assignInitialData: assign((context, event) => {
          const initialData = mergeInitialData(context.data, event.payload);
          return {
            ...context,
            data: initialData,
            initialData,
          };
        }),
        assignConfirmScreenVisibility: assign(context => ({
          ...context,
          isConfirmScreenVisible: true,
        })),
      },
    },
  );

export default createCollectKycDataMachine;
