import GhostContentAPI from '@tryghost/content-api';

const configureGhost = () => {
  const ghost = new GhostContentAPI({
    url: process.env.GHOST_API_URL as string,
    key: process.env.GHOST_CONTENT_API_KEY as string,
    version: 'v5.0',
  });
  return ghost;
};

export default configureGhost;
