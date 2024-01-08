import { useTranslation } from '@onefootprint/hooks';
import {
  IcoLayer0124,
  IcoSmartphone224,
  IcoSparkles24,
  IcoSquareFrame24,
} from '@onefootprint/icons';
import { BottomSheet } from '@onefootprint/ui';
import React from 'react';

import type { AutocaptureKind } from '../../../camera/types';
import InstructionItems from './components/instruction-item';

type InstructionProps = {
  onClose: () => void;
  isOpen: boolean;
  autocaptureKind: AutocaptureKind;
};

const Instructions = ({
  onClose,
  isOpen,
  autocaptureKind,
}: InstructionProps) => {
  const { t } = useTranslation('components.id-doc.photo-capture.instructions');
  const instructionItems = [
    {
      title: t(`position-${autocaptureKind}.title`),
      description: t(`position-${autocaptureKind}.description`),
      Icon: IcoSquareFrame24,
    },
    {
      title: t('steady.title'),
      description: t('steady.description'),
      Icon: IcoSmartphone224,
    },
    {
      title: t(`autocapture-${autocaptureKind}.title`),
      description: t(`autocapture-${autocaptureKind}.description`),
      Icon: IcoSparkles24,
    },
  ];

  if (autocaptureKind === 'document')
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
