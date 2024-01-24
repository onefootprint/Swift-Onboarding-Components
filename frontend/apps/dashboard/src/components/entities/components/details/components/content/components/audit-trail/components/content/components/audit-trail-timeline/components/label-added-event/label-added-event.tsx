import styled, { css } from '@onefootprint/styled';
import type { LabelAddedEventData } from '@onefootprint/types';
import { createFontStyles, Tag } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
      <Tag>{t(`labels.${kind}` as ParseKeys<'common'>)}</Tag>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('label-3')};
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: ${theme.spacing[3]};
    justify-content: flex-start;
  `}
`;

export default LabelAddedEvent;
