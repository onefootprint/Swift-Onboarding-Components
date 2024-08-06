import type { Color } from '@onefootprint/design-tokens';
import { MatchLevel } from '@onefootprint/types/src/data/match-signal';
import { Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

type ValidationTimelineItemHeaderProps = {
  attribute: string;
  matchLevel: MatchLevel;
};

type MatchColorsType = {
  [key in MatchLevel]: Color;
};

const matchColors: MatchColorsType = {
  [MatchLevel.NoMatch]: 'error',
  [MatchLevel.CouldNotMatch]: 'warning',
  [MatchLevel.Exact]: 'success',
  [MatchLevel.Verified]: 'success',
  [MatchLevel.NotVerified]: 'warning',
  [MatchLevel.Partial]: 'warning',
};

const ValidationTimelineItemHeader = ({ attribute, matchLevel }: ValidationTimelineItemHeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.onboarding-decision-event.not-verified-details.field-validations',
  });

  return (
    <HeaderContainer>
      <Text variant="label-3">{t(`attributes.${attribute}` as ParseKeys<'common'>)}</Text>
      <Text variant="body-4" color={matchColors[matchLevel]}>
        {t(`match-level.${matchLevel}` as ParseKeys<'common'>)}
      </Text>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

export default ValidationTimelineItemHeader;
