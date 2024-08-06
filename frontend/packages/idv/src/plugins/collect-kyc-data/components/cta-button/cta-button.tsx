import { Button } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

type CtaButtonProps = {
  isLoading?: boolean;
  label?: string;
};

const CtaButton = ({ label, isLoading }: CtaButtonProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages.cta' });

  return (
    <Button type="submit" fullWidth loading={isLoading} size="large">
      {label ?? t('continue')}
    </Button>
  );
};

export default CtaButton;
