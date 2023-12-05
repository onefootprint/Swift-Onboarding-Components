export const checkIsUaSocialMediaBrowser = (userAgent: string) => {
  const lowUserAgent = userAgent.toLowerCase();
  return (
    userAgent.includes('fban') || // facebook
    lowUserAgent.includes('fban') || // facebook
    lowUserAgent.includes('facebook') ||
    lowUserAgent.includes('twitter') ||
    lowUserAgent.includes('twitterbot') ||
    lowUserAgent.includes('linkedin') ||
    lowUserAgent.includes('instagram') ||
    lowUserAgent.includes('snapchat') ||
    lowUserAgent.includes('bytedance') || // tiktok
    lowUserAgent.includes('bytelocale') || // tiktok
    lowUserAgent.includes('bytedancewebview') // tiktok
  );
};

const checkIsSocialMediaBrowser = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent;
  return checkIsUaSocialMediaBrowser(ua);
};

export default checkIsSocialMediaBrowser;
