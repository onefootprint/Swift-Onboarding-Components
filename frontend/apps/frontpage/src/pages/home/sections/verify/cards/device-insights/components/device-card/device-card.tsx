import { IcoAppclip24, IcoCheckCircle16, IcoCloseSmall16, IcoLaptop16, IcoSmartphone216 } from '@onefootprint/icons';
import { LinkButton } from '@onefootprint/ui';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type DeviceCardProps = {
  icon: 'phone' | 'computer';
  deviceName: string;
  date: string;
  ip: string;
  biometric: boolean;
  appClip: boolean;
  id?: string;
  onWhatsThisClick?: () => void;
};

const cardAnimation = {
  initial: {
    x: '-50%',
    left: '50%',
    opacity: 0,
    y: 50,
    filter: 'blur(5px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    y: -50,
    filter: 'blur(5px)',
  },
};

const DeviceCard = ({ icon, deviceName, date, ip, biometric, appClip, id, onWhatsThisClick }: DeviceCardProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify.cards.behavior-and-device-insights.illustration',
  });

  const renderBiometricStatus = () => (
    <div className="flex items-center justify-center">
      {biometric ? (
        <div className="flex items-center justify-center gap-1">
          <IcoCheckCircle16 color="success" />
          <p className="text-label-2 text-success">{t('verified')}</p>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-1">
          <IcoCloseSmall16 color="error" />
          <p className="text-label-2 text-error">{t('not-verified')}</p>
        </div>
      )}
    </div>
  );

  const renderAppClipInfo = () => (
    <div className="flex items-center justify-center gap-2 ">
      <p className="text-body-2 text-tertiary">{t('app-clip.title')}</p>
      <p className="text-body-2 text-tertiary">·</p>
      <LinkButton variant="label-2" onClick={onWhatsThisClick}>
        {t('app-clip.whats-this')}
      </LinkButton>
    </div>
  );

  return (
    <motion.div
      className="absolute flex flex-col gap-5 p-6 bg-white/10 backdrop-blur-md shadow-md rounded-xl w-[340px] md:w-[400px] border border-solid border-tertiary rounded select-none"
      variants={cardAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      key={id}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-center p-3 rounded-full bg-tertiary">
          {icon === 'phone' ? <IcoSmartphone216 color="quinary" /> : <IcoLaptop16 color="quinary" />}
        </div>
        <p className="text-label-2">{deviceName}</p>
      </div>
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-between w-full">
          <p className="text-body-2 text-tertiary">{t('date-and-time')}</p>
          <p className="text-label-2">{date}</p>
        </div>
        <div className="flex items-center justify-between w-full">
          <p className="text-body-2 text-tertiary">{t('ip-address')}</p>
          <p className="text-label-2">{ip}</p>
        </div>
        <div className="flex items-center justify-between w-full">
          <p className="text-body-2 text-tertiary">{t('biometric')}</p>
          {renderBiometricStatus()}
        </div>
        <div className="flex items-center justify-between w-full">
          {renderAppClipInfo()}
          <div className="flex items-center justify-center gap-1">
            <IcoAppclip24 />
            <p className="text-label-2">{appClip ? t('app-clip.yes') : t('app-clip.no')}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DeviceCard;
