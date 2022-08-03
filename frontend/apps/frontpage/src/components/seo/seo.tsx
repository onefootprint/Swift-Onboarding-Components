import Head from 'next/head';
import React from 'react';

type SeoProps = {
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  image?: string;
  keywords?: string;
  kind?: string;
  slug: string;
  title: string;
  og?: {
    title?: string;
    description?: string;
    image?: string;
  };
  twitter?: {
    title?: string;
    description?: string;
    image?: string;
    extraData?: {
      label: string;
      data: string;
    }[];
  };
};

const Seo = ({
  createdAt,
  updatedAt,
  description = "The last identity verification you'll ever need",
  image = 'https://onefootprint.com/cover.png',
  keywords = 'footprint,foot,print,id,onefootprint,identity,kyc,verify,security',
  kind = 'product',
  slug,
  title,
  og = {},
  twitter = {},
}: SeoProps) => (
  <Head>
    <title>{title}</title>
    <link rel="canonical" href={`https://onefootprint.com${slug}`} />
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords} />
    <meta property="og:type" content={kind} />
    <meta property="og:title" content={og.title || title} />
    <meta property="og:description" content={og.description || description} />
    <meta property="og:url" content={`https://onefootprint.com${slug}`} />
    <meta property="og:image" content={og.image || image} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={twitter.title || title} />
    {twitter.extraData &&
      twitter.extraData.map(({ label, data }, index) => (
        <>
          <meta name={`twitter:label${index + 1}`} content={label} />
          <meta name={`twitter:data${index + 1}`} content={data} />
        </>
      ))}
    <meta
      name="twitter:description"
      content={twitter.description || description}
    />
    <meta name="twitter:url" content={`https://onefootprint.com${slug}`} />
    <meta name="twitter:image" content={twitter.image || image} />
    {createdAt && (
      <meta property="article:published_time" content={createdAt} />
    )}
    {updatedAt && <meta property="article:modified_time" content={updatedAt} />}
  </Head>
);

export default Seo;
