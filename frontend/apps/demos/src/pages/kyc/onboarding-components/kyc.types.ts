export type StepProps = {
  onFormSubmit: () => void;
  onInputEvent?: (e: NativeEvent) => void;
};

export enum EventVariant {
  INPUT = 'input',
  GEOLOCATION = 'geolocation',
}

export type InputEventProps = {
  variant: EventVariant.INPUT;
  type: string;
  value: string;
  name?: string;
  createdAt?: Date;
  isAutoCompleted?: boolean;
  isPaste?: boolean;
};

export type GeolocationEventProps = {
  latitude: number;
  longitude: number;
  city: string;
  country_name: string;
  variant?: EventVariant.GEOLOCATION;
  createdAt?: Date;
  ip?: string;
  version?: string;
};

export type NativeEvent =
  | React.ChangeEvent<HTMLInputElement>
  | React.FocusEvent<HTMLInputElement>
  | React.MouseEvent<HTMLInputElement>;

export type FormStates = 'default' | 'loading' | 'encrypted';
