import { IcoEye16, IcoEyeCrossed16 } from '@onefootprint/icons';
import { CopyButton, IconButton, Text } from '@onefootprint/ui';
import { formatCardExpiry, formatCardNumber } from 'creditcardutils';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type RenderMask = 'creditCard' | 'cvc' | 'date';

export type RenderBaseProps = {
  isHidden?: boolean;
  label?: string;
  mask?: RenderMask;
  onToggleHidden?: () => void;
  value: string;
  canCopy?: boolean;
};

const RenderBase = ({ isHidden, label, mask, onToggleHidden, value, canCopy }: RenderBaseProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.secure-render',
  });
  const [values, setValues] = useState({
    showValue: '',
    hiddenValue: '',
  });

  useEffect(() => {
    switch (mask) {
      case 'creditCard':
        setValues({
          showValue: formatCardNumber(value),
          hiddenValue: formatCardNumber(value).replace(/\d/g, '•'),
        });
        break;
      case 'cvc':
        setValues({
          showValue: value,
          hiddenValue: value.replace(/\d/g, '•'),
        });
        break;
      case 'date':
        setValues({
          showValue: formatCardExpiry(value),
          hiddenValue: formatCardExpiry(value).replace(/\d/g, '•'),
        });
        break;
      default:
        setValues({
          showValue: value,
          hiddenValue: value.replace(/\d/g, '•'),
        });
        break;
    }
  }, [mask, value]);

  return (
    <Container>
      <FieldContainer>
        {label && (
          <Text color="tertiary" variant="label-3">
            {label}
          </Text>
        )}
        <ValueContainer>
          <Value isHidden={!!isHidden} variant="body-3">
            {isHidden ? values.hiddenValue : values.showValue}
          </Value>
          {canCopy && <CopyButton contentToCopy={values.showValue} />}
        </ValueContainer>
      </FieldContainer>
      {isHidden && (
        <IconButton
          onClick={onToggleHidden}
          aria-label={isHidden ? t('toggle.show-aria-label') : t('toggle.hide-aria-label')}
        >
          {isHidden ? <IcoEye16 /> : <IcoEyeCrossed16 />}
        </IconButton>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.spacing[3]};
  `}
`;

const FieldContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[3]};
  `}
`;

const ValueContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-direction: row;
    gap: ${theme.spacing[3]};
  `}
`;

const Value = styled(Text)<{ isHidden: boolean }>`
  ${({ theme, isHidden }) => css`
    ${
      isHidden &&
      css`
      color: red !important;
      letter-spacing: ${theme.spacing[2]};
      pointer-events: none;
      user-select: none;
    `
    }
  `}
`;

export default RenderBase;
