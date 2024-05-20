import type { Color } from '@onefootprint/design-tokens';
import { Stack, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

const rows = [
  {
    key: 'fail',
    color: 'error',
    value: '18 (45%)',
  },
  {
    key: 'fail-and-manual-review',
    color: 'warning',
    value: '10 (25%)',
  },
  {
    key: 'step-up',
    color: 'info',
    value: '18 (45%)',
  },
  {
    key: 'pass-and-manual-review',
    color: 'success',
    value: '18 (45%)',
  },
];

const StatusTable = ({ className }: { className?: string }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify.cards.backtest.illustration.outcomes',
  });
  return (
    <Container direction="column" gap={5} className={className}>
      <Stack direction="column" maxWidth="80%">
        <Text variant="label-3">{t('title')}</Text>
        <Text variant="body-3">{t('subtitle')}</Text>
      </Stack>
      <Table direction="column">
        {rows.map(row => (
          <Row key={row.key} justify="space-between">
            <Text variant="label-3" color={row.color as Color}>
              {t(row.key as unknown as ParseKeys<'common'>)}
            </Text>
            <Text variant="body-3">{row.value}</Text>
          </Row>
        ))}
      </Table>
    </Container>
  );
};

const Container = styled(Stack)`
  ${({ theme }) => css`
    padding: ${theme.spacing[5]};
    background-color: ${theme.backgroundColor.primary};
    border-radius: calc(${theme.borderRadius.default} + 4px);
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
  `}
`;

const Table = styled(Stack)`
  ${({ theme }) => css`
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

const Row = styled(Stack)`
  ${({ theme }) => css`
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    &:not(:last-child) {
      border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    }
  `}
`;

export default StatusTable;
