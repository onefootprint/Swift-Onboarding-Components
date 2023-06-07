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
  success?: boolean;
};

const Selfie = ({ authToken, loading, onSubmit, success }: SelfieProps) => {
  const { t } = useTranslation('components.scan.selfie');
  const [isCameraDisabled, setIsCameraDisable] = useState(true);

  return (
    <>
      <Camera
        disabled={isCameraDisabled}
        Frame={Frame}
        instructions={{
          IconComponent: IcoEmojiHappy24,
          title: t('instructions.title'),
        }}
        loading={loading}
        onSubmit={onSubmit}
        size="large"
        success={success}
        title={t('title')}
        type="front"
      />
      <ConsentDialog
        authToken={authToken}
        onSubmit={() => {
          setIsCameraDisable(false);
        }}
      />
    </>
  );
};

export default Selfie;
