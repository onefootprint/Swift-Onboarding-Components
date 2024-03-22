import { socialMediaCheck } from './check-is-social-media-browser';

const SocialMedia = [
  // => iOS
  // SnapChat
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Mobile/15E148 Snapchat/12.02.0.31 (like Safari/8613.3.9.0.5)',
  // TikTok
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_25.9.0 JsSdk/2.0 NetType/WIFI Channel/App Store ByteLocale/en Region/CA RevealType/Dialog isDarkMode/0 WKWebView/1 BytedanceWebview/d8a21c6 FalconTag/9BBBCC25-B655-47F2-9B89-6E9CDB33DF77',
  // Instagram
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 254.0.0.15.109 (iPhone11,8; iOS 15_6_1; en_CA; en-CA; scale=2.00; 828x1792; 401726258)',
  // Facebook
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/19G82 [FBAN/FBIOS;FBDV/iPhone14,2;FBMD/iPhone;FBSN/iOS;FBSV/15.6.1;FBSS/3;FBID/phone;FBLC/nl_NL;FBOP/5]',

  // => Android
  // SnapChat
  'Mozilla/5.0 (Linux; Android 12; SM-G990W Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/105.0.5195.136 Mobile Safari/537.36Snapchat12.01.0.33 (SM-G990W; Android 12#G990WVLU3CVG1#31; gzip; )',
  // TikTok
  'Mozilla/5.0 (Linux; Android 9; CPH1931; wv) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.62 Mobile Safari/537.36 trill_2021505060 JsSdk/1.0 NetType/WIFI Channel/googleplay AppName/musical_ly app_version/15.5.6 ByteLocale/de ByteFullLocale/de Region/DE AppSkin/white',
  // Instagram
  'Mozilla/5.0 (Linux; Android 9; H8276 Build/52.0.A.11.32; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/105.0.5195.136 Mobile Safari/537.36 Instagram 253.0.0.23.114 Android (28/9; 480dpi; 1080x2016; Sony; H8276; H8276; qcom; en_CA; 399993162)',
  // Facebook
  'Mozilla/5.0 (Linux; Android 11; SM-A037F Build/RP1A.200720.012; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/105.0.5195.136 Mobile Safari/537.36[FBAN/EMA;FBLC/en_US;FBAV/321.0.0.13.113;]',
];

const NotSocialMedia = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 12; SM-N975U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/105.0.5195.147 Mobile/15E148 Safari/604.1',
];

describe('checkIsSocialMedia', () => {
  SocialMedia.forEach(ua => {
    it(`should return true for ${ua}`, () => {
      expect(socialMediaCheck({ ua })).toBe(true);
    });
  });

  NotSocialMedia.forEach(ua => {
    it(`should return false for ${ua}
    `, () => {
      expect(socialMediaCheck({ ua })).toBe(false);
    });
  });

  it('should evaluate based on browser info', () => {
    // Flexcar user running in social media app (facebook)
    expect(
      socialMediaCheck({
        ua: 'Mozilla/5.0 (Linux; Android 14; SM-S916U Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/122.0.6261.106 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/455.0.0.44.88;]',
        browserVersion: '455.0.0.44.88',
        browserName: 'Facebook',
        isIframe: true,
        isMobile: true,
      }),
    ).toBe(true);

    // Flexcar user running in social media app
    expect(
      socialMediaCheck({
        ua: 'Mozilla/5.0 (Linux; Android 14; SM-S916U Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/122.0.6261.106 Mobile Safari/537.36',
        browserVersion: 'WebView',
        browserName: 'Chrome WebView',
        isIframe: true,
        isMobile: true,
      }),
    ).toBe(true);

    // Trayd user from expo sdk running in webview
    expect(
      socialMediaCheck({
        ua: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
        browserName: 'Chrome',
        isMobile: true,
        browserVersion: '122.0.0.0',
      }),
    ).toBe(false);

    // Bloom user from react native sdk running in webview
    expect(
      socialMediaCheck({
        ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
        browserName: 'Mobile',
        isIframe: false,
        isMobile: true,
        browserVersion: 'Safari',
      }),
    ).toBe(false);

    // Trayd user running JS sdk (in iframe) on desktop
    expect(
      socialMediaCheck({
        ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        browserName: 'Chrome',
        isIframe: true,
        isMobile: false,
        browserVersion: '122.0.0.0',
      }),
    ).toBe(false);
  });
});
