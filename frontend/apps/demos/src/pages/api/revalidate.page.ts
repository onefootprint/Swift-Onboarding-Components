import type { NextApiRequest, NextApiResponse } from 'next';

// This is a router called by a webhook from Ghost, which will revalidate the page content changes
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.query.secret !== process.env.REVALIDATE_SECRET_TOKEN) {
    return res.status(401).json({ message: 'Invalid token' });
  }
  try {
    await res.revalidate(`/${req.body.page.current.slug}`);
    return res.json({ revalidated: true });
  } catch (err) {
    return res.status(500).send('Error revalidating');
  }
}
