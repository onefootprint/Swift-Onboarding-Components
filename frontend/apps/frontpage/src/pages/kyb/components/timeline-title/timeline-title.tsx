import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { createFontStyles, LinkButton, media } from '@onefootprint/ui/';
import React from 'react';

type TimelineTitleProps = {
  title: string;
  subtitle: string;
  cta?: string;
  href?: string;
};

const TimelineTitle = ({ title, subtitle, cta, href }: TimelineTitleProps) => (
  <Container>
    <Title>{title}</Title>
    <Subtitle>{subtitle}</Subtitle>
    {cta && (
      <LinkButton href={href} iconComponent={IcoArrowRightSmall16}>
        {cta}
      </LinkButton>
    )}
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: ${theme.spacing[3]};
    max-width: 520px;

    ${media.greaterThan('md')`
      gap: ${theme.spacing[5]};
    `}
  `}
`;

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
