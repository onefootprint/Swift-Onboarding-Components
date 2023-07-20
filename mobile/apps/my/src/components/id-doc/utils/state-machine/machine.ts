import { getCountryFromCode } from '@onefootprint/global-constants';
import {
  IdDocType,
  SubmitDocumentSide,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { assign, createMachine } from 'xstate';

import { MachineContext, MachineEvents } from './types';

const USCountryCode = getCountryFromCode('US').value;

const createIdDocMachine = (initialContext: Partial<MachineContext>) =>
  createMachine(
    {
      predictableActionArguments: true,
      id: 'idDoc',
      schema: {
        context: {} as MachineContext,
        events: {} as MachineEvents,
      },
      tsTypes: {} as import('./machine.typegen').Typegen0,
      context: {
        requirement: undefined,
        currentSide: SubmitDocumentSide.Front,
        collectingDocumentMeta: {
          countryCode: USCountryCode,
          type: IdDocType.passport,
        },
        ...initialContext,
      },
      initial: 'init',
      states: {
        init: {
          always: [
            {
              target: 'frontImage',
              cond: context =>
                !!context.requirement.onlyUsSupported &&
                context.requirement.supportedDocumentTypes?.length === 1,
              actions: 'assignDefaultCountryAndType',
            },
            {
              target: 'docSelection',
            },
          ],
        },
        docSelection: {
          on: {
            countryAndTypeSubmitted: {
              target: 'frontImage',
              actions: 'assignCountryAndType',
            },
          },
        },
        frontImage: {
          on: {
            backButtonTapped: {
              target: 'docSelection',
            },
            imageSubmitted: [
              {
                target: 'backImage',
                cond: (_, event) => event.payload.nextSideToCollect === 'back',
                actions: 'assignNextSideToCollect',
              },
              {
                target: 'selfie',
                cond: (_, event) =>
                  event.payload.nextSideToCollect === 'selfie',
                actions: 'assignNextSideToCollect',
              },
              {
                target: 'completed',
                actions: 'assignNextSideToCollect',
              },
            ],
          },
        },
        backImage: {
          on: {
            imageSubmitted: [
              {
                target: 'selfie',
                cond: (_, event) =>
                  event.payload.nextSideToCollect === 'selfie',
                actions: 'assignNextSideToCollect',
              },
              {
                target: 'completed',
                actions: 'assignNextSideToCollect',
              },
            ],
          },
        },
        selfie: {
          on: {
            imageSubmitted: [
              {
                target: 'completed',
                actions: 'assignNextSideToCollect',
              },
            ],
          },
        },
        completed: {
          type: 'final',
        },
      },
    },
    {
      actions: {
        assignDefaultCountryAndType: assign(context => {
          const { supportedDocumentTypes } = context.requirement;
          // get rid of this once back end fixes the typo with "drivers license" in id-doc type
          const supportedTypeToIdDocType = {
            [SupportedIdDocTypes.idCard]: IdDocType.idCard,
            [SupportedIdDocTypes.driversLicense]: IdDocType.driversLicense,
            [SupportedIdDocTypes.passport]: IdDocType.passport,
          };
          const supportedIdDocTypes: IdDocType[] = supportedDocumentTypes.map(
            supportedDocumentType =>
              supportedTypeToIdDocType[supportedDocumentType],
          );
          return {
            ...context,
            collectingDocumentMeta: {
              countryCode: USCountryCode,
              type: supportedIdDocTypes[0],
            },
          };
        }),
        assignNextSideToCollect: assign((context, { payload }) => {
          return {
            ...context,
            currentSide: payload.nextSideToCollect,
          };
        }),
        assignCountryAndType: assign((context, { payload }) => {
          return {
            ...context,
            collectingDocumentMeta: {
              countryCode: payload.countryCode,
              type: payload.documentType,
            },
          };
        }),
      },
    },
  );

export default createIdDocMachine;
