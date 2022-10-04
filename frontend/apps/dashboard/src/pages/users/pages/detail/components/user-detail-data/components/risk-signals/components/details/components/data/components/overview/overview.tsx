import { useTranslation } from '@onefootprint/hooks';
import type { RiskSignalDetails } from '@onefootprint/types';
import { Grid, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import Field from './components/field';

type OverviewProps = {
  dataVendor: RiskSignalDetails['dataVendor'];
  note: RiskSignalDetails['note'];
  noteDetails: RiskSignalDetails['noteDetails'];
  scope: RiskSignalDetails['scope'];
  severity: RiskSignalDetails['severity'];
};

const Overview = ({
  dataVendor,
  note,
  noteDetails,
  scope,
  severity,
}: OverviewProps) => {
  const { t } = useTranslation(
    'pages.user-details.risk-signals.details.overview',
  );

  return (
    <section>
      <Header>
        <Typography variant="label-2">{t('title')}</Typography>
      </Header>
      <Fieldset>
        <Field label={t('data-vendor')} value={dataVendor} />
        <Grid.Row>
          <Grid.Column col={6}>
            <Field label={t('severity')} value={severity} />
          </Grid.Column>
          <Grid.Column col={6}>
            <Field label={t('scope')} value={scope} />
          </Grid.Column>
        </Grid.Row>
        <Field label={t('note')} value={note} />
        <Field label={t('note-details')} value={noteDetails} />
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
