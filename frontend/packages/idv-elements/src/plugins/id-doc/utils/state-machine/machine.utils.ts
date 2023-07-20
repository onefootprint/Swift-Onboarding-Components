import { IdDocImageTypes } from '@onefootprint/types';

import { MachineContext, ProccessingSucceededEvent } from './types';

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

const NextSideTargets: MachineTarget[] = [
  {
    target: 'frontImage',
    cond: (context, event) => event.payload.nextSideToCollect === 'front',
    actions: assignCurrSide,
  },
  {
    target: 'backImage',
    cond: (context, event) => event.payload.nextSideToCollect === 'back',
    actions: assignCurrSide,
  },
  {
    target: 'selfiePrompt',
    cond: (context, event) => event.payload.nextSideToCollect === 'selfie',
    actions: assignCurrSide,
  },
  {
    target: 'complete',
  },
];

export default NextSideTargets;
