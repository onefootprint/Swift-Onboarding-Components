import request from '@onefootprint/request';
import { AUTH_HEADER } from '@onefootprint/types';

declare global {
  interface Window {
    nid: {
      (command: 'identify', authToken: string): void;
      (command: 'applicationSubmit'): void;
      (command: 'start', options: { funnel: string }): void;
    };
  }
}

const start = (funnel: string) => {
  if (window.nid) {
    window.nid('start', { funnel });
  }
};

// Identify the user with Neuro-ID
const identify = async (authToken: string) => {
  if (window.nid) {
    try {
      const { data } = await request<{ id: string }>({
        method: 'GET',
        url: '/hosted/onboarding/nid',
        headers: {
          [AUTH_HEADER]: authToken,
        },
      });
      window.nid('identify', data.id);
    } catch (e) {
      // Do nothing
    }
  }
};

// Notify Neuro-ID that the application has been submitted
const complete = () => {
  if (window.nid) {
    window.nid('applicationSubmit');
  }
};

export default {
  start,
  identify,
  complete,
};
