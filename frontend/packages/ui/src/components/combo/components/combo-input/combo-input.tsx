import { IcoCloseSmall16, IcoSearchSmall16 } from '@onefootprint/icons';
import { Command } from 'cmdk';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { createFontStyles } from '../../../../utils/mixins';
import IconButton from '../../../icon-button';

type ComboInputProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  onErase?: () => void;
  size?: 'compact' | 'default';
};

const ComboInput = ({ value, onValueChange, onErase, size = 'default' }: ComboInputProps) => {
  const { t } = useTranslation('ui', { keyPrefix: 'components.combo' });
  const handleErase = () => {
    if (onErase) {
      onErase();
    } else if (onValueChange) {
      onValueChange('');
    }
  };

  return (
    <InputContainer $size={size}>
      <IcoSearchSmall16 color="tertiary" />
      <StyledInput value={value} onValueChange={onValueChange} placeholder={t('input-placeholder')} />
      {value && (
        <IconButton aria-label={t('erase-search')} onClick={handleErase} size="compact">
          <IcoCloseSmall16 color="tertiary" />
        </IconButton>
      )}
    </InputContainer>
  );
};

const InputContainer = styled.div<{ $size: 'compact' | 'default' }>`
  ${({ theme, $size }) => css`
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:${theme.spacing[3]};
    width:100%;
    padding:${theme.spacing[4]};
    position:sticky;
    top:0;
    z-index:2;
    background-color: ${theme.backgroundColor.primary};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    overflow: hidden;
    ${$size === 'compact' ? createFontStyles('body-3') : createFontStyles('body-2')};
  `}
`;

const StyledInput = styled(Command.Input)`
  ${({ theme }) => css`
    all:unset;
    width:100%;
    height:100%;
    flex:1;
    color:${theme.color.primary};
    &::placeholder{
      color:${theme.color.tertiary};
    }
  `}
`;

export default ComboInput;
