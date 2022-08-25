export type Author = {
  bio: string | null;
  cover_image: string | null;
  facebook: string | null;
  id: string;
  location: string | null;
  meta_description: string | null;
  meta_title: string | null;
  name: string;
  profile_image: string;
  slug: string;
  twitter: string | null;
  url: string;
  website: string | null;
};

export type Tag = {
  accent_color: string | null;
  canonical_url: string | null;
  codeinjection_foot: string | null;
  codeinjection_head: string | null;
  description: string | null;
  feature_image: string | null;
  id: string;
  meta_description: string | null;
  meta_title: string | null;
  name: string;
  og_description: string | null;
  og_image: string | null;
  og_title: string | null;
  slug: string;
  twitter_description: string | null;
  twitter_image: string | null;
  twitter_title: string | null;
  url: string;
  visibility: string;
};

export type Post = {
  created_at: string;
  excerpt: string;
  reading_time: number;
  feature_image: string;
  feature_image_alt?: string;
  slug: string;
  url: string;
  uuid: string;
  title: string;
  primary_tag: Tag;
  primary_author: Author;
};

export type PostDetails = {
  canonical_url: string;
  created_at: string;
  excerpt: string;
  feature_image_alt?: string;
  feature_image: string;
  html: string;
  meta_description: string;
  meta_title: string;
  og_description: string;
  og_image: string;
  og_title: string;
  primary_author: Author;
  primary_tag: Tag;
  reading_time: number;
  slug: string;
  title: string;
  twitter_description: string;
  twitter_image: string;
  twitter_title: string;
  updated_at: string;
  url: string;
  uuid: string;
};
