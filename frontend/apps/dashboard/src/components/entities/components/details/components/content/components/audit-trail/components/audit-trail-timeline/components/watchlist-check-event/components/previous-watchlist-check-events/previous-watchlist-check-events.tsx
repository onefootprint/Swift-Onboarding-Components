import { Drawer, LinkButton, Stack, Text } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import WatchlistCheckEventsDrawerContent from './components/watchlist-check-events-drawer-content';

const PreviousWatchlistCheckEvents = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.watchlist-check-event',
  });
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  return (
    <>
      <Stack align="center">
        <Text variant="label-3" marginLeft={2} marginRight={2}>
          &middot;
        </Text>
        <LinkButton
          onClick={() => {
            setDrawerOpen(true);
          }}
          variant="label-3"
        >
          {t('previous-checks-button.label')}
        </LinkButton>
      </Stack>
      <Drawer
        open={isDrawerOpen}
        title="Watchlist checks"
        onClose={() => {
          setDrawerOpen(false);
        }}
      >
        <DrawerContentContainer>
          <WatchlistCheckEventsDrawerContent />
        </DrawerContentContainer>
      </Drawer>
    </>
  );
};

const DrawerContentContainer = styled.div`
  margin-left: -150px;
`;

export default PreviousWatchlistCheckEvents;
