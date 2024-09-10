export type StepperOption = {
  label: string;
  value: string;
  options?: {
    label: string;
    value: string;
  }[];
};

export type StepperProps = {
  'aria-label': string;
  onChange?: (option: StepperOption) => void;
  options: StepperOption[];
  value: { option: StepperOption; subOption?: StepperOption };
};

export type StepperStatus = 'next' | 'selected' | 'completed';
