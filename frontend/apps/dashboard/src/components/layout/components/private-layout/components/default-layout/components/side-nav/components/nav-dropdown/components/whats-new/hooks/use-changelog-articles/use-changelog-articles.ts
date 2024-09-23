import request from '@onefootprint/request';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { GHOST_API_URL, GHOST_CONTENT_API_KEY } from 'src/config/constants';

import type { PostDetails } from '../../whats-new.types';

const getChangelogArticles = async () => {
  const { data } = await request<{ posts: PostDetails[] }>(
    {
      baseURL: GHOST_API_URL,
      url: `/ghost/api/v3/content/posts/?key=${GHOST_CONTENT_API_KEY}&include=tags`,
      method: 'GET',
      withCredentials: false,
    },
    { omitSessionId: true, omitClientVersion: true },
  );

  return data.posts;
};

const useChangelogArticles = () => {
  return useQuery({
    queryKey: ['whatsNews'],
    queryFn: getChangelogArticles,
    select: (posts: PostDetails[]) => {
      return posts
        .filter(post => post.primaryTag?.slug === 'changelog')
        .slice(0, 3)
        .map(post => ({
          ...post,
          publishedAt: format(new Date(post.publishedAt), 'MMM d, yyyy'),
        }));
    },
  });
};

export default useChangelogArticles;
