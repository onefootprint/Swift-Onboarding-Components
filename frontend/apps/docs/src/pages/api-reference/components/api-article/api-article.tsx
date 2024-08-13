import { Stack, Text, media } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { SecurityTypes } from 'src/pages/api-reference/api-reference.types';

import { ApiArticleContent } from '../articles';
import SideBySideElement from '../side-by-side-element';
import TypeBadge from '../type-badge/type-badge';
import DemoCode from './components/demo-code';
import Description from './components/description';
import HeadingAnchor from './components/heading-anchor';
import Parameters from './components/parameters';
import RequestBody from './components/request-body';
import Responses from './components/responses';
import Security from './components/security';
import Tags from './components/tags';

const API_BASE_URL = 'api.onefootprint.com';

type ArticleProps = {
  article: ApiArticleContent;
};

const Article = ({ article }: ArticleProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  const { title, description: mdDescription, api } = article;
  const { id, parameters, description: openApiDescription, method, path, security, responses, requestBody } = api;
  const encodedId = encodeURIComponent(id);
  // Use the API's description written in markdown if any. Otherwise, use the description from the open API spec.
  const description = mdDescription || openApiDescription;

  if (api.isHidden) {
    return null;
  }

  const contentColumn = (
    <>
      <HeaderContainer>
        <HeadingAnchor id={api.id}>
          {title ? (
            // Show the title for the API if it's explicitly set in markdown
            <Text variant="heading-2">{title}</Text>
          ) : (
            // For APIs that don't have an explicit title (mostly on our internal API reference), show the method and path
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
          )}
        </HeadingAnchor>
        <Tags article={api} />
      </HeaderContainer>
      {description && <Description>{description}</Description>}
      <Stack direction="column" gap={8} marginTop={8}>
        <Stack direction="column" gap={5}>
          <Text variant="heading-3">{t('request')}</Text>
          {security?.map(s => Object.keys(s).map(s => <Security key={s} type={s as SecurityTypes} />))}
          {parameters && <Parameters parameters={parameters} />}
          {requestBody && <RequestBody requestBody={requestBody} />}
        </Stack>
        {responses && <Responses responses={responses} />}
      </Stack>
    </>
  );
  const codeColumn = <DemoCode article={api} />;
  return <SideBySideElement id={encodedId} left={contentColumn} right={codeColumn} />;
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
    padding-bottom: ${theme.spacing[7]};
    background-color: ${theme.backgroundColor.primary};
  `}
`;

export default Article;
