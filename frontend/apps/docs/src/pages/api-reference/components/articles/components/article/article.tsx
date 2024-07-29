import { Box, Stack, Text, createFontStyles, media } from '@onefootprint/ui';
import React from 'react';
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
        <ContentWidth>
          <TitleContainer direction="column" gap={3}>
            <Stack direction="row" justifyContent="space-between">
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
            </Stack>
            {description && <Description>{description}</Description>}
          </TitleContainer>
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
        </ContentWidth>
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

const ContentWidth = styled.div`
  max-width: ${CONTENT_WIDTH}px;
  margin: 0 auto;
`;

const TitleContainer = styled(Stack)`
  ${({ theme }) => css`
    width: 100%;
    margin: 0 auto;
    margin-bottom: ${theme.spacing[3]};

    & > *:first-child {
      margin-left: calc(-1 * ${theme.spacing[2]});
    }
  `}
`;

const ContentColumn = styled.div`
  ${({ theme }) => css`
    grid-area: article;
    padding: ${theme.spacing[8]} ${theme.spacing[5]} ${theme.spacing[8]}
      ${theme.spacing[8]};
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
    padding: ${theme.spacing[4]} ${theme.spacing[6]} ${theme.spacing[10]};

    ${media.greaterThan('md')`
      padding: ${theme.spacing[4]} ${theme.spacing[6]};
    `}
  `}
`;

export default Article;
