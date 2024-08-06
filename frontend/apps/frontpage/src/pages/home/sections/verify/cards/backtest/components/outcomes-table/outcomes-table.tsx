import { Badge, Grid, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const OutcomesTable = ({ className }: { className?: string }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify.cards.backtest.illustration.table',
  });
  return (
    <TableContainer
      className={className}
      columns={['1fr', '1fr', '1fr']}
      rows={['32px', 'fit-content']}
      templateAreas={[
        'current-onboarding-status original-rule-outcome backtested-rule-outcome',
        'current-onboarding-value original-rule-value backtested-rule-value',
      ]}
    >
      <HeaderElement gridArea="current-onboarding-status">
        <Text variant="caption-3" color="tertiary">
          {t('headers.current-onboarding-status')}
        </Text>
      </HeaderElement>
      <HeaderElement gridArea="original-rule-outcome">
        <Text variant="caption-3" color="tertiary">
          {t('headers.original-rule-outcome')}
        </Text>
      </HeaderElement>
      <HeaderElement gridArea="backtested-rule-outcome">
        <Text variant="caption-3" color="tertiary">
          {t('headers.backtested-rule-outcome')}
        </Text>
      </HeaderElement>
      <RowElement gridArea="current-onboarding-value">
        <Badge variant="error">{t('rows.failed')}</Badge>
      </RowElement>
      <RowElement gridArea="original-rule-value">
        <Badge variant="warning">{t('rows.fail-and-manual-review')}</Badge>
      </RowElement>
      <RowElement gridArea="backtested-rule-value">
        <Badge variant="success">{t('rows.pass')}</Badge>
      </RowElement>
    </TableContainer>
  );
};

const TableContainer = styled(Grid.Container)`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.primary};
    border-radius: calc(${theme.borderRadius.default} + 2px);
    width: 840px;
    position: absolute;
    top: 0;
    left: ${theme.spacing[9]};
    box-shadow: ${theme.elevation[1]};
    transform: scale(0.9);
    transform-origin: top left;
  `}
`;

const HeaderElement = styled(Grid.Item)`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    text-transform: uppercase;
  `}
`;

const RowElement = styled(Grid.Item)`
  ${({ theme }) => css`
    padding-left: ${theme.spacing[4]};
    margin: ${theme.spacing[3]} 0;
  `}
`;

export default OutcomesTable;
