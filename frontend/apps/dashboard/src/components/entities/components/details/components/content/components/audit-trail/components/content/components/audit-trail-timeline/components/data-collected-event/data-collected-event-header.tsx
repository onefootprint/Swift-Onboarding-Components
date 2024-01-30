import styled, { css } from '@onefootprint/styled';
import type { CollectedDataEventData } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Actor from '../actor';
import CdoList from './components/cdo-list';

type DataCollectedEventHeaderProps = {
  data: CollectedDataEventData;
};

const DataCollectedEventHeader = ({ data }: DataCollectedEventHeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.data-collected-event',
  });
  const { attributes } = data;

  let title = (
    <TertiaryColor>
      {data.isPrefill ? t('title-prefill') : t('title')}
    </TertiaryColor>
  );
  if (data.actor) {
    title = (
      <>
        <Actor actor={data.actor} />
        <TertiaryColor>{t('title-edited')}</TertiaryColor>
      </>
    );
  }

  return (
    <Container data-testid="data-collected-event-header">
      <Typography variant="body-3">{title}</Typography>
      <CdoList cdos={attributes} />
      {data.isPrefill && (
        <Typography variant="body-3" color="tertiary">
          {t('end-prefill')}
        </Typography>
      )}
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

const TertiaryColor = styled.span`
  ${({ theme }) => css`
    color: ${theme.color.tertiary};
  `}
`;

export default DataCollectedEventHeader;
