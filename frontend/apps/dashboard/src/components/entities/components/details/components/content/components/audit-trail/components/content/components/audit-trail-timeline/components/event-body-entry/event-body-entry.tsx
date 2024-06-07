import type { Color } from '@onefootprint/design-tokens';
import type { Icon } from '@onefootprint/icons';
import { IcoDotSmall16 } from '@onefootprint/icons';
import { Stack, createFontStyles } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type EventBodyEntryProps = {
  content: string | JSX.Element;
  testID?: string;
  iconComponent?: Icon | null;
  iconColor?: Color;
  lineHeight?: 'default' | 'large';
};

const EventBodyEntry = ({
  content,
  testID,
  iconComponent: IconComponent = IcoDotSmall16,
  iconColor = 'tertiary',
  lineHeight = 'large',
}: EventBodyEntryProps) => (
  <Stack align="flex-start" justify="flex-start">
    {IconComponent && (
      <IconBounds data-height={lineHeight}>
        <IconComponent color={iconColor} />
      </IconBounds>
    )}
    <Content data-testid={testID} data-height={lineHeight}>
      {content}
    </Content>
  </Stack>
);

const IconBounds = styled.div`
  ${({ theme }) => css`
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
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    margin-left: ${theme.spacing[3]};
    ${createFontStyles('body-3')};
    color: ${theme.color.tertiary};

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
  `}
`;

export default EventBodyEntry;
