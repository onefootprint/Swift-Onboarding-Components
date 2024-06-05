import { Button } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type EditableFormButtonContainerProps = {
  onCancel?: () => void;
  isLoading: boolean;
  ctaLabel?: string;
  submitButtonTestID?: string;
};

const EditableFormButtonContainer = ({
  onCancel,
  isLoading,
  ctaLabel,
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

const EndJustifiedButtons = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: flex-end;
    gap: ${theme.spacing[5]};
  `}
`;

export default EditableFormButtonContainer;
