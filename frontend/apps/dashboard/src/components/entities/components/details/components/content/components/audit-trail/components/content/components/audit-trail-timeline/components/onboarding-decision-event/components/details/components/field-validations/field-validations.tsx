import { Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Timeline from 'src/components/timeline';
import styled from 'styled-components';

import useEntityMatchSignals from '../../hooks/use-entity-match-signals';
import Error from './components/error';
import Loading from './components/loading';
import {
  ValidationTimelineItemBody,
  ValidationTimelineItemHeader,
  ValidationTimelineItemIcon,
} from './components/validation-timeline-item';

export type FieldValidationsProps = {
  entityId: string;
};

const FieldValidations = ({ entityId }: FieldValidationsProps) => {
  const { t } = useTranslation('common', {
    keyPrefix:
      'pages.entity.audit-trail.timeline.onboarding-decision-event.not-verified-details.drawer',
  });
  const { data, isError, error, isLoading } = useEntityMatchSignals({
    id: entityId,
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
