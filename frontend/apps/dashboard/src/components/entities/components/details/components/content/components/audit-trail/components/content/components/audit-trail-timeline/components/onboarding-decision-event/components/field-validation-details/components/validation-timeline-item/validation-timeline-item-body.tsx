import { useTranslation } from '@onefootprint/hooks';
import { IcoDotSmall16 } from '@onefootprint/icons';
import { Box, Typography } from '@onefootprint/ui';
import React from 'react';

import { SignalShortInfoType } from '../../hooks/use-entity-match-signals/utils/transform-response';

type ValidationTimelineItemBodyProps = {
  signals: SignalShortInfoType[];
};

const ValidationTimelineItemBody = ({
  signals,
}: ValidationTimelineItemBodyProps) => {
  const { t } = useTranslation(
    'pages.entity.audit-trail.timeline.onboarding-decision-event.field-validation',
  );

  return (
    <>
      {signals.map(signal => {
        const { matchLevel, description } = signal;
        return (
          <Box sx={{ display: 'flex' }}>
            <Box sx={{ marginRight: 2 }}>
              <IcoDotSmall16 />
            </Box>
            <Typography variant="body-3">
              <Typography as="span" variant="label-3">
                {`${t(`match-level.${matchLevel}`)}: `}
              </Typography>
              {description}
            </Typography>
          </Box>
        );
      })}
    </>
  );
};

export default ValidationTimelineItemBody;
