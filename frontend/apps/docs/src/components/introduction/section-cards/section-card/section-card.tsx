import type { Icon } from '@onefootprint/icons';
import { createFontStyles } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import type React from 'react';
import { forwardRef } from 'react';
import styled, { css } from 'styled-components';

type SectionCardProps = {
  title: string;
  subtitle: string;
  icon?: Icon;
  imageSrc?: string;
  gridArea?: string;
  href: string;
  children?: React.ReactNode;
};

const SectionCard = forwardRef<HTMLAnchorElement, SectionCardProps>(
  ({ title, subtitle, icon: Icon, imageSrc, gridArea, children, href }, ref) => {
    const renderedIcon = Icon && <Icon />;

    return (
      <Container href={href} $gridArea={gridArea} ref={ref}>
        <IllustrationContainer>
          {children || (imageSrc && <Image src={imageSrc} alt={title} height={194} width={350} />)}
        </IllustrationContainer>
        <TextContainer>
          <TitleContainer>
            {renderedIcon}
            <Title>{title}</Title>
          </TitleContainer>
          <Subtitle>{subtitle}</Subtitle>
        </TextContainer>
      </Container>
    );
  },
);

SectionCard.displayName = 'SectionCard';

const Container = styled(Link)<{ $gridArea?: string }>`
  ${({ theme, $gridArea }) => css`
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    grid-area: ${$gridArea};
    text-decoration: none;

    @media (hover: hover) {
      &:hover {
        border-color: ${theme.borderColor.primary};
        box-shadow: ${theme.elevation[2]};

        img {
          scale: 1.05;
        }
      }
    }
  `};
`;

const IllustrationContainer = styled.div`
  width: 100%;
  overflow: hidden;
  position: relative;
  mask: linear-gradient(180deg, #fff 85%, transparent 100%);
  height: 170px;
  mask-mode: alpha;
  isolation: isolate;

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
`;

const TextContainer = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `};
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
  `};
`;

const Title = styled.h2`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    color: ${theme.color.primary};

    &&& {
      margin: 0;
    }
  `};
`;

const Subtitle = styled.p`
  ${({ theme }) => css`
    ${createFontStyles('body-4')}
    color: ${theme.color.secondary};
  `};
`;

export default SectionCard;
