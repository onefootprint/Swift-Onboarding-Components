import React from 'react';
import styled, { css } from 'styled-components';

import { HeaderTitle } from '../../../../components';
import convertImageToBase64 from '../../utils/image-processing/image-to-base64';
import Prompt from './components/prompt';

type TakeOrUploadPhotoMobileProps = {
  title: string;
  subtitle: string;
  showGuidelines?: boolean;
  onComplete: (image: string) => void;
};

const TakeOrUploadPhoto = ({
  title,
  subtitle,
  showGuidelines,
  onComplete,
}: TakeOrUploadPhotoMobileProps) => {
  const handleImage = async (image: File) => {
    const imageString = (await convertImageToBase64(image)) as string;
    onComplete(imageString);
  };

  return (
    <Container>
      <HeaderTitle title={title} subtitle={subtitle} />
      <Prompt onDone={handleImage} showGuidelines={showGuidelines} />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    justify-content: center;
    align-items: center;
    > button {
      margin-top: -${theme.spacing[4]};
    }
  `}
`;

export default TakeOrUploadPhoto;
