import { GoogleButton } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SocialButtons = () => {
  const { t } = useTranslation('authentication', {
    keyPrefix: 'social-buttons',
  });
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    try {
      const redirect = `${window.location.origin}/auth`;
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/org/auth/google_oauth?redirect_url=${redirect}`;
      window.location.href = url;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleButton size="large" onClick={handleClick} loading={loading}>
      {t('google')}
    </GoogleButton>
  );
};

export default SocialButtons;
