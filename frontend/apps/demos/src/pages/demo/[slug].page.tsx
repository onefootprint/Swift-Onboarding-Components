import type { GetStaticProps } from 'next';
import type { ParsedUrlQuery } from 'querystring';
import { getAllPages, getPageBySlug } from 'src/utils/ghost';

export async function getStaticPaths() {
  const pages = await getAllPages();
  const paths = pages.map(({ slug }) => ({ params: { slug } }));
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
  const page = await getPageBySlug(slug);
  return page ? { props: { page } } : { notFound: true };
};

export { default } from './demo';
