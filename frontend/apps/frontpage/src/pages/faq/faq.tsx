import { useTranslation } from 'hooks';
import Head from 'next/head';
import React from 'react';
import styled, { css } from 'styled-components';
import { Button, media, Typography } from 'ui';

import FaqItem from './components/faq-item';

const Faq = () => {
  const { t } = useTranslation('pages.faq');
  const items = [
    {
      id: 'what-is-kyc',
      title: t('questions.what-is-kyc.title'),
      content: t('questions.what-is-kyc.content'),
    },
    {
      id: 'satisfy-kyc',
      title: t('questions.satisfy-kyc.title'),
      content: t('questions.satisfy-kyc.content'),
    },
    {
      id: 'too-good',
      title: t('questions.too-good.title'),
      content: t('questions.too-good.content'),
    },
    {
      id: 'customize-kyc',
      title: t('questions.customize-kyc.title'),
      content: t('questions.customize-kyc.content'),
    },
    {
      id: 'internet-fraud',
      title: t('questions.internet-fraud.title'),
      content: t('questions.internet-fraud.content'),
    },
    {
      id: 'why-vaulting',
      title: t('questions.why-vaulting.title'),
      content: t('questions.why-vaulting.content'),
    },
    {
      id: 'promises-one-click',
      title: t('questions.promises-one-click.title'),
      content: t('questions.promises-one-click.content'),
    },
  ];

  const handleClick = () => {
    window.open('mailto:hello@onefootprint.com');
  };

  return (
    <>
      <Head>
        <title>{t('html-title')}</title>
      </Head>
      <Container>
        <TitleContainer>
          <Typography variant="display-1" as="h1">
            {t('title')}
          </Typography>
          <Typography variant="display-4" as="h2">
            {t('subtitle')}
          </Typography>
        </TitleContainer>
        <QuestionsContainer>
          {items.map(({ id, title, content }) => {
            const isContentArray = Array.isArray(content);
            return isContentArray ? (
              <FaqItem key={id} title={title} content={content} />
            ) : null;
          })}
        </QuestionsContainer>
        <ContactContainer>
          <Typography variant="label-1" sx={{ marginBottom: 3 }}>
            {t('contact.title')}
          </Typography>
          <Typography
            color="secondary"
            variant="body-2"
            sx={{ marginBottom: 7 }}
          >
            {t('contact.subtitle')}
          </Typography>
          <Button onClick={handleClick} size="compact">
            {t('contact.cta')}
          </Button>
        </ContactContainer>
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    margin: 0 auto;
    max-width: 800px;
    padding: 0 ${theme.spacing[5]}px;

    ${media.greaterThan('md')`
      padding: 0;
    `}
  `}
`;

const TitleContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]}px;
    margin-bottom: ${theme.spacing[10]}px;
    text-align: center;
  `}
`;

const QuestionsContainer = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[5]}px;
    margin-bottom: ${theme.spacing[10]}px;
  `}
`;

const ContactContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    margin-bottom: ${theme.spacing[10]}px;
    text-align: center;

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[11]}px;
    `}
  `}
`;

export default Faq;
