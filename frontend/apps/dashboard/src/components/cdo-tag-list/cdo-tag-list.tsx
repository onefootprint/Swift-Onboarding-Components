import { useTranslation } from '@onefootprint/hooks';
import {
  CollectedDataOption,
  CollectedDocumentDataOption,
  CollectedIdDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { Tag } from '@onefootprint/ui';
import React from 'react';

type CdoTagListProps = {
  cdos: CollectedDataOption[];
};

const order: CollectedDataOption[] = [
  CollectedKycDataOption.name,
  CollectedKycDataOption.email,
  CollectedKycDataOption.fullAddress,
  CollectedKycDataOption.partialAddress,
  CollectedKycDataOption.dob,
  CollectedKycDataOption.phoneNumber,
  CollectedKycDataOption.ssn4,
  CollectedKycDataOption.ssn9,
  CollectedKybDataOption.name,
  CollectedKybDataOption.tin,
  CollectedKybDataOption.address,
  CollectedKybDataOption.phoneNumber,
  CollectedKybDataOption.website,
  CollectedKybDataOption.beneficialOwners,
  CollectedInvestorProfileDataOption.investorProfile,
  CollectedDocumentDataOption.document,
  CollectedIdDocumentDataOption.document,
  CollectedIdDocumentDataOption.documentAndSelfie,
];

const CdoTagList = ({ cdos }: CdoTagListProps) => {
  const { t } = useTranslation('cdo');
  const attributeLabels = order.map(attr => t(attr));
  const tagLabels = cdos
    .map(attr => t(attr))
    .sort((a, b) => attributeLabels.indexOf(a) - attributeLabels.indexOf(b));

  return (
    <>
      {tagLabels.map((tag: string) => (
        <Tag role="listitem" aria-label={tag} key={tag}>
          {tag}
        </Tag>
      ))}
    </>
  );
};

export default CdoTagList;
