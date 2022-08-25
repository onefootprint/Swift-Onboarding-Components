import type { GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { getAllPosts, getPostBySlug, PostType } from 'src/utils/ghost';

export async function getStaticPaths() {
  const posts = await getAllPosts(PostType.investorUpdate);
  const paths = posts.map(({ slug }) => ({ params: { slug } }));
  return { paths, fallback: false };
}

type Params = ParsedUrlQuery & {
  slug: string;
};

export const getStaticProps: GetStaticProps<any, Params> = async context => {
  const { slug } = context.params!;
  const post = await getPostBySlug(slug);
  return { props: { post } };
};

export { default } from './pages/post';
