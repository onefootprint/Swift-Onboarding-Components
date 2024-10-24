import { type StateValue, assign, createMachine } from 'xstate';

import {
  isCollectingBusinessData,
  shouldShowAddressDataScreen,
  shouldShowBasicDataScreen,
  shouldShowBeneficialOwnersScreen,
  shouldShowManageBosScreen,
} from '../attributes';
import type { MachineContext, MachineEvents } from './types';

type Screen = {
  screen: StateValue;
  missingCheck: (ctx: MachineContext) => boolean;
};

const ORDERED_SCREENS: Screen[] = [
  {
    screen: 'introduction',
    missingCheck: isCollectingBusinessData,
  },
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
    screen: 'beneficialOwners',
    missingCheck: shouldShowBeneficialOwnersScreen,
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
    actions: s.screen === 'introduction' ? [] : ['assignData'],
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
      on: {
        setStakeExplanationDialogConfirmed: {
          actions: ['assignStakeExplanationDialogConfirmed'],
        },
      },
      states: {
        loadFromVault: {
          on: {
            businessDataLoadSuccess: {
              target: 'router',
              actions: 'assignVaultData',
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
        introduction: {
          on: {
            introductionCompleted: nextScreenTransitions('introduction'),
          },
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
        manageBos: {},
        beneficialOwners: {
          on: {
            beneficialOwnersSubmitted: nextScreenTransitions('beneficialOwners').map(config => ({
              ...config,
              actions: ['assignVaultData'],
            })),
            navigatedToPrevPage: prevScreenTransitions('beneficialOwners'),
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
            beneficialOwnersSubmitted: { actions: ['assignVaultData'] },
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
          ctx.vaultBusinessData = {
            ...ctx.vaultBusinessData,
            ...payload,
          };
          ctx.data = {
            ...ctx.data,
            ...payload,
          };
          return ctx;
        }),
        assignVaultData: assign((ctx, { payload }) => {
          ctx.vaultBusinessData = {
            ...ctx.vaultBusinessData,
            ...payload.vaultBusinessData,
          };
          ctx.data = {
            ...ctx.data,
            ...payload.data,
          };
          return ctx;
        }),
        assignAuthToken: assign((ctx, { payload }) => ({
          ...ctx,
          authToken: payload,
        })),
        assignStakeExplanationDialogConfirmed: assign((ctx, { payload }) => ({
          ...ctx,
          isStakeExplanationDialogConfirmed: payload,
        })),
      },
    },
  );

export default createCollectKybDataMachine;
