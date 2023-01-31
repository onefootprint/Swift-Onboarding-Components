import Head from 'next/head';
import React from 'react';

type SeoProps = {
  description?: string;
  keywords?: string;
  slug?: string;
  title: string;
};

const Seo = ({
  description = "The last identity verification you'll ever need",
  keywords = 'footprint,foot,print,id,onefootprint,identity,kyc,verify,security',
  slug,
  title,
}: SeoProps) => (
  <Head>
    <title>{title}</title>
    <link rel="canonical" href={`https://docs.onefootprint.com${slug}`} />
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:url" content={`https://docs.onefootprint.com${slug}`} />
    <meta property="og:description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:type" content="article" />
    <meta property="og:url" content={`https://docs.onefootprint.com${slug}`} />
    <meta
      property="og:image"
      content={`https://docs.onefootprint.com/api/og?title=${encodeURIComponent(
        title,
      )}`}
    />
  </Head>
);

export default Seo;
