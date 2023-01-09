import React from 'react';
import { useEffectOnce } from 'usehooks-ts';

type PreviewProps = {
  image: string;
  onRetake: () => void;
  onConfirm: () => void;
};

const Preview = ({ image, onRetake, onConfirm }: PreviewProps) => {
  // TODO: implement this! Below is a placeholder
  useEffectOnce(() => {
    onRetake();
    onConfirm();
  });

  return <div>{image}</div>;
};

export default Preview;
