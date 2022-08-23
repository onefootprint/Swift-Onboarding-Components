import { IcoQuote40 } from 'icons';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';
import { Container, Typography } from 'ui';

type TestimonialAuthor = {
  name: string;
  role: string;
  imgAlt: string;
  imgSrc: string;
};

type TestimonialProps = {
  quote: string;
  author: TestimonialAuthor;
};

const Testimonial = ({ quote, author }: TestimonialProps) => {
  const { name, role, imgAlt, imgSrc } = author;

  return (
    <Container id="testimonial" as="section">
      <Inner>
        <IcoQuote40 color="accent" />
        <Typography
          as="p"
          color="primary"
          sx={{ marginY: 9 }}
          variant="display-4"
        >
          {quote}
        </Typography>
        <AuthorContainer>
          <Image
            alt={imgAlt}
            height={48}
            layout="fixed"
            src={imgSrc}
            width={48}
          />
          <AuthorContentContainer>
            <Typography variant="heading-3" color="primary" as="div">
              {name}
            </Typography>
            <Typography variant="body-2" color="secondary" as="div">
              {role}
            </Typography>
          </AuthorContentContainer>
        </AuthorContainer>
      </Inner>
    </Container>
  );
};

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

export default Testimonial;
