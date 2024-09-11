import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  status?: string;
  error?: string;
};

const API_KEY = process.env.FOOTPRINT_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  );
  res.setHeader('X-UA-Compatible', 'IE=edge');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

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
