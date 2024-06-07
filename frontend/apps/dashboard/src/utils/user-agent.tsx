import type { Color } from '@onefootprint/design-tokens';
import {
  IcoAndroid16,
  IcoAndroid24,
  IcoApple16,
  IcoApple24,
  IcoCode16,
  IcoCode24,
  IcoLaptop16,
  IcoLaptop24,
  IcoPhone16,
  IcoPhone24,
  IcoUser16,
  IcoUser24,
} from '@onefootprint/icons';
import React from 'react';
import UAParser from 'ua-parser-js';

const isBot = (userAgent: UAParser.IResult) => userAgent.ua?.toLowerCase().includes('python');

export const icoForUserAgent = (
  userAgentStr: string,
  isInstantApp?: boolean,
  isAppClip?: boolean,
  color?: Color,
  size?: 'small' | 'large',
) => {
  const userAgent = UAParser(userAgentStr || '');
  if (userAgent.os.name?.toLowerCase() === 'ios' || userAgent.device.vendor?.toLowerCase() === 'apple' || isAppClip) {
    return size === 'small' ? <IcoApple16 color={color} /> : <IcoApple24 color={color} />;
  }
  if (userAgent.os.name?.toLowerCase() === 'android' || isInstantApp) {
    return size === 'small' ? <IcoAndroid16 color={color} /> : <IcoAndroid24 color={color} />;
  }
  if (userAgent.device.type?.toLowerCase() === 'mobile') {
    return size === 'small' ? <IcoPhone16 color={color} /> : <IcoPhone24 color={color} />;
  }
  if (isBot(userAgent)) {
    return size === 'small' ? <IcoCode16 color={color} /> : <IcoCode24 color={color} />;
  }
  if (
    userAgent.os.name?.toLowerCase() === 'mac os' ||
    userAgent.os.name?.toLowerCase() === 'linux' ||
    userAgent.os.name?.toLowerCase() === 'windows' ||
    userAgent.device.type === undefined
  ) {
    return size === 'small' ? <IcoLaptop16 color={color} /> : <IcoLaptop24 color={color} />;
  }
  return size === 'small' ? <IcoUser16 color={color} /> : <IcoUser24 color={color} />;
};

export const displayForUserAgent = (userAgentStr: string, isInstantApp?: boolean, isAppClip?: boolean) => {
  const userAgent = UAParser(userAgentStr || '');
  if (isBot(userAgent)) {
    return 'A robot';
  }
  const device = `${userAgent.device.vendor || ''} ${userAgent.device.model || ''}`.trim();
  const os = `${userAgent.os.name || ''} ${userAgent.os.version || ''}`.trim();
  if (device && os) {
    return `${device}, ${os}`;
  }
  if (isInstantApp) {
    return 'Android device';
  }
  if (isAppClip) {
    return 'Apple device';
  }
  return device || os || '-';
};
