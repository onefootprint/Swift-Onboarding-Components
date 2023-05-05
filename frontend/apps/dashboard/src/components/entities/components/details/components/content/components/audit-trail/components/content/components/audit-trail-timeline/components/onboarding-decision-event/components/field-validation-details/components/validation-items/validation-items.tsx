import React from 'react';
import { TransformedMatchSignalDataType } from 'src/components/entities/components/details/components/content/components/audit-trail/components/content/components/audit-trail-timeline/components/onboarding-decision-event/components/field-validation-details/hooks/use-entity-match-signals/utils/transform-response';
import Timeline from 'src/components/timeline/timeline';

import {
  ValidationTimelineItemBody,
  ValidationTimelineItemHeader,
  ValidationTimelineItemIcon,
} from '../validation-timeline-item';

type ValidationItemsProps = { data: TransformedMatchSignalDataType[] };

const ValidationItems = ({ data }: ValidationItemsProps) => {
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
};

export default ValidationItems;
