'use client';

import { IcoPinMarker16, IcoSmartphone40 } from '@onefootprint/icons';
import { Button } from '@onefootprint/ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const Verify = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.verify' });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
    // const [challenge, setChallenge] = useState(() => {
    //   return window.location.hash.slice(1);
    // });
  }

  const handleConfirm = () => {
    console.log('confirm');
  };

  const handleCancel = () => {
    console.log('cancel');
  };

  return (
    <div className="flex items-center justify-center h-screen w-full text-center">
      <div className="max-w-[450px] flex flex-col items-center">
        <div className="mb-4">
          <IcoSmartphone40 />
        </div>
        <h1 className="text-heading-3 text-primary mb-6">{t('title')}</h1>
        <p className="text-label-2 text-primary mb-6 flex items-center gap-2">
          <IcoPinMarker16 />
          {t('location')}
        </p>
        <div className="flex flex-col w-full gap-3">
          <Button variant="primary" fullWidth size="large" onClick={handleConfirm}>
            {t('confirm')}
          </Button>
          <Button variant="secondary" fullWidth size="large" onClick={handleCancel}>
            {t('cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Verify;
