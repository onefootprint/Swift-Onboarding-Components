import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled';
import { Container, Typography } from 'ui';

type InvestorsSectionProps = {
  imgAlt: string;
  imgSrc: string;
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
        sx={{ marginBottom: 10, maxWidth: '510px' }}
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
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    padding-top: ${theme.spacing[11]}px;
    text-align: center;
  `}
`;

const ImageContainer = styled.div`
  ${({ theme }) => css`
    margin: 0 auto;
    max-width: 700px;
    padding-bottom: ${theme.spacing[12]}px;
  `}
`;

export default InvestorsSection;
