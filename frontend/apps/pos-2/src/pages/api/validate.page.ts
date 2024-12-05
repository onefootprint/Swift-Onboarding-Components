import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  fpId?: string;
  error?: string;
};

type ValidateSessionResponse = {
  user_auth: {
    fp_id: string;
  };
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

  const validationToken = req.body.validationToken;

  const validateSession = await fetch('https://api.onefootprint.com/onboarding/session/validate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-footprint-secret-key': API_KEY!,
    },
    body: JSON.stringify({
      validation_token: validationToken,
    }),
  });

  if (!validateSession.ok) {
    res.status(500).json({ error: 'Failed to validate session' });
    throw new Error(`Failed to create user: ${validateSession.status} ${await validateSession.text()}`);
  }

  const result: ValidateSessionResponse = await validateSession.json();
  console.log('validateSession result:', result);

  res.status(200).json({ fpId: result.user_auth.fp_id });
}
