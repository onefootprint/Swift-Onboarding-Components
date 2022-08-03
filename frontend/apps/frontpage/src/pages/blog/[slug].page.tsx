import type { GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { getAllPosts, getPostBySlug } from 'src/utils/ghost';

export async function getStaticPaths() {
  const posts = await getAllPosts();
  console.log('posts', posts);
  const paths = posts.map(({ slug }) => ({ params: { slug } }));
  console.log('paths', paths);
  return { paths, fallback: false };
}

type Params = ParsedUrlQuery & {
  slug: string;
};

export const getStaticProps: GetStaticProps<any, Params> = async context => {
  const { slug } = context.params!;
  const post = await getPostBySlug(slug);
  console.log('post', post);
  return { props: { post } };
};

export { default } from './pages/post';
