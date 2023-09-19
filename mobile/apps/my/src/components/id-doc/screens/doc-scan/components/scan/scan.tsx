import React, { useState } from 'react';

import { StepperProps } from '../stepper';
import Camera from './components/camera';
import Preview from './components/preview';
import type { ScanPicture, ScanSize, ScanType } from './scan.types';

type ScanProps = {
  children?: React.ReactNode;
  disabled?: boolean;
  feedback?: string;
  frameProcessor?: any;
  isObjectDetected?: boolean;
  size?: ScanSize;
  title: string;
  subtitle?: string;
  type?: ScanType;
  stepperValues: StepperProps;
  onBack?: () => void;
};

const initialPictureState = {
  photo: null,
  meta: {},
};

const Scan = ({
  children,
  disabled = false,
  feedback,
  frameProcessor,
  isObjectDetected,
  size = 'default',
  title,
  subtitle,
  type = 'back',
  stepperValues,
  onBack,
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
      stepperValues={stepperValues}
      subtitle={subtitle}
      title={title}
    />
  ) : (
    <Camera
      disabled={disabled}
      feedback={feedback}
      frameProcessor={frameProcessor}
      isObjectDetected={isObjectDetected}
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
