import { Button } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type EditableFormButtonContainerProps = {
  onCancel?: () => void;
  isLoading: boolean;
  ctaLabel?: string;
  submitButtonTestID?: string;
  submitButtonRef?: React.RefObject<HTMLButtonElement>;
};

const EditableFormButtonContainer = ({
  onCancel,
  isLoading,
  ctaLabel,
  submitButtonTestID,
  submitButtonRef,
}: EditableFormButtonContainerProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'global.components.cta' });
  const actionContext = submitButtonTestID || 'editable-form';

  if (onCancel) {
    return (
      <EndJustifiedButtons>
        <Button
          variant="secondary"
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          data-dd-action-name={`${actionContext}:cancel`}
        >
          {t('cancel')}
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          testID={submitButtonTestID}
          ref={submitButtonRef}
          data-dd-action-name={`${actionContext}:save`}
        >
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
      ref={submitButtonRef}
      data-dd-action-name={`${actionContext}:continue`}
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
