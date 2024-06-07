import { UAParser } from 'ua-parser-js';

const socialMediaTerms = [
  'fban',
  'fbav',
  'fbios',
  'fb_iab',
  'fb4a',
  'facebook',
  'instagram',
  'twitter',
  'twitterbot',
  'linkedin',
  'snapchat',
  'tiktok',
  'bytedance',
  'bytelocale',
  'bytedancewebview',
];

const checkIsIframe = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return window.self !== window.top;
  } catch (_e) {
    return true;
  }
};

type SocialMediaCheckArgs = {
  ua: string;
  browserName?: string;
  browserVersion?: string;
  isMobile?: boolean;
  isIframe?: boolean;
};

export const socialMediaCheck = ({ ua, browserName, browserVersion, isMobile, isIframe }: SocialMediaCheckArgs) => {
  const lowUserAgent = ua.toLowerCase();
  const lowBrowserName = browserName?.toLowerCase();
  const lowBrowserVersion = browserVersion?.toLowerCase();

  // Check if the user agent or browser name/version include any of the social media terms
  if (socialMediaTerms.some(term => lowUserAgent.includes(term))) {
    return true;
  }
  if (lowBrowserName && socialMediaTerms.some(term => lowBrowserName.includes(term))) {
    return true;
  }
  if (lowBrowserVersion && socialMediaTerms.some(term => lowBrowserVersion.includes(term))) {
    return true;
  }

  const isWebview =
    lowUserAgent.includes('webview') ||
    (lowBrowserName && lowBrowserName.includes('webview')) ||
    (browserVersion && browserVersion.includes('webview'));

  // If running inside an iframe and the user agent has webview on mobile, it's
  // likely a social media browser (cannot be both a webview and iframe, so this
  // means we must be running our iframe inside a social media in-app browser)
  return Boolean(isMobile && isWebview && isIframe);
};

const checkIsSocialMediaBrowser = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent;
  const uaParser = new UAParser();
  const browser = uaParser.getBrowser();
  const browserName = browser.name;
  const browserVersion = browser.version;
  const device = uaParser.getDevice();
  const isMobile = device.type === 'mobile';
  const isIframe = checkIsIframe();

  return socialMediaCheck({
    ua,
    browserName,
    browserVersion,
    isMobile,
    isIframe,
  });
};

export default checkIsSocialMediaBrowser;
