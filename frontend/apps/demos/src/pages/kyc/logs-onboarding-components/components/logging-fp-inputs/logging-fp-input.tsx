import { Fp } from '@onefootprint/footprint-react';
import { formatISO } from 'date-fns';
import { uniqueId } from 'lodash';
import type { ChangeEvent, ClipboardEvent, FocusEvent, FormEvent, KeyboardEvent, MouseEvent } from 'react';

export type CustomInputEvent = {
  type: string;
  value: string;
  timestamp: string;
  target: HTMLInputElement;
  id: string;
  nativeEvent:
    | ChangeEvent<HTMLInputElement>
    | FocusEvent<HTMLInputElement>
    | KeyboardEvent<HTMLInputElement>
    | MouseEvent<HTMLInputElement>
    | ClipboardEvent<HTMLInputElement>
    | FormEvent<HTMLInputElement>;
};

export type GeolocationEvent = {
  type: 'geolocation';
  value: string;
  timestamp: string;
  id: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country_name?: string;
};

type LoggingFpInputProps = {
  placeholder: string;
  defaultValue?: string;
  type?: string;
  autoFocus?: boolean;
  onEvent: (event: CustomInputEvent | GeolocationEvent) => void;
};

type LoggingFpPinInputProps = {
  onComplete: (value: string) => void;
  autoFocus?: boolean;
  pinActiveClassName?: string;
  onEvent: (event: CustomInputEvent) => void;
};

const createEventHandler = (onEvent: (event: CustomInputEvent) => void) => (event: CustomInputEvent['nativeEvent']) => {
  onEvent({
    type: event.type,
    value: event.currentTarget.value,
    timestamp: formatISO(new Date()),
    target: event.currentTarget,
    nativeEvent: event,
    id: uniqueId(),
  });
};

const LoggingFpInput = ({ placeholder, autoFocus, onEvent }: LoggingFpInputProps) => {
  const handleEvent = createEventHandler(onEvent);

  return (
    <Fp.Input
      placeholder={placeholder}
      autoFocus={autoFocus}
      {...{
        onChange: handleEvent,
        onBlur: handleEvent,
        onKeyDown: handleEvent,
        onPaste: handleEvent,
        onFocus: handleEvent,
        onInput: handleEvent,
        onKeyDownCapture: handleEvent,
        onMouseDown: handleEvent,
        onMouseUp: handleEvent,
        onMouseEnter: handleEvent,
        onMouseLeave: handleEvent,
        onMouseOver: handleEvent,
        onMouseOut: handleEvent,
      }}
    />
  );
};

const LoggingFpPinInput = ({ onComplete, autoFocus, pinActiveClassName, onEvent }: LoggingFpPinInputProps) => {
  const handleEvent = createEventHandler(onEvent);

  return (
    <Fp.PinInput
      onComplete={onComplete}
      autoFocus={autoFocus}
      pinActiveClassName={pinActiveClassName}
      {...{
        onBlur: handleEvent,
        onKeyDown: handleEvent,
        onPaste: handleEvent,
        onKeyDownCapture: handleEvent,
        onMouseDown: handleEvent,
        onMouseUp: handleEvent,
        onMouseEnter: handleEvent,
        onMouseLeave: handleEvent,
        onMouseOver: handleEvent,
        onMouseOut: handleEvent,
      }}
    />
  );
};

export { LoggingFpInput, LoggingFpPinInput };
