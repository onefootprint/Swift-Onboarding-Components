import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled';
import { Button, Container, media, Typography } from 'ui';

import footprintLogo from '../../../../../public/images/footer/footprint-circle.png';
import lighting from '../../../../../public/images/footer/lightning.png';
import CircleBackground from './components/circle-background';

type GetStartedSectionProps = {
  cta: string;
  subtitle: string;
  title: string;
};

const GetStartedSection = ({
  cta,
  subtitle,
  title,
}: GetStartedSectionProps) => (
  <Container id="get-started" as="section" sx={{ position: 'relative' }}>
    <Inner>
      <LogoContainer>
        <Image
          width={170}
          height={155}
          src={footprintLogo}
          placeholder="blur"
        />
      </LogoContainer>
      <ContentContainer>
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
            <Image width={44} height={60} src={lighting} />
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
        <Button size="large">{cta}</Button>
      </ContentContainer>
    </Inner>
    <CircleBackground />
  </Container>
);

const Inner = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor.quaternary};
    border-radius: ${theme.borderRadius[1]}px;
    display: flex;
    flex-direction: column;
    padding: ${theme.spacing[9]}px ${theme.spacing[8]}px;

    ${media.greaterThan('md')`
      flex-direction: row-reverse;
      padding: ${theme.spacing[10]}px;
    `}
  `}
`;

const LogoContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[9]}px;
    width: 118px;
    height: 107px;

    ${media.greaterThan('md')`
      flex: 1;
      height: unset;
      margin-bottom: unset;
      text-align: right;
      width: unset;
    `}
  `}
`;

const ContentContainer = styled.div`
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
