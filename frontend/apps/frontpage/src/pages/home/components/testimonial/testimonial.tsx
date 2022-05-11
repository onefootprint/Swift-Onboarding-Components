import IcoQuote40 from 'icons/ico/ico-quote-40';
import Image from 'next/image';
import React from 'react';
import styled from 'styled';
import { Container, Typography } from 'ui';

type HeroProps = {
  author: {
    name: string;
    pictureAltText: string;
    pictureSrc: string;
    role: string;
  };
  contentText: string;
};

const Hero = ({ author, contentText }: HeroProps) => (
  <Container id="testimonial" as="section" sx={{ marginY: 11 }}>
    <Inner>
      <IcoQuote40 />
      <Typography
        as="p"
        color="primary"
        sx={{ marginY: 9 }}
        variant="display-4"
      >
        {contentText}
      </Typography>
      <AuthorContainer>
        <Image
          alt={author.pictureAltText}
          height={48}
          layout="fixed"
          src={author.pictureSrc}
          width={48}
        />
        <AuthorContentContainer>
          <Typography variant="heading-3" color="primary" as="div">
            {author.name}
          </Typography>
          <Typography variant="body-2" color="secondary" as="div">
            {author.role}
          </Typography>
        </AuthorContentContainer>
      </AuthorContainer>
    </Inner>
  </Container>
);

const Inner = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  max-width: 800px;
  text-align: center;
`;

const AuthorContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[5]}px;
`;

const AuthorContentContainer = styled.div`
  text-align: left;
`;

export default Hero;
