import { expect, test } from '@playwright/test';
import {
  clickOnContinue,
  doTransferFromSocialMediaBrowser,
  selectOutcomeOptional,
  verifyPhoneNumber,
  waitForVerifyButton,
} from './utils/commands';

const key = process.env.E2E_OB_KYC_DOC_FIRST || 'pb_test_ZeSUWIlEteLWZByDjLITUL';

const userData = encodeURIComponent(
  JSON.stringify({
    'id.email': 'piip@onefootprint.com',
    'id.phoneNumber': '+15555550100',
  }),
);

const SOCIAL_MEDIA_BROWSER_USER_AGENTS = [
  {
    label: 'Tiktok.iOS',
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 musical_ly_25.9.0 JsSdk/2.0 NetType/WIFI Channel/App Store ByteLocale/en Region/CA RevealType/Dialog isDarkMode/0 WKWebView/1 BytedanceWebview/d8a21c6 FalconTag/9BBBCC25-B655-47F2-9B89-6E9CDB33DF77',
  },
  {
    label: 'Tiktok.Android',
    userAgent:
      'Mozilla/5.0 (Linux; Android 9; CPH1931; wv) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.62 Mobile Safari/537.36 trill_2021505060 JsSdk/1.0 NetType/WIFI Channel/googleplay AppName/musical_ly app_version/15.5.6 ByteLocale/de ByteFullLocale/de Region/DE AppSkin/white',
  },
];

for (const { label, userAgent } of SOCIAL_MEDIA_BROWSER_USER_AGENTS) {
  test.use({ userAgent, isMobile: true });

  test.skip(`reverse-doc.social-media-browser.${label} #ci`, async ({ browserName, browser, page, isMobile }) => {
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (!isMobile) test.skip(); // eslint-disable-line playwright/no-skipped-test
    test.setTimeout(120000);
    const context = await browser.newContext({
      userAgent,
      permissions: ['camera'],
    });
    const flowId = `${browserName}-${Math.floor(Math.random() * 100000) + 1}`;

    await context.grantPermissions(['camera']);
    await page.route('**/*.{png,jpg,jpeg,woff,woff2}', route => route.abort());
    await page.goto(`/e2e?ob_key=${key}&flow=${flowId}&user_data=${userData}`);
    await page.waitForLoadState();

    await waitForVerifyButton(page);

    await page.getByRole('button', { name: 'Verify with Footprint' }).click();
    await page.waitForLoadState();

    const frame = page.frameLocator('iframe[name^="footprint-iframe-"]');

    await selectOutcomeOptional(frame, 'Success');
    await clickOnContinue(frame);
    await page.waitForLoadState();

    await verifyPhoneNumber({ frame, page });
    await page.waitForLoadState();

    const handoffPage = await doTransferFromSocialMediaBrowser({
      frame,
      page,
      browser,
    });
    await handoffPage.waitForLoadState();

    await handoffPage.close();
    await context.close();

    expect(1).toBe(1);
  });
}
