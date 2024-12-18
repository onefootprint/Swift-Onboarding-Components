import {
  IcoFootprintShield24,
  IcoIncognito24,
  IcoLink24,
  IcoSmartphone224,
  IcoSparkles24,
  IcoUserCircle24,
} from '@onefootprint/icons';
import { cx } from 'class-variance-authority';
import type { ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import FrontpageContainer from 'src/components/frontpage-container';
import SectionTitle from 'src/components/section-title';
import MockupVideo from './components/mockup-video';

const leverageData = [
  {
    variant: 'app-clip',
    videoSrc: '/home/videos/id-scan.mp4',
    inverted: true,
    bullets: [
      {
        translationKey: 'real-phone',
        icon: IcoSmartphone224,
      },
      {
        translationKey: 'device-attestation',
        icon: IcoSparkles24,
      },
      {
        translationKey: 'duplicate-fraud',
        icon: IcoIncognito24,
      },
    ],
  },
  {
    variant: 'passkeys',
    videoSrc: '/home/videos/qr-scan.mp4',
    inverted: false,
    bullets: [
      {
        translationKey: 'prevent-ato',
        icon: IcoFootprintShield24,
      },
      {
        translationKey: 'same-person',
        icon: IcoUserCircle24,
      },
      {
        translationKey: 'link-kyc-and-auth',
        icon: IcoLink24,
      },
    ],
  },
];

export const Leverage = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.leverage',
  });

  return (
    <FrontpageContainer className="flex flex-col gap-16 py-9 md:py-28">
      <SectionTitle title={t('title')} subtitle={t('subtitle')} align="center" />
      <div className="flex flex-col gap-9 md:gap-24">
        {leverageData.map(({ variant, videoSrc, inverted, bullets }) => (
          <div
            key={variant}
            className="flex flex-col w-full mx-auto md:grid md:grid-cols-2 md:grid-rows-1 md:gap-x-9 md:w-full bg-primary"
            style={{
              gridTemplateAreas: inverted ? '"text video"' : '"video text"',
            }}
          >
            <div style={{ gridArea: 'video' }}>
              <MockupVideo videoSrc={videoSrc} shouldPlay />
            </div>
            <div className="flex flex-col items-start justify-start px-5 py-10 md:p-10 align-start">
              <h4
                className={cx(
                  'text-label-1',
                  {
                    'text-info border-info': variant === 'app-clip',
                    'text-success border-success': variant === 'passkeys',
                  },
                  'border w-fit',
                )}
              >
                {variant === 'app-clip' ? 'Modern' : 'Secure'}
              </h4>
              <div className="flex flex-col gap-2 mt-2">
                <h3 className="text-heading-2">{t(`${variant}.title` as unknown as ParseKeys<'common'>)}</h3>
                <h4 className="text-body-1 text-secondary">
                  {t(`${variant}.subtitle` as unknown as ParseKeys<'common'>)}
                </h4>
              </div>
              <ul
                className="flex flex-col w-full gap-3 mt-4"
                style={{
                  gridArea: 'text',
                }}
              >
                {bullets.map(bullet => (
                  <li className="relative flex items-center justify-start gap-3" key={bullet.translationKey}>
                    <div className="flex-0">
                      <bullet.icon />
                    </div>
                    <p className="text-body-1 text-secondary">
                      {t(`${variant}.${bullet.translationKey}` as unknown as ParseKeys<'common'>)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </FrontpageContainer>
  );
};

export default Leverage;
