import { IcoPassport24 } from '@onefootprint/icons';
import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';
import { documentProcessor } from 'vision-camera-plugin-document';

import useTranslation from '@/hooks/use-translation';

import Camera from '../camera';
import Frame from '../default-frame';

export type PassportProps = {
  success?: boolean;
  loading?: boolean;
  onSubmit: (image: string) => void;
};

const Passport = ({ success, loading, onSubmit }: PassportProps) => {
  const { t } = useTranslation('components.scan.passport');
  const [objectedDetected, setObjectDetected] = useState(false);
  const detector = useSharedValue(false);

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';

      const options = {
        frame: { x: 16, y: 30, width: windowWidth - 32, height: 220 },
      };
      const result = documentProcessor(frame, options);
      detector.value = result.is_document;
      if (result.is_document) {
        runOnJS(setObjectDetected)(true);
      } else {
        runOnJS(setObjectDetected)(false);
      }
    },
    [detector],
  );

  return (
    <Camera
      Frame={Frame}
      instructions={{
        description: t('instructions.description'),
        IconComponent: IcoPassport24,
        title: t('instructions.title'),
      }}
      detector={detector}
      frameProcessor={frameProcessor}
      isObjectDetected={objectedDetected}
      loading={loading}
      onSubmit={onSubmit}
      subtitle={t('subtitle')}
      success={success}
      title={t('title')}
    />
  );
};

const windowWidth = Dimensions.get('window').width;

export default Passport;
