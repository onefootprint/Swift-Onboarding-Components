import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { createFontStyles, Typography } from '@onefootprint/ui';
import React from 'react';

import type { SignalShortInfoType } from '../../hooks/use-entity-match-signals/utils/transform-response';

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
      {signals.map(({ matchLevel, description, reasonCode }, i) => {
        const key = `${reasonCode}-${i}`;
        return (
          <Container key={key}>
            <Typography as="span" variant="label-3">
              •
            </Typography>
            <Typography variant="body-3" sx={{ width: '100%' }}>
              <Title>{`${t(`match-level.${matchLevel}`)}:`}</Title>
              {description}
            </Typography>
          </Container>
        );
      })}
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: flex-start;
    gap: ${theme.spacing[4]};
    margin-right: ${theme.spacing[4]};
    margin-bottom: ${theme.spacing[2]};
    max-width: 100%;

    &:last-child {
      margin-bottom: 0;
    }
  `};
`;

const Title = styled.span`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    margin-right: ${theme.spacing[2]};
  `}
`;

export default ValidationTimelineItemBody;
