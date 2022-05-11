import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled';
import { Container, Typography } from 'ui';

type InvestorsProps = {
  altImageText: string;
  subtitleText: string;
  titleText: string;
};

const Investors = ({
  altImageText,
  subtitleText,
  titleText,
}: InvestorsProps) => (
  <Container id="investors" as="section">
    <ContentContainer>
      <Typography
        as="h5"
        color="senary"
        sx={{ marginBottom: 5 }}
        variant="label-1"
      >
        {titleText}
      </Typography>
      <Typography
        as="p"
        color="quaternary"
        sx={{ marginBottom: 10, maxWidth: '510px' }}
        variant="display-2"
      >
        {subtitleText}
      </Typography>
    </ContentContainer>
    <ImageContainer>
      <Image
        alt={altImageText}
        height={225}
        src="/images/investors-logo.png"
        width={700}
        layout="responsive"
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

export default Investors;
