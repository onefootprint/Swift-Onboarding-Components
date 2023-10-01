import { useTranslation } from '@onefootprint/hooks';
import type { CollectedDataOption } from '@onefootprint/types';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import { Tag, Typography } from '@onefootprint/ui';
import React, { Fragment } from 'react';

import getCdos from './utils/get-cdos';

type CdoTagListProps = {
  label?: string;
  testID?: string;
  cdos: (CollectedDataOption | string)[];
  optionalCdos?: (CollectedDataOption | string)[];
  disableSort?: boolean;
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

const CdoTagList = ({
  label,
  testID,
  cdos,
  // TODO: This is temporaly and not ideal, I'll refactor this component
  // https://linear.app/footprint/issue/FP-5714/refactor-cdo-tag-list-components
  optionalCdos = [],
  disableSort,
}: CdoTagListProps) => {
  const { t } = useTranslation('cdo');
  const allCdos = getCdos(cdos);
  const optionalCdosList = getCdos(optionalCdos);
  const allTagLabels = allCdos.map(cdo => t(cdo));
  const optionalCdosLabels = optionalCdosList.map(
    cdo => `${t(cdo)} ‧ Optional`,
  );
  const tagLabels = [...allTagLabels, ...optionalCdosLabels];

  const attributeLabels = tagOrder.map(attr => t(attr));
  if (!disableSort)
    tagLabels.sort(
      (a, b) => attributeLabels.indexOf(a) - attributeLabels.indexOf(b),
    );

  return (
    <>
      {label && (
        <Typography
          variant="label-4"
          color="secondary"
          sx={{ marginRight: 2, alignItems: 'center', display: 'flex' }}
          data-testid={testID}
        >
          {label}
        </Typography>
      )}
      {tagLabels.map((tag: string) => (
        <Tag role="listitem" aria-label={tag} key={tag} data-testid={testID}>
          {tag}
        </Tag>
      ))}
    </>
  );
};

export default CdoTagList;
