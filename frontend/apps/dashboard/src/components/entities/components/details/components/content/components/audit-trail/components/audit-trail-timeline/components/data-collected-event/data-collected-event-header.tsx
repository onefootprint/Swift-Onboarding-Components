import type { CollectedDataOption, DataCollectedInfo, DataIdentifier } from '@onefootprint/request-types/dashboard';
import type { Actor as TActor } from '@onefootprint/types';
import { Text, createFontStyles } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import FieldList from 'src/pages/security-logs/components/timeline/components/event/components/user-data/components/field-list';
import Actor from '../actor';
import getVisibleDis from './utils';

type DataCollectedEventHeaderProps = {
  data: DataCollectedInfo;
};

const DataCollectedEventHeader = ({ data }: DataCollectedEventHeaderProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'audit-trail.timeline.data-collected-event',
  });
  const { attributes, targets } = data;

  let title = <TertiaryColor>{data.isPrefill ? t('title-prefill') : t('title')}</TertiaryColor>;
  if (data.actor) {
    title = (
      <>
        <Actor actor={data.actor as TActor} />
        <TertiaryColor>{t('title-edited')}</TertiaryColor>
      </>
    );
  }

  const { visibleDis, visibleAttributes } = getVisibleDis(targets || [], attributes);

  return (
    <Container aria-label={t('aria-label')}>
      <Title>{title}</Title>
      <FieldList
        fields={visibleDis as DataIdentifier[]}
        cdos={visibleAttributes as CollectedDataOption[]}
        numVisibleFields={7}
      />
      {data.isPrefill && (
        <Text variant="body-3" color="tertiary">
          {t('end-prefill')}
        </Text>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: ${theme.spacing[2]};
  `}
`;

const TertiaryColor = styled.span`
  ${({ theme }) => css`
    color: ${theme.color.tertiary};
  `}
`;

const Title = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('body-3')};
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing[2]};
  `}
`;

export default DataCollectedEventHeader;
