import { Button } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type ContinueButtonProps = {
  isLoading?: boolean;
  label?: string;
  trackActionName?: string;
};

const ContinueButton = ({ isLoading, label, trackActionName }: ContinueButtonProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'investor-profile.components.continue-button' });
  const btnLabel = label || t('label');
  const btnActionName = trackActionName || `investor-profile:${btnLabel}`;

  return (
    <Button
      type="submit"
      fullWidth
      loading={isLoading}
      loadingAriaLabel={t('loading-aria-label')}
      size="large"
      data-dd-action-name={btnActionName}
    >
      {btnLabel}
    </Button>
  );
};

export default ContinueButton;
