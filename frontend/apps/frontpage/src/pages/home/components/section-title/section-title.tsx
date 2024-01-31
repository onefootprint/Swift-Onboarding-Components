import { primitives } from '@onefootprint/design-tokens';
import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  Container,
  createFontStyles,
  LinkButton,
  media,
} from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

type SectionTitleProps = {
  title: string;
  subtitle: string;
  iconSrc?: string;
  cta?: string;
  href?: string;
  isOnDarkSection?: boolean;
};

const SectionTitle = ({
  title,
  subtitle,
  iconSrc,
  cta,
  href,
  isOnDarkSection,
}: SectionTitleProps) => (
  <Container>
    <TitleContainer isOnDarkSection={isOnDarkSection}>
      {iconSrc && <Image src={iconSrc} alt="" width={80} height={80} />}
      <TextContainer>
        <Title isOnDarkSection={isOnDarkSection}>{title}</Title>
        <Subtitle isOnDarkSection={isOnDarkSection}>{subtitle}</Subtitle>
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

const Title = styled.div<{ isOnDarkSection?: boolean }>`
  ${({ theme, isOnDarkSection }) => css`
    ${createFontStyles('display-3')}
    color: ${isOnDarkSection ? primitives.Gray0 : theme.color.primary};

    ${media.greaterThan('md')`
      ${createFontStyles('display-2')}
    `}
  `}
`;

const Subtitle = styled.div<{ isOnDarkSection?: boolean }>`
  ${({ theme, isOnDarkSection }) => css`
    ${createFontStyles('display-4')}
    color: ${isOnDarkSection ? primitives.Gray100 : theme.color.secondary};
  `}
`;

const TitleContainer = styled.div<{ isOnDarkSection?: boolean }>`
  ${({ theme, isOnDarkSection }) => css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: ${theme.spacing[8]};

    ${isOnDarkSection &&
    css`
      img {
        filter: invert(100%);
      }
    `}

    && {
      width: fit-content;
      max-width: 600px;

      button,
      a {
        color: ${isOnDarkSection ? primitives.Purple300 : theme.color.accent};
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
