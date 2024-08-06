import { NextSeo } from 'next-seo';

type SeoProps = {
  title: string;
  description?: string;
  image?: string;
  kind?: string;
  slug?: string;
};

const Seo = ({
  description = 'The single onboarding tool your company needs',
  image = '/og-img-home.png',
  kind = 'website',
  slug,
  title,
}: SeoProps) => (
  <NextSeo
    title={title}
    description={description}
    canonical={`https://onefootprint.com${slug}`}
    robotsProps={{
      noarchive: false,
    }}
    openGraph={{
      type: kind,
      locale: 'en_IE',
      title,
      description,
      url: `https://onefootprint.com${slug}`,
      images: [{ url: image }],
      siteName: 'Footprint',
    }}
    twitter={{
      handle: '@Footprint_HQ',
      site: '@Footprint_HQ',
      cardType: 'summary_large_image',
    }}
  />
);

export default Seo;
