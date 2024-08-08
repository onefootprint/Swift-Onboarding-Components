import { Box, Stack, Text } from '@onefootprint/ui';
import styled from 'styled-components';
import TypeBadge from '../../type-badge';
import { ApiArticle } from '../nav.types';
import NavigationScrollLink from './navigation-scroll-link';

type ApiNavigationScrollLinkProps = {
  article: ApiArticle;
  onClick?: () => void;
};

const ApiNavigationScrollLink = ({ article, onClick }: ApiNavigationScrollLinkProps) => {
  const {
    api: { method, path, id },
    title,
  } = article;

  return (
    <Box marginLeft={3}>
      <NavigationScrollLink id={id} onClick={onClick}>
        {title ? (
          <Text variant="body-4" color="tertiary">
            {title}
          </Text>
        ) : (
          <>
            <Stack justify="center">
              <TypeBadge skinny type={method} />
            </Stack>
            <PathLabel>{path}</PathLabel>
          </>
        )}
      </NavigationScrollLink>
    </Box>
  );
};

const PathLabel = styled.span`
  text-transform: lowercase;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
  display: block;
  overflow: hidden;
  max-width: 100%;
`;

export default ApiNavigationScrollLink;
