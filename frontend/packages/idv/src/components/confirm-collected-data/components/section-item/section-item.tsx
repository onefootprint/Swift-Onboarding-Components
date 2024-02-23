import type { Color } from '@onefootprint/design-tokens';
import { Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

export type SectionItemProps = {
  text: string;
  textColor?: Color;
  subtext?: string;
};

const SectionItem = ({
  text,
  subtext,
  textColor = 'tertiary',
}: SectionItemProps) => (
  <Container>
    <Text variant="label-3" color={textColor} isPrivate>
      {text}
    </Text>
    {subtext && (
      <Text variant="body-3" isPrivate>
        {subtext}
      </Text>
    )}
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex-direction: column;
    row-gap: ${theme.spacing[2]};
  `}
`;

export default SectionItem;
