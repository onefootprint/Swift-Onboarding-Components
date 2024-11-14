import { type StateValue, assign, createMachine } from 'xstate';

import { shouldShowAddressDataScreen, shouldShowBasicDataScreen, shouldShowManageBosScreen } from '../attributes';
import type { MachineContext, MachineEvents } from './types';

type Screen = {
  screen: StateValue;
  missingCheck: (ctx: MachineContext) => boolean;
};

const ORDERED_SCREENS: Screen[] = [
  {
    screen: 'basicData',
    missingCheck: shouldShowBasicDataScreen,
  },
  {
    screen: 'businessAddress',
    missingCheck: shouldShowAddressDataScreen,
  },
  {
    screen: 'manageBos',
    missingCheck: shouldShowManageBosScreen,
  },
  {
    screen: 'confirm',
    missingCheck: () => true,
  },
];

const getScreenOrder = (screen: StateValue) => ORDERED_SCREENS.findIndex(s => s.screen === screen) ?? -1;

/**
 * Given the initial context, computes the static set of screens we
 * might show. The state machine transitions will only navigate forward and backward through this
 * set of static pages of data that need to be collected.
 */
export const getDataCollectionScreensToShow = (initialContext: MachineContext): StateValue[] =>
  ORDERED_SCREENS.filter(s => s.missingCheck(initialContext)).map(s => s.screen);

/**
 * The forward transitions made for the specific `currentScreen`.
 * They don't allow transitioning to a screen that is before the `currentScreen`.
 */
export const nextScreenTransitions = (currentScreen: StateValue) => {
  const currentScreenOrder = getScreenOrder(currentScreen);

  return ORDERED_SCREENS.map(s => ({
    target: s.screen as string,
    actions: ['assignData'],
    cond: (ctx: MachineContext) => {
      return (
        // The requirement from the backend says there's info to collect on this screen
        ctx.dataCollectionScreensToShow.includes(s.screen) &&
        // The current screen came before this screen
        getScreenOrder(s.screen) > currentScreenOrder
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
    cond: (ctx: MachineContext) => {
      return (
        // The requirement from the backend says there's info to collect on this screen
        ctx.dataCollectionScreensToShow.includes(s.screen) &&
        // The current screen came after this screen
        getScreenOrder(s.screen) < currentScreenOrder
      );
    },
  }));
};

const createCollectKybDataMachine = (initialContext: MachineContext) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'collect-kyb-data',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'loadFromVault',
      context: {
        ...initialContext,
        dataCollectionScreensToShow: getDataCollectionScreensToShow(initialContext),
        /** Whether the user can skip the confirm screen */
        isConfirmScreenVisible: !initialContext.config?.skipConfirm,
      },
      states: {
        loadFromVault: {
          on: {
            businessDataLoadSuccess: {
              target: 'router',
              actions: 'assignData',
            },
            businessDataLoadError: {
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
        basicData: {
          on: {
            basicDataSubmitted: nextScreenTransitions('basicData'),
            navigatedToPrevPage: prevScreenTransitions('basicData'),
          },
        },
        businessAddress: {
          on: {
            businessAddressSubmitted: nextScreenTransitions('businessAddress'),
            navigatedToPrevPage: prevScreenTransitions('businessAddress'),
          },
        },
        manageBos: {
          on: {
            manageBosCompleted: nextScreenTransitions('manageBos'),
            navigatedToPrevPage: prevScreenTransitions('manageBos'),
          },
        },
        confirm: {
          on: {
            confirmed: [
              { target: 'beneficialOwnerKyc', cond: context => !!context.kycRequirement },
              { target: 'completed' },
            ],
            basicDataSubmitted: { actions: 'assignData' },
            businessAddressSubmitted: { actions: 'assignData' },
            navigatedToPrevPage: prevScreenTransitions('confirm'),
            stepUpAuthTokenCompleted: { actions: ['assignAuthToken'] },
            stepUpDecryptionCompleted: { actions: ['assignData'] },
          },
        },
        beneficialOwnerKyc: {
          on: {
            beneficialOwnerKycSubmitted: { target: 'completed' },
          },
        },
        completed: { type: 'final' },
      },
    },
    {
      actions: {
        assignData: assign((ctx, { payload }) => {
          // Only after data is synced to the backend, we update the local view of the data
          ctx.data = {
            ...ctx.data,
            ...payload,
          };
          return ctx;
        }),
        assignAuthToken: assign((ctx, { payload }) => ({
          ...ctx,
          authToken: payload,
        })),
      },
    },
  );

export default createCollectKybDataMachine;
