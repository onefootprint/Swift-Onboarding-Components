import IcoQuote40 from 'icons/ico/ico-quote-40';
import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled';
import { Container, media, Typography } from 'ui';

type TestimonialSectionProps = {
  author: {
    name: string;
    imgAlt: string;
    imgSrc: StaticImageData;
    role: string;
  };
  content: string;
};

const TestimonialSection = ({ author, content }: TestimonialSectionProps) => (
  <Container id="testimonial" as="section">
    <Inner>
      <IcoQuote40 color="accent" />
      <Typography
        as="p"
        color="primary"
        sx={{ marginY: 9 }}
        variant="display-4"
      >
        {content}
      </Typography>
      <AuthorContainer>
        <Image
          alt={author.imgAlt}
          height={48}
          layout="fixed"
          src={author.imgSrc}
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
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
    max-width: 800px;
    padding: ${theme.spacing[10]}px 0;
    text-align: center;

    ${media.greaterThan('lg')`
      padding: ${theme.spacing[11]}px 0;
    `}
  `}
`;

const AuthorContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing[5]}px;
`;

const AuthorContentContainer = styled.div`
  text-align: left;
`;

export default TestimonialSection;
