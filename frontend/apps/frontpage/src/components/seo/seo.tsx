import Head from 'next/head';
import React, { Fragment } from 'react';

type SeoProps = {
  description?: string;
  image?: string;
  keywords?: string;
  kind?: string;
  slug?: string;
  title: string;
  og?: {
    title?: string;
    description?: string;
    image?: string;
    author?: string;
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
  description = "The last identity verification you'll ever need",
  image = '/og-img-home.png',
  keywords = 'footprint,foot,print,id,onefootprint,identity,kyc,verify,security',
  kind = 'product',
  slug,
  title,
  og = {
    image: '/og-img-home.png',
    title: 'Footprint',
    description: "The last identity verification you'll ever need",
    author: 'Footprint',
  },
  twitter = {
    title: 'Footprint',
    description: "The last identity verification you'll ever need",
    image: '/og-img-home.png',
    extraData: [
      { label: 'Footprint', data: 'Footprint' },
      { label: 'Footprint', data: 'Footprint' },
    ],
  },
}: SeoProps) => (
  <Head>
    <title>{title}</title>
    <link rel="canonical" href={`https://onefootprint.com${slug}`} />
    <meta name="description" content={description} />
    <meta name="keywords" content={keywords} />
    <meta property="og:type" content={kind} />
    <meta name="title" property="og:title" content={og.title || title} />
    <meta
      name="description"
      property="og:description"
      content={og.description || description}
    />
    {og.author && (
      <meta name="author" property="og:author" content={og.author} />
    )}
    <meta property="og:url" content={`https://onefootprint.com${slug}`} />
    <meta name="image" property="og:image" content={og.image || image} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={twitter.title || title} />
    {twitter.extraData &&
      twitter.extraData.map(({ label, data }, index) => (
        <Fragment key={label}>
          <meta name={`twitter:label${index + 1}`} content={label} />
          <meta name={`twitter:data${index + 1}`} content={data} />
        </Fragment>
      ))}
    <meta
      name="twitter:description"
      content={twitter.description || description}
    />
    <meta name="twitter:url" content={`https://onefootprint.com${slug}`} />
    <meta name="twitter:image" content={twitter.image || image} />
  </Head>
);

export default Seo;
