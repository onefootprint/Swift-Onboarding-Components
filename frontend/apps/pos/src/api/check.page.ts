import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';

type ResponseData = {
  status?: string;
  error?: string;
};

const API_KEY = process.env.FOOTPRINT_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  await NextCors(req, res, {
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

  const fpId = req.body.fpId;

  const getUserDetails = await fetch(`https://api.onefootprint.com/users/${fpId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-footprint-secret-key': API_KEY!,
    },
  });

  if (!getUserDetails.ok) {
    res.status(500).json({ error: 'Failed to get user' });
    throw new Error(`Failed to create user: ${getUserDetails.status} ${await getUserDetails.text()}`);
  }

  const result = await getUserDetails.json();

  res.status(200).json({ status: result.status });
}
