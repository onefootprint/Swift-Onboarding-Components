import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { createFontStyles, LinkButton, media, Stack } from '@onefootprint/ui/';
import React from 'react';

type TimelineTitleProps = {
  title: string;
  subtitle: string;
  cta?: string;
  href?: string;
};

const TimelineTitle = ({ title, subtitle, cta, href }: TimelineTitleProps) => (
  <Stack direction="column" justify="center" gap={3} maxWidth="520px">
    <Title>{title}</Title>
    <Subtitle>{subtitle}</Subtitle>
    {cta && (
      <LinkButton
        href={href}
        iconComponent={IcoArrowRightSmall16}
        target="_blank"
      >
        {cta}
      </LinkButton>
    )}
  </Stack>
);

const Title = styled.h2`
  ${({ theme }) => css`
    ${createFontStyles('heading-3')}
    color: ${theme.color.primary};

    ${media.greaterThan('md')`
      ${createFontStyles('display-3')}
    `}
  `}
`;

const Subtitle = styled.h4`
  ${({ theme }) => css`
    ${createFontStyles('body-3')}
    color: ${theme.color.secondary};

    ${media.greaterThan('md')`
    ${createFontStyles('body-1')}
    `}
  `}
`;

export default TimelineTitle;
