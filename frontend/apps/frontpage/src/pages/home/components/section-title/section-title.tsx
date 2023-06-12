import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import {
  Container,
  createFontStyles,
  LinkButton,
  media,
} from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

type SectionTitleProps = {
  title: string;
  subtitle: string;
  icon?: string;
  darkTheme?: boolean;
  cta?: string;
  href?: string;
};

const SectionTitle = ({
  title,
  subtitle,
  icon,
  darkTheme,
  cta,
  href,
}: SectionTitleProps) => (
  <Container>
    <WidthContainer darkTheme={darkTheme}>
      {icon && (
        <Image
          src={icon}
          alt={`${title} section icon`}
          width={42}
          height={42}
        />
      )}
      <TextContainer>
        <Title darkTheme={darkTheme}>{title}</Title>
        <Subtitle darkTheme={darkTheme}>{subtitle}</Subtitle>
      </TextContainer>
      {cta && (
        <LinkButton iconComponent={IcoArrowRightSmall16} href={href}>
          {cta}
        </LinkButton>
      )}
    </WidthContainer>
  </Container>
);

const Title = styled.div<{ darkTheme?: boolean }>`
  ${({ theme, darkTheme }) => css`
    ${createFontStyles('display-3')}
    color: ${darkTheme ? theme.color.quinary : theme.color.primary};

    ${media.greaterThan('md')`
      ${createFontStyles('display-2')}
    `}
  `}
`;

const Subtitle = styled.div<{ darkTheme?: boolean }>`
  ${({ theme, darkTheme }) => css`
    ${createFontStyles('display-4')}
    color: ${darkTheme ? theme.color.quinary : theme.color.secondary};
  `}
`;

const WidthContainer = styled.div<{
  darkTheme?: boolean;
}>`
  ${({ theme, darkTheme }) => css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: ${theme.spacing[8]};
    max-width: 600px;

    p {
      opacity: ${darkTheme ? 0.75 : 1};
    }

    && button {
      color: ${darkTheme ? '#9B85EB' : undefined};
      transition: opacity 0.1s ease-in-out;

      path {
        fill: ${darkTheme ? '#816ccd' : undefined};
      }

      &:hover {
        opacity: 0.8;
      }
    }
  `}
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

export default SectionTitle;
