import { useTranslation } from '@onefootprint/hooks';
import type { Icon } from '@onefootprint/icons';
import {
  IcoBuilding24,
  IcoFileText24,
  IcoPhone24,
  IcoUserCircle24,
} from '@onefootprint/icons';
import { CollectedKybDataOption } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

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
  const { t } = useTranslation('pages.authorize');

  const collectedKybDataOptionLabels: Record<CollectedKybDataOption, string> = {
    [CollectedKybDataOption.name]: t('data-labels.business-name'),
    [CollectedKybDataOption.tin]: t('data-labels.business-tin'),
    [CollectedKybDataOption.address]: t('data-labels.business-address'),
    [CollectedKybDataOption.phoneNumber]: t(
      'data-labels.business-phone-number',
    ),
    [CollectedKybDataOption.website]: t('data-labels.business-website'),
    [CollectedKybDataOption.corporationType]: t('data-labels.corporation-type'),
    [CollectedKybDataOption.beneficialOwners]: t(
      'data-labels.business-beneficial-owners',
    ),
    [CollectedKybDataOption.kycedBeneficialOwners]: t(
      'data-labels.kyced-business-beneficial-owners',
    ),
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
        <Typography variant="label-1" sx={{ width: '100%' }}>
          {t('kyb.title')}
        </Typography>
      )}
      <FieldsList fields={fields} />{' '}
    </>
  ) : null;
};

export default KybFields;
