import { getOrgFootprintWrappedOptions } from '@onefootprint/axios/dashboard';
import type { GetOrgFootprintWrappedData } from '@onefootprint/request-types/dashboard';
import { Dialog, LinkButton, Shimmer } from '@onefootprint/ui';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import StatCard from './components/stat-card';

type WrappedDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const WrappedDialog = ({ isOpen, onClose }: WrappedDialogProps) => {
  const { t } = useTranslation('home', { keyPrefix: 'wrapped' });
  const { data, isLoading } = useQuery(getOrgFootprintWrappedOptions());

  const metricsToShow = {
    nBusinessOnboarded: t('businesses-onboarded'),
    nDocument: t('documents-collected'),
    nPasskeys: t('passkeys-registered'),
    nStepups: t('step-ups-generated'),
    nPersonOnboarded: t('users-onboarded'),
    pctWaterfallVerifRateIncrease: t('verification-rate-improvement'),
  };

  return (
    <Dialog open={isOpen} onClose={onClose} title={t('title')} noPadding>
      {isLoading || !data ? (
        <Shimmer height="788px" />
      ) : (
        <div className="flex flex-col">
          <div className="relative bg-quaternary bg-opacity-25 w-full h-[300px] flex flex-col gap-6">
            <div className="flex flex-col h-full p-6">
              <Image
                width={132}
                height={101}
                src="/wrapped/illu_id@2x.png"
                alt={t('id-illustration-alt')}
                className="absolute top-5 left-6"
              />
              <Image
                width={182}
                height={252}
                src="/wrapped/illu_gift_percy@2x.png"
                alt={t('gift-illustration-alt')}
                className="absolute top-5 right-6"
              />
              <div className="mt-auto mb-6">
                <div className="w-[70%] text-left text-4xl font-bold text-primary">{t('title')}</div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(metricsToShow).map(([key, label]) => (
                <StatCard
                  key={key}
                  label={label}
                  value={data[key as keyof GetOrgFootprintWrappedData]}
                  isPercentage={key === 'pctWaterfallVerifRateIncrease'}
                />
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-primary text-body-3">{t('thank-you-text')}</p>
              {/* @ts-expect-error  - Dave says this is untyped JSON on the backend*/}
              <LinkButton href={data?.downloadLink} $marginTop={2}>
                {t('download')}
              </LinkButton>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default WrappedDialog;
