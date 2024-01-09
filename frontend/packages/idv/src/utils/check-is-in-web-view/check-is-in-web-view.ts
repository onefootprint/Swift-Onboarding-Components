const WebViewRules = [
  // if it says it's a webview, let's go with that
  'WebView',
  // iOS webview will be the same as safari but missing "Safari"
  '(iPhone|iPod|iPad)(?!.*Safari)',
  // Android Lollipop and Above: webview will be the same as native but it will contain "wv"
  // Android KitKat to Lollipop webview will put Version/X.X Chrome/{version}.0.0.0
  'Android.*(;\\s+wv|Version/\\d.\\d\\s+Chrome/\\d+(\\.0){3})',
  // old chrome android webview agent
  'Linux; U; Android',
];

const WebViewRegExp = new RegExp(`(${WebViewRules.join('|')})`, 'ig');

export const checkIsUserAgentWebView = (ua: string) =>
  !!ua.match(WebViewRegExp);

const checkIsInWebView = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  const ua = navigator.userAgent;
  return !!checkIsUserAgentWebView(ua);
};

export default checkIsInWebView;
