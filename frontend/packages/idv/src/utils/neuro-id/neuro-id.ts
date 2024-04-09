import request from '@onefootprint/request';
import { AUTH_HEADER } from '@onefootprint/types';

declare global {
  interface Window {
    nid: {
      (command: 'identify', authToken: string): void;
      (command: 'applicationSubmit'): void;
      (command: 'closeSession'): void;
    };
  }
}

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

const complete = () => {
  if (window.nid) {
    window.nid('applicationSubmit');
  }
};

const cancel = () => {
  if (window.nid) {
    window.nid('closeSession');
  }
};

export default {
  identify,
  complete,
  cancel,
};
