import React, { useState } from 'react';
import { PhotoFile } from 'react-native-vision-camera';

import Camera from './components/camera';
import Preview from './components/preview';
import type { CameraType } from './scan.types';

type ScanProps = {
  children?: React.ReactNode;
  disabled?: boolean;
  feedback?: string;
  frameProcessor?: any;
  isObjectDetected?: boolean;
  title: string;
  type?: CameraType;
};

const Scan = ({
  children,
  disabled = false,
  feedback,
  frameProcessor,
  isObjectDetected,
  title,
  type = 'back',
}: ScanProps) => {
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const showPreview = !!photo;

  const handlePhotoTaken = (newPhoto: PhotoFile) => {
    setPhoto(newPhoto);
  };

  const handleResetPhoto = () => {
    setPhoto(null);
  };

  return showPreview ? (
    <Preview title={title} photo={photo} onReset={handleResetPhoto} />
  ) : (
    <Camera
      disabled={disabled}
      feedback={feedback}
      frameProcessor={frameProcessor}
      isObjectDetected={isObjectDetected}
      onPhotoTaken={handlePhotoTaken}
      title={title}
      type={type}
    >
      {children}
    </Camera>
  );
};

export default Scan;
