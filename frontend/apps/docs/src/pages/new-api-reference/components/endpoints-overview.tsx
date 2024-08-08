import { Box, Text, createFontStyles, media } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-scroll';
import { HttpMethod } from 'src/pages/api-reference/api-reference.types';
import { ARTICLES_CONTAINER_ID } from 'src/pages/api-reference/components/articles/articles';
import { ApiArticle } from 'src/pages/api-reference/components/nav/nav.types';
import { COLOR_FOR_METHOD } from 'src/pages/api-reference/components/type-badge/type-badge';
import styled, { css } from 'styled-components';

type EndpointsOverviewProps = {
  apiArticles: ApiArticle[];
};

const Method = ({ method }: { method: HttpMethod }) => {
  const colorForMethod = COLOR_FOR_METHOD[method];
  return (
    <Box marginRight={3} color={colorForMethod}>
      {method.toUpperCase()}
    </Box>
  );
};

const EndpointsOverview = ({ apiArticles }: EndpointsOverviewProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.api-reference' });
  return (
    <StickyContainer>
      <Container>
        <Header>
          <Text variant="caption-1" color="secondary" tag="h5">
            {t('endpoints')}
          </Text>
        </Header>
        <Content>
          {apiArticles.map(article => (
            <Link
              id={article.api.id}
              to={article.api.id}
              containerId={ARTICLES_CONTAINER_ID}
              href={`#${article.api.id}`}
            >
              <Method method={article.api.method} />
              <td>{article.api.path}</td>
            </Link>
          ))}
        </Content>
      </Container>
    </StickyContainer>
  );
};

const StickyContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    padding-top: ${theme.spacing[8]};
    padding-bottom: ${theme.spacing[8]};
    width: 100%;

    ${media.greaterThan('md')`
      position: sticky;
      top: 0;
      z-index: 1;
    `}
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor.primary};
    border-radius: ${theme.borderRadius.default};
    border: 1px solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
    width: 100%;
  `}
`;

const Content = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.primary};
    margin: ${theme.spacing[3]} 0 ${theme.spacing[4]};
    width: 100%;
    display: table;

    a {
      display: table-row;
      padding: ${theme.spacing[1]} 0;
      text-decoration: none;
      color: ${theme.color.primary};
      @media (hover: hover) {
        &:hover {
          color: ${theme.color.secondary};
        }
      }
    }

    a > * {
      display: table-cell;
      ${createFontStyles('snippet-2', 'code')};
    }
    a > *:first-child {
      width:auto;
      text-align:right;
      white-space: nowrap;

      padding-left: ${theme.spacing[5]};
      padding-right: ${theme.spacing[3]};
    }
    a > *:last-child {
      width: 100%;
      padding-right: ${theme.spacing[5]};
    }
  `}
`;

export default EndpointsOverview;
