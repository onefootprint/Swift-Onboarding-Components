import { useTranslation } from '@onefootprint/hooks';
import {
  CollectedKycDataEventData,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import createTagList from 'src/utils/create-tag-list';
import styled, { css } from 'styled-components';

type KycDataCollectedEventHeaderProps = {
  data: CollectedKycDataEventData;
  isFromOtherOrg?: boolean;
};

const KycDataCollectedEventHeader = ({
  data,
  isFromOtherOrg,
}: KycDataCollectedEventHeaderProps) => {
  const { t, allT } = useTranslation(
    'pages.user-details.audit-trail.timeline.kyc-data-collected-event',
  );
  const { attributes } = data;
  const attributeLabels = attributes.map((attr: CollectedKycDataOption) =>
    allT(`collected-data-options.${attr}`),
  );

  return (
    <Container data-testid="kyc-data-collected-event-header">
      <Typography
        variant="label-3"
        color={isFromOtherOrg ? 'tertiary' : 'primary'}
        sx={{ marginRight: 1 }}
      >
        {isFromOtherOrg ? t('title-from-other-org') : t('title')}
      </Typography>
      {createTagList(attributeLabels)}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: ${theme.spacing[2]};
  `}
`;

export default KycDataCollectedEventHeader;
