import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Author, Post, Tag } from './types';

const GENERATED_POSTS_DIR = path.join(process.cwd(), 'src/pages/blog/seo/generated-posts');
const PUBLIC_DIR = path.join(process.cwd(), 'public/seo');
const DEFAULT_AUTHOR: Author = {
  id: 'percy',
  name: 'Percy the Penguin',
  profile_image: '/pricing/aml.png',
  slug: 'percy',
  url: '/blog/author/percy',
  bio: null,
  cover_image: null,
  facebook: null,
  location: null,
  meta_description: null,
  meta_title: null,
  twitter: null,
  website: null,
};

const DEFAULT_TAG: Tag = {
  id: 'knowledge-base',
  name: 'Knowledge Base',
  slug: 'knowledge-base',
  url: '/blog/tag/knowledge-base',
  description: 'Knowledge Base Articles',
  accent_color: null,
  canonical_url: null,
  codeinjection_foot: null,
  codeinjection_head: null,
  feature_image: null,
  meta_description: null,
  meta_title: null,
  og_description: null,
  og_image: null,
  og_title: null,
  twitter_description: null,
  twitter_image: null,
  twitter_title: null,
  visibility: 'public',
};

const DEFAULT_IMAGES = ['/og-img-real-estate.png', '/og-img-home.png', '/og-img-fintech.png'];

export async function getGeneratedPosts(): Promise<Post[]> {
  const files = fs.readdirSync(GENERATED_POSTS_DIR);
  const posts: Post[] = [];

  for (const file of files) {
    if (file.endsWith('.html')) {
      const filePath = path.join(GENERATED_POSTS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data, content: html } = matter(content);

      // Validate required fields
      if (!html) {
        console.warn(`Skipping post ${file} due to missing HTML content`);
        continue;
      }

      const slug = file.replace('.html', '');

      // Generate title from slug if not provided in frontmatter
      let title = data.title ? String(data.title).trim() : '';
      if (!title) {
        // Convert slug to title case, handling special cases
        title = slug
          .split('-')
          .map(word => {
            if (word.toLowerCase() === 'kyc') return 'KYC';
            return word.charAt(0).toUpperCase() + word.slice(1);
          })
          .join(' ');
        console.log(`Generated title from slug: "${title}" for file: ${file}`);
      }

      if (!title) {
        console.warn(`Skipping post ${file} due to empty title`);
        continue;
      }

      // Get feature image from frontmatter and ensure it has /seo/ prefix
      let featureImage = data.feature_image;
      if (featureImage && !featureImage.startsWith('/seo/')) {
        featureImage = `/seo${featureImage}`;
      }

      // If no feature image in frontmatter or it doesn't exist, use default
      if (!featureImage || !fs.existsSync(path.join(PUBLIC_DIR, path.basename(featureImage)))) {
        console.log('Using default image for:', slug);
        featureImage = DEFAULT_IMAGES[Math.floor(Math.random() * DEFAULT_IMAGES.length)];
      }

      const post: Post = {
        id: slug,
        uuid: slug,
        title,
        slug,
        html,
        excerpt: data.excerpt || `${html.substring(0, 200).replace(/<[^>]*>/g, '')}...`,
        feature_image: featureImage,
        feature_image_alt: data.feature_image_alt || null,
        published_at: data.published_at || new Date().toISOString(),
        reading_time: Math.ceil(html.split(' ').length / 200),
        authors: [DEFAULT_AUTHOR],
        primary_author: DEFAULT_AUTHOR,
        primary_tag: DEFAULT_TAG,
        tags: [DEFAULT_TAG],
        url: `/blog/${slug}`,
        created_at: data.created_at || new Date().toISOString(),
        featured: false,
      };

      posts.push(post);
    }
  }

  return posts;
}
