import { IcoChevronRight24 } from '@onefootprint/icons';
import { Box, media, Stack } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { useRef } from 'react';
import styled, { css } from 'styled-components';
import { useHover } from 'usehooks-ts';

type FeaturedCardProps = {
  title: string;
  gridArea: string;
  logo: React.ElementType;
  url: string;
};

const logoVariants = {
  hidden: { y: 0 },
  visible: { y: '-20%', transition: { duration: 0.2 } },
};

const chevronVariants = {
  initial: {
    opacity: 0,
    x: '50%',
    y: '50%',
    translateX: '-50%',
    translateY: '-50%',
    scale: 0.9,
  },
  final: { opacity: 1, x: '100%', scale: 1, transition: { duration: 0.2 } },
};

const FeaturedCard = ({
  logo: Logo,
  title,
  gridArea,
  url,
}: FeaturedCardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHovering = useHover(containerRef);

  return (
    <StyledLink href={url}>
      <CardContainer aria-label={title} gridArea={gridArea} ref={containerRef}>
        <LogoContainer
          variants={logoVariants}
          initial="hidden"
          animate={isHovering ? 'visible' : 'hidden'}
          aria-label={`${title}'s logo`}
        >
          <Logo />
          <IconContainer
            variants={chevronVariants}
            initial="initial"
            animate={isHovering ? 'final' : 'initial'}
          >
            <IcoChevronRight24 />
          </IconContainer>
        </LogoContainer>
        <MobileChevronLink>
          <IcoChevronRight24 color="tertiary" />
        </MobileChevronLink>
      </CardContainer>
    </StyledLink>
  );
};

const StyledLink = styled(Link)`
  text-decoration: none;
  all: unset;
`;

const MobileChevronLink = styled(Box)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: ${theme.spacing[3]};
    right: ${theme.spacing[3]};
    transform: rotate(-45deg);
    z-index: 1;
    background-color: ${theme.backgroundColor.primary};
    border-radius: 50%;
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    width: ${theme.spacing[7]};
    height: ${theme.spacing[7]};

    ${media.greaterThan('md')`
      display: none;
    `}
  `}
`;

const LogoContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CardContainer = styled(Stack)`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing[9]} 0;
    gap: ${theme.spacing[4]};
    height: 100%;
    width: 100%;
    min-height: 80px;
    cursor: pointer;
    transition:
      background-color 0.2s ease-in-out,
      fill 0.3s ease-in-out;

    svg {
      fill: ${theme.color.primary};
    }

    ${media.greaterThan('md')`
      padding: 0;
      svg {
        fill: ${theme.color.tertiary};
        transition: fill 0.3s ease-in-out; // Added transition for fill color
      }
  
      &:hover {
        background-color: ${theme.backgroundColor.secondary};
        svg {
          fill: ${theme.color.primary};
        }
      }
    `}
  `}
`;

const IconContainer = styled(motion.div)`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    background-color: ${theme.backgroundColor.secondary};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: none;

    ${media.greaterThan('md')`
      display: flex;
    `}
  `}
`;

export default FeaturedCard;
