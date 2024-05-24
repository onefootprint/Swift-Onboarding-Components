import type { BeneficialOwner } from '@onefootprint/types';
import {
  BeneficialOwnerDataAttribute,
  BusinessDI,
  CollectedKybDataOption,
  IdDI,
} from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import HeaderTitle from '../../../../components/layout/components/header-title';
import { Logger } from '../../../../utils/logger';
import CollectKybDataNavigationHeader from '../../components/collect-kyb-data-navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import BeneficialOwnersForm from './components/form';
import useCheckDuplicateContacts from './hooks/check-duplicate-contacts';

type BeneficialOwnersProps = {
  hideHeader?: boolean;
  ctaLabel?: string;
  onComplete?: () => void;
  onCancel?: () => void;
};

const BeneficialOwners = ({
  ctaLabel,
  hideHeader,
  onComplete,
  onCancel,
}: BeneficialOwnersProps) => {
  const [state, send] = useCollectKybDataMachine();
  const {
    idvContext: { authToken },
    data,
    kybRequirement: { missingAttributes },
    kycUserData,
    config,
  } = state.context;
  const { mutation, syncData } = useSyncData();
  const checkDuplicateContacts = useCheckDuplicateContacts();
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.pages.beneficial-owners',
  });
  const requireMultiKyc = missingAttributes.includes(
    CollectedKybDataOption.kycedBeneficialOwners,
  );

  const handleSubmit = (beneficialOwners: BeneficialOwner[]) => {
    if (config?.isLive) {
      // Check that no two beneficial owners have the same email or phone number, when not sandbox
      const hasDuplicateContacts = checkDuplicateContacts(beneficialOwners);
      if (hasDuplicateContacts) {
        return;
      }
    }
    const submittedData = requireMultiKyc
      ? { [BusinessDI.kycedBeneficialOwners]: beneficialOwners }
      : { [BusinessDI.beneficialOwners]: beneficialOwners };

    const handleSuccess = () => {
      send({
        type: 'beneficialOwnersSubmitted',
        payload: submittedData,
      });
      onComplete?.();
    };

    const handleError = (error: string) => {
      Logger.error(
        `Speculatively vaulting data failed in kyb beneficial-owners page: ${error}}`,
        { location: 'kyb-beneficial-owners' },
      );
    };

    if (!authToken) {
      return;
    }
    syncData({
      authToken,
      data: submittedData,
      speculative: true,
      onSuccess: handleSuccess,
      onError: handleError,
    });
  };

  const defaultData = requireMultiKyc
    ? data?.[BusinessDI.kycedBeneficialOwners]
    : data?.[BusinessDI.beneficialOwners];
  const defaultValues = defaultData ?? [
    {
      [BeneficialOwnerDataAttribute.firstName]: '',
      [BeneficialOwnerDataAttribute.middleName]: '',
      [BeneficialOwnerDataAttribute.lastName]: '',
      [BeneficialOwnerDataAttribute.email]:
        kycUserData?.[IdDI.email]?.value ?? '',
      [BeneficialOwnerDataAttribute.phoneNumber]:
        kycUserData?.[IdDI.phoneNumber]?.value ?? '',
      [BeneficialOwnerDataAttribute.ownershipStake]: 0,
    },
  ];

  return (
    <Stack direction="column" gap={5}>
      {!hideHeader && (
        <>
          <CollectKybDataNavigationHeader />
          <HeaderTitle
            title={t('title')}
            subtitle={t('subtitle')}
            marginBottom={7}
          />
        </>
      )}
      <BeneficialOwnersForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        isLoading={mutation.isLoading}
        ctaLabel={ctaLabel}
        requireMultiKyc={requireMultiKyc}
        config={config}
      />
    </Stack>
  );
};

export default BeneficialOwners;
