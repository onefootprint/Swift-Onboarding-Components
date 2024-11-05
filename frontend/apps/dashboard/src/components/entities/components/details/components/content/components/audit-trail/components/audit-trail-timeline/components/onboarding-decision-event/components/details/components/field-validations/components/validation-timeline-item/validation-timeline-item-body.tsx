import { Text, createFontStyles } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { SignalShortInfoType } from '../../hooks/use-entity-match-signals/utils/transform-response';

type ValidationTimelineItemBodyProps = {
  signals: SignalShortInfoType[];
};

const ValidationTimelineItemBody = ({ signals }: ValidationTimelineItemBodyProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.onboarding-decision-event.not-verified-details.field-validations',
  });

  return (
    <>
      {signals.map(({ matchLevel, description, reasonCode }, i) => {
        const key = `${reasonCode}-${i}`;
        return (
          <Container key={key}>
            <Text tag="span" variant="label-3">
              •
            </Text>
            <Text variant="body-3" width="100%">
              <Title>{`${t(`match-level.${matchLevel}` as ParseKeys<'common'>)}:`}</Title>
              {description}
            </Text>
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
