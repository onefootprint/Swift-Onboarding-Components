import type { ParseKeys } from 'i18next';
import { random } from 'lodash';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import QuoteIcon from './components/quote-icon';

type QuoteCardProps = {
  companyName: string;
  logo: React.ElementType;
};

const QuoteCard = ({ companyName, logo: Logo }: QuoteCardProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.quotes.quote-list',
  });

  return (
    <div className="flex flex-col w-full border border-solid rounded h-fit gap-9 bg-primary p-7 border-tertiary">
      <Logo className="max-w-[100px]" />
      <div className="relative flex-1">
        <QuoteIcon className="absolute top-[-4px] left-[-8px] z-0 opacity-20 transform" />
        <blockquote className="pt-3 text-body-1 z-1">
          {t(`${companyName}.quote` as unknown as ParseKeys<'common'>)}&quot;
        </blockquote>
      </div>
      <div className="relative flex flex-col items-start justify-start gap-2">
        <h4 className="text-label-1">{t(`${companyName}.name` as unknown as ParseKeys<'common'>)}</h4>
        <h5 className="text-body-1 text-tertiary">{t(`${companyName}.role` as unknown as ParseKeys<'common'>)}</h5>
        <div
          className="absolute bottom-0 right-0 w-16 h-16 p-1 pb-3 overflow-hidden origin-bottom-right rounded-sm shadow md:w-20 md:h-20 bg-primary"
          style={{
            transform: `rotate(${random(-10, 10)}deg)`,
          }}
        >
          <Image
            src={`/home/quotes/${companyName}/author.png`}
            alt={`${t(`${companyName}.name` as unknown as ParseKeys<'common'>)}'s headshot`}
            width={200}
            height={200}
            className="object-cover w-full h-full rounded-xs saturate-80"
          />
        </div>
      </div>
    </div>
  );
};

export default QuoteCard;
