import {
  IcoAndroid24,
  IcoApple24,
  IcoCode24,
  IcoLaptop24,
  IcoPhone24,
  IcoUser24,
} from '@onefootprint/icons';
import React from 'react';
import UAParser from 'ua-parser-js';

const isBot = (userAgent: UAParser.IResult) =>
  userAgent.ua?.toLowerCase().includes('python');

export const icoForUserAgent = (
  userAgentStr: string,
  isInstantApp?: boolean,
  isAppClip?: boolean,
) => {
  const userAgent = UAParser(userAgentStr || '');
  if (
    userAgent.os.name?.toLowerCase() === 'ios' ||
    userAgent.device.vendor?.toLowerCase() === 'apple' ||
    isAppClip
  ) {
    return <IcoApple24 />;
  }
  if (userAgent.os.name?.toLowerCase() === 'android' || isInstantApp) {
    return <IcoAndroid24 />;
  }
  if (userAgent.device.type?.toLowerCase() === 'mobile') {
    return <IcoPhone24 />;
  }
  if (isBot(userAgent)) {
    return <IcoCode24 />;
  }
  if (
    userAgent.os.name?.toLowerCase() === 'mac os' ||
    userAgent.os.name?.toLowerCase() === 'linux' ||
    userAgent.os.name?.toLowerCase() === 'windows' ||
    userAgent.device.type === undefined
  ) {
    return <IcoLaptop24 />;
  }
  return <IcoUser24 />;
};

export const displayForUserAgent = (
  userAgentStr: string,
  isInstantApp?: boolean,
  isAppClip?: boolean,
) => {
  const userAgent = UAParser(userAgentStr || '');
  if (isBot(userAgent)) {
    return 'A robot';
  }
  const device = `${userAgent.device.vendor || ''} ${
    userAgent.device.model || ''
  }`.trim();
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
