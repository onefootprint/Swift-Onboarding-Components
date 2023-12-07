import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { CollectedDataEventData } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import CdoTagList from 'src/components/cdo-tag-list';

import Actor from '../actor';

type DataCollectedEventHeaderProps = {
  data: CollectedDataEventData;
};

const DataCollectedEventHeader = ({ data }: DataCollectedEventHeaderProps) => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.data-collected-event',
  );
  const { attributes } = data;

  let title = <>{t('title')}</>;
  if (data.isPrefill) {
    title = <>{t('title-prefill')}</>;
  } else if (data.actor) {
    title = (
      <>
        <Actor actor={data.actor} />
        {t('title-edited')}
      </>
    );
  }

  return (
    <Container data-testid="data-collected-event-header">
      <Typography variant="label-3" color="primary" sx={{ marginRight: 1 }}>
        {title}
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
