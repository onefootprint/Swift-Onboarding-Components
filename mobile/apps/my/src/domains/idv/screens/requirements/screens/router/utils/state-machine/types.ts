import type { RemainingRequirements } from '../../../../requirement.types';

export type MachineContext = {
  remainingRequirements: RemainingRequirements;
};

export type MachineEvents =
  | {
      type: 'remainingRequirementsReceived';
      payload: {
        remainingRequirements: RemainingRequirements;
      };
    }
  | {
      type: 'requirementCompleted';
    };
