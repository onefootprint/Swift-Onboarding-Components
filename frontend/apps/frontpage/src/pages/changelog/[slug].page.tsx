import type { GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';

import { getAllPosts, getPostBySlug, PostType } from '../../utils/ghost';

export async function getStaticPaths() {
  const posts = await getAllPosts(PostType.changelog);
  const paths = posts.map(({ slug }) => ({ params: { slug } }));
  return { paths, fallback: 'blocking' };
}

type Params = ParsedUrlQuery & {
  slug: string;
};

export const getStaticProps: GetStaticProps<
  Record<string, unknown>,
  Params
> = async context => {
  const { slug } = context.params!;
  const post = await getPostBySlug(slug);
  return { props: { post } };
};

export { default } from './pages/post';
