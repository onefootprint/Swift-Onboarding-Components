import configureGhost from 'src/config/initializers/ghost';

const ghost = configureGhost();

const INVESTOR_UPDATES_TAG = 'Investor Update';
const LIBRARY_TAG = 'Library';

export enum PostType {
  blog = 'blog',
  investorUpdate = 'investorUpdate',
  library = 'library',
}

export async function getInitialPosts(type?: PostType) {
  const posts = await ghost.posts.browse({
    include: ['tags', 'authors'],
  });
  return filterPosts(posts, type);
}

export async function getAllPosts(type?: PostType) {
  const posts = await ghost.posts.browse({ limit: 'all', include: ['tags'] });
  return filterPosts(posts, type);
}

function filterPosts(posts: any[], type?: PostType) {
  if (type === PostType.blog) {
    return posts.filter(post => {
      const name = post.primary_tag?.name;
      return name !== INVESTOR_UPDATES_TAG && name !== LIBRARY_TAG;
    });
  }
  if (type === PostType.investorUpdate) {
    return posts.filter(
      post => post.primary_tag?.name === INVESTOR_UPDATES_TAG,
    );
  }
  if (type === PostType.library) {
    return posts.filter(post => post.primary_tag?.name === LIBRARY_TAG);
  }
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
