import { assign, createMachine } from 'xstate';

import allAttributes from '../all-attributes';
import {
  isMissingBasicAttribute,
  isMissingEmailAttribute,
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
  isMissingUsLegalStatusAttribute,
  shouldConfirm,
} from '../missing-attributes';
import { MachineContext, MachineEvents } from './types';
import isInDomesticFlow from './utils/is-in-domestic-flow';
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
              target: 'email',
              cond: context =>
                // If email was passed into initial context, no need to collect again
                isMissingEmailAttribute(
                  // use ob config things required to determine what's missing
                  // this will break if we start returning full ssn9 when only ssn4 is required
                  // should we serialize all attributes from the requirement?
                  allAttributes(context.requirement),
                  context.data,
                ),
            },
            {
              target: 'basicInformation',
              cond: context =>
                isMissingBasicAttribute(
                  allAttributes(context.requirement),
                  context.data,
                ),
            },
            {
              target: 'residentialAddress',
              cond: context =>
                isMissingResidentialAttribute(
                  allAttributes(context.requirement),
                  context.data,
                ),
            },
            {
              target: 'usLegalStatus',
              cond: context =>
                isInDomesticFlow(context.data) &&
                isMissingUsLegalStatusAttribute(
                  allAttributes(context.requirement),
                  context.data,
                ),
            },
            {
              target: 'ssn',
              cond: context =>
                isInDomesticFlow(context.data) &&
                isMissingSsnAttribute(
                  allAttributes(context.requirement),
                  context.data,
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
        email: {
          on: {
            dataSubmitted: [
              {
                target: 'basicInformation',
                actions: 'assignData',
                cond: context =>
                  isMissingBasicAttribute(
                    allAttributes(context.requirement),
                    context.data,
                  ),
              },
              {
                target: 'residentialAddress',
                actions: ['assignData'],
                cond: context =>
                  isMissingResidentialAttribute(
                    allAttributes(context.requirement),
                    context.data,
                  ),
              },
              {
                target: 'usLegalStatus',
                actions: 'assignData',
                cond: context =>
                  isInDomesticFlow(context.data) &&
                  isMissingUsLegalStatusAttribute(
                    allAttributes(context.requirement),
                    context.data,
                  ),
              },
              {
                target: 'ssn',
                actions: ['assignData'],
                cond: context =>
                  isInDomesticFlow(context.data) &&
                  isMissingSsnAttribute(
                    allAttributes(context.requirement),
                    context.data,
                  ),
              },
              {
                target: 'confirm',
                actions: ['assignData'],
              },
            ],
          },
        },
        basicInformation: {
          on: {
            dataSubmitted: [
              {
                target: 'residentialAddress',
                actions: ['assignData'],
                cond: context =>
                  isMissingResidentialAttribute(
                    allAttributes(context.requirement),
                    context.data,
                  ),
              },
              {
                target: 'usLegalStatus',
                actions: 'assignData',
                cond: context =>
                  isInDomesticFlow(context.data) &&
                  isMissingUsLegalStatusAttribute(
                    allAttributes(context.requirement),
                    context.data,
                  ),
              },
              {
                target: 'ssn',
                actions: ['assignData'],
                cond: context =>
                  isInDomesticFlow(context.data) &&
                  isMissingSsnAttribute(
                    allAttributes(context.requirement),
                    context.data,
                  ),
              },
              {
                target: 'confirm',
                actions: ['assignData'],
              },
            ],
            navigatedToPrevPage: {
              target: 'email',
              cond: context =>
                isMissingEmailAttribute(
                  allAttributes(context.requirement),
                  context.initialData,
                ),
            },
          },
        },
        residentialAddress: {
          on: {
            dataSubmitted: [
              {
                target: 'usLegalStatus',
                actions: 'assignData',
                cond: (context, event) =>
                  isInDomesticFlow(
                    mergeUpdatedData(context.data, event.payload),
                  ) &&
                  isMissingUsLegalStatusAttribute(
                    allAttributes(context.requirement),
                    context.data,
                  ),
              },
              {
                target: 'ssn',
                actions: ['assignData'],
                cond: (context, event) =>
                  isInDomesticFlow(
                    mergeUpdatedData(context.data, event.payload),
                  ) &&
                  isMissingSsnAttribute(
                    allAttributes(context.requirement),
                    context.data,
                  ),
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
                  ),
              },
              {
                target: 'email',
                cond: context =>
                  isMissingEmailAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
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
                cond: context =>
                  isInDomesticFlow(context.data) &&
                  isMissingSsnAttribute(
                    allAttributes(context.requirement),
                    context.data,
                  ),
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
                  ),
              },
              {
                target: 'basicInformation',
                cond: context =>
                  isMissingBasicAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                  ),
              },
              {
                target: 'email',
                cond: context =>
                  isMissingEmailAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
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
                  ),
              },
              {
                target: 'residentialAddress',
                cond: context =>
                  isMissingResidentialAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                  ),
              },
              {
                target: 'basicInformation',
                cond: context =>
                  isMissingBasicAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                  ),
              },
              {
                target: 'email',
                cond: context =>
                  isMissingEmailAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
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
            confirmed: [
              {
                target: 'completed',
              },
            ],
            navigatedToPrevPage: [
              {
                target: 'ssn',
                cond: context =>
                  isInDomesticFlow(context.data) &&
                  isMissingSsnAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                  ),
              },
              {
                target: 'usLegalStatus',
                cond: context =>
                  isInDomesticFlow(context.data) &&
                  isMissingUsLegalStatusAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                  ),
              },
              {
                target: 'residentialAddress',
                cond: context =>
                  isMissingResidentialAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                  ),
              },
              {
                target: 'basicInformation',
                cond: context =>
                  isMissingBasicAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                  ),
              },
              {
                target: 'email',
                cond: context =>
                  isMissingEmailAttribute(
                    allAttributes(context.requirement),
                    context.initialData,
                  ),
              },
            ],
            dataSubmitted: {
              actions: ['assignData'],
            },
          },
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
