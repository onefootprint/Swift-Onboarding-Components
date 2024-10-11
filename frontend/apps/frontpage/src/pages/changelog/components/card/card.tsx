import { IcoDotSmall16 } from '@onefootprint/icons';
import { CopyButton, Grid, Stack, Text, createFontStyles, media } from '@onefootprint/ui';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { PostDetails } from 'src/utils/ghost/types';
import styled, { css } from 'styled-components';

import HtmlContent from '../html-content';
import Author from './components/author';
import Line from './components/line';

type CardProps = {
  post: PostDetails;
  hideLine?: boolean;
};

const BASE_URL = 'https://onefootprint.com/changelog';

const Card = ({ post, hideLine }: CardProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'components.copy-link' });
  const formattedDate = format(new Date(post.published_at), 'MMM d, yyyy');

  return (
    <PostContainer id={`${post.slug}`} width="fit-content">
      <DateRail gridArea="date" align="start">
        <Text variant="caption-1" color="tertiary">
          {formattedDate}
        </Text>
      </DateRail>
      <LineContainer gridArea="line" direction="column" align="center" position="relative">
        <DotContainer>
          <IcoDotSmall16 />
        </DotContainer>
        {hideLine && <Line />}
      </LineContainer>
      {post.feature_image && (
        <Grid.Item direction="column" gap={7} gridArea="image" align="center">
          <ImageContainer>
            <Image src={post.feature_image} height={900} width={900} alt={post.feature_image_alt || post.title} />
          </ImageContainer>
        </Grid.Item>
      )}
      <TextContent gridArea="content" direction="column" width="100%" gap={7}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={3}>
          <Title href={`/changelog/${post.slug}`}>{post.title}</Title>
          <CopyButton
            ariaLabel={t('cta')}
            tooltip={{
              position: 'top',
              text: t('cta'),
            }}
            contentToCopy={`${BASE_URL}/${post.slug}`}
          />
        </Stack>
        <Author avatarUrl={post.primary_author.profile_image} name={post.primary_author.name} />
        {post.html && <HtmlContent html={post.html} />}
      </TextContent>
    </PostContainer>
  );
};

const DotContainer = styled(Stack)`
  ${({ theme }) => css`
    background-color: ${theme.backgroundColor.primary};
    position: absolute;
    top: ${theme.spacing[3]};
    left: 0;
    transform: translate(-50%, -50%);
    padding: ${theme.spacing[3]};
  `}
`;

const LineContainer = styled(Grid.Item)`
  display: none;
  position: relative;

  ${media.greaterThan('md')`
    display: flex;
  `}
`;

const PostContainer = styled(Grid.Container)`
  ${({ theme }) => css`
    margin-left: auto;
    margin-right: auto;
    position: relative;
    grid-template-columns: 1px 1fr;
    grid-template-rows: auto auto;
    grid-template-areas:
      'line image'
      'line date'
      'line content';

    ${media.greaterThan('md')`
      grid-column-gap: ${theme.spacing[9]};
      grid-template-areas: 
        'date line image'
        'date line content';
      grid-template-columns: 100px 1px 800px;
    `};
  `}
`;

const DateRail = styled(Grid.Item)`
  ${({ theme }) => css`
    position: relative;
    padding: ${theme.spacing[5]} 0;

    ${media.greaterThan('md')`
      padding: 0;
    `};
  `}
`;

const Title = styled(Link)`
  ${({ theme }) => css`
    cursor: pointer;
    text-decoration: none;
    ${createFontStyles('heading-2')}
    color: ${theme.color.primary};
    transition: color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: ${theme.spacing[2]};

    &:hover {
      color: ${theme.color.tertiary};
    }
  `}
`;

const TextContent = styled(Grid.Item)`
  ${({ theme }) => css`
    margin: auto;
    padding: ${theme.spacing[3]} ${theme.spacing[3]} ${theme.spacing[10]}
      ${theme.spacing[3]};

    ${media.greaterThan('md')`
      width: 100%;
      max-width: 720px;
      padding: ${theme.spacing[7]} ${theme.spacing[7]} ${theme.spacing[11]} ${theme.spacing[7]};
    `};
  `};
`;

const ImageContainer = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.secondary};
    overflow: hidden;
    width: 100%;
    aspect-ratio: 800 / 440;

    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }

    ${media.greaterThan('md')`
      border-radius: ${theme.borderRadius.lg};
      height: 430px;
      width: 100%;
    `}
  `}
`;

export default Card;
