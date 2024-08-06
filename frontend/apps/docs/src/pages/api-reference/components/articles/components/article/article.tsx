import { Stack, Text, media } from '@onefootprint/ui';
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
          <Stack gap={2}>
            <TypeBadge type={method} />
            <Stack direction="row" gap={1}>
              <BaseUrlContainer>
                <Text variant="heading-3" color="tertiary" tag="span">
                  {API_BASE_URL}
                </Text>
              </BaseUrlContainer>
              <Text variant="heading-3" tag="h3">
                {path}
              </Text>
            </Stack>
          </Stack>
          <Tags article={article} />
        </HeaderContainer>
        {description && <Description>{description}</Description>}
        <Stack direction="column" gap={8} marginTop={8}>
          <Stack direction="column" gap={5}>
            <Text variant="heading-3">{t('request')}</Text>
            {/* TODO remove this for normal auth, put this in headers for other auth */}
            {security?.map(s => Object.keys(s).map(s => <Security key={s} type={s as SecurityTypes} />))}
            {parameters && <Parameters parameters={parameters} />}
            {requestBody && <RequestBody requestBody={requestBody} />}
          </Stack>
          {responses && <Responses responses={responses} />}
        </Stack>
      </ContentColumn>
      <CodeColumn>{responses && <DemoCode article={article} />}</CodeColumn>
    </ArticleContainer>
  );
};

const BaseUrlContainer = styled.div`
  display: none;
  ${media.greaterThan('md')`
    display: block;
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
