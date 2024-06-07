import type { CollectedDataOption } from '@onefootprint/types';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

import getCdos from './utils/get-cdos';

type CdoListProps = {
  cdos: (CollectedDataOption | string)[];
  optionalCdos?: (CollectedDataOption | string)[];
  disableSort?: boolean;
  singleDocument?: boolean;
};

// We need to clean this up when we re-do the CDO structure in the dashboard
const tagOrder: (CollectedDataOption | SupportedIdDocTypes | 'selfie')[] = [
  CollectedKycDataOption.name,
  CollectedKycDataOption.email,
  CollectedKycDataOption.address,
  CollectedKycDataOption.dob,
  CollectedKycDataOption.phoneNumber,
  CollectedKycDataOption.ssn4,
  CollectedKycDataOption.ssn9,
  CollectedKycDataOption.nationality,
  CollectedKybDataOption.name,
  CollectedKybDataOption.tin,
  CollectedKybDataOption.address,
  CollectedKybDataOption.phoneNumber,
  CollectedKybDataOption.website,
  CollectedKybDataOption.beneficialOwners,
  CollectedInvestorProfileDataOption.investorProfile,
  CollectedDocumentDataOption.document,
  CollectedDocumentDataOption.documentAndSelfie,
  SupportedIdDocTypes.driversLicense,
  SupportedIdDocTypes.passport,
  SupportedIdDocTypes.idCard,
  SupportedIdDocTypes.visa,
  SupportedIdDocTypes.workPermit,
  SupportedIdDocTypes.residenceDocument,
  'selfie',
];

const CdoList = ({ cdos, optionalCdos = [], disableSort, singleDocument }: CdoListProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'cdo' });
  const allCdos = getCdos(cdos, !!singleDocument);
  const optionalCdosList = getCdos(optionalCdos, !!singleDocument);
  const allTagLabels = allCdos.map(cdo => t(cdo as ParseKeys<'common'>));
  const optionalCdosLabels = optionalCdosList.map(cdo => `${t(cdo as ParseKeys<'common'>)} ‧ Optional`);
  const tagLabels = [...allTagLabels, ...optionalCdosLabels];

  const attributeLabels: string[] = tagOrder.map(attr => t(attr as ParseKeys<'common'>) as string);
  if (!disableSort) tagLabels.sort((a: string, b: string) => attributeLabels.indexOf(a) - attributeLabels.indexOf(b));

  return <Text variant="label-3">{tagLabels.join(', ')}</Text>;
};

export default CdoList;
