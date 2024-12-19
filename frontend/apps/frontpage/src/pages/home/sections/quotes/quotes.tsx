import { chunk, uniqueId } from 'lodash';
import { useTranslation } from 'react-i18next';
import { ApitureLogo, BloomLogo, CobaLogo, FindigsLogo, FlexcarLogo, WhaleLogo } from 'src/components/company-logos';
import FrontpageContainer from 'src/components/frontpage-container';
import SectionTitle from 'src/components/section-title';
import QuoteCard from './components/quote-card';

const companies = [
  {
    name: 'apiture',
    logo: ApitureLogo,
  },
  {
    name: 'coba',
    logo: CobaLogo,
  },
  {
    name: 'whale',
    logo: WhaleLogo,
  },
  {
    name: 'flexcar',
    logo: FlexcarLogo,
  },
  {
    name: 'bloom',
    logo: BloomLogo,
  },
  {
    name: 'findigs',
    logo: FindigsLogo,
  },
];

const Quotes = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.quotes',
  });

  const companyChunks = chunk(companies, Math.ceil(companies.length / 2));

  return (
    <FrontpageContainer className="flex flex-col items-center justify-center py-20 overflow-hidden md:gap-12 gap-9 md:py-28">
      <SectionTitle title={t('title')} subtitle={t('subtitle')} align="center" />
      <div className="flex flex-col gap-4 md:grid md:grid-cols-[1fr_1fr]">
        {companyChunks.map(chunk => (
          <div key={uniqueId()} className="flex flex-col gap-4">
            {chunk.map(company => (
              <QuoteCard key={company.name} companyName={company.name} logo={company.logo} />
            ))}
          </div>
        ))}
      </div>
    </FrontpageContainer>
  );
};

export default Quotes;
