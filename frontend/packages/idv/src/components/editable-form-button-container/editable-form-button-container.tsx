import { Button, LinkButton } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type EditableFormButtonContainerProps = {
  onCancel?: () => void;
  onSkip?: () => void;
  isLoading: boolean;
  ctaLabel?: string;
  skipLabel?: string;
  submitButtonTestID?: string;
};

const EditableFormButtonContainer = ({
  onCancel,
  onSkip,
  isLoading,
  ctaLabel,
  skipLabel,
  submitButtonTestID,
}: EditableFormButtonContainerProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'global.components.cta' });

  if (onCancel) {
    return (
      <EndJustifiedButtons>
        <Button
          variant="secondary"
          type="button"
          onClick={onCancel}
          disabled={isLoading}
        >
          {t('cancel')}
        </Button>
        <Button type="submit" loading={isLoading} testID={submitButtonTestID}>
          {t('save')}
        </Button>
      </EndJustifiedButtons>
    );
  }

  if (onSkip && skipLabel) {
    return (
      <VerticalButtons>
        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          testID={submitButtonTestID}
          size="large"
        >
          {ctaLabel ?? t('continue')}
        </Button>
        <LinkButton onClick={onSkip}>{skipLabel}</LinkButton>
      </VerticalButtons>
    );
  }

  return (
    <Button
      type="submit"
      fullWidth
      size="large"
      loading={isLoading}
      testID={submitButtonTestID}
    >
      {ctaLabel ?? t('continue')}
    </Button>
  );
};

const VerticalButtons = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const EndJustifiedButtons = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: flex-end;
    gap: ${theme.spacing[5]};
  `}
`;

export default EditableFormButtonContainer;
