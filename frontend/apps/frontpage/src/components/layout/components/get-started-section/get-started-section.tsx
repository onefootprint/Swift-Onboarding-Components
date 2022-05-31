import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled';
import { Button, Container, media, Typography } from 'ui';

import CircleBackground from './components/circle-background';

type GetStartedSectionProps = {
  cta: string;
  subtitle: string;
  title: string;
  onCtaClick: () => void;
};

const GetStartedSection = ({
  cta,
  subtitle,
  title,
  onCtaClick,
}: GetStartedSectionProps) => (
  <Container id="get-started" as="section">
    <Inner>
      <Content>
        <LogoContainer>
          <Image
            alt="Footprint logo"
            height={107}
            layout="fixed"
            src="/footer/footprint-circle.png"
            width={118}
          />
        </LogoContainer>
        <TextContent>
          <TitleContainer>
            <Typography
              as="h5"
              color="primary"
              sx={{ marginBottom: 5 }}
              variant="display-2"
            >
              {title}
            </Typography>
            <TitleImageContainer>
              <Image
                alt="A thunder to illustrate that we are fast"
                height={60}
                src="/footer/lightning.png"
                width={44}
              />
            </TitleImageContainer>
          </TitleContainer>
          <Typography
            as="div"
            color="primary"
            sx={{ marginBottom: 9 }}
            variant="display-4"
          >
            {subtitle}
          </Typography>
          <Button size="large" onClick={onCtaClick}>
            {cta}
          </Button>
        </TextContent>
      </Content>
      <CircleBackground />
    </Inner>
  </Container>
);

const Inner = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.quaternary};
    border-radius: ${theme.borderRadius[1]}px;
    padding: ${theme.spacing[9]}px ${theme.spacing[8]}px;
    position: relative;
    overflow: hidden;
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;

    ${media.greaterThan('md')`
      flex-direction: row-reverse;
      padding: ${theme.spacing[10]}px;
    `}
  `}
`;

const LogoContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[9]}px;

    ${media.greaterThan('md')`
      flex: 1;
      margin-bottom: unset;
      text-align: right;
    `}
  `}
`;

const TextContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  z-index: 1;

  img {
    display: none;
  }

  ${media.greaterThan('md')`
    text-align: left;
    align-items: start;
  `}

  ${media.between('md', 'lg')`
    flex: 1.5;
  `}

  ${media.greaterThan('lg')`
    flex: 1.2;
  `}
`;

const TitleContainer = styled.div`
  ${media.greaterThan('md')`
    display: flex;
  `}
`;

const TitleImageContainer = styled.div`
  display: none;

  ${media.greaterThan('md')`
    margin-left: ${({ theme }) => theme.spacing[5]}px;
    display: block;
  `}
`;

export default GetStartedSection;
