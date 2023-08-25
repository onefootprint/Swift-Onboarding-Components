import React, { useState } from 'react';
import { PhotoFile } from 'react-native-vision-camera';

import { StepperProps } from '../stepper';
import Camera from './components/camera';
import Preview from './components/preview';
import type { ScanSize, ScanType } from './scan.types';

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
  const [photo, setPhoto] = useState<PhotoFile | null>(null);
  const showPreview = !!photo;

  const handlePhotoTaken = (newPhoto: PhotoFile) => {
    setPhoto(newPhoto);
  };

  const handleResetPhoto = () => {
    setPhoto(null);
  };

  return showPreview ? (
    <Preview
      onBack={onBack}
      onReset={handleResetPhoto}
      photo={photo}
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
