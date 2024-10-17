import { useIntl } from '@onefootprint/hooks';
import { Container, Divider, createFontStyles, media } from '@onefootprint/ui';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TwitterBreadcrumb from 'src/components/twitter-breadcrumb';
import SubscribeToNewsletter from 'src/components/writing-layout/components/subscribe-to-newsletter';
import { PostType, getInitialPosts } from 'src/utils/ghost';
import styled, { css } from 'styled-components';

import { motion } from 'framer-motion';
import type { ParseKeys } from 'i18next';
import SEO from '../../components/seo';
import type { Post } from '../../utils/ghost/types';
import PostPreview from './components/post-preview';

export const getStaticProps = async () => {
  const posts = await getInitialPosts(PostType.blog);
  return { props: { posts } };
};

export type BlogProps = {
  posts: Post[];
};

enum Tags {
  all = 'all',
  design = 'design',
  engineering = 'engineering',
  product = 'product',
  companyNews = 'news',
  knowledgeBase = 'knowledge-base',
}

const Blog = ({ posts }: BlogProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.blog' });
  const { formatDateWithLongMonth } = useIntl();
  // Get the first post that is not a knowledge base post
  const [featuredPost] = posts.filter(post => post.primary_tag?.slug !== Tags.knowledgeBase);
  const [selectedTag, setSelectedTag] = useState('all');
  const filtersRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const handleTagChange = (value: string) => {
    setSelectedTag(value || 'all');
  };

  const tags = Object.values(Tags)
    .filter(tag => tag !== 'knowledge-base')
    .map(tag => tag)
    .sort();

  const filteredPosts =
    selectedTag === 'all'
      ? posts.filter(
          post =>
            post.primary_tag?.slug === Tags.design ||
            post.primary_tag?.slug === Tags.engineering ||
            post.primary_tag?.slug === Tags.product ||
            post.primary_tag?.slug === Tags.companyNews,
        )
      : posts.filter(post => post.primary_tag?.slug === selectedTag);

  const handleScroll = () => {
    if (filtersRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = filtersRef.current;
      setShowLeftShadow(scrollLeft > 0);
      setShowRightShadow(scrollLeft + clientWidth < scrollWidth);
    }
  };

  useEffect(() => {
    handleScroll();
    if (filtersRef.current) {
      filtersRef.current.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (filtersRef.current) {
        filtersRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <>
      <SEO title={t('html-title')} description={t('html-description')} slug="/blog" />
      <StyledContainer>
        <TwitterBreadcrumb
          title={t('breadcrumb.title')}
          description={t('breadcrumb.description')}
          twitterLabel={t('breadcrumb.twitter')}
        />
        <FeaturedPost>
          <PostPreview
            href={`/blog/${featuredPost.slug}`}
            authors={featuredPost.authors.map(author => ({
              id: author.id,
              avatarImgUrl: author.profile_image,
              name: author.name,
            }))}
            primaryTag={featuredPost.primary_tag.name}
            featureImageUrl={featuredPost.feature_image}
            featureImageAlt={featuredPost.feature_image_alt || featuredPost.title}
            publishedAt={formatDateWithLongMonth(new Date(featuredPost.published_at))}
            excerpt={featuredPost.excerpt}
            key={featuredPost.uuid}
            title={featuredPost.title}
            type="featured"
          />
        </FeaturedPost>
        <FiltersContainer $showLeftShadow={showLeftShadow} $showRightShadow={showRightShadow}>
          <Filters ref={filtersRef} type="single" value={selectedTag} onValueChange={handleTagChange}>
            {tags.map(tag => (
              <FilterChip key={tag} value={tag}>
                {t(`tags.${tag}` as ParseKeys<'common'>)}
              </FilterChip>
            ))}
            <VerticalDivider />
            <FilterChip value={Tags.knowledgeBase}>Knowledge Base</FilterChip>
          </Filters>
        </FiltersContainer>
        <Posts
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.15 }}
          key={selectedTag}
        >
          {filteredPosts.map(post => (
            <PostPreview
              href={`/blog/${post.slug}`}
              authors={post.authors.map(author => ({
                id: author.id,
                avatarImgUrl: author.profile_image,
                name: author.name,
              }))}
              primaryTag={post.primary_tag?.name}
              featureImageUrl={post.feature_image}
              featureImageAlt={post.feature_image_alt || post.title}
              publishedAt={formatDateWithLongMonth(new Date(post.published_at))}
              excerpt={post.excerpt}
              key={post.uuid}
              title={post.title}
              type="regular"
            />
          ))}
        </Posts>
        <StyledDivider />
        <SubscribeToNewsletter />
      </StyledContainer>
    </>
  );
};

const VerticalDivider = styled(Divider)`
  ${({ theme }) => css`
    width: ${theme.borderWidth[1]};
    height: ${theme.spacing[7]};
    background-color: ${theme.borderColor.tertiary};
    margin: 0 ${theme.spacing[3]};
  `}
`;

const StyledContainer = styled(Container)`
  && {
    max-width: 1100px;
  }
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[10]};
  `}
`;

const FeaturedPost = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]};
  `}
`;

const Posts = styled(motion.div)`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[7]};

    ${media.greaterThan('md')`
      grid-template-columns: repeat(2, 1fr);
    `}
  `}
`;

const FiltersContainer = styled.div<{ $showLeftShadow: boolean; $showRightShadow: boolean }>`
  ${({ theme, $showLeftShadow, $showRightShadow }) => css`
    position: relative;
    padding: ${theme.spacing[4]} 0;
    margin-bottom: ${theme.spacing[4]};
    &::before,
    &::after {
      content: '';
      position: absolute;
      top: -50%;
      transform: translateY(50%);
      height: 100%;
      width: 50%;
      pointer-events: none;
      transition: box-shadow 0.1s ease-in-out;
    }
    &::before {
      left: 0;
      border-left: ${$showLeftShadow ? `${theme.borderWidth[1]} solid ${theme.borderColor.tertiary}` : 'none'};
    }
    &::after {
      right: 0;
      border-right: ${$showRightShadow ? `${theme.borderWidth[1]} solid ${theme.borderColor.tertiary}` : 'none'};
    }
  `}
`;

const Filters = styled(ToggleGroup.Root)`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    align-items: center;
    max-width: 100%;
    overflow-x: auto;
  `}
`;

const FilterChip = styled(ToggleGroup.Item)`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    all: unset;
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    border-radius: ${theme.borderRadius.full};
    background-color: ${theme.backgroundColor.secondary};
    transition: background-color 0.1s ease-in-out, color 0.1s ease-in-out;
    cursor: pointer;
    white-space: nowrap;

    &:hover {
      background-color: ${theme.backgroundColor.senary};
      color: ${theme.color.primary};
    }

    &[data-state='on'] {
      background-color: ${theme.backgroundColor.tertiary};
      color: ${theme.color.quinary};
    }

    &[data-state='off'] {
   
      color: ${theme.color.primary};
    }
  `}
`;

export default Blog;
