import type { CountryCode } from '@onefootprint/types';
import Cleave from 'cleave.js/react';
import type React from 'react';
import { forwardRef, useId, useRef, useState } from 'react';
import mergeRefs from 'react-merge-refs';
import styled, { css } from 'styled-components';

import { createText } from '../../../../utils';
import Box from '../../../box';
import Label from '../../../label';
import type { PhoneInputProps } from '../../phone-input.types';
import { getNationalNumber } from '../../phone-input.utils';
import CountryPicker from './components/country-picker';
import { defaultPreference, preferences } from './input.constants';

type InputProps = PhoneInputProps & {
  countryCode: CountryCode;
  prefix: string;
  selectTrigger?: {
    isOpen?: boolean;
    onClick?: () => void;
  };
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      countryCode,
      defaultValue,
      disabled = false,
      hasError = false,
      id: baseId,
      label,
      onBlur,
      onChange,
      onChangeText,
      onFocus,
      prefix,
      selectTrigger,
      size,
      value,
      ...props
    }: InputProps,
    ref,
  ) => {
    const [isFocused, setFocus] = useState(false);
    const localRef = useRef<HTMLInputElement>(null);
    const internalId = useId();
    const id = baseId || internalId;
    const countryPreferences = preferences[countryCode] || defaultPreference;

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setFocus(false);
      onBlur?.(event);
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setFocus(true);
      onBlur?.(event);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValueWithCountryCode = `${prefix} ${event.target.value}`;
      const modifiedEvent = {
        ...event,
        target: {
          ...event.target,
          value: inputValueWithCountryCode,
        },
      };
      onChange?.(modifiedEvent);
      onChangeText?.(modifiedEvent.target.value);
    };

    return (
      <Box>
        {label ? <Label htmlFor={id}>{label}</Label> : null}
        <FakeInput
          className="fp-input fp-phone-input fp-custom-appearance"
          data-has-error={hasError}
          data-has-focus={isFocused}
          data-disabled={disabled}
          onClick={() => {
            localRef.current?.focus();
          }}
        >
          <CountryPicker code={countryCode} disabled={disabled} onClick={selectTrigger?.onClick} prefix={prefix} />
          <RealInput
            {...props}
            autoComplete="tel-national"
            data-has-error={hasError}
            data-has-focus={isFocused}
            defaultValue={getNationalNumber(prefix, defaultValue) || undefined}
            disabled={disabled}
            htmlRef={mergeRefs([localRef, ref])}
            id={id}
            key={countryCode}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            options={countryPreferences.mask}
            placeholder={countryPreferences.placeholder}
            type="tel"
            value={getNationalNumber(prefix, value) || undefined}
            /** Do not change/remove these classes */
            className="fp-input fp-phone-input fp-custom-appearance"
          />
        </FakeInput>
      </Box>
    );
  },
);

const FakeInput = styled.div`
  ${({ theme }) => {
    const {
      components: { input },
    } = theme;

    return css`
      background: ${input.state.default.initial.bg};
      border-color: ${input.state.default.initial.border};
      border-radius: ${input.global.borderRadius};
      border-style: solid;
      border-width: ${input.global.borderWidth};
      color: ${input.global.color};
      display: flex;
      height: ${input.size.default.height};
      outline: none;
      width: 100%;

      &[data-disabled='false'] {
        &[data-has-error='false'] {
          &:hover {
            background: ${input.state.default.hover.bg};
            border-color: ${input.state.default.hover.border};
          }

          &[data-has-focus='true'] {
            background: ${input.state.default.focus.bg};
            border-color: ${input.state.default.focus.border};
            box-shadow: ${input.state.default.focus.elevation};
          }
        }

        &[data-has-error='true'] {
          background: ${input.state.error.initial.bg};
          border-color: ${input.state.error.initial.border};

          &:hover {
            background: ${input.state.error.hover.bg};
            border-color: ${input.state.error.hover.border};
          }

          &[data-has-focus='true'] {
            background: ${input.state.error.focus.bg};
            border-color: ${input.state.error.focus.border};
            box-shadow: ${input.state.error.focus.elevation};
          }
        }
      }

      &[data-disabled='true'] {
        background: ${input.state.disabled.bg};
        border-color: ${input.state.disabled.border};
      }
    `;
  }}
`;

const RealInput = styled(Cleave)`
  ${({ theme }) => {
    const {
      components: { input },
    } = theme;

    return css`
      ${createText(input.size.default.typography)};
      background: transparent;
      border: unset;
      outline: none;
      width: 100%;

      ::placeholder {
        color: ${input.global.placeholderColor};
      }

      :-webkit-credentials-auto-fill-button {
        visibility: hidden;
        pointer-events: none;
        position: absolute;
        right: 0;
      }

      :-webkit-autofill {
        transition: background-color 5000s ease-in-out 0s;
        color: ${input.global.color};
      }
    `;
  }}
`;

export default Input;
