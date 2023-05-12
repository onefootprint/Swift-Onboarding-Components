import { useTranslation } from '@onefootprint/hooks';
import { PreviousWatchlistChecksEventData } from '@onefootprint/types';
import { Drawer, LinkButton, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled from 'styled-components';

import WatchlistCheckEventsDrawerContent from './components/watchlist-check-events-drawer-content';

type PreviousWatchlistCheckEventsProps = {
  data: PreviousWatchlistChecksEventData;
};

const PreviousWatchlistCheckEvents = ({
  data,
}: PreviousWatchlistCheckEventsProps) => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.watchlist-check-event',
  );
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const hasPreviousWatchlistChecks = data.length > 0;
  return hasPreviousWatchlistChecks ? (
    <>
      <Typography variant="label-3" sx={{ marginLeft: 2, marginRight: 2 }}>
        &middot;
      </Typography>
      <LinkButton
        onClick={() => {
          setDrawerOpen(true);
        }}
        size="compact"
      >
        {t('previous-checks-button.label')}
      </LinkButton>
      <Drawer
        open={isDrawerOpen}
        title="Watchlist checks"
        onClose={() => {
          setDrawerOpen(false);
        }}
      >
        <DrawerContentContainer>
          <WatchlistCheckEventsDrawerContent data={data} />
        </DrawerContentContainer>
      </Drawer>
    </>
  ) : null;
};

const DrawerContentContainer = styled.div`
  margin-left: -150px;
`;

export default PreviousWatchlistCheckEvents;
