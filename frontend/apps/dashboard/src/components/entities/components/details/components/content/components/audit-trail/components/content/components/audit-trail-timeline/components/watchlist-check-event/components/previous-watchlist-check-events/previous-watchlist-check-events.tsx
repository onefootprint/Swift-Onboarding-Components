import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import { PreviousWatchlistChecksEventData } from '@onefootprint/types';
import { Box, Drawer, LinkButton, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

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
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
      </Box>
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
