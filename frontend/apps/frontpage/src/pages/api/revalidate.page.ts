import type { NextApiRequest, NextApiResponse } from 'next';

import { getSlugPrefix } from '../../utils/ghost';

// This is a router called by a webhook from Ghost, which will revalidate the page content changes
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.query.secret !== process.env.REVALIDATE_SECRET_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  try {
    const slugPrefix = getSlugPrefix(req.body.post.current.primary_tag?.name);
    await res.revalidate(slugPrefix);
    await res.revalidate(`${slugPrefix}/${req.body.post.current.slug}`);
    return res.json({ revalidated: true });
  } catch (_e) {
    return res.status(500).send('Error revalidating');
  }
}
