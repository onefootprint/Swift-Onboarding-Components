import { Button, Grid, media, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Accordion from 'src/components/accordion';
import styled, { css } from 'styled-components';

import SEO from '../../components/seo';

const Faq = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.faq' });
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
      content: [
        t('questions.too-good.content-first'),
        t('questions.too-good.content-second'),
      ],
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
      content: [
        t('questions.why-vaulting.content-first'),
        t('questions.why-vaulting.content-second'),
        t('questions.why-vaulting.content-third'),
      ],
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
      <SEO title={t('html-title')} slug="/faq" />
      <Container>
        <Grid.Container gap={5} marginBottom={10} textAlign="center">
          <Text variant="display-1" as="h1">
            {t('title')}
          </Text>
          <Text variant="display-4" as="h2" color="secondary">
            {t('subtitle')}
          </Text>
        </Grid.Container>
        <Accordion.List>
          {items.map(({ id, title, content }) => {
            const isContentArray = Array.isArray(content);
            return isContentArray ? (
              <Accordion.Item key={id} title={title} content={content} />
            ) : null;
          })}
        </Accordion.List>
        <ContactContainer direction="column" align="center" textAlign="center">
          <Text variant="label-1" marginBottom={3}>
            {t('contact.title')}
          </Text>
          <Text color="secondary" variant="body-2" marginBottom={7}>
            {t('contact.subtitle')}
          </Text>
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
    padding: 0 ${theme.spacing[5]};

    ${media.greaterThan('md')`
      padding: 0;
    `}
  `}
`;

const ContactContainer = styled(Stack)`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[10]};

    ${media.greaterThan('lg')`
      margin-bottom: ${theme.spacing[11]};
    `}
  `}
`;

export default Faq;
