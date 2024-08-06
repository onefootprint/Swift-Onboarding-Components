import type { CollectedDataEventData } from '@onefootprint/types';
import { Text, createFontStyles } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Actor from '../actor';
import CdoList from './components/cdo-list';

type DataCollectedEventHeaderProps = {
  data: CollectedDataEventData;
};

const DataCollectedEventHeader = ({ data }: DataCollectedEventHeaderProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.audit-trail.timeline.data-collected-event',
  });
  const { attributes } = data;

  let title = <TertiaryColor>{data.isPrefill ? t('title-prefill') : t('title')}</TertiaryColor>;
  if (data.actor) {
    title = (
      <>
        <Actor actor={data.actor} />
        <TertiaryColor>{t('title-edited')}</TertiaryColor>
      </>
    );
  }

  return (
    <Container data-testid="data-collected-event-header">
      <Title>{title}</Title>
      <CdoList cdos={attributes} />
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
