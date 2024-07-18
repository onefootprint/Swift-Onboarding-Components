import { Box, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type LineItemProps = {
  leftText: string;
  rightText?: string;
  badge?: React.ReactNode;
  customRight?: React.ReactNode;
};

const LineItem = ({ leftText, rightText, badge, customRight }: LineItemProps) => (
  <Stack direction="row" width="100%" gap={3}>
    <Stack gap={3} align="center" maxWidth="50%">
      <Text variant="body-3" display="flex" gap={2} tag="div">
        {leftText}
      </Text>
      {badge}
    </Stack>
    <Line />
    <Box maxWidth="50%" overflow="scroll">
      {customRight ? (
        customRight
      ) : (
        <Text variant="body-3" display="flex">
          {rightText}
        </Text>
      )}
    </Box>
  </Stack>
);

const Line = styled.div`
  ${({ theme }) => css`
    flex: 1;
    position: relative;
    &::after {
      content: '';
      bottom: 7px;
      left: 0;
      position: absolute;
      right: 0;
      border-bottom: ${theme.borderWidth[1]} dashed
        ${theme.borderColor.tertiary};
    }
  `}
`;

export default LineItem;
