import type { IconProps } from '@onefootprint/icons';
import { IcoLayer0124, IcoSmartphone224, IcoSparkles24, IcoSquareFrame24 } from '@onefootprint/icons';
import { BottomSheet } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import type { AutoCaptureKind } from '../../../camera/types';
import InstructionItems from './components/instruction-item';

type InstructionProps = {
  onClose: () => void;
  isOpen: boolean;
  autoCaptureKind: AutoCaptureKind;
};

const Instructions = ({ onClose, isOpen, autoCaptureKind }: InstructionProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.components.photo-capture.instructions',
  });
  const captureKind = autoCaptureKind === 'face' ? 'face' : 'document';
  const instructionItems: {
    title: string;
    description: string;
    Icon: (props: IconProps) => JSX.Element;
  }[] = [
    {
      title: t(`position-${captureKind}.title`),
      description: t(`position-${captureKind}.description`),
      Icon: IcoSquareFrame24,
    },
    {
      title: t('steady.title'),
      description: t('steady.description'),
      Icon: IcoSmartphone224,
    },
    {
      title: t(`autocapture-${captureKind}.title`),
      description: t(`autocapture-${captureKind}.description`),
      Icon: IcoSparkles24,
    },
  ];

  if (captureKind === 'document')
    instructionItems.unshift({
      title: t('background.title'),
      description: t('background.description'),
      Icon: IcoLayer0124,
    });

  return (
    <BottomSheet onClose={onClose} open={isOpen} title={t('title')}>
      <InstructionItems items={instructionItems} />
    </BottomSheet>
  );
};

export default Instructions;
