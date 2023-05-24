import { useTranslation } from '@onefootprint/hooks';
import {
  CollectedDataOption,
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { Tag } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type CdoTagListProps = {
  testID?: string;
  cdos: CollectedDataOption[];
  disableSort?: boolean;
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
];

const CdoTagList = ({ testID, cdos, disableSort }: CdoTagListProps) => {
  const { t } = useTranslation('cdo');
  const attributeLabels = order.map(attr => t(attr));
  const tagLabels = cdos.map(attr => t(attr));
  if (!disableSort)
    tagLabels.sort(
      (a, b) => attributeLabels.indexOf(a) - attributeLabels.indexOf(b),
    );

  return (
    <Container data-testid={testID}>
      {tagLabels.map((tag: string) => (
        <Tag role="listitem" aria-label={tag} key={tag}>
          {tag}
        </Tag>
      ))}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing[2]};
  `}
`;

export default CdoTagList;
