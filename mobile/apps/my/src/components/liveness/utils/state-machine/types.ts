export type MachineEvents =
  | {
      type: 'completed';
    }
  | {
      type: 'failed';
    }
  | {
      type: 'skipped';
    };
