import { useIntl, useTranslation } from '@onefootprint/hooks';
import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import { LinkButton, media, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { PostDetails } from 'src/utils/ghost/types';
import styled, { css } from 'styled-components';

import HtmlContent from '../../../html-content';
import Author from '../author';
import CopyLink from '../copy-link';

const BASE_URL = 'https://onefootprint.com/changelog';
const RECAP_TAG = 'recap';

type CardContentProps = {
  post: PostDetails;
};

const CardContent = ({ post }: CardContentProps) => {
  const { t } = useTranslation('pages.changelog');
  const { formatDateWithLongMonth } = useIntl();
  const formattedDate = formatDateWithLongMonth(new Date(post.published_at));
  const isRecap = post.tags.some(tag => tag.slug === RECAP_TAG);

  return (
    <PostContainer>
      {post.feature_image && (
        <ImageContainer>
          <Image
            src={post.feature_image}
            height={200}
            width={200}
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
          <CopyLink slug={`${BASE_URL}/${post.slug}`} />
        </Title>
        <Author
          authorImg={post.primary_author.profile_image}
          authorName={post.primary_author.name}
        />
        {isRecap ? (
          <>
            <Typography
              variant="body-2"
              color="secondary"
              sx={{ whiteSpace: 'pre-line' }}
            >
              {post.custom_excerpt || post.excerpt}
            </Typography>
            <LinkButton
              href={`/changelog/${post.slug}`}
              iconComponent={IcoArrowRightSmall16}
            >
              {t('read-more')}
            </LinkButton>
          </>
        ) : (
          post.html && <HtmlContent html={post.html} />
        )}
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
    height: 430px;

    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  `}
`;

const Title = styled.div`
  ${({ theme }) => css`
    display: flex;
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
