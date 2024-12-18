import { useTranslation } from 'react-i18next';
import FrontpageContainer from 'src/components/frontpage-container';
import SectionTitle from 'src/components/section-title';
import QuoteCard from './components/quote-card';

export type Companies = 'apiture' | 'flexcar' | 'bloom' | 'findigs' | 'coba';

const Quotes = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.quotes',
  });
  return (
    <FrontpageContainer className="flex flex-col items-center justify-center overflow-hidden md:gap-12 gap-9 py-9 md:py-11">
      <SectionTitle title={t('title')} subtitle={t('subtitle')} align="center" />
      <div className="flex flex-col gap-4 md:grid md:max-w-full md:grid-cols-2">
        <div className="relative flex flex-col gap-3">
          <QuoteCard company="apiture" />
          <QuoteCard company="coba" />
        </div>
        <div className="relative flex flex-col gap-3">
          <QuoteCard company="bloom" />
          <QuoteCard company="findigs" />
          <QuoteCard company="flexcar" />
        </div>
      </div>
    </FrontpageContainer>
  );
};

export default Quotes;
