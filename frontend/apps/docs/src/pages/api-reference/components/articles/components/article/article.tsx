import { Box, Stack, Text, createFontStyles, media } from '@onefootprint/ui';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Element } from 'react-scroll';
import styled, { css } from 'styled-components';

import type { SecurityTypes } from '@/api-reference/api-reference.types';

import { HydratedArticle } from 'src/pages/api-reference/hooks';
import TypeBadge from '../../../type-badge/type-badge';
import DemoCode from './components/demo-code';
import Description from './components/description';
import Parameters from './components/parameters';
import RequestBody from './components/request-body';
import Responses from './components/responses';
import Security from './components/security';
import Tags from './components/tags';

const API_BASE_URL = 'api.onefootprint.com';

type ArticleProps = {
  article: HydratedArticle;
};

const CONTENT_WIDTH = 900;

const Article = ({ article }: ArticleProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  const { id, parameters, description, method, path, security, responses, requestBody } = article;
  const encodedId = encodeURIComponent(id);

  if (article.isHidden) {
    return null;
  }

  return (
    <ArticleContainer id={encodedId} name={encodedId}>
      <ContentColumn>
        <HeaderContainer>
          <MethodContainer>
            <TypeBadge type={method} />
            <Stack direction="row" gap={1}>
              <BaseUrl>{API_BASE_URL}</BaseUrl>
              <Text variant="label-2" tag="h3">
                {path}
              </Text>
            </Stack>
          </MethodContainer>
          <Tags article={article} />
        </HeaderContainer>
        {description && (
          <Box marginBottom={7}>
            <Description>{description}</Description>
          </Box>
        )}
        {security && (
          <Requests>
            <Text variant="label-1" marginTop={3}>
              {t('request')}
            </Text>
            {security.map(s => Object.keys(s).map(s => <Security key={s} type={s as SecurityTypes} />))}
            <Box marginTop={2} marginBottom={2} />
            <Schema>
              {parameters && <Parameters parameters={parameters} />}
              {requestBody && <RequestBody requestBody={requestBody} />}
              {responses && <Responses responses={responses} />}
            </Schema>
          </Requests>
        )}
      </ContentColumn>
      <CodeColumn>{responses && <DemoCode article={article} />}</CodeColumn>
    </ArticleContainer>
  );
};

const BaseUrl = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('label-2')}
    color: ${theme.color.tertiary};
    display: none;

    ${media.greaterThan('md')`
      display: block;
    `}
  `}
`;

const HeaderContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding-top: ${theme.spacing[8]};
    padding-bottom: ${theme.spacing[7]};
    background-color: ${theme.backgroundColor.primary};
  `}
`;

const MethodContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    gap: ${theme.spacing[2]};
  `}
`;

const ArticleContainer = styled(Element)<{ name: string }>`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    grid-area: content;
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;

    ${media.greaterThan('lg')`
      display: grid;
      grid-template-columns: minmax(600px, 1fr) minmax(var(--page-aside-nav-api-reference-width-small), 0.5fr);
      grid-template-areas: 'article code';
    `}
  `}
`;

const ContentColumn = styled.div`
  ${({ theme }) => css`
    grid-area: article;
    padding: 0 ${theme.spacing[5]} ${theme.spacing[8]} ${theme.spacing[8]};
    max-width: ${CONTENT_WIDTH}px;
    width: 100%;
    margin: 0 auto;
  `}
`;

const Requests = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[4]};
  `}
`;

const Schema = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const CodeColumn = styled.div`
  ${({ theme }) => css`
    grid-area: code;
    padding: 0 ${theme.spacing[6]};

    ${media.greaterThan('md')`
      padding: 0 ${theme.spacing[6]};
    `}
  `}
`;

export default Article;
