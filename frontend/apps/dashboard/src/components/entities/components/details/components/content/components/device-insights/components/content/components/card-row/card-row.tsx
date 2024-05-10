import { Stack, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type CardRowProps = {
  label: string;
  value: string | JSX.Element;
  labelSuffix?: JSX.Element;
};

const CardRow = ({ label, value, labelSuffix }: CardRowProps) => (
  <Row role="row" aria-label={label}>
    {labelSuffix ? (
      <Stack direction="row" align="center" gap={2}>
        <Text variant="body-3" color="tertiary">
          {label}
        </Text>
        {labelSuffix}
      </Stack>
    ) : (
      <Text variant="body-3" color="tertiary">
        {label}
      </Text>
    )}
    {typeof value === 'string' ? <Text variant="body-3">{value}</Text> : value}
  </Row>
);

const Row = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: ${theme.spacing[3]};
  `};
`;

export default CardRow;
