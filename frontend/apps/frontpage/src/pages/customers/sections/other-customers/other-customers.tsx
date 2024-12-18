import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { ApitureLogo, ComposerLogo, FindigsLogo, GridLogo, YieldStreet } from 'src/components/company-logos';
import TreasuryPrimeLogo from 'src/components/company-logos/treasury-prime';
const logos = [FindigsLogo, TreasuryPrimeLogo, GridLogo, YieldStreet, ComposerLogo, ApitureLogo];
import { cx } from 'class-variance-authority';

const LINE_NUMBER = 350;

const OtherCustomers = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.customers.other-customers',
  });

  const GridElement = ({ children }: { children: React.ReactNode }) => (
    <div
      className={cx('flex flex-col justify-center items-center gap-4 md:min-h-[180px] min-h-[80px] w-full bg-primary')}
    >
      {children}
    </div>
  );

  return (
    <div className="relative flex flex-col items-center gap-10 md:gap-12 mx-aut0 ">
      <svg className="absolute inset-0 w-full h-full z-[-1] top-0 bottom-0 md:block hidden" viewBox="0 0 200% 200%">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="transparent" />
            <stop offset="50%" stop-color="rgb(0 0 0 / 0.5)" />
            <stop offset="100%" stop-color="transparent" />
          </linearGradient>
        </defs>
        {[...Array(LINE_NUMBER)].map((_, index) => {
          const leftPosition = (index + 1) * (100 / LINE_NUMBER);
          return (
            <rect
              // biome-ignore lint/suspicious/noArrayIndexKey:
              key={index}
              x={`${leftPosition}%`}
              y="0%"
              width="0.25"
              height="100%"
              fill="url(#gradient)"
            />
          );
        })}
      </svg>
      <div className="flex flex-col items-center gap-3 text-center">
        <h2 className="text-display-2">{t('title')}</h2>
        <h4 className="text-display-4 text-secondary">{t('subtitle')}</h4>
      </div>
      <div className="container relative grid w-full grid-cols-1 md:grid-cols-3 md:grid-rows-2">
        {logos.map(Logo => (
          <GridElement key={_.uniqueId()}>
            <Logo className="place-self-center text-tertiary" />
          </GridElement>
        ))}
      </div>
    </div>
  );
};

export default OtherCustomers;
