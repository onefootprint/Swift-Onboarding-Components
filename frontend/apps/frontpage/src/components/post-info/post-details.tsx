import { Box, Text, createFontStyles, media } from '@onefootprint/ui';
import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

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

const PostInfo = ({ authors, publishedAt, readingTime, tag }: PostInfoProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.blog' });

  return (
    <Container>
      <AvatarGroup count={authors.length}>
        {authors.map(author => (
          <Avatar key={author.id} alt={author.name} height={44} src={author.profileImage} width={44} />
        ))}
      </AvatarGroup>
      <Box>
        <Header>
          <AuthorsName>{authors.map(author => author.name).join(' & ')}</AuthorsName>
          <Separator />
          <Text variant="label-2">{tag.name}</Text>
        </Header>
        <Details>
          <Text variant="body-3" color="tertiary">
            {publishedAt}
          </Text>
          {publishedAt && <Separator visibleMobile />}
          <Text variant="body-3" color="tertiary">
            {t('post.reading-time', {
              readingTime,
            })}
          </Text>
        </Details>
      </Box>
    </Container>
  );
};

const Details = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
    margin-top: ${theme.spacing[2]};
    color: ${theme.color.tertiary};
  `}
`;

const Separator = styled.span<{ visibleMobile?: boolean }>`
  ${({ visibleMobile }) => css`
    ${createFontStyles('label-2')};
    display: ${visibleMobile ? 'flex' : 'none'};
    height: 100%;
    align-items: center;

    &::after {
      content: '·';
      height: fit-content;
    }

    ${media.greaterThan('sm')`
      display: inline-block;
    `}
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[4]};
    flex-direction: column;

    ${media.greaterThan('sm')`
      flex-direction: row;
    `}
  `}
`;

const Header = styled.header`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing[2]};

    ${media.greaterThan('sm')`
      flex-direction: row;
      gap: ${theme.spacing[3]};
  `}
  `}
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
