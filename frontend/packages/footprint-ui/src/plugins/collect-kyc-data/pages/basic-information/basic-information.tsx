import { useTranslation } from '@onefootprint/hooks';
import { CollectedDataOption } from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import React from 'react';

import { useCollectKycDataMachine } from '../../components/machine-provider';
import useSyncData from '../../hooks/use-sync-data';
import { BasicInformation as BasicInformationData } from '../../utils/data-types';
import { Events } from '../../utils/state-machine/types';
import NameAndDobForm from './components/name-and-dob-form';
import NameForm from './components/name-form';

type BasicInformationProps = {
  hideTitle?: boolean;
  hideNavHeader?: boolean;
  ctaLabel?: string;
  onComplete?: () => void;
};

const BasicInformation = ({
  ctaLabel,
  hideTitle: hideHeader,
  hideNavHeader,
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

  const requiresDob = missingAttributes.includes(CollectedDataOption.dob);
  if (requiresDob) {
    return (
      <NameAndDobForm
        onSubmit={onSubmit}
        isMutationLoading={mutation.isLoading}
        ctaLabel={ctaLabel}
        hideTitle={hideHeader}
        hideNavHeader={hideNavHeader}
      />
    );
  }

  return (
    <NameForm
      onSubmit={onSubmit}
      isMutationLoading={mutation.isLoading}
      ctaLabel={ctaLabel}
      hideTitle={hideHeader}
      hideNavHeader={hideNavHeader}
    />
  );
};

export default BasicInformation;
