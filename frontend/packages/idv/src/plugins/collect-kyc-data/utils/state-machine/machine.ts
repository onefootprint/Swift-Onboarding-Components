import { assign, createMachine } from 'xstate';

import allAttributes from '../all-attributes';
import {
  isMissingBasicAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
  isMissingUsLegalStatusAttribute,
  shouldConfirm,
} from '../missing-attributes';
import type { MachineContext, MachineEvents } from './types';
import isCountryUsOrTerritories from './utils/is-country-us-or-territories';
import mergeUpdatedData from './utils/merge-data';
import mergeInitialData from './utils/merge-initial-data';

const createCollectKycDataMachine = (
  initialContext: MachineContext,
  initState?: string,
) =>
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
      context: { ...initialContext },
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
            {
              target: 'basicInformation',
              cond: context =>
                isMissingBasicAttribute(
                  allAttributes(context.requirement),
                  context.data,
                  true,
                ),
            },
            {
              target: 'residentialAddress',
              cond: context =>
                isMissingResidentialAttribute(
                  allAttributes(context.requirement),
                  context.data,
                  true,
                ),
            },
            {
              target: 'usLegalStatus',
              cond: context =>
                isCountryUsOrTerritories(context.data) &&
                isMissingUsLegalStatusAttribute(
                  allAttributes(context.requirement),
                  context.data,
                  true,
                ),
            },
            {
              target: 'ssn',
              cond: context =>
                isCountryUsOrTerritories(context.data) &&
                isMissingSsnAttribute(
                  allAttributes(context.requirement),
                  context.data,
                  true,
                ),
            },
            {
              target: 'confirm',
              cond: context => shouldConfirm(context.data, context.requirement),
            },
            {
              target: 'completed',
            },
          ],
        },
        basicInformation: {
          on: {
            dataSubmitted: [
              {
                target: 'residentialAddress',
                actions: ['assignData'],
                cond: (context, event) => {
                  const allData = mergeUpdatedData(context.data, event.payload);
                  return isMissingResidentialAttribute(
                    allAttributes(context.requirement),
                    allData,
                    true,
                  );
                },
              },
              {
                target: 'usLegalStatus',
                actions: 'assignData',
                cond: (context, event) => {
                  const allData = mergeUpdatedData(context.data, event.payload);
                  return (
                    isCountryUsOrTerritories(allData) &&
                    isMissingUsLegalStatusAttribute(
                      allAttributes(context.requirement),
                      allData,
                      true,
                    )
                  );
                },
              },
              {
                target: 'ssn',
                actions: ['assignData'],
                cond: (context, event) => {
                  const allData = mergeUpdatedData(context.data, event.payload);
                  return (
                    isCountryUsOrTerritories(allData) &&
                    isMissingSsnAttribute(
                      allAttributes(context.requirement),
                      allData,
                      true,
                    )
                  );
                },
              },
              {
                target: 'confirm',
                actions: ['assignData'],
              },
            ],
          },
        },
        residentialAddress: {
          on: {
            dataSubmitted: [
              {
                target: 'usLegalStatus',
                actions: 'assignData',
                cond: (context, event) => {
                  const allData = mergeUpdatedData(context.data, event.payload);
                  return (
                    isCountryUsOrTerritories(allData) &&
                    isMissingUsLegalStatusAttribute(
                      allAttributes(context.requirement),
                      allData,
                      true,
                    )
                  );
                },
              },
              {
                target: 'ssn',
                actions: ['assignData'],
                cond: (context, event) => {
                  const allData = mergeUpdatedData(context.data, event.payload);
                  return (
                    isCountryUsOrTerritories(allData) &&
                    isMissingSsnAttribute(
                      allAttributes(context.requirement),
                      allData,
                      true,
                    )
                  );
                },
              },
              {
                target: 'confirm',
                actions: ['assignData'],
              },
            ],
            navigatedToPrevPage: [
              {
                target: 'basicInformation',
                cond: context =>
                  isMissingBasicAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                    true,
                  ),
              },
            ],
          },
        },
        usLegalStatus: {
          on: {
            dataSubmitted: [
              {
                target: 'ssn',
                actions: ['assignData'],
                cond: (context, event) => {
                  const allData = mergeUpdatedData(context.data, event.payload);
                  return (
                    isCountryUsOrTerritories(allData) &&
                    isMissingSsnAttribute(
                      allAttributes(context.requirement),
                      allData,
                      true,
                    )
                  );
                },
              },
              {
                target: 'confirm',
                actions: ['assignData'],
              },
            ],
            navigatedToPrevPage: [
              {
                target: 'residentialAddress',
                cond: context =>
                  isMissingResidentialAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                    true,
                  ),
              },
              {
                target: 'basicInformation',
                cond: context =>
                  isMissingBasicAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                    true,
                  ),
              },
            ],
          },
        },
        ssn: {
          on: {
            dataSubmitted: {
              target: 'confirm',
              actions: ['assignData'],
            },
            navigatedToPrevPage: [
              {
                target: 'usLegalStatus',
                cond: context =>
                  isMissingUsLegalStatusAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                    true,
                  ),
              },
              {
                target: 'residentialAddress',
                cond: context =>
                  isMissingResidentialAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                    true,
                  ),
              },
              {
                target: 'basicInformation',
                cond: context =>
                  isMissingBasicAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                    true,
                  ),
              },
            ],
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
            confirmed: [{ target: 'completed' }],
            navigatedToPrevPage: [
              {
                target: 'ssn',
                cond: context =>
                  isCountryUsOrTerritories(context.data) &&
                  isMissingSsnAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                    true,
                  ),
              },
              {
                target: 'usLegalStatus',
                cond: context =>
                  isCountryUsOrTerritories(context.data) &&
                  isMissingUsLegalStatusAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                    true,
                  ),
              },
              {
                target: 'residentialAddress',
                cond: context =>
                  isMissingResidentialAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                    true,
                  ),
              },
              {
                target: 'basicInformation',
                cond: context =>
                  isMissingBasicAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                    true,
                  ),
              },
            ],
            dataSubmitted: {
              actions: ['assignData'],
            },
            addVerification: [
              {
                cond: (c, { payload }) => payload === 'phone',
                target: 'addVerificationPhone',
              },
              {
                cond: (c, { payload }) => payload === 'email',
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
          context.data = mergeInitialData(context.data, event.payload);
          // Snapshot the set of data we have before starting to collect from users. This helps
          // us decide the page to visit when hitting the back button
          return {
            ...context,
            initialData: context.data,
          };
        }),
      },
    },
  );

export default createCollectKycDataMachine;
