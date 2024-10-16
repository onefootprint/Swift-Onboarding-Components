import type { RiskSignal } from '@onefootprint/types';
import { Grid, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createCapitalStringList } from 'src/utils/create-string-list';
import styled, { css } from 'styled-components';
import { useEffectOnce } from 'usehooks-ts';

import SeverityBadge from '../../../../../severity-badge';
import Field from './components/field';

type OverviewProps = {
  description: RiskSignal['description'];
  scopes: RiskSignal['scopes'];
  severity: RiskSignal['severity'];
};

const Overview = ({ description, scopes, severity }: OverviewProps) => {
  const { t } = useTranslation('entity-details');
  const { t: allT } = useTranslation('common');
  const uniqueScopes = Array.from(new Set(scopes));
  const scopesList = uniqueScopes.map(scope => allT(`signal-attributes.${scope}` as ParseKeys<'common'>));

  const overviewRef = useRef<HTMLDivElement>(null);
  useEffectOnce(() => {
    overviewRef.current?.scrollIntoView();
  });

  return (
    <OverviewSection ref={overviewRef}>
      <Header>
        <Text variant="label-2">{t('risk-signals.details.overview.title')}</Text>
      </Header>
      <Fieldset>
        <Grid.Container columns={['1fr', '1fr']} gap={5}>
          <Field label={t('risk-signals.details.overview.severity')}>
            <SeverityBadge severity={severity} />
          </Field>
          <Field label={t('risk-signals.details.overview.scopes')}>{createCapitalStringList(scopesList)}</Field>
        </Grid.Container>
        <Field label={t('risk-signals.details.overview.description')}>{description}</Field>
      </Fieldset>
    </OverviewSection>
  );
};

const OverviewSection = styled.section`
  ${({ theme }) => css`
    scroll-margin: ${theme.spacing[7]};
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[5]};
  `}
`;

const Fieldset = styled.fieldset`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;

    > div {
      margin-bottom: ${theme.spacing[7]};
    }
  `}
`;

export default Overview;
