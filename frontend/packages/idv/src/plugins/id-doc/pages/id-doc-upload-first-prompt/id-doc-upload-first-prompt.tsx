import { IcoIdGeneric40 } from '@onefootprint/icons';
import { SupportedIdDocTypes } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { NavigationHeader } from '../../../../components';
import FadeInContainer from '../../components/fade-in-container';
import IdDocPhotoButtons from '../../components/id-doc-photo-buttons';
import { useIdDocMachine } from '../../components/machine-provider';
import PromptWithGuidelines from '../../components/prompt-with-directions';
import type { CaptureKind } from '../../utils/state-machine';

const guidelineKeys: Partial<{
  [key in SupportedIdDocTypes]: string[];
}> = {
  [SupportedIdDocTypes.proofOfAddress]: [
    'gas-water-electricity-bill',
    'bank-credit-card-statement',
    'vehicle-voter-registration',
    'rental-agreement',
    'insurance',
    'phone-internet-bill',
  ],
};

const IdDocUploadFirstPrompt = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: `id-doc.pages.id-doc-upload-first-prompt`,
  });
  const [state, send] = useIdDocMachine();
  const {
    idDoc: { type: docType, country },
  } = state.context;

  if (!docType || !country) {
    return null;
  }

  const guidelineKeysForDocType = guidelineKeys[docType];

  const guidelines = guidelineKeysForDocType
    ? guidelineKeysForDocType.map(key =>
        // @ts-ignore:next-line
        t(`${docType}.guidelines.${key}` as ParseKeys<`idv`>),
      )
    : [];

  const handleComplete = (
    imageFile: File | Blob,
    extraCompressed: boolean,
    captureKind: CaptureKind,
  ) => {
    send({
      type: 'receivedImage',
      payload: {
        imageFile,
        extraCompressed,
        captureKind,
      },
    });
  };

  const handleClickBack = () => {
    send({ type: 'navigatedToPrev' });
  };

  return (
    <FadeInContainer>
      <NavigationHeader
        leftButton={{ variant: 'back', onBack: handleClickBack }}
      />
      <PromptContainer
        direction="column"
        gap={7}
        align="center"
        justify="center"
      >
        <PromptWithGuidelines
          // @ts-ignore:next-line
          title={t(`${docType}.title` as ParseKeys<`idv`>)}
          icon={IcoIdGeneric40}
          // @ts-ignore:next-line
          description={t(`${docType}.description` as ParseKeys<`idv`>)}
          // @ts-ignore:next-line
          guidelines={guidelines}
        />
        <IdDocPhotoButtons onComplete={handleComplete} uploadFirst />
      </PromptContainer>
    </FadeInContainer>
  );
};

const PromptContainer = styled(Stack)`
  height: 100%;
`;
export default IdDocUploadFirstPrompt;
