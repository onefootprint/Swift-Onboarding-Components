import { useTranslation } from 'hooks';
import IcoQuote40 from 'icons/ico/ico-quote-40';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';
import { Container, Typography } from 'ui';

const TestimonialSection = () => {
  const { t } = useTranslation('pages.home.testimonial');
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
          {t('quote')}
        </Typography>
        <AuthorContainer>
          <Image
            alt={t('author.img-alt')}
            height={48}
            layout="fixed"
            src="/testimonial/author.png"
            width={48}
          />
          <AuthorContentContainer>
            <Typography variant="heading-3" color="primary" as="div">
              {t('author.name')}
            </Typography>
            <Typography variant="body-2" color="secondary" as="div">
              {t('author.role')}
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

export default TestimonialSection;
