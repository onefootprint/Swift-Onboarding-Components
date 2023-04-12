import { useTranslation } from '@onefootprint/hooks';
import { CollectedDataEventData } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import CdoTagList from 'src/components/cdo-tag-list';
import styled, { css } from 'styled-components';

type DataCollectedEventHeaderProps = {
  data: CollectedDataEventData;
  isFromOtherOrg?: boolean;
};

const DataCollectedEventHeader = ({
  data,
  isFromOtherOrg,
}: DataCollectedEventHeaderProps) => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.data-collected-event',
  );
  const { attributes } = data;
  // const attributeLabels = attributes.map(attr => allT(`cdo.${attr}`));

  return (
    <Container data-testid="data-collected-event-header">
      <Typography
        variant="label-3"
        color={isFromOtherOrg ? 'tertiary' : 'primary'}
        sx={{ marginRight: 1 }}
      >
        {isFromOtherOrg ? t('title-from-other-org') : t('title')}
      </Typography>
      <CdoTagList cdos={attributes} />
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

export default DataCollectedEventHeader;
