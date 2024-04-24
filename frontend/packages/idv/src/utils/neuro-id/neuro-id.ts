import request from '@onefootprint/request';
import { AUTH_HEADER } from '@onefootprint/types';

declare global {
  interface Window {
    nid: {
      (command: 'identify', authToken: string): void;
      (command: 'applicationSubmit'): void;
      (
        command: 'setVariable',
        variableName: string,
        variableValue: string,
      ): void;
    };
  }
}

const setVariable = (variableName: string, variableValue: string) => {
  if (window.nid) {
    window.nid('setVariable', variableName, variableValue);
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
  setVariable,
  identify,
  complete,
};
