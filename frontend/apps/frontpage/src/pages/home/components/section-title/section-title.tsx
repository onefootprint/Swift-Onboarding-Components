import { primitives } from '@onefootprint/design-tokens';
import type { Icon } from '@onefootprint/icons';
import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Container,
  createFontStyles,
  LinkButton,
  media,
} from '@onefootprint/ui';
import React from 'react';

type SectionTitleProps = {
  title: string;
  subtitle: string;
  icon?: Icon;
  cta?: string;
  href?: string;
  isDark?: boolean;
};

const SectionTitle = ({
  title,
  subtitle,
  icon: Icon,
  cta,
  href,
  isDark,
}: SectionTitleProps) => {
  const renderedIcon = Icon && <Icon />;
  return (
    <Container>
      <TitleContainer isDark={isDark}>
        <SectionIcon isDark={isDark}>
          <IconOutline isDark={isDark}>{renderedIcon}</IconOutline>
        </SectionIcon>
        <TextContainer>
          <Title isDark={isDark}>{title}</Title>
          <Subtitle isDark={isDark}>{subtitle}</Subtitle>
        </TextContainer>
        {cta && (
          <LinkButton
            iconComponent={IcoArrowRightSmall16}
            href={href}
            target="_blank"
          >
            {cta}
          </LinkButton>
        )}
      </TitleContainer>
    </Container>
  );
};

const Title = styled.div<{ isDark?: boolean }>`
  ${({ theme, isDark }) => css`
    ${createFontStyles('display-3')}
    color: ${isDark ? primitives.Gray0 : theme.color.primary};

    ${media.greaterThan('md')`
      ${createFontStyles('display-2')}
    `}
  `}
`;

const Subtitle = styled.div<{ isDark?: boolean }>`
  ${({ theme, isDark }) => css`
    ${createFontStyles('display-4')}
    color: ${isDark ? primitives.Gray100 : theme.color.secondary};
  `}
`;

const TitleContainer = styled.div<{ isDark?: boolean }>`
  ${({ theme, isDark }) => css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: ${theme.spacing[8]};

    && {
      width: fit-content;
      max-width: 600px;

      button {
        color: ${isDark ? primitives.Purple300 : theme.color.accent};
      }

      svg {
        path {
          fill: ${isDark && primitives.Purple300};
        }
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

const SectionIcon = styled.div<{ isDark?: boolean }>`
  ${({ theme, isDark }) => css`
    width: 48px;
    height: 48px;
    background-color: ${isDark
      ? primitives.Gray800
      : theme.backgroundColor.secondary};
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;

    & {
      svg {
        path {
           {
            fill: ${isDark && primitives.Purple300};
          }
        }
      }
    }
  `}
`;

const IconOutline = styled.div<{ isDark?: boolean }>`
  ${({ theme, isDark }) => css`
    border: 1.5px solid
      ${isDark ? primitives.Purple300 : theme.borderColor.secondary};
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
  `}
`;

export default SectionTitle;
