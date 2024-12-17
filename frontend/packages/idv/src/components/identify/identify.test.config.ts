import {
  getIdentifyChallengeResponse,
  getIdentifyRequirementsResponse,
  getIdentifySessionResponse,
  getIdentifyVerifyResponse,
} from '@onefootprint/fixtures';
import type {
  IdentifyChallengeResponse,
  IdentifyRequirementsResponse,
  IdentifySessionResponse,
  IdentifyVerifyResponse,
} from '@onefootprint/request-types';
import { mockRequest } from '@onefootprint/test-utils';

export const withIdentifySession = (props: Partial<IdentifySessionResponse>) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify/session',
    response: getIdentifySessionResponse(props),
  });

export const withRequirements = (props: Partial<IdentifyRequirementsResponse>) =>
  mockRequest({
    method: 'get',
    path: '/hosted/identify/session/requirements',
    response: getIdentifyRequirementsResponse(props),
  });

export const withRequirementsErr = () =>
  mockRequest({
    method: 'get',
    path: '/hosted/identify/session/requirements',
    statusCode: 400,
    response: { message: 'Flerp derp' },
  });

export const withVault = () =>
  mockRequest({
    method: 'patch',
    path: '/hosted/identify/session/vault',
    response: {},
  });

export const withChallenge = (props: Partial<IdentifyChallengeResponse>) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify/session/challenge',
    response: getIdentifyChallengeResponse({ error: undefined, ...props }),
  });

export const withChallengeVerify = () =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify/session/challenge/verify',
    response: {},
  });

export const withSessionVerify = (props: Partial<IdentifyVerifyResponse>) =>
  mockRequest({
    method: 'post',
    path: '/hosted/identify/session/verify',
    response: getIdentifyVerifyResponse(props),
  });
