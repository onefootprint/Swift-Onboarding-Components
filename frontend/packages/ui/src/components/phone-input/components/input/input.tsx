import { IcoChevronDown24 } from 'icons';
import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import type { CountryCode } from 'types';

import Flag from '../../../internal/flag';
import Input from '../../../internal/input';
import LoadingIndicator from '../../../loading-indicator';
import type { PhoneInputProps } from '../../phone-input.types';
import getIndicatorColor from './input.utils';

type InputProps = PhoneInputProps & {
  countryCode: CountryCode;
  hasMask?: boolean;
  isLoading?: boolean;
  prefix: string;
  selectTrigger: {
    isOpen?: boolean;
    onClick?: () => void;
    ref: React.RefObject<HTMLButtonElement>;
  };
};

const PhoneInput = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      value,
      hasError,
      countryCode,
      hasMask,
      isLoading,
      prefix,
      selectTrigger,
      ...props
    }: InputProps,
    ref,
  ) => {
    const mask = {
      phone: true,
      phoneRegionCode: countryCode,
      prefix,
    };

    return (
      <InputContainer>
        <Input
          {...props}
          autoComplete="tel"
          hasError={hasError}
          hasFocus={selectTrigger.isOpen}
          mask={hasMask ? mask : { prefix }}
          placeholder=""
          readOnly={isLoading}
          prefixElement={
            <Trigger
              onClick={isLoading ? undefined : selectTrigger.onClick}
              ref={selectTrigger.ref}
              tabIndex={isLoading ? -1 : 0}
              type="button"
            >
              <Flag code={countryCode} />
              <DropdownIndicator
                color={getIndicatorColor(!!hasError, !!selectTrigger.isOpen)}
              />
            </Trigger>
          }
          ref={ref}
          suffixElement={
            isLoading && (
              <LoadingContainer>
                <LoadingIndicator color="quaternary" size="compact" />
              </LoadingContainer>
            )
          }
          tabIndex={isLoading ? -1 : 0}
          type="tel"
          value={value}
        />
      </InputContainer>
    );
  },
);

const InputContainer = styled.div`
  ${({ theme }) => css`
    position: relative;

    input[type='tel'] {
      padding-left: ${theme.spacing[10] + theme.spacing[3]}px;
    }
  `}
`;

const Trigger = styled.button`
  ${({ theme }) => css`
    align-items: center;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    gap: ${theme.spacing[2]}px;
    height: 100%;
    justify-content: center;
    padding-left: ${theme.spacing[5]}px;
  `}
`;

const DropdownIndicator = styled(IcoChevronDown24)``;

const LoadingContainer = styled.div`
  ${({ theme }) => css`
    height: 100%;
    display: flex;
    padding-right: ${theme.spacing[5]}px;
  `}
`;

export default PhoneInput;
