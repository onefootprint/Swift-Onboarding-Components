import { name, version } from '../../package.json';

export const API_BASE_URL = process.env.API_BASE_URL || 'https://api.onefootprint.com';
export const SDK_VERSION = version as string;
export const SDK_NAME = name as string;
export const CLIENT_VERSION = `${SDK_NAME}:${SDK_VERSION}`;
