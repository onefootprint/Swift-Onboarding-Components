import {
  CLIENT_PUBLIC_KEY_HEADER,
  CollectedKycDataOption,
  OnboardingRequirementKind,
} from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import allAttributes from '../all-attributes';
import isInDomesticFlow from '../is-in-domestic-flow';
import mergeUpdatedData from '../merge-data/merge-data';
import {
  isMissingResidentialAttribute,
  isMissingSsnAttribute,
} from '../missing-attributes';
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
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      tsTypes: {} as import('./machine.typegen').Typegen0,
      initial: 'init',
      context: {
        sdkAuthToken,
        identify: {},
        // TODO: this is temporary; we will get this data from requirements machine when we implement it
        kyc: {
          requirement: {
            isMet: false,
            kind: OnboardingRequirementKind.collectKycData,
            missingAttributes: [
              CollectedKycDataOption.name,
              CollectedKycDataOption.dob,
              CollectedKycDataOption.fullAddress,
              CollectedKycDataOption.ssn4,
            ],
            populatedAttributes: [
              CollectedKycDataOption.email,
              CollectedKycDataOption.phoneNumber,
            ],
            optionalAttributes: [],
          },
          kycData: {},
        },
      },
      states: {
        init: {
          on: {
            sdkArgsReceived: {
              target: 'emailIdentification',
              actions: ['assignConfig', 'assignObConfigAuth'],
            },
            failed: {
              target: 'initFailed',
            },
          },
        },
        initFailed: {
          type: 'final',
        },
        emailIdentification: {
          on: {
            identified: [
              // TODO: biometric and email challenge
              {
                target: 'phoneIdentification',
                actions: ['assignIdentifyResult'],
                cond: (context, event) =>
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
            identified: {
              target: 'smsChallenge',
              actions: ['assignIdentifyResult'],
            },
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
              target: 'basicInformation',
              actions: ['assignAuthToken'],
            },
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
                  const allData = mergeUpdatedData(
                    context.kyc.kycData ?? {},
                    event.payload,
                  );
                  return isMissingResidentialAttribute(
                    allAttributes(context.kyc.requirement),
                    allData,
                    true,
                  );
                },
              },

              {
                target: 'ssn',
                actions: ['assignKycData'],
                cond: (context, event) => {
                  const allData = mergeUpdatedData(
                    context.kyc.kycData ?? {},
                    event.payload,
                  );
                  return (
                    isInDomesticFlow(allData) &&
                    isMissingSsnAttribute(
                      allAttributes(context.kyc.requirement),
                      allData,
                      true,
                    )
                  );
                },
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
                  const allData = mergeUpdatedData(
                    context.kyc.kycData ?? {},
                    event.payload,
                  );
                  return (
                    isInDomesticFlow(allData) &&
                    isMissingSsnAttribute(
                      allAttributes(context.kyc.requirement),
                      allData,
                      true,
                    )
                  );
                },
              },
            ],
          },
        },
        ssn: {
          on: {
            done: 'completed',
          },
        },

        completed: {
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
          const isEmailChanged =
            email && context.identify.identifyResult?.email !== email;
          const isPhoneChanged =
            phoneNumber &&
            context.identify.identifyResult?.phoneNumber !== phoneNumber;
          if (isEmailChanged || isPhoneChanged) {
            context.identify.challengeData = undefined;
          }
          if (!context.identify.identifyResult) {
            context.identify.identifyResult = event.payload;
            return context;
          }
          context.identify.identifyResult.userFound = userFound;
          context.identify.identifyResult.isUnverified = isUnverified;
          context.identify.identifyResult.hasSyncablePassKey =
            hasSyncablePassKey;
          if (email) {
            context.identify.identifyResult.email = email;
          }
          if (phoneNumber) {
            context.identify.identifyResult.phoneNumber = phoneNumber;
          }
          if (availableChallengeKinds) {
            context.identify.identifyResult.availableChallengeKinds =
              availableChallengeKinds;
          }
          if (successfulIdentifier) {
            context.identify.identifyResult.successfulIdentifier =
              successfulIdentifier;
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
          context.kyc.kycData = mergeUpdatedData(
            context.kyc.kycData ?? {},
            event.payload,
          );
          return context;
        }),
      },
    },
  );

export default createPasskeysMachine;
