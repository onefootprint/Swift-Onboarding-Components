import type { CountryCode, IdDocImageTypes } from '@onefootprint/types';

import type { MachineContext, ProccessingSucceededEvent } from './types';

type MachineTarget = {
  target: string;
  cond?: (context: MachineContext, event: ProccessingSucceededEvent) => boolean;
  actions?: (context: MachineContext, event: ProccessingSucceededEvent) => void;
};

const assignCurrSide = (
  context: MachineContext,
  event: ProccessingSucceededEvent,
) => {
  context.currSide = event.payload.nextSideToCollect as IdDocImageTypes;
  context.errors = [];
};

export const NextSideTargetsMobile: MachineTarget[] = [
  {
    target: 'frontImageCaptureMobile',
    cond: (context, event) => event.payload.nextSideToCollect === 'front',
    actions: assignCurrSide,
  },
  {
    target: 'backImageCaptureMobile',
    cond: (context, event) => event.payload.nextSideToCollect === 'back',
    actions: assignCurrSide,
  },
  {
    target: 'selfieImageMobile',
    cond: (context, event) => event.payload.nextSideToCollect === 'selfie',
    actions: assignCurrSide,
  },
  {
    target: 'complete',
  },
];

export const NextSideTargetsDesktop: MachineTarget[] = [
  {
    target: 'frontImageDesktop',
    cond: (context, event) => event.payload.nextSideToCollect === 'front',
    actions: assignCurrSide,
  },
  {
    target: 'backImageDesktop',
    cond: (context, event) => event.payload.nextSideToCollect === 'back',
    actions: assignCurrSide,
  },
  {
    target: 'selfieImageDesktop',
    cond: (context, event) => event.payload.nextSideToCollect === 'selfie',
    actions: assignCurrSide,
  },
  {
    target: 'complete',
  },
];

export const isSingleDocCountryMap = (context: MachineContext) => {
  const { supportedCountryAndDocTypes } = context;
  const supportedCountries = Object.keys(supportedCountryAndDocTypes);
  const numCountries = supportedCountries.length;
  if (numCountries !== 1) {
    return false;
  }
  const numDocTypes =
    supportedCountryAndDocTypes[supportedCountries[0] as CountryCode]?.length;
  return numDocTypes === 1;
};
