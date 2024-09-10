import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';

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
  await NextCors(req, res, {
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });

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
