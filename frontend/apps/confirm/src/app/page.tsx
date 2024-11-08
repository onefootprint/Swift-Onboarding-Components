'use client';

import { postHostedUserEmailVerifyMutation } from '@onefootprint/axios';
import { LogoFpDefault } from '@onefootprint/icons';
import { LoadingSpinner } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const Verify = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.verify' });
  const mutation = useMutation(postHostedUserEmailVerifyMutation());
  const [challenge, setChallenge] = useState('');

  useEffect(() => {
    setChallenge(window.location.hash.slice(1));
  }, []);

  useEffect(() => {
    const challenge = window.location.hash.slice(1);
    if (challenge) {
      mutation.mutate({ body: { data: challenge } });
    }
  }, [challenge]);

  return (
    <div className="flex items-center justify-center h-screen w-full text-center">
      <div className="max-w-[350px] flex flex-col items-center">
        <div className="mb-10">
          <LogoFpDefault />
        </div>
        {mutation.isPending && <LoadingSpinner />}
        {mutation.isSuccess && (
          <>
            <h3 className="text-heading-3 text-primary mb-10">{t('success.title')}</h3>
            <p className="text-body-2 text-secondary">{t('success.description')}</p>
          </>
        )}
        {(mutation.isError || !challenge) && (
          <>
            <h3 className="text-heading-3 text-primary mb-10">{t('error.title')}</h3>
            <p className="text-body-2 text-secondary">{t('error.description')}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default Verify;
