import { Box, Text, createFontStyles } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-scroll';
import { HttpMethod } from 'src/pages/api-reference/api-reference.types';
import { COLOR_FOR_METHOD } from 'src/pages/api-reference/components/type-badge/type-badge';
import styled, { css } from 'styled-components';
import { ARTICLES_CONTAINER_ID, ApiArticleContent } from './articles';

type EndpointsOverviewProps = {
  apiArticles: ApiArticleContent[];
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
    <Container>
      <Header>
        <Text variant="caption-1" color="secondary" tag="h5">
          {t('endpoints')}
        </Text>
      </Header>
      <Content>
        {apiArticles
          .filter(article => !article.api.isHidden)
          .map(article => (
            <Link
              id={article.api.id}
              to={article.api.id}
              containerId={ARTICLES_CONTAINER_ID}
              href={`#${article.api.id}`}
              smooth
              duration={500}
            >
              <Method method={article.api.method} />
              <td>{article.api.path}</td>
            </Link>
          ))}
      </Content>
    </Container>
  );
};

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
