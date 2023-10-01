import type { Color } from '@onefootprint/design-tokens';
import type { Icon } from '@onefootprint/icons';
import { IcoCheck16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Stack } from '@onefootprint/ui';
import React from 'react';

type EventBodyEntryProps = {
  content: string | JSX.Element;
  testID?: string;
  iconComponent?: Icon;
  iconColor?: Color;
  lineHeight?: 'default' | 'large';
};

const EventBodyEntry = ({
  content,
  testID,
  iconComponent: IconComponent = IcoCheck16,
  iconColor = 'neutral',
  lineHeight = 'large',
}: EventBodyEntryProps) => (
  <Stack align="flex-start" justify="flex-start">
    <IconBounds data-height={lineHeight}>
      <IconComponent color={iconColor} />
    </IconBounds>
    <Content data-testid={testID} data-height={lineHeight}>
      {content}
    </Content>
  </Stack>
);

const IconBounds = styled.div`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[3]};
    margin-left: ${theme.spacing[3]};
    display: flex;
    justify-content: center;
    align-items: center;

    &[data-height='large'] {
      min-height: 26px;
    }

    &[data-height='default'] {
      min-height: 20px;
    }
  `}
`;

const Content = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;

  & > * {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
  }

  &[data-height='large'] {
    min-height: 26px;
  }

  &[data-height='default'] {
    min-height: 20px;
  }
`;

export default EventBodyEntry;
