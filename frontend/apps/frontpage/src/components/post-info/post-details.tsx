import { useTranslation } from '@onefootprint/hooks';
import { Box, Typography } from '@onefootprint/ui';
import Image from 'next/image';
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
  createdAt?: string;
};

const PostInfo = ({ author, createdAt, readingTime, tag }: PostInfoProps) => {
  const { t } = useTranslation('pages.blog');

  return (
    <Container>
      <Avatar
        alt={author.name}
        height={44}
        layout="fixed"
        src={author.profileImage}
        width={44}
      />
      <Box>
        <Typography variant="label-2">
          {author.name}
          <Separator />
          {tag.name}
        </Typography>
        <Typography variant="body-3" color="tertiary">
          {createdAt}
          {createdAt && <Separator />}
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
    gap: ${theme.spacing[4]}px;
  `}
`;

const Avatar = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius[4]}px;
  `}
`;

export default PostInfo;
