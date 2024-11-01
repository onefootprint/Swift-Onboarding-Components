/**
 * This is being ignored from the CICD pipeline because of lack of bun support HTTPParser, used by msw, but not yet implemented in bun test runner
 * https://github.com/oven-sh/bun/issues/2297
 * https://github.com/oven-sh/bun/issues/13072
 */

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';
// @ts-ignore: Module '"msw"' has no exported member 'http'.
import { http } from 'msw';
import { setupServer } from 'msw/node';

import identifyUser from './identify-user';

const isFoundEmail = (x: unknown) => x === 'userfound@email.com';
const isFoundPhone = (x: unknown) => x === '+1-202-555-0130';

async function* streamReader(reader: ReadableStreamDefaultReader<Uint8Array>) {
  let result;
  do {
    result = await reader.read(); // eslint-disable-line no-await-in-loop
    yield result;
  } while (!result.done);
}

const convertStreamToObject = async (reader?: ReadableStreamDefaultReader<Uint8Array>) => {
  let jsonStr = '';
  if (!reader) return {};

  try {
    for await (const { done, value } of streamReader(reader)) {
      if (!done) {
        const chunkData = new TextDecoder().decode(value);
        jsonStr += chunkData;
      }
    }

    const parsedObject = JSON.parse(jsonStr);
    return parsedObject;
  } finally {
    reader.releaseLock();
  }
};

const isTest = process.env.NODE_ENV === 'test';
const baseUrl = (process.env.API_BASE_URL ?? isTest) ? 'http://test' : '';
const handlers = [
  // @ts-ignore: Parameter 'res' implicitly has an 'any' type.
  http.post(`${baseUrl}/hosted/identify/lite`, async res => {
    const bodyStream = res.request.body?.getReader();
    const body = await convertStreamToObject(bodyStream);

    return new Response(
      JSON.stringify({
        user_found: isFoundEmail(body.email) || isFoundPhone(body.phone_number),
      }),
    );
  }),
];
const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('identifyUser', () => {
  it('should throw an exception when nothing is passed', async () => {
    expect(identifyUser()).rejects.toEqual(new Error('User data must be passed in order to identify an user'));
  });

  it('should be true when only email is passed and user is found', async () => {
    expect(identifyUser({ 'id.email': 'userfound@email.com' })).resolves.toEqual(true);
  });

  it('should be true when only phoneNumber is passed and user is found', async () => {
    expect(identifyUser({ 'id.phone_number': '+1-202-555-0130' })).resolves.toEqual(true);
  });

  it('should be true when email and phoneNumber are passed, and user is found with the phoneNumber', async () => {
    expect(
      identifyUser({
        'id.email': 'jane.doe@acme.com',
        'id.phone_number': '+1-202-555-0130',
      }),
    ).resolves.toEqual(true);
  });

  it('should be false when only email is passed and user is not found', async () => {
    expect(identifyUser({ 'id.email': 'jane.doe@acme.com' })).resolves.toEqual(false);
  });

  it('should return false when email and phoneNumber are passed and user is not found', async () => {
    expect(
      identifyUser({
        'id.email': 'jane.doe@acme.com',
        'id.phone_number': '+1-202-555-9999',
      }),
    ).resolves.toEqual(false);
  });
});
