import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  CollectedDataOption,
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { Tag, Typography } from '@onefootprint/ui';
import React from 'react';

type CdoTagListProps = {
  label?: string;
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

const isDocumentDi = (cdo: string) => cdo.startsWith('document.');

const isDocumentAndSelfieDi = (cdo: string) =>
  isDocumentDi(cdo) && cdo.indexOf('selfie') > -1;

const CdoTagList = ({ label, testID, cdos, disableSort }: CdoTagListProps) => {
  const { t } = useTranslation('cdo');
  const processedCdos = cdos.map(cdo => {
    if (isDocumentAndSelfieDi(cdo)) {
      return CollectedDocumentDataOption.documentAndSelfie;
    }
    if (isDocumentDi(cdo)) {
      return CollectedDocumentDataOption.document;
    }
    return cdo;
  });
  const attributeLabels = order.map(attr => t(attr));
  const tagLabels = processedCdos.map(attr => t(attr));
  if (!disableSort)
    tagLabels.sort(
      (a, b) => attributeLabels.indexOf(a) - attributeLabels.indexOf(b),
    );

  return (
    <Container data-testid={testID}>
      {label && (
        <Typography
          variant="label-4"
          color="secondary"
          sx={{ marginRight: 2, alignItems: 'center', display: 'flex' }}
        >
          {label}
        </Typography>
      )}
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
