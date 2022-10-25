import { useTranslation } from '@onefootprint/hooks';
import type { RiskSignal } from '@onefootprint/types';
import { Grid, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import SeverityBadge from '../../../../../severity-badge';
import Field from './components/field';

type OverviewProps = {
  note: RiskSignal['note'];
  scopes: RiskSignal['scopes'];
  severity: RiskSignal['severity'];
  vendors: RiskSignal['vendors'];
};

const Overview = ({ vendors, note, scopes, severity }: OverviewProps) => {
  const { t, allT } = useTranslation(
    'pages.user-details.signals.details.overview',
  );

  return (
    <section>
      <Header>
        <Typography variant="label-2">{t('title')}</Typography>
      </Header>
      <Fieldset>
        <Field label={t('vendors')}>{vendors.toString()}</Field>
        <Grid.Row>
          <Grid.Column col={6}>
            <Field label={t('severity')}>
              <SeverityBadge severity={severity} />
            </Field>
          </Grid.Column>
          <Grid.Column col={6}>
            <Field label={t('scopes')}>
              {scopes
                .map(signalAttribute =>
                  allT(`signal-attributes.${signalAttribute}`),
                )
                .toString()}
            </Field>
          </Grid.Column>
        </Grid.Row>
        <Field label={t('note')}>{note}</Field>
      </Fieldset>
    </section>
  );
};

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[5]}px;
  `}
`;

const Fieldset = styled.fieldset`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;

    > div:not(:last-child) {
      margin-bottom: ${theme.spacing[7]}px;
    }
  `}
`;

export default Overview;
