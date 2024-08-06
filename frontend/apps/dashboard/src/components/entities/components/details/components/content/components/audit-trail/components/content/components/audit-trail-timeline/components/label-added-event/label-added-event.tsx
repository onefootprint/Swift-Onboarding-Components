import type { LabelAddedEventData } from '@onefootprint/types';
import { Text, createFontStyles } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type LabelAddedEventProps = {
  data: LabelAddedEventData;
};

const LabelAddedEvent = ({ data: { kind } }: LabelAddedEventProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.label-added-event',
  });

  return (
    <Container data-testid="label-added-event-header">
      {t('as')}
      <Text variant="label-3" color="primary">
        {t(`labels.${kind}` as ParseKeys<'common'>)}
      </Text>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    color: ${theme.color.tertiary};
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: ${theme.spacing[2]};
    justify-content: flex-start;
  `}
`;

export default LabelAddedEvent;
