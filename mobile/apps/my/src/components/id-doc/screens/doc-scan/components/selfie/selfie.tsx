import { IcoEmojiHappy24 } from '@onefootprint/icons';
import React, { useState } from 'react';

import useTranslation from '@/hooks/use-translation';

import Camera from '../camera';
import ConsentDialog from './components/consent-dialog';
import Frame from './components/frame';

export type SelfieProps = {
  authToken: string;
  loading: boolean;
  onSubmit: (image: string) => void;
};

const Selfie = ({ authToken, loading, onSubmit }: SelfieProps) => {
  const { t } = useTranslation('components.scan.selfie');
  const [isCameraActive, setIsCameraActive] = useState(false);

  return (
    <>
      <Camera
        active={isCameraActive}
        Frame={Frame}
        instructions={{
          IconComponent: IcoEmojiHappy24,
          title: t('instructions.title'),
        }}
        loading={loading}
        onSubmit={onSubmit}
        title={t('title')}
        type="front"
        size="large"
      />
      <ConsentDialog
        authToken={authToken}
        onSubmit={() => {
          setIsCameraActive(true);
        }}
      />
    </>
  );
};

export default Selfie;
