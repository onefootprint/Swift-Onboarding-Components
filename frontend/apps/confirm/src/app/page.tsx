'use client';

import {
  getHostedIdentifyVerifyContactInfoOptions,
  postHostedIdentifyVerifyContactInfoMutation,
} from '@onefootprint/axios';
import { IcoForbid40, IcoPinMarker16, IcoSmartphone40 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import type { GetVerifyContactInfoResponse } from '@onefootprint/request-types';
import { Button, LoadingSpinner } from '@onefootprint/ui';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Verify = () => {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';
  const { data, isPending, error } = useQuery(
    getHostedIdentifyVerifyContactInfoOptions({
      headers: {
        'X-Fp-Authorization': token,
      },
    }),
  );

  useEffect(() => {
    if (data?.isVerified) {
      router.push('/success');
    }
  }, [data?.isVerified]);

  return (
    <div className="flex items-center justify-center h-screen w-full text-center">
      {isPending ? <LoadingSpinner /> : null}
      {data && !data.isVerified ? <Content data={data} token={token} /> : null}
      {error ? <ErrorComponent error={error} /> : null}
    </div>
  );
};

const Content = ({ data, token }: { data: GetVerifyContactInfoResponse; token: string }) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.verify' });
  const router = useRouter();
  const mutation = useMutation(
    postHostedIdentifyVerifyContactInfoMutation({
      headers: {
        'X-Fp-Authorization': token,
      },
    }),
  );

  const renderLocation = () => {
    if (!data) return 'Unknown';
    const {
      originInsightEvent: { city, regionName },
    } = data;
    if (!city && !regionName) {
      return 'Unknown';
    }
    const decodedCity = decodeURIComponent(city || '');
    const decodedRegion = decodeURIComponent(regionName || '');
    return [decodedCity, decodedRegion].filter(Boolean).join(', ');
  };

  const handleConfirm = () => {
    mutation.mutate(
      {},
      {
        onSuccess: () => {
          router.push('/success');
        },
        onError: () => {
          router.push('/error');
        },
      },
    );
  };

  return (
    <div className="max-w-[450px] flex flex-col items-center">
      <div className="mb-4">
        <IcoSmartphone40 />
      </div>
      <h1 className="text-heading-3 text-primary mb-6">{t('title', { tenantName: data.tenantName })}</h1>
      <p className="text-label-2 text-primary mb-6 flex items-center gap-2">
        <IcoPinMarker16 />
        {renderLocation()}
      </p>
      <Button variant="primary" fullWidth size="large" onClick={handleConfirm} loading={mutation.isPending}>
        {t('confirm')}
      </Button>
    </div>
  );
};

const ErrorComponent = ({ error }: { error: unknown }) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.verify' });

  return (
    <div className="max-w-[450px] flex flex-col items-center">
      <div className="mb-4">
        <IcoForbid40 color="error" />
      </div>
      <h1 className="text-heading-3 text-error mb-6">{t('error')}</h1>
      <p className="text-body-2 text-secondary mb-6 flex items-center gap-2">{getErrorMessage(error)}</p>
    </div>
  );
};

export default Verify;
