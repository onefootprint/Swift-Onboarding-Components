import { CLIENT_PUBLIC_KEY_HEADER } from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import allAttributes from '../all-attributes';
import isCountryUsOrTerritories from '../is-country-us-or-territories';
import mergeUpdatedData from '../merge-data/merge-data';
import { isMissingResidentialAttribute, isMissingSsnAttribute } from '../missing-attributes';
import { NextTargetsFromRequirement, shouldShowSandbox } from './machine.utils';
import type { MachineContext, MachineEvents } from './types';

export const createPasskeysMachine = (sdkAuthToken: string) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'verify',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {
        sdkAuthToken,
        identify: {},
        kyc: {},
      },
      states: {
        init: {
          on: {
            sdkArgsReceived: [
              {
                target: 'sandboxOutcome',
                cond: (context, event) => shouldShowSandbox(context, event),
                actions: ['assignConfig', 'assignObConfigAuth'],
              },
              {
                target: 'emailIdentification',
                actions: ['assignConfig', 'assignObConfigAuth'],
              },
            ],
            failed: {
              target: 'initFailed',
            },
          },
        },
        initFailed: {
          type: 'final',
        },
        sandboxOutcome: {
          on: {
            sandboxOutcomeReceived: {
              target: 'emailIdentification',
              actions: ['assignSandboxOutcome'],
            },
            requiresIdDoc: {
              target: 'incompatibleRequirements',
            },
          },
        },
        emailIdentification: {
          on: {
            identified: [
              {
                target: 'incompatibleRequirements',
                cond: (_, event) => !!event.payload.userFound, // TODO: handle userFound cases later
              },
              {
                target: 'phoneIdentification',
                actions: ['assignIdentifyResult'],
                cond: (_, event) =>
                  !event.payload.userFound ||
                  !event.payload.availableChallengeKinds ||
                  event.payload.availableChallengeKinds.length === 0,
              },
              {
                target: 'smsChallenge',
                actions: ['assignIdentifyResult'],
              },
            ],
          },
        },
        phoneIdentification: {
          on: {
            identified: [
              {
                target: 'incompatibleRequirements',
                cond: (_, event) => !!event.payload.userFound, // TODO: handle userFound cases later
              },
              {
                target: 'smsChallenge',
                actions: ['assignIdentifyResult'],
              },
            ],
            identifyReset: {
              target: 'emailIdentification',
              actions: ['reset'],
            },
          },
        },
        smsChallenge: {
          on: {
            challengeReceived: {
              actions: ['assignChallengeData'],
            },
            challengeSucceeded: {
              target: 'requirements',
              actions: ['assignAuthToken'],
            },
          },
        },
        requirements: {
          on: {
            requirementsReceived: NextTargetsFromRequirement,
          },
        },
        basicInformation: {
          on: {
            // TODO: add transition to legal status
            // TODO: add transition to confirm
            dataSubmitted: [
              {
                target: 'residentialAddress',
                actions: ['assignKycData'],
                cond: (context, event) => {
                  const allData = mergeUpdatedData(context.kyc.kycData ?? {}, event.payload);
                  return isMissingResidentialAttribute(allAttributes(context.kyc.requirement), allData, true);
                },
              },
              {
                target: 'ssn',
                actions: ['assignKycData'],
                cond: (context, event) => {
                  const allData = mergeUpdatedData(context.kyc.kycData ?? {}, event.payload);
                  return (
                    isCountryUsOrTerritories(allData) &&
                    isMissingSsnAttribute(allAttributes(context.kyc.requirement), allData, true)
                  );
                },
              },
              {
                target: 'confirm',
                actions: ['assignKycData'],
              },
            ],
          },
        },
        residentialAddress: {
          on: {
            dataSubmitted: [
              {
                target: 'ssn',
                actions: ['assignKycData'],
                cond: (context, event) => {
                  const allData = mergeUpdatedData(context.kyc.kycData ?? {}, event.payload);
                  return (
                    isCountryUsOrTerritories(allData) &&
                    isMissingSsnAttribute(allAttributes(context.kyc.requirement), allData, true)
                  );
                },
              },
              {
                target: 'confirm',
                actions: ['assignKycData'],
              },
            ],
          },
        },
        ssn: {
          on: {
            dataSubmitted: {
              target: 'confirm',
              actions: ['assignKycData'],
            },
          },
        },
        confirm: {
          on: {
            dataSubmitted: {
              actions: ['assignKycData'],
            },
            dataConfirmed: {
              target: 'requirements',
              actions: ['assignKycDataCollected'],
            },
          },
        },
        liveness: {
          on: {
            skipLiveness: {
              target: 'requirements',
            },
            skipLivenessError: {
              target: 'error',
            },
          },
        },
        process: {
          on: {
            done: {
              target: 'requirements',
            },
          },
        },
        incompatibleRequirements: { type: 'final' },
        completed: {
          type: 'final',
        },
        error: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignConfig: assign((context, event) => {
          context.config = event.payload.config;
          return context;
        }),
        assignObConfigAuth: assign((context, event) => {
          context.obConfigAuth = {
            [CLIENT_PUBLIC_KEY_HEADER]: event.payload.config.key,
          };
          return context;
        }),
        assignIdentifyResult: assign((context, event) => {
          const {
            email,
            phoneNumber,
            isUnverified,
            availableChallengeKinds,
            successfulIdentifier,
            hasSyncablePassKey,
            userFound,
          } = event.payload;
          const isEmailChanged = email && context.identify.identifyResult?.email !== email;
          const isPhoneChanged = phoneNumber && context.identify.identifyResult?.phoneNumber !== phoneNumber;
          if (isEmailChanged || isPhoneChanged) {
            context.identify.challengeData = undefined;
          }
          if (!context.identify.identifyResult) {
            context.identify.identifyResult = event.payload;
            return context;
          }
          context.identify.identifyResult.userFound = userFound;
          context.identify.identifyResult.isUnverified = isUnverified;
          context.identify.identifyResult.hasSyncablePassKey = hasSyncablePassKey;
          if (email) {
            context.identify.identifyResult.email = email;
          }
          if (phoneNumber) {
            context.identify.identifyResult.phoneNumber = phoneNumber;
          }
          if (availableChallengeKinds) {
            context.identify.identifyResult.availableChallengeKinds = availableChallengeKinds;
          }
          if (successfulIdentifier) {
            context.identify.identifyResult.successfulIdentifier = successfulIdentifier;
          }
          return context;
        }),
        reset: assign(context => {
          context.identify = {};
          return context;
        }),
        assignChallengeData: assign((context, event) => {
          context.identify.challengeData = event.payload;
          return context;
        }),
        assignAuthToken: assign((context, event) => {
          context.identify.authToken = event.payload.authToken;
          return context;
        }),
        assignKycData: assign((context, event) => {
          context.kyc.kycData = mergeUpdatedData(context.kyc.kycData ?? {}, event.payload);
          context.startedDataCollection = true;
          return context;
        }),
        assignKycDataCollected: assign(context => {
          context.collectedKycData = true;
          return context;
        }),
        assignSandboxOutcome: assign((context, event) => {
          context.sandboxOutcome = event.payload;
          return context;
        }),
      },
    },
  );

export default createPasskeysMachine;
