import { IcoCloseSmall16, IcoSearch16 } from '@onefootprint/icons';
import { Command } from 'cmdk';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { createFontStyles } from '../../../../utils/mixins';
import IconButton from '../../../icon-button';

type CommandInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  onErase?: () => void;
  size?: 'compact' | 'default';
  placeholder?: string;
};

const CommandInput = ({ value, onValueChange, onErase, size = 'default', placeholder }: CommandInputProps) => {
  const { t } = useTranslation('ui', { keyPrefix: 'components.command' });
  const inputRef = useRef<HTMLInputElement>(null);

  const handleErase = () => {
    if (onErase) {
      onErase();
    } else {
      onValueChange('');
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <InputContainer>
      <IcoSearch16 color="tertiary" />
      <StyledInput ref={inputRef} value={value} onValueChange={onValueChange} size={size} placeholder={placeholder} />
      {value && (
        <IconButton aria-label={t('erase-search')} onClick={handleErase} size="compact">
          <IcoCloseSmall16 color="tertiary" />
        </IconButton>
      )}
    </InputContainer>
  );
};

const InputContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[4]};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
  `}
`;

const StyledInput = styled(Command.Input)<{ size: 'compact' | 'default' }>`
  ${({ theme, size }) => css`
    all: unset;
    ${createFontStyles('body-3')}
    color: ${theme.color.primary};
    width: 100%;
    height: 100%;
    min-height: ${size === 'compact' ? '26px' : '28px'};
    flex: 1;
    &::placeholder {
      color: ${theme.color.tertiary};
    }
  `}
`;

export default CommandInput;
