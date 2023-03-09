import { useTranslation } from '@onefootprint/hooks';
import { Box, Typography } from '@onefootprint/ui';
import Image from 'next/legacy/image';
import React from 'react';
import styled, { css } from 'styled-components';

export type PostInfoProps = {
  author: {
    name: string;
    profileImage: string;
  };
  readingTime: number;
  tag: {
    name: string;
  };
  publishedAt?: string;
};

const PostInfo = ({ author, publishedAt, readingTime, tag }: PostInfoProps) => {
  const { t } = useTranslation('pages.blog');

  return (
    <Container>
      <Avatar
        alt={author.name}
        height={44}
        src={author.profileImage}
        width={44}
        layout="fixed"
      />
      <Box>
        <Typography variant="label-2">
          {author.name}
          <Separator />
          {tag.name}
        </Typography>
        <Typography variant="body-3" color="tertiary">
          {publishedAt}
          {publishedAt && <Separator />}
          {t('post.reading-time', {
            readingTime,
          })}
        </Typography>
      </Box>
    </Container>
  );
};

const Separator = () => (
  <Box as="span" sx={{ marginX: 3 }}>
    |
  </Box>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]};
  `}
`;

const Avatar = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
  `}
`;

export default PostInfo;
