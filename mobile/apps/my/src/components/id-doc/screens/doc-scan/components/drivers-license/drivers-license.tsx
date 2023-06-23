import { IcoIdCard24 } from '@onefootprint/icons';
import { SubmitDocumentSide } from '@onefootprint/types';
import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';
import { documentProcessor } from 'vision-camera-plugin-document';

import useTranslation from '@/hooks/use-translation';

import Camera from '../camera';
import Frame from '../default-frame';

export type DriversLicenseProps = {
  side: SubmitDocumentSide;
};

const DriversLicense = ({ side }: DriversLicenseProps) => {
  const { t } = useTranslation('components.scan.drivers-license');
  const { t: sideT } = useTranslation(
    `components.scan.drivers-license.${side}`,
  );
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
      detector={detector}
      Frame={Frame}
      instructions={{
        description: sideT('instructions.description'),
        IconComponent: IcoIdCard24,
        title: sideT('instructions.title'),
      }}
      frameProcessor={frameProcessor}
      isObjectDetected={objectedDetected}
      subtitle={sideT('subtitle')}
      title={t('title')}
    />
  );
};

const windowWidth = Dimensions.get('window').width;

export default DriversLicense;
