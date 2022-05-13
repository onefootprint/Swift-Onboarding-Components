import type { StaticImageData } from 'next/image';
import Image from 'next/image';
import React from 'react';
import styled, { css } from 'styled';
import { Container, media, Typography } from 'ui';

import VaultArticle from './components/vault-article';

type VaultSectionProps = {
  articles: { title: string; content: string }[];
  description: string;
  mainArticle: {
    content: string;
    imgAlt: string;
    imgSrc: StaticImageData;
    title: string;
  };
  subtitle: string;
  title: string;
};

const VaultSection = ({
  articles,
  description,
  mainArticle,
  subtitle,
  title,
}: VaultSectionProps) => (
  <Container as="section" id="vault">
    <Inner>
      <Header>
        <Typography
          variant="label-1"
          color="secondary"
          sx={{ marginBottom: 5 }}
        >
          {subtitle}
        </Typography>
        <Typography
          variant="display-1"
          color="primary"
          sx={{ maxWidth: '620px', marginBottom: 7 }}
        >
          {title}
        </Typography>
        <Typography
          variant="display-4"
          color="secondary"
          sx={{ marginBottom: 9, maxWidth: '720px' }}
        >
          {description}
        </Typography>
      </Header>
      <MainArticle>
        <Image
          alt={mainArticle.imgAlt}
          height={391}
          layout="responsive"
          placeholder="blur"
          src={mainArticle.imgSrc}
          width={484}
        />
        <MainArticleInner>
          <VaultArticle
            title={mainArticle.title}
            content={mainArticle.content}
          />
        </MainArticleInner>
      </MainArticle>
      <SecondaryArticles>
        {articles.map(article => (
          <Article key={article.title}>
            <VaultArticle content={article.content} title={article.title} />
          </Article>
        ))}
      </SecondaryArticles>
    </Inner>
  </Container>
);

const Inner = styled.div`
  ${({ theme }) => css`
    align-items: center;
    border-top: ${theme.borderWidth[1]}px solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0 auto;
    max-width: 960px;
    padding: ${theme.spacing[10]}px 0;

    ${media.greaterThan('lg')`
      padding: ${theme.spacing[11]}px 0;
    `}
  `}
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
    border-radius: ${theme.borderRadius[1]}px;
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
