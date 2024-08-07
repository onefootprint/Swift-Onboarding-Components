import { Stack, Text, media } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { SecurityTypes } from '@/api-reference/api-reference.types';

import HeadingAnchor from 'src/components/markdown/components/heading-anchor';
import { HydratedArticle } from 'src/pages/api-reference/hooks';
import TypeBadge from '../../../type-badge/type-badge';
import SideBySideElement from '../side-by-side-element';
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

const Article = ({ article }: ArticleProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  const { id, parameters, description, method, path, security, responses, requestBody } = article;
  const encodedId = encodeURIComponent(id);

  if (article.isHidden) {
    return null;
  }

  const contentColumn = (
    <>
      <HeaderContainer>
        <HeadingAnchor id={article.id} variant="heading-3" tag="h3">
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
        </HeadingAnchor>
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
    </>
  );
  const codeColumn = responses && <DemoCode article={article} />;
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
    padding-top: ${theme.spacing[8]};
    padding-bottom: ${theme.spacing[7]};
    background-color: ${theme.backgroundColor.primary};
  `}
`;

export default Article;
