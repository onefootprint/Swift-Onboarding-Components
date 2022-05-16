import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled';
import { Container, media, Typography } from 'ui';

type InvestorsSectionProps = {
  imgAlt: string;
  imgSrc: StaticImageData;
  subtitle: string;
  title: string;
};

const InvestorsSection = ({
  imgAlt,
  imgSrc,
  subtitle,
  title,
}: InvestorsSectionProps) => (
  <Container id="investors" as="section">
    <ContentContainer>
      <Typography
        as="h5"
        color="senary"
        sx={{ marginBottom: 5 }}
        variant="label-1"
      >
        {title}
      </Typography>
      <Typography
        as="p"
        color="quaternary"
        sx={{ maxWidth: '510px' }}
        variant="display-2"
      >
        {subtitle}
      </Typography>
    </ContentContainer>
    <ImageContainer>
      <Image
        alt={imgAlt}
        height={225}
        layout="responsive"
        src={imgSrc}
        width={700}
      />
    </ImageContainer>
  </Container>
);

const ContentContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
`;

const ImageContainer = styled.div`
  ${({ theme }) => css`
    margin: 0 auto;
    margin-top: ${theme.spacing[9]}px;
    margin-bottom: ${theme.spacing[10]}px;
    max-width: 700px;

    ${media.greaterThan('lg')`
      margin-top: ${theme.spacing[10]}px;
      margin-bottom: ${theme.spacing[11]}px;
    `}
  `}
`;

export default InvestorsSection;
