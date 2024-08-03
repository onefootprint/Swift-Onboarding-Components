import type { CountryCode, IdDocImageTypes } from '@onefootprint/types';

import type { MachineContext, ProcessingSucceededEvent } from './types';

type MachineTarget = {
  target: string;
  cond?: (context: MachineContext, event: ProcessingSucceededEvent) => boolean;
  actions?: (context: MachineContext, event: ProcessingSucceededEvent) => void;
};

const assignCurrSide = (context: MachineContext, event: ProcessingSucceededEvent) => {
  context.currSide = event.payload.nextSideToCollect as IdDocImageTypes;
  context.errors = [];
};

export const NextSideTargetsMobile: MachineTarget[] = [
  {
    target: 'mobileFrontPhotoFallback',
    cond: (context, event) => event.payload.nextSideToCollect === 'front' && !!context.forceUpload,
    actions: assignCurrSide,
  },
  {
    target: 'mobileFrontImageCapture',
    cond: (_, event) => event.payload.nextSideToCollect === 'front',
    actions: assignCurrSide,
  },
  {
    target: 'mobileBackPhotoFallback',
    cond: (context, event) => event.payload.nextSideToCollect === 'back' && !!context.forceUpload,
    actions: assignCurrSide,
  },
  {
    target: 'mobileBackImageCapture',
    cond: (_, event) => event.payload.nextSideToCollect === 'back',
    actions: assignCurrSide,
  },
  {
    target: 'mobileSelfieFallback',
    cond: (context, event) => event.payload.nextSideToCollect === 'selfie' && !!context.forceUpload,
    actions: assignCurrSide,
  },
  {
    target: 'mobileSelfieImage',
    cond: (_, event) => event.payload.nextSideToCollect === 'selfie',
    actions: assignCurrSide,
  },
  {
    target: 'complete',
  },
];

export const NextSideTargetsDesktop: MachineTarget[] = [
  {
    target: 'desktopFrontImage',
    cond: (_, event) => event.payload.nextSideToCollect === 'front',
    actions: assignCurrSide,
  },
  {
    target: 'desktopBackImage',
    cond: (_, event) => event.payload.nextSideToCollect === 'back',
    actions: assignCurrSide,
  },
  {
    target: 'desktopSelfieFallback',
    cond: (context, event) => event.payload.nextSideToCollect === 'selfie' && !!context.forceUpload,
    actions: assignCurrSide,
  },
  {
    target: 'desktopSelfieImage',
    cond: (_, event) => event.payload.nextSideToCollect === 'selfie',
    actions: assignCurrSide,
  },
  {
    target: 'complete',
  },
];

export const isSingleDocCountryMap = (context: MachineContext) => {
  const { supportedCountryAndDocTypes } = context.requirement.config;
  const supportedCountries = Object.keys(supportedCountryAndDocTypes);
  const numCountries = supportedCountries.length;
  if (numCountries !== 1) {
    return false;
  }
  const numDocTypes = supportedCountryAndDocTypes[supportedCountries[0] as CountryCode]?.length;
  return numDocTypes === 1;
};
