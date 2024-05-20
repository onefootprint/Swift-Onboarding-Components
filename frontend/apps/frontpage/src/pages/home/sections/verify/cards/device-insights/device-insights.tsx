import { Box } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import BaseCard from '../../components/base-card';
import CardTitle from '../../components/card-title';
import DeviceCard from './components/device-card';
import DeviceSelect from './components/device-select';
import WhatIsThisCard from './components/what-is-this-card';

type DeviceType = 'phone' | 'computer';
type DeviceID = 'phone-1' | 'phone-2' | 'computer-1' | 'computer-2';

const deviceCards = [
  {
    id: 'phone-1' as DeviceID,
    icon: 'phone' as DeviceType,
    deviceName: 'iPhone 14 Pro Max, iOS 16.5',
    date: '05/05/2023, 08:50am',
    ip: '34.36.156.118',
    biometric: true,
    appClip: true,
    selectorPosition: {
      x: '90%',
      y: '80%',
    },
  },
  {
    id: 'phone-2' as DeviceID,
    icon: 'phone' as DeviceType,
    deviceName: 'Samsung Galaxy S22, Android 12',
    date: '05/06/2023, 09:15am',
    ip: '192.168.1.1',
    biometric: false,
    appClip: false,
    selectorPosition: {
      x: '8%',
      y: '50px',
    },
  },
  {
    id: 'computer-1' as DeviceID,
    icon: 'computer' as DeviceType,
    deviceName: 'MacBook Pro 16, macOS Monterey',
    date: '05/07/2023, 10:30am',
    ip: '172.16.254.1',
    biometric: true,
    appClip: false,
    selectorPosition: {
      x: '5%',
      y: '0px',
    },
  },
  {
    id: 'computer-2' as DeviceID,
    icon: 'computer' as DeviceType,
    deviceName: 'Dell XPS 15, Windows 11',
    date: '05/08/2023, 11:00am',
    ip: '10.0.0.2',
    biometric: false,
    appClip: true,
    selectorPosition: {
      x: '90%',
      y: '40px',
    },
  },
];

const DeviceInsights = () => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.home.verify.cards.behavior-and-device-insights',
  });
  const [activeDevice, setActiveDevice] = useState('phone-1');
  const activeDeviceCard = deviceCards.find(card => card.id === activeDevice);
  const [showWhatsThis, setShowWhatsThis] = useState(false);

  return (
    <BaseCard
      backgroundImage="/home/verify-cards/custom-map.png"
      overflow="hidden"
    >
      <CardTitle title={t('title')} subtitle={t('subtitle')} />
      <Box position="relative" width="100%" height="100%" minHeight="260px">
        {deviceCards.map(card => (
          <DeviceSelect
            key={card.id}
            id={card.id}
            icon={card.icon}
            $isActive={activeDevice === card.id}
            onClick={() => setActiveDevice(card.id)}
            position={card.selectorPosition}
          />
        ))}
        {activeDeviceCard && (
          <DeviceCard
            icon={activeDeviceCard.icon}
            deviceName={activeDeviceCard.deviceName}
            date={activeDeviceCard.date}
            ip={activeDeviceCard.ip}
            biometric={activeDeviceCard.biometric}
            appClip={activeDeviceCard.appClip}
            key={activeDeviceCard.id}
            onWhatsThisClick={() => setShowWhatsThis(true)}
          />
        )}
        <WhatIsThisCard
          $isVisible={showWhatsThis}
          onClose={() => setShowWhatsThis(false)}
        />
      </Box>
    </BaseCard>
  );
};

export default DeviceInsights;
