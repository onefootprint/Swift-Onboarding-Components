import { useTranslation } from '@onefootprint/hooks';
import { IcoWarning16 } from '@onefootprint/icons';
import { getErrorMessage } from '@onefootprint/request';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';
import Timeline from 'src/components/timeline';

import useEntityId from '@/entity/hooks/use-entity-id';

import useEntityMatchSignals from '../../hooks/use-entity-match-signals';
import {
  ValidationTimelineItemBody,
  ValidationTimelineItemHeader,
  ValidationTimelineItemIcon,
} from '../validation-timeline-item';
import Loading from './components/loading';

const ValidationItems = () => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.onboarding-decision-event.field-validation.drawer',
  );
  const id = useEntityId();
  const { data, isError, error, isLoading } = useEntityMatchSignals({
    id,
  });

  if (isError) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginLeft: 13,
        }}
      >
        <IcoWarning16 />
        <Typography variant="body-3" sx={{ marginLeft: 2 }}>
          {getErrorMessage(error)}
        </Typography>
      </Box>
    );
  }
  if (isLoading) {
    return <Loading />;
  }
  if (data && data.length > 0) {
    const timelineItems = data.map(validationEntry => {
      const { attribute, matchLevel, signals } = validationEntry;
      return {
        headerComponent: (
          <ValidationTimelineItemHeader
            attribute={attribute}
            matchLevel={matchLevel}
          />
        ),
        bodyComponent: <ValidationTimelineItemBody signals={signals} />,
        iconComponent: <ValidationTimelineItemIcon attribute={attribute} />,
      };
    });
    return <Timeline items={timelineItems} />;
  }
  if (data && data.length === 0) {
    return (
      <Typography variant="body-3" sx={{ marginLeft: 13 }}>
        {t('no-data')}
      </Typography>
    );
  }
  return null;
};

export default ValidationItems;
