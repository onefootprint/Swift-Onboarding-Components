import { useTranslation } from '@onefootprint/hooks';
import { Button } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

import ScanGuidelines from '../scan-guidelines';

type PromptProps = {
  showGuidelines?: boolean;
  onSelectTake: () => void;
  onSelectUpload: () => void;
};

const Prompt = ({
  showGuidelines,
  onSelectTake,
  onSelectUpload,
}: PromptProps) => {
  const { t } = useTranslation('components.take-or-upload-photo');
  return (
    <>
      {showGuidelines && <ScanGuidelines />}
      <ButtonsContainer>
        <Button fullWidth onClick={onSelectTake}>
          {t('take-photo.title')}
        </Button>
        <Button fullWidth variant="secondary" onClick={onSelectUpload}>
          {t('upload-photo.title')}
        </Button>
      </ButtonsContainer>
    </>
  );
};

const ButtonsContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[4]}px;
  `}
`;

export default Prompt;
