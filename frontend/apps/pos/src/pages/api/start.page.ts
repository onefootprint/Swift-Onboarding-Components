import type { NextApiRequest, NextApiResponse } from 'next';
import { Twilio } from 'twilio';

type ResponseData = {
  fpId?: string;
  error?: string;
};

const PLAYBOOK_KEY = process.env.FOOTPRINT_PLAYBOOK_KEY;
const API_KEY = process.env.FOOTPRINT_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  // Set CORS headers manually
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  );

  // Add IE11 specific headers
  res.setHeader('X-UA-Compatible', 'IE=edge');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Handle OPTIONS method for preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({ fpId: 'test' });
    return;
  }

  const phone = req.body.phoneNumber.replace(/[\(\)\s\-]/g, '');

  // 1. create a user
  const createUserResponse = await fetch('https://api.onefootprint.com/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-footprint-secret-key': API_KEY!,
    },
    body: JSON.stringify({
      'id.phone_number': phone,
    }),
  });

  if (!createUserResponse.ok) {
    res.status(500).json({ error: 'Failed to create user' });
    throw new Error(`Failed to create user: ${createUserResponse.status} ${await createUserResponse.text()}`);
  }

  const fpId = (await createUserResponse.json()).id;
  console.log('created user: ', fpId);

  // 2. create a token
  const createTokenResponse = await fetch(`https://api.onefootprint.com/users/${fpId}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-footprint-secret-key': API_KEY!,
    },
    body: JSON.stringify({
      key: PLAYBOOK_KEY,
      kind: 'onboard',
      ttl_min: 60,
    }),
  });
  if (!createTokenResponse.ok) {
    res.status(500).json({ error: 'Failed to create user' });
    throw new Error(`Failed to create token: ${createTokenResponse.status} ${await createTokenResponse.text()}`);
  }
  const token = await createTokenResponse.json();
  console.log('createTokenResponse: ', token);
  const url = token.link;
  console.log('url: ', url);

  // 3. Send SMS using Twilio
  const sent = await sendSMS(url, phone, res);

  if (!sent) {
    return;
  }

  res.status(200).json({ fpId });
}

async function sendSMS(url: string, phone: string, res: NextApiResponse<ResponseData>): Promise<boolean> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !twilioPhoneNumber) {
    console.error('Twilio credentials are not properly configured');
    res.status(500).json({ error: 'SMS service is not configured' });
    return false;
  }

  const client = new Twilio(accountSid, authToken);

  try {
    const msg = await client.messages.create({
      body: `Verify your identity: ${url}`,
      from: twilioPhoneNumber,
      to: phone,
    });
    console.log('SMS sent successfully', msg);
  } catch (error) {
    console.error('Failed to send SMS:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
    return false;
  }

  return true;
}
