import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import Timeline from 'src/components/timeline';
import styled from 'styled-components';

import ErrorComponent from './components/error';
import Loading from './components/loading';
import {
  ValidationTimelineItemBody,
  ValidationTimelineItemHeader,
  ValidationTimelineItemIcon,
} from './components/validation-timeline-item';
import useEntityMatchSignals from './hooks/use-entity-match-signals';

export type FieldValidationsProps = {
  entityId: string;
};

const FieldValidations = ({ entityId }: FieldValidationsProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.onboarding-decision-event.not-verified-details.drawer',
  });
  const { data, isError, error, isPending } = useEntityMatchSignals({
    id: entityId,
  });

  const getContent = () => {
    if (data && data.length > 0) {
      const timelineItems = data.map(validationEntry => {
        const { attribute, matchLevel, signals } = validationEntry;
        return {
          headerComponent: <ValidationTimelineItemHeader attribute={attribute} matchLevel={matchLevel} />,
          bodyComponent: <ValidationTimelineItemBody signals={signals} />,
          iconComponent: <ValidationTimelineItemIcon attribute={attribute} />,
        };
      });
      return <Timeline items={timelineItems} />;
    }
    if (data && data.length === 0) {
      return (
        <Text variant="body-3" marginLeft={13}>
          {t('no-data')}
        </Text>
      );
    }
    return null;
  };

  return (
    <Container>
      {isError && <ErrorComponent error={error} />}
      {isPending && <Loading />}
      {!isError && !isPending && getContent()}
    </Container>
  );
};

const Container = styled.div`
  margin-left: -150px;
`;

export default FieldValidations;
