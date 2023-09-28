import React, { useState } from 'react';

import Camera from './components/camera';
import Preview from './components/preview';
import type { ScanObject, ScanPicture, ScanSize, ScanType } from './scan.types';

type ScanProps = {
  children?: React.ReactNode;
  disabled?: boolean;
  frameProcessor?: any;
  object: ScanObject;
  onBack?: () => void;
  size?: ScanSize;
  subtitle?: string;
  title: string;
  type?: ScanType;
};

const initialPictureState = {
  photo: null,
  meta: {},
};

const Scan = ({
  children,
  disabled = false,
  frameProcessor,
  object,
  onBack,
  size = 'default',
  subtitle,
  title,
  type = 'back',
}: ScanProps) => {
  const [picture, setPicture] = useState<ScanPicture>(initialPictureState);
  const showPreview = !!picture.photo;

  const handlePhotoTaken = (picture: ScanPicture) => {
    setPicture(picture);
  };

  const handleResetPhoto = () => {
    setPicture(initialPictureState);
  };

  return showPreview ? (
    <Preview
      onBack={onBack}
      onReset={handleResetPhoto}
      picture={picture}
      size={size}
      subtitle={subtitle}
      title={title}
    />
  ) : (
    <Camera
      disabled={disabled}
      frameProcessor={frameProcessor}
      object={object}
      onBack={onBack}
      onPhotoTaken={handlePhotoTaken}
      subtitle={subtitle}
      title={title}
      type={type}
    >
      {children}
    </Camera>
  );
};

export default Scan;
