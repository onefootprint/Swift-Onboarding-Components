import type { BeneficialOwner } from '@onefootprint/types';
import { BeneficialOwnerDataAttribute, BusinessDI, CollectedKybDataOption, IdDI } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import { cloneDeep } from 'lodash';
import HeaderTitle from '../../../../components/layout/components/header-title';
import { getLogger } from '../../../../utils/logger';
import CollectKybDataNavigationHeader from '../../components/collect-kyb-data-navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import { omitNullAndUndefined } from '../../utils/utils';
import BeneficialOwnersForm from './components/form';
import useCheckDuplicateContacts from './hooks/check-duplicate-contacts';

type BeneficialOwnersProps = {
  ctaLabel?: string;
  hideHeader?: boolean;
  onCancel?: () => void;
  onComplete?: () => void;
};

const { logError } = getLogger({ location: 'kyb-beneficial-owners' });

const BeneficialOwners = ({ ctaLabel, hideHeader, onCancel, onComplete }: BeneficialOwnersProps) => {
  const [state, send] = useCollectKybDataMachine();
  const {
    idvContext: { authToken },
    data,
    kybRequirement: { missingAttributes },
    bootstrapUserData,
    vaultBusinessData,
    config,
  } = state.context;
  const { mutation, syncData } = useSyncData();
  const checkDuplicateContacts = useCheckDuplicateContacts();
  const { t } = useTranslation('idv', { keyPrefix: 'kyb.pages.beneficial-owners' });
  const requireMultiKyc = missingAttributes.includes(CollectedKybDataOption.kycedBeneficialOwners);
  const canEdit = !vaultBusinessData?.['business.kyced_beneficial_owners']?.length;

  const handleSubmit = (beneficialOwnersRaw: BeneficialOwner[]) => {
    const beneficialOwners = beneficialOwnersRaw.map(omitNullAndUndefined);

    if (config?.isLive) {
      // Check that no two beneficial owners have the same email or phone number, when not sandbox
      const hasDuplicateContacts = checkDuplicateContacts(beneficialOwners);
      if (hasDuplicateContacts) {
        return;
      }
    }

    const payload = requireMultiKyc
      ? { [BusinessDI.kycedBeneficialOwners]: beneficialOwners }
      : { [BusinessDI.beneficialOwners]: beneficialOwners };

    if (!authToken) {
      return;
    }

    syncData({
      authToken,
      data: payload,
      onSuccess: () => {
        send({ type: 'beneficialOwnersSubmitted', payload });
        onComplete?.();
      },
      onError: (error: string) => {
        logError(`Error vaulting kyb beneficial-owners data: ${error}}`, error);
      },
    });
  };

  const defaultData = requireMultiKyc ? data?.[BusinessDI.kycedBeneficialOwners] : data?.[BusinessDI.beneficialOwners];
  const defaultValues = cloneDeep(defaultData) ?? [
    {
      [BeneficialOwnerDataAttribute.firstName]: '',
      [BeneficialOwnerDataAttribute.middleName]: '',
      [BeneficialOwnerDataAttribute.lastName]: '',
      [BeneficialOwnerDataAttribute.email]: bootstrapUserData?.[IdDI.email]?.value ?? '',
      [BeneficialOwnerDataAttribute.phoneNumber]: bootstrapUserData?.[IdDI.phoneNumber]?.value ?? '',
      [BeneficialOwnerDataAttribute.ownershipStake]: 0,
    },
  ];

  return (
    <Stack direction="column" gap={5}>
      {!hideHeader && (
        <>
          <CollectKybDataNavigationHeader />
          <HeaderTitle title={t('title')} subtitle={t('subtitle')} marginBottom={7} />
        </>
      )}
      <BeneficialOwnersForm
        config={config}
        ctaLabel={ctaLabel}
        defaultValues={defaultValues}
        hideHeader={hideHeader}
        isLoading={mutation.isLoading}
        onCancel={onCancel}
        onSubmit={handleSubmit}
        requireMultiKyc={requireMultiKyc}
        canEdit={canEdit}
      />
    </Stack>
  );
};

export default BeneficialOwners;
