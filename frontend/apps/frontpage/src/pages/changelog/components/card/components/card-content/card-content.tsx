import { useIntl } from '@onefootprint/hooks';
import { CopyButton, media, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { PostDetails } from 'src/utils/ghost/types';
import styled, { css } from 'styled-components';

import HtmlContent from '../../../html-content';
import Author from '../author';

const BASE_URL = 'https://onefootprint.com/changelog';

type CardContentProps = {
  post: PostDetails;
};

const CardContent = ({ post }: CardContentProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.copy-link' });
  const { formatDateWithLongMonth } = useIntl();
  const formattedDate = formatDateWithLongMonth(new Date(post.published_at));

  return (
    <PostContainer>
      {post.feature_image && (
        <ImageContainer>
          <Image
            src={post.feature_image}
            height={900}
            width={900}
            alt={post.feature_image_alt || post.title}
          />
        </ImageContainer>
      )}
      <TextContent>
        <DateMobile>
          <Typography variant="label-3" color="tertiary">
            {formattedDate}
          </Typography>
        </DateMobile>
        <Title>
          <Link href={`/changelog/${post.slug}`}>
            <Typography variant="display-3">{post.title}</Typography>
          </Link>
          <CopyButton
            ariaLabel={t('cta')}
            tooltipText={t('cta')}
            contentToCopy={`${BASE_URL}/${post.slug}`}
          />
        </Title>
        <Author
          authorImg={post.primary_author.profile_image}
          authorName={post.primary_author.name}
        />
        {post.html && <HtmlContent html={post.html} />}
      </TextContent>
    </PostContainer>
  );
};

const PostContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[8]};
    margin: ${theme.spacing[2]} auto;
    width: 100%;
    margin-bottom: ${theme.spacing[10]};

    ${media.greaterThan('md')`
      margin-bottom: none;
      min-width: 830px;
    `}
  `}
`;

const TextContent = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};

    ${media.greaterThan('md')`
      padding: ${theme.spacing[5]} ${theme.spacing[8]} ${theme.spacing[11]}
        ${theme.spacing[5]};
    `};
  `};
`;

const DateMobile = styled.div`
  display: flex;

  ${media.greaterThan('md')`
    display: none;
  `}
`;

const ImageContainer = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.tertiary};
    background-color: rgba(247, 247, 247, 0.4);
    backdrop-filter: (8px);
    overflow: hidden;
    width: 100%;
    height: 240px;

    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  `}

  ${media.greaterThan('md')`
    height: 430px;
  `}
`;

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: ${theme.spacing[4]};
    width: 100%;

    a {
      text-decoration: none;
    }
  `}
`;
export default CardContent;
