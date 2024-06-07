import type { Icon } from '@onefootprint/icons';
import { IcoBuilding24, IcoFileText24, IcoPhone24, IcoUserCircle24 } from '@onefootprint/icons';
import { CollectedKybDataOption } from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { FieldProps } from '../field';
import FieldsList from '../fields-list';

const IconByCollectedKybDataOption: Record<CollectedKybDataOption, Icon> = {
  [CollectedKybDataOption.name]: IcoFileText24,
  [CollectedKybDataOption.tin]: IcoFileText24,
  [CollectedKybDataOption.address]: IcoBuilding24,
  [CollectedKybDataOption.phoneNumber]: IcoPhone24,
  [CollectedKybDataOption.website]: IcoFileText24,
  [CollectedKybDataOption.corporationType]: IcoFileText24,
  [CollectedKybDataOption.beneficialOwners]: IcoUserCircle24,
  [CollectedKybDataOption.kycedBeneficialOwners]: IcoUserCircle24,
};

type KybFieldsProps = {
  data: CollectedKybDataOption[];
  showTitle?: boolean;
};

const KybFields = ({ data, showTitle }: KybFieldsProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'onboarding.pages.authorize',
  });

  const collectedKybDataOptionLabels: Record<CollectedKybDataOption, string> = {
    [CollectedKybDataOption.name]: t('data-labels.business-name'),
    [CollectedKybDataOption.tin]: t('data-labels.business-tin'),
    [CollectedKybDataOption.address]: t('data-labels.business-address'),
    [CollectedKybDataOption.phoneNumber]: t('data-labels.business-phone-number'),
    [CollectedKybDataOption.website]: t('data-labels.business-website'),
    [CollectedKybDataOption.corporationType]: t('data-labels.business-corporation-type'),
    [CollectedKybDataOption.beneficialOwners]: t('data-labels.business-beneficial-owners'),
    [CollectedKybDataOption.kycedBeneficialOwners]: t('data-labels.kyced-business-beneficial-owners'),
  };

  const fields: FieldProps[] = [];
  data.forEach(cdo => {
    fields.push({
      IconComponent: IconByCollectedKybDataOption[cdo],
      label: collectedKybDataOptionLabels[cdo],
    });
  });

  return fields.length > 0 ? (
    <>
      {showTitle && (
        <Text variant="label-1" width="100%">
          {t('kyb.title')}
        </Text>
      )}
      <FieldsList fields={fields} />{' '}
    </>
  ) : null;
};

export default KybFields;
