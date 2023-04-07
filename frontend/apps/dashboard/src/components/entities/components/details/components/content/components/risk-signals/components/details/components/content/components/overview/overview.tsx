import { useTranslation } from '@onefootprint/hooks';
import type { RiskSignal } from '@onefootprint/types';
import { Grid, Typography } from '@onefootprint/ui';
import React from 'react';
import createStringList from 'src/utils/create-string-list';
import styled, { css } from 'styled-components';

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
        <Grid.Row>
          <Grid.Column col={6}>
            <Field label={t('severity')}>
              <SeverityBadge severity={severity} />
            </Field>
          </Grid.Column>
          <Grid.Column col={6}>
            <Field label={t('scopes')}>{createStringList(scopesList)}</Field>
          </Grid.Column>
        </Grid.Row>
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

    > div:not(:last-child) {
      margin-bottom: ${theme.spacing[7]};
    }
  `}
`;

export default Overview;
