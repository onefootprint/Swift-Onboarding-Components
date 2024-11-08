import type { GetStaticProps } from 'next';
import Script from 'next/script';
import Onboarding from './onboarding';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export const getStaticProps: GetStaticProps = () => ({
  props: {
    layout: 'blank',
  },
});

const GOOGLE_TAG_ID = 'AW-16622916059'; /** Google Ads Conversion - Sandbox Created (Google Ads Conversion Tracking) */
const OnboardingPage = () => {
  return (
    <>
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`}
      />
      <Script id="google-analytics-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_TAG_ID}');
        `}
      </Script>
      <Onboarding />
    </>
  );
};

export default OnboardingPage;
