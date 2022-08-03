import configureGhost from 'src/config/initializers/ghost';

const ghost = configureGhost();

export async function getInitialPosts() {
  const posts = await ghost.posts.browse({
    limit: '9',
    include: ['tags', 'authors'],
  });
  return posts;
}

export async function getAllPosts() {
  const posts = await ghost.posts.browse({ limit: 'all' });
  return posts;
}

export async function getPostBySlug(slug: string) {
  try {
    const post = await ghost.posts.read(
      { slug },
      { formats: ['html'], include: ['tags', 'authors'] },
    );
    return post;
  } catch (_) {
    return null;
  }
}
