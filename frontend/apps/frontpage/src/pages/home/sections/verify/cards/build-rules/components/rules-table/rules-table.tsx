import { Stack, Text } from '@onefootprint/ui';
import { uniqueId } from 'lodash';
import React from 'react';
import styled, { css } from 'styled-components';

import type { RuleTagProps } from '../rule-tag';
import RuleTag from '../rule-tag';

const ruleTableContent: RuleTagProps[][] = [
  [
    {
      signal: 'phone_number',
      op: 'is',
      list: '@blocked_phones',
    },
    {
      signal: 'id_flagged',
      op: 'is',
      list: undefined,
    },
  ],
  [
    {
      signal: 'subject_deceased',
      op: 'is',
      list: undefined,
    },
    {
      signal: 'address_input_is_po_box',
      op: 'is not',
      list: undefined,
    },
    {
      signal: 'dob_located_coppa_alert',
      op: 'is not',
      list: undefined,
    },
    {
      signal: 'multiple_records_found',
      op: 'is',
      list: undefined,
    },
  ],
  [
    {
      signal: 'phone_number',
      op: 'is',
      list: '@blocked_phones',
    },
    {
      signal: 'ssn_input_is_invalid',
      op: 'is',
      list: undefined,
    },
  ],
];

const RulesTable = () => (
  <TableContainer direction="column">
    {ruleTableContent.map((row, rowIndex) => (
      <Row direction="row" align="center" gap={3} flexWrap="wrap" key={uniqueId(`row-${rowIndex}-`)}>
        <Text variant="body-4" color="tertiary">
          if
        </Text>
        {row.map(({ signal, op, list }, index) => (
          <React.Fragment key={uniqueId(`rule-${index}-`)}>
            <RuleTag signal={signal} op={op} list={list} />
            {index < row.length - 1 && (
              <Text variant="body-4" color="tertiary">
                and
              </Text>
            )}
          </React.Fragment>
        ))}
      </Row>
    ))}
  </TableContainer>
);

const TableContainer = styled(Stack)`
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
      margin-bottom: ${theme.spacing[3]};
    }
  `}
`;

export default RulesTable;
