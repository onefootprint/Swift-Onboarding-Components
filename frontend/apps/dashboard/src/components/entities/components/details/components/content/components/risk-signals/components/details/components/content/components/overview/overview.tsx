import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import type { RiskSignal } from '@onefootprint/types';
import { Grid, Typography } from '@onefootprint/ui';
import React from 'react';
import { createCapitalStringList } from 'src/utils/create-string-list';

import SeverityBadge from '../../../../../severity-badge';
import Field from './components/field';

type OverviewProps = {
  description: RiskSignal['description'];
  scopes: RiskSignal['scopes'];
  severity: RiskSignal['severity'];
};

const Overview = ({ description, scopes, severity }: OverviewProps) => {
  const { t, allT } = useTranslation(
    'pages.entity.risk-signals.details.overview',
  );
  const uniqueScopes = Array.from(new Set(scopes));
  const scopesList = uniqueScopes.map(scope =>
    allT(`signal-attributes.${scope}`),
  );

  return (
    <section>
      <Header>
        <Typography variant="label-2">{t('title')}</Typography>
      </Header>
      <Fieldset>
        <Grid.Container columns={['1fr', '1fr']} gap={5}>
          <Field label={t('severity')}>
            <SeverityBadge severity={severity} />
          </Field>
          <Field label={t('scopes')}>
            {createCapitalStringList(scopesList)}
          </Field>
        </Grid.Container>
        <Field label={t('description')}>{description}</Field>
      </Fieldset>
    </section>
  );
};

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
