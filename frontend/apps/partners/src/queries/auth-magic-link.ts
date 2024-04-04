import baseFetch from './base-fetch';

type EmptyResponse = Record<string, never>;

/**
 * Sends a magic link to the specified email address for authentication.
 *
 * @param {string} email - The email address to send the magic link to.
 * @return {Promise<EmptyResponse>} - A promise that resolves to an EmptyResponse object.
 */
const authMagicLink = async (email: string) =>
  baseFetch<EmptyResponse>('/org/auth/magic_link', {
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      email_address: email,
      redirect_url: `${window.location.origin}/auth`,
    }),
  });

export default authMagicLink;
