import { Button, LinkButton } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components/native';

import useTranslation from '@/hooks/use-translation';

type DataCollectionActionButtonProps = {
  onCancel?: () => void;
  onSkip?: () => void;
  onComplete?: () => void;
  isLoading: boolean;
  ctaLabel?: string;
  skipLabel?: string;
  submitButtonTestID?: string;
};

const DataCollectionActionButton = ({
  onCancel,
  onSkip,
  onComplete,
  isLoading,
  ctaLabel,
  skipLabel,
  submitButtonTestID,
}: DataCollectionActionButtonProps) => {
  const { t } = useTranslation('components.data-collection-action-button');

  if (onCancel) {
    return (
      <EndJustifiedButtons>
        <Button variant="secondary" onPress={onCancel} disabled={isLoading}>
          {t('cancel')}
        </Button>
        <Button loading={isLoading} testID={submitButtonTestID} onPress={onComplete}>
          {t('save')}
        </Button>
      </EndJustifiedButtons>
    );
  }

  if (onSkip && skipLabel) {
    return (
      <VerticalButtons>
        <Button loading={isLoading} testID={submitButtonTestID} onPress={onComplete}>
          {ctaLabel ?? t('continue')}
        </Button>
        <LinkButton onPress={onSkip}>{skipLabel}</LinkButton>
      </VerticalButtons>
    );
  }

  return (
    <Button loading={isLoading} testID={submitButtonTestID} onPress={onComplete}>
      {ctaLabel ?? t('continue')}
    </Button>
  );
};

const VerticalButtons = styled.View`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const EndJustifiedButtons = styled.View`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    gap: ${theme.spacing[5]};
  `}
`;

export default DataCollectionActionButton;
