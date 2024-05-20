import { Box, createFontStyles, media, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
};

const SectionTitle = ({
  title,
  subtitle,
  align = 'center',
}: SectionTitleProps) => (
  <Stack
    direction="column"
    gap={4}
    align={align === 'left' ? 'flex-start' : 'center'}
  >
    <Title textAlign={align}>{title}</Title>
    {subtitle && (
      <Text
        variant="body-1"
        maxWidth="600px"
        textAlign={align === 'left' ? 'left' : 'center'}
      >
        {subtitle}
      </Text>
    )}
  </Stack>
);

const Title = styled(Box)<{ textAlign: 'left' | 'center' }>`
  ${({ textAlign }) => css`
    ${createFontStyles('display-3')}
    text-align: ${textAlign};

    ${media.greaterThan('md')`
      ${createFontStyles('display-2')}
    `}
  `}
`;

export default SectionTitle;
