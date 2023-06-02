import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type EditableFormButtonContainerProps = {
  onCancel?: () => void;
  isLoading: boolean;
  ctaLabel?: string;
};

const EditableFormButtonContainer = ({
  onCancel,
  isLoading,
  ctaLabel,
}: EditableFormButtonContainerProps) => {
  const { t } = useTranslation('pages');

  if (onCancel) {
    return (
      <ButtonLayoutContainer>
        <Button
          size="small"
          variant="secondary"
          type="button"
          onClick={onCancel}
          loading={isLoading}
        >
          {t('cta.cancel')}
        </Button>
        <Button size="small" type="submit" loading={isLoading}>
          {t('cta.save')}
        </Button>
      </ButtonLayoutContainer>
    );
  }
  return (
    <Button type="submit" fullWidth loading={isLoading}>
      {ctaLabel ?? t('cta.continue')}
    </Button>
  );
};

const ButtonLayoutContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: flex-end;
    gap: ${theme.spacing[5]};
  `}
`;

export default EditableFormButtonContainer;
