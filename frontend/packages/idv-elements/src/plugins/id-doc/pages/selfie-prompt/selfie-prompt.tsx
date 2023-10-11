import { useTranslation } from '@onefootprint/hooks';
import {
  IcoEmojiHappy24,
  IcoSmartphone24,
  IcoSparkles24,
  IcoSun24,
} from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Box, Button } from '@onefootprint/ui';
import React from 'react';

import InfoBox from '../../../../components/info-box';
import HeaderTitle from '../../../../components/layout/components/header-title';
import StickyBottomBox from '../../../../components/layout/components/sticky-bottom-box';
import FadeInContainer from '../../components/fade-in-container';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const SelfiePrompt = () => {
  const [, send] = useIdDocMachine();
  const { t } = useTranslation('pages.selfie-photo-prompt');

  const handleClick = () => {
    send({ type: 'startImageCapture' });
  };

  return (
    <FadeInContainer>
      <PromptContainer>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
          <InfoBox
            items={[
              {
                title: t('guidelines.whole-face.title'),
                description: t('guidelines.whole-face.description'),
                Icon: IcoEmojiHappy24,
              },
              {
                title: t('guidelines.check-lighting.title'),
                description: t('guidelines.check-lighting.description'),
                Icon: IcoSun24,
              },
              {
                title: t('guidelines.device-steady.title'),
                Icon: IcoSmartphone24,
              },
              {
                title: t('guidelines.autocapture.title'),
                Icon: IcoSparkles24,
              },
            ]}
            variant="default"
          />
        </Box>
        <StickyBottomBox>
          <Button fullWidth onClick={handleClick}>
            {t('cta')}
          </Button>
        </StickyBottomBox>
      </PromptContainer>
    </FadeInContainer>
  );
};

const PromptContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    align-items: center;
    padding: ${theme.spacing[5]} 0;
  `}
`;

export default SelfiePrompt;
