import { IcoClose16, IcoSearch24 } from '@onefootprint/icons';
import { IconButton, createFontStyles } from '@onefootprint/ui';
import { Command } from 'cmdk';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type SearchInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  onErase: () => void;
};

const SearchInput = ({ value, onValueChange, onErase }: SearchInputProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.cmdk' });
  return (
    <InputContainer>
      <IcoSearch24 color="tertiary" />
      <Input value={value} onValueChange={onValueChange} />
      <IconButton aria-label={t('erase-search')} onClick={onErase}>
        <IcoClose16 color="tertiary" />
      </IconButton>
    </InputContainer>
  );
};

const InputContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    gap: ${theme.spacing[4]};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const Input = styled(Command.Input)`
  ${({ theme }) => css`
    all: unset;
    ${createFontStyles('body-3')}
    color: ${theme.color.tertiary};
    flex: 1;
  `}
`;

export default SearchInput;
