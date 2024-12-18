import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { BloomLogo, CobaLogo, ComposerLogo, FlexcarLogo } from 'src/components/company-logos';

const FeaturedCards = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.customers.featured-customers',
  });
  const featuredCases = [
    {
      company: 'coba',
      logo: CobaLogo,
      title: t('coba.title'),
      subtitle: t('coba.subtitle'),
      url: '/customers/coba',
    },
    {
      company: 'flexcar',
      logo: FlexcarLogo,
      title: t('flexcar.title'),
      subtitle: t('flexcar.subtitle'),
      url: '/customers/flexcar',
    },
    {
      company: 'bloom',
      logo: BloomLogo,
      title: t('bloom.title'),
      subtitle: t('bloom.subtitle'),
      url: '/customers/bloom',
    },
    {
      company: 'composer',
      logo: ComposerLogo,
      title: t('composer.title'),
      subtitle: t('composer.subtitle'),
      url: '/customers/composer',
    },
  ];

  return (
    <div className="container relative flex flex-col mx-auto my-20">
      {featuredCases.map(featuredCase => {
        const Logo = featuredCase.logo;

        return (
          <Link
            className="container mx-auto relative flex flex-col align-start md:grid md:grid-cols-[1fr_2fr_.5fr] md:items-center gap-4 cursor-pointer bg-primary p-5 group border-b border-tertiary border-solid last:border-b-0 hover:bg-secondary rounded transition-colors duration-200"
            aria-label={featuredCase.title}
            href={featuredCase.url}
            key={featuredCase.company}
          >
            <div className="">
              <Logo className="h-6 transition-opacity duration-200 text-primary group-hover:text-accent" />
            </div>
            <div className="">
              <p className="text-body-1 text-secondary">{featuredCase.subtitle}</p>
            </div>
            <div className="flex flex-row items-center justify-start gap-1 md:justify-end">
              <p className="text-label-1 text-accent md:text-primary md:group-hover:text-accent">{t('read-story')}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default FeaturedCards;
