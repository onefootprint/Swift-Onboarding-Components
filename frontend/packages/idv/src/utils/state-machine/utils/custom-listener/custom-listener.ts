import { FPCustomEvents, isCustomEvent } from '../../../custom-event';

export type AuthTokenPayload = {
  type: 'authTokenChanged';
  payload: {
    authToken: string;
  };
};

export type DeviceResponseJsonPayload = {
  type: 'receivedDeviceResponseJson';
  payload: {
    deviceResponseJson: string;
  };
};

/**
 * Creates a payload for the 'receivedDeviceResponseJson' event based on the provided Event.
 *
 * @param {Event} e - The Event object to extract information from.
 * @returns {Payload | undefined} - The payload for 'receivedDeviceResponseJson' event,
 *                                  or undefined if the event does not meet the criteria.
 */
export const createReceivedDeviceResponseJsonPayload = (e: Event): DeviceResponseJsonPayload | undefined => {
  if (e.type !== FPCustomEvents.receivedDeviceResponseJson) return undefined;
  if (!isCustomEvent<{ deviceResponseJson: string }>(e)) return undefined;
  if (!e.detail) return undefined;

  return {
    type: 'receivedDeviceResponseJson',
    payload: { deviceResponseJson: e.detail.deviceResponseJson },
  };
};

/**
 * Creates a payload for the 'authTokenChanged' event based on the provided Event.
 *
 * @param {Event} e - The Event object to extract information from.
 * @returns {Payload | undefined} - The payload for 'authTokenChanged' event,
 *                                  or undefined if the event does not meet the criteria.
 */
export const createAuthTokenChangedPayload = (e: Event): AuthTokenPayload | undefined => {
  if (e.type !== FPCustomEvents.stepUpCompleted) return undefined;
  if (!isCustomEvent<{ authToken: string }>(e)) return undefined;
  if (!e.detail) return undefined;

  return {
    type: 'authTokenChanged',
    payload: { authToken: e.detail.authToken },
  };
};
