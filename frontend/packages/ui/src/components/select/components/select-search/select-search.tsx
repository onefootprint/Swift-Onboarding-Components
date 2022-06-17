import IcoSearch16 from 'icons/ico/ico-search-16';
import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../../../utils/mixins';

export type SelectSearchProps = {
  'aria-activedescendant'?: string;
  'aria-autocomplete'?: 'list' | 'none' | 'inline' | 'both';
  'aria-controls'?: string;
  'aria-labelledby'?: string;
  autoComplete?: string;
  id?: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

const SelectSearch = ({
  'aria-activedescendant': ariaActivedescendant,
  'aria-autocomplete': ariaAutocomplete,
  'aria-controls': ariaControls,
  'aria-labelledby': ariaLabelledby,
  autoComplete,
  id,
  onChangeText,
  placeholder,
  value,
}: SelectSearchProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChangeText(event.currentTarget.value);
  };

  return (
    <Container role="search">
      <InputContainer>
        <IcoSearch16 color="tertiary" />
        <Input
          aria-activedescendant={ariaActivedescendant}
          aria-autocomplete={ariaAutocomplete}
          aria-controls={ariaControls}
          aria-labelledby={ariaLabelledby}
          autoCapitalize="off"
          autoComplete={autoComplete}
          autoCorrect="off"
          autoFocus
          id={id}
          onChange={handleChange}
          placeholder={placeholder}
          type="text"
          value={value}
        />
      </InputContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    height: 44px;
    border-bottom: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};

    svg {
      left: ${theme.spacing[5]}px;
      pointer-events: none;
      position: absolute;
      top: ${theme.spacing[4] + theme.spacing[1]}px;
    }

    + ul {
      padding-top: ${theme.spacing[2]}px;
    }
  `}
`;

const InputContainer = styled.div`
  position: relative;
  height: 100%;
`;

const Input = styled.input`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    background: ${theme.backgroundColor.primary};
    border-top-left-radius: ${theme.borderRadius[2]}px;
    border-top-right-radius: ${theme.borderRadius[2]}px;
    border: none;
    color: ${theme.color.primary};
    height: 100%;
    outline: none;
    padding-left: ${theme.spacing[9]}px;
    width: 100%;

    ::placeholder {
      color: ${theme.color.tertiary};
    }
  `}
`;

export default SelectSearch;
