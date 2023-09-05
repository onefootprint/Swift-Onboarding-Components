import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Box, createFontStyles, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';

export type PostInfoProps = {
  authors: {
    id: string;
    name: string;
    profileImage: string;
  }[];
  readingTime: number;
  tag: {
    name: string;
  };
  publishedAt?: string;
};

const PostInfo = ({
  authors,
  publishedAt,
  readingTime,
  tag,
}: PostInfoProps) => {
  const { t } = useTranslation('pages.blog');

  return (
    <Container>
      <AvatarGroup count={authors.length}>
        {authors.map(author => (
          <Avatar
            key={author.id}
            alt={author.name}
            height={44}
            src={author.profileImage}
            width={44}
          />
        ))}
      </AvatarGroup>
      <Box>
        <Header>
          <AuthorsName>
            {authors.map(author => author.name).join(' & ')}
          </AuthorsName>
          <Typography variant="label-2">
            <Separator />
            {tag.name}
          </Typography>
        </Header>
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

const Header = styled.header`
  display: flex;
`;

const AuthorsName = styled.div`
  ${createFontStyles('label-2')};
`;

const AvatarGroup = styled.div<{ count: number }>`
  ${({ count }) => css`
    width: ${count === 2 ? 74 : 46}px;
    position: relative;
  `}
`;

const Avatar = styled(Image)`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
    border: ${theme.borderWidth[2]} solid ${theme.backgroundColor.secondary};

    &:nth-child(2) {
      position: absolute;
      left: ${theme.spacing[8]};
    }
  `}
`;

export default PostInfo;
