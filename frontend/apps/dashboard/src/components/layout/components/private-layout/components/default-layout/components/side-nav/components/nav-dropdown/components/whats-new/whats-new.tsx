import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { IcoArrowUpRight16 } from '@onefootprint/icons';
import { Box, Dialog, LinkButton, Stack, Text } from '@onefootprint/ui';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import useChangelogArticles from './hooks/use-changelog-articles';
import type { PostDetails } from './whats-new.types';

type WhatsNewProps = {
  onClose: () => void;
  open: boolean;
};

const WhatsNew = ({ open, onClose }: WhatsNewProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.private-layout.nav' });
  const { data: posts = [] } = useChangelogArticles();

  return (
    <>
      <Dialog open={open} onClose={onClose} title={t('whats-new.title')}>
        <Stack direction="column" minHeight="400px" gap={5}>
          {posts.map((post: PostDetails) => (
            <PostContent key={post.uuid}>
              <PostImage src={post.featureImage} alt={post.title} width={800} height={800} />
              <TextContainer direction="column" justifyContent="space-between" alignItems="start" gap={3}>
                <Stack direction="row" justifyContent="space-between" width="100%">
                  <Text variant="label-2" color="tertiary">
                    {post.publishedAt}
                  </Text>
                  <LinkButton
                    variant="label-2"
                    iconComponent={IcoArrowUpRight16}
                    href={`${FRONTPAGE_BASE_URL}/changelog/${post.slug}`}
                  >
                    {t('whats-new.more-details')}
                  </LinkButton>
                </Stack>
                <Text variant="label-1">{post.title}</Text>
                <Text variant="body-2" color="secondary">
                  {post.excerpt}
                </Text>
              </TextContainer>
            </PostContent>
          ))}
          <Stack direction="column" textAlign="center" justifyContent="center" gap={2} marginTop={3} marginBottom={3}>
            <Text variant="label-3" color="tertiary">
              {t('whats-new.want-to-know-more')}
            </Text>
            <Box>
              <LinkButton variant="label-3" iconComponent={IcoArrowUpRight16} href={`${FRONTPAGE_BASE_URL}/changelog`}>
                {t('whats-new.view-full-changelog')}
              </LinkButton>
            </Box>
          </Stack>
        </Stack>
      </Dialog>
    </>
  );
};

const PostContent = styled.article`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `}
`;

const PostImage = styled(Image)`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

const TextContainer = styled(Stack)`
  ${({ theme }) => css`
    padding: ${theme.spacing[7]};
  `}
`;

export default WhatsNew;
