'use client';

import { IcoCheckCircle40 } from '@onefootprint/icons';
import { useTranslation } from 'react-i18next';

const Verify = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.success' });

  return (
    <div className="flex items-center justify-center h-screen w-full text-center">
      <div className="max-w-[450px] flex flex-col items-center">
        <div className="mb-4">
          <IcoCheckCircle40 color="success" />
        </div>
        <h1 className="text-heading-3 text-success mb-6">{t('title')}</h1>
        <p className="text-body-2 text-secondary mb-6 flex items-center gap-2">{t('description')}</p>
      </div>
    </div>
  );
};

export default Verify;
