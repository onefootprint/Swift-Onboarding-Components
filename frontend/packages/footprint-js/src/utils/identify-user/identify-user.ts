import type { IdentifyRequest } from '../../types/identify';
import type { FootprintUserData } from '../../types/user-data';

const isTest = process.env.NODE_ENV === 'test';
const baseUrl = process.env.API_BASE_URL ?? isTest ? 'http://test' : '';

const identifyUserRequest = async (payload: IdentifyRequest) => {
  const response = await fetch(`${baseUrl}/hosted/identify`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw Error(response.statusText);
  }
  const data = await response.json();
  return data.user_found;
};

const identifyUser = async (userData?: FootprintUserData) => {
  if (!userData) {
    throw new Error('User data must be passed in order to identify an user');
  }
  const email = userData['id.email'];
  const phoneNumber = userData['id.phone_number'];
  if (email) {
    const result = await identifyUserRequest({ identifier: { email } });
    if (result) return true;
  }
  if (phoneNumber) {
    const result = await identifyUserRequest({
      identifier: { phone_number: phoneNumber },
    });
    return result;
  }
  return false;
};

export default identifyUser;
