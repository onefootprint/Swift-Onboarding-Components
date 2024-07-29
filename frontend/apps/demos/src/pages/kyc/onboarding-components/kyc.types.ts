export type StepProps = {
  onFormSubmit: () => void;
  onInputEvent?: (e: NativeEvent) => void;
};

export type EventLog = {
  type: string;
  value: string;
  name?: string;
  createdAt?: Date;
  isAutoCompleted?: boolean;
  isPaste?: boolean;
};

export type NativeEvent =
  | React.ChangeEvent<HTMLInputElement>
  | React.FocusEvent<HTMLInputElement>
  | React.MouseEvent<HTMLInputElement>;

export type FormStates = 'default' | 'loading' | 'encrypted';
