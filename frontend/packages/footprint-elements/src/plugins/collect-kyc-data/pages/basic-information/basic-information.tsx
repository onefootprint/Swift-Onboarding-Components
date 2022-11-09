import { useTranslation } from '@onefootprint/hooks';
import { CollectedKycDataOption } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../components/header-title';
import { useCollectKycDataMachine } from '../../components/machine-provider';
import NavigationHeader from '../../components/navigation-header';
import useSyncData from '../../hooks/use-sync-data';
import { BasicInformation as BasicInformationData } from '../../utils/data-types';
import { Events } from '../../utils/state-machine/types';
import DobForm from './components/dob-form';
import NameAndDobForm from './components/name-and-dob-form';
import NameForm from './components/name-form';

type BasicInformationProps = {
  hideHeader?: boolean;
  ctaLabel?: string;
  onComplete?: () => void;
};

const BasicInformation = ({
  ctaLabel,
  hideHeader,
  onComplete,
}: BasicInformationProps) => {
  const [state, send] = useCollectKycDataMachine();
  const { authToken, missingAttributes } = state.context;
  const { mutation, syncData } = useSyncData();
  const toast = useToast();
  const { t } = useTranslation('pages.basic-information');

  const onSubmit = (basicInformation: BasicInformationData) => {
    const handleSuccess = () => {
      send({
        type: Events.basicInformationSubmitted,
        payload: {
          basicInformation,
        },
      });
      onComplete?.();
    };

    const handleError = () => {
      toast.show({
        title: t('sync-data-error.title'),
        description: t('sync-data-error.description'),
        variant: 'error',
      });
    };

    if (!authToken) {
      return;
    }
    syncData(authToken, basicInformation, {
      speculative: true,
      onSuccess: handleSuccess,
      onError: handleError,
    });
  };

  const requiresName = missingAttributes.includes(CollectedKycDataOption.name);
  const requiresDob = missingAttributes.includes(CollectedKycDataOption.dob);

  const renderForm = () => {
    if (requiresName && requiresDob) {
      return (
        <NameAndDobForm
          onSubmit={onSubmit}
          isLoading={mutation.isLoading}
          ctaLabel={ctaLabel}
        />
      );
    }
    if (requiresName) {
      return (
        <NameForm
          onSubmit={onSubmit}
          isLoading={mutation.isLoading}
          ctaLabel={ctaLabel}
        />
      );
    }
    return (
      <DobForm
        onSubmit={onSubmit}
        isLoading={mutation.isLoading}
        ctaLabel={ctaLabel}
      />
    );
  };

  return (
    <>
      {hideHeader ? null : (
        <>
          <HeaderTitle
            title={t('title')}
            subtitle={t('subtitle')}
            sx={{ marginBottom: 7 }}
          />
          <NavigationHeader />
        </>
      )}
      {renderForm()}
    </>
  );
};

export default BasicInformation;
