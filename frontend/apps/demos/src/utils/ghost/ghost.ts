import configureGhost from 'src/config/initializers/ghost';

const ghost = configureGhost();

export async function getAllPages() {
  const posts = await ghost.pages.browse({ limit: 'all' });
  return posts;
}

export async function getPageBySlug(slug: string) {
  try {
    const post = await ghost.pages.read({ slug }, { formats: ['html'] });
    return post;
  } catch (_) {
    return null;
  }
}
