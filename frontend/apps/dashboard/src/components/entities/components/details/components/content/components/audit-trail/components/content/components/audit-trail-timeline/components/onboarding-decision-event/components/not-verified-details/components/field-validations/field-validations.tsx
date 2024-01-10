import { useTranslation } from '@onefootprint/hooks';
import styled from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import Timeline from 'src/components/timeline';

import useEntityId from '@/entity/hooks/use-entity-id';

import useEntityMatchSignals from '../../hooks/use-entity-match-signals';
import Error from './components/error';
import Loading from './components/loading';
import {
  ValidationTimelineItemBody,
  ValidationTimelineItemHeader,
  ValidationTimelineItemIcon,
} from './components/validation-timeline-item';

const FieldValidations = () => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.onboarding-decision-event.not-verified-details.drawer',
  );
  const id = useEntityId();
  const { data, isError, error, isLoading } = useEntityMatchSignals({
    id,
  });

  const getContent = () => {
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

  return (
    <Container>
      {isError && <Error error={error} />}
      {isLoading && <Loading />}
      {!isError && !isLoading && getContent()}
    </Container>
  );
};

const Container = styled.div`
  margin-left: -150px;
`;

export default FieldValidations;
