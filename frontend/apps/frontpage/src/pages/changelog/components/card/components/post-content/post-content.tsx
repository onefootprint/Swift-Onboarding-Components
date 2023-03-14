import { useIntl } from '@onefootprint/hooks';
import { media, Typography } from '@onefootprint/ui';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import styled, { css } from 'styled-components';

import Author from '../author';
import Content from '../content';
import CopyLink from '../copy-link';

const BASE_URL = 'https://onefootprint.com/changelog';

type PostContentProps = {
  date: string;
  featureImageUrl?: string;
  featureImageAlt: string;
  authorName: string;
  authorImg: string;
  title: string;
  html?: string;
  slug: string;
};

const PostContent = ({
  featureImageUrl,
  featureImageAlt,
  date,
  authorImg,
  authorName,
  html,
  title,
  slug,
}: PostContentProps) => {
  const { formatDateWithLongMonth } = useIntl();
  const formattedDate = formatDateWithLongMonth(new Date(date));
  return (
    <PostContainer>
      {featureImageUrl && (
        <ImageContainer>
          <Image
            src={featureImageUrl}
            height={200}
            width={200}
            alt={featureImageAlt}
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
          <Link href={`/changelog/${slug}`}>
            <Typography variant="display-3">{title}</Typography>
          </Link>
          <CopyLink slug={`${BASE_URL}/${slug}`} />
        </Title>
        <Author authorImg={authorImg} authorName={authorName} />
        {html && <Content html={html} />}
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
export default PostContent;
