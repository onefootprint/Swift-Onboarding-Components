import type { CollectedDataOption } from '@onefootprint/types';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  InvestorProfileDI,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

import getCdos from './utils/get-cdos';

type CdoListProps = {
  cdos: (CollectedDataOption | string)[];
  optionalCdos?: (CollectedDataOption | string)[];
  disableSort?: boolean;
  singleDocument?: boolean;
};

const investorProfileDIOrder: Record<string, number> = Object.fromEntries(
  Object.values(InvestorProfileDI).map((value, index) => [value, index]),
);

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

export const InvestorProfileDiList = ({ diList }: { diList?: InvestorProfileDI[] }) => {
  const { t } = useTranslation('common');
  const investorProfileLabel = t(`cdo.${CollectedInvestorProfileDataOption.investorProfile}`);

  if (diList && diList.length > 0) {
    const investorDILabels = diList
      .filter(di => di !== InvestorProfileDI.declarations)
      .sort((diA, diB) => investorProfileDIOrder[diA] - investorProfileDIOrder[diB])
      .map(di => t(`di.${di}`));

    return <Text variant="label-3">{`${investorProfileLabel} (${investorDILabels.join(', ')})`}</Text>;
  }

  return <Text variant="label-3">{investorProfileLabel}</Text>;
};

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
