import type { RiskSignalDetail } from '@onefootprint/request-types/dashboard';
import { Grid, Text } from '@onefootprint/ui';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import useScopeListText from '../../../../hooks/use-scope-list-text';
import Field from './components/field';
import SeverityBadge from './components/severity-badge';

type OverviewProps = {
  description: RiskSignalDetail['description'];
  scopes: RiskSignalDetail['scopes'];
  severity: RiskSignalDetail['severity'];
};

const Overview = ({ description, scopes, severity }: OverviewProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.risk-signals.drawer.overview' });
  const scopeListT = useScopeListText();

  const overviewRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    overviewRef.current?.scrollIntoView();
  }, []);

  return (
    <OverviewSection ref={overviewRef}>
      <Header>
        <Text variant="label-2">{t('title')}</Text>
      </Header>
      <Fieldset>
        <Grid.Container columns={['1fr', '1fr']} gap={5}>
          <Field label={t('severity')}>
            <SeverityBadge severity={severity} />
          </Field>
          <Field label={t('scopes')}>{scopeListT(scopes)}</Field>
        </Grid.Container>
        <Field label={t('description')}>{description}</Field>
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
