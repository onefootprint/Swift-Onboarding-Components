import { useTranslation } from '@onefootprint/hooks';
import { Button, LinkButton } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import Steps from './components/steps';

export type FormControlsProps = {
  id: string;
  max: number;
  onPrev?: () => void;
  onSkip?: () => void;
  value: number;
};

const FormControls = ({
  id,
  max,
  onPrev,
  onSkip,
  value,
}: FormControlsProps) => {
  const { t } = useTranslation();
  const isLast = value === max - 1;

  return (
    <Container>
      <Steps max={max} onPrev={onPrev} value={value} />
      <ButtonsContainer>
        {isLast && (
          <LinkButton form={id} onClick={onSkip}>
            {t('skip')}
          </LinkButton>
        )}
        <Button form={id} size="compact" type="submit">
          {isLast ? t('complete') : t('next')}
        </Button>
      </ButtonsContainer>
    </Container>
  );
};

const Container = styled.footer`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[5]} ${theme.spacing[7]};
  `}
`;

const ButtonsContainer = styled.footer`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[7]};
  `}
`;

export default FormControls;
