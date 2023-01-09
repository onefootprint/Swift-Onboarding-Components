import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

type CameraProps = {
  onCapture: (image: string) => void;
};

const Camera = ({ onCapture }: CameraProps) => {
  // TODO: implement this
  useEffectOnce(() => {
    onCapture('');
  });

  return <div>TODO</div>;
};

export default Camera;
