import type { RemainingRequirements } from '../../../../requirement.types';

export type MachineEvents =
  | {
      type: 'requirementsReceived';
      payload: {
        remainingRequirements: RemainingRequirements;
      };
    }
  | {
      type: 'requirementCompleted';
    };
