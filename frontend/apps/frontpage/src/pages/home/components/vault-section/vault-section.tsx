import { useTranslation } from '@onefootprint/hooks';
import {
  IcoDatabase24,
  IcoEye24,
  IcoLock24,
  IcoShield24,
} from '@onefootprint/icons';
import { Container, media, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled-components';

import VaultArticle from './components/vault-article';

const VaultSection = () => {
  const { t } = useTranslation('pages.home.vault');
  const articles = [
    {
      title: t('articles.secondaries.trust.title'),
      content: t('articles.secondaries.trust.content'),
      Icon: IcoEye24,
    },
    {
      title: t('articles.secondaries.access.title'),
      content: t('articles.secondaries.access.content'),
      Icon: IcoDatabase24,
    },
    {
      title: t('articles.secondaries.secure.title'),
      content: t('articles.secondaries.secure.content'),
      Icon: IcoShield24,
    },
  ];

  return (
    <Container as="section" id="vault">
      <Inner>
        <Header>
          <Typography
            variant="label-1"
            color="secondary"
            sx={{ marginBottom: 5 }}
          >
            {t('subtitle')}
          </Typography>
          <Typography
            variant="display-1"
            color="primary"
            sx={{ maxWidth: '620px', marginBottom: 7 }}
          >
            {t('title')}
          </Typography>
          <Typography
            variant="display-4"
            color="secondary"
            sx={{ marginBottom: 9, maxWidth: '720px' }}
          >
            {t('description')}
          </Typography>
        </Header>
        <MainArticle>
          <Image
            alt={t('articles.main.alt-img')}
            height={391}
            src="/vault/main-article.png"
            width={484}
          />
          <MainArticleInner>
            <VaultArticle
              content={t('articles.main.content')}
              iconComponent={IcoLock24}
              title={t('articles.main.title')}
            />
          </MainArticleInner>
        </MainArticle>
        <SecondaryArticles>
          {articles.map(article => (
            <Article key={article.title}>
              <VaultArticle
                content={article.content}
                iconComponent={article.Icon}
                title={article.title}
              />
            </Article>
          ))}
        </SecondaryArticles>
      </Inner>
    </Container>
  );
};

const Inner = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 0 auto;
  max-width: 960px;
`;

const Header = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  text-align: center;
`;

const Article = styled.article`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius[2]}px;
    padding: ${theme.spacing[6]}px;

    ${media.between('sm', 'lg')`
      padding: ${theme.spacing[7]}px;
    `}

    ${media.greaterThan('lg')`
      padding: ${theme.spacing[9]}px;
    `}
  `}
`;

const MainArticle = styled(Article)`
  ${({ theme }) => css`
    display: inline-grid;
    margin-bottom: ${theme.spacing[5]}px;
    row-gap: ${theme.spacing[9]}px;

    ${media.greaterThan('lg')`
      column-gap: ${theme.spacing[9]}px;
      grid-template-columns: repeat(2, 1fr);
    `}
  `}
`;

const MainArticleInner = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;

  ${media.greaterThan('lg')`
    align-items: flex-start;
    text-align: left;
  `}
`;

const SecondaryArticles = styled.div`
  ${({ theme }) => css`
    display: inline-grid;
    grid-template-columns: repeat(1, 1fr);
    row-gap: ${theme.spacing[5]}px;

    ${media.greaterThan('lg')`
      column-gap: ${theme.spacing[5]}px;
      grid-template-columns: repeat(3, 1fr);
    `}
  `}
`;

export default VaultSection;
