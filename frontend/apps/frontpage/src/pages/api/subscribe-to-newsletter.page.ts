import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { email } = req.body;
  const response = await fetch('https://footprint-blog.ghost.io/members/api/send-magic-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, emailType: 'subscribe', labels: [] }),
  });
  return res.status(response.status).send(response);
}
