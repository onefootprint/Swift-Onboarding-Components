import IcoSearch16 from 'icons/ico/ico-search-16';
import React from 'react';
import styled, { css } from 'styled';

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
    border-bottom: ${theme.borderWidths[1]}px solid
      ${theme.dividerColors.primary};

    svg {
      left: ${theme.spacings[5]}px;
      pointer-events: none;
      position: absolute;
      top: ${theme.spacings[4] + theme.spacings[1]}px;
    }

    + ul {
      padding-top: ${theme.spacings[2]}px;
    }
  `}
`;

const InputContainer = styled.div`
  position: relative;
  height: 100%;
`;

const Input = styled.input`
  ${({ theme }) => css`
    background: ${theme.backgroundColors.primary};
    border-top-left-radius: ${theme.borderRadius[1]}px;
    border-top-right-radius: ${theme.borderRadius[1]}px;
    border: none;
    color: ${theme.colors.primary};
    font-family: ${theme.typographies['body-3'].fontFamily};
    font-size: ${theme.typographies['body-3'].fontSize}px;
    font-weight: ${theme.typographies['body-3'].fontWeight};
    height: 100%;
    line-height: ${theme.typographies['body-3'].lineHeight}px;
    outline: none;
    padding-left: ${theme.spacings[9]}px;
    width: 100%;

    ::placeholder {
      color: ${theme.colors.tertiary};
    }
  `}
`;

export default SelectSearch;
