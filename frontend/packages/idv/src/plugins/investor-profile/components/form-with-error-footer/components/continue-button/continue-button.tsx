import { Button } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type ContinueButtonProps = {
  isLoading?: boolean;
  label?: string;
};

const ContinueButton = ({ isLoading, label }: ContinueButtonProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'investor-profile.components.continue-button' });

  return (
    <Button type="submit" fullWidth loading={isLoading} loadingAriaLabel={t('loading-aria-label')} size="large">
      {label || t('label')}
    </Button>
  );
};

export default ContinueButton;
