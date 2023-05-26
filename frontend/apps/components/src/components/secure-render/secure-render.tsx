import { CopyButton, LinkButton, Typography } from '@onefootprint/ui';
import { formatCardExpiry, formatCardNumber } from 'creditcardutils';
import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

export type SecureRenderProps = {
  isHidden?: boolean;
  label?: string;
  mask?: 'creditCard' | 'cvv' | 'date';
  onShow?: () => void;
  value: string;
};

const SecureRender = ({
  isHidden = false,
  label,
  mask,
  onShow,
  value,
}: SecureRenderProps) => {
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
      case 'cvv':
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
          <Typography color="tertiary" variant="label-4">
            {label}
          </Typography>
        )}
        <ValueContainer>
          <Value isHidden={isHidden} variant="body-3">
            {isHidden ? values.hiddenValue : values.showValue}
          </Value>
          {!isHidden && <CopyButton contentToCopy={values.showValue} />}
        </ValueContainer>
      </FieldContainer>
      {isHidden && <LinkButton onClick={onShow}>Show</LinkButton>}
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

const Value = styled(Typography)<{ isHidden: boolean }>`
  ${({ theme, isHidden }) => css`
    ${isHidden &&
    css`
      color: red !important;
      letter-spacing: ${theme.spacing[2]};
      pointer-events: none;
      user-select: none;
    `}
  `}
`;

export default SecureRender;
