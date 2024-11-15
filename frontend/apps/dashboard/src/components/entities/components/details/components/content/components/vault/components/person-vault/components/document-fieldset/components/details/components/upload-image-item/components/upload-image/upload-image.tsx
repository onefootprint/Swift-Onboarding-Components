import { IcoInfo16 } from '@onefootprint/icons';
import type { IdDocImageProcessingError } from '@onefootprint/types';
import { Box, Tooltip } from '@onefootprint/ui';
import styled, { css } from 'styled-components';
import BaseImage from './components/base-image';
import RotatedImage from './components/rotated-image';
import useFailureReasonText from './hooks/use-failure-reason-text';

type UploadImageProps = {
  objectUrl: string;
  alt: string;
  failureReasons: IdDocImageProcessingError[];
  rotateIndex?: number;
};

export const UploadImage = ({ objectUrl, alt, failureReasons, rotateIndex }: UploadImageProps) => {
  const failureReasonT = useFailureReasonText();

  if (typeof rotateIndex === 'number') {
    return <RotatedImage alt={alt} src={objectUrl} rotateIndex={rotateIndex} />;
  }

  if (failureReasons.length > 0) {
    return (
      <Box position="relative" backgroundColor="primary">
        <ReasonContainer
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
          backgroundColor="primary"
        >
          <Tooltip alignment="end" text={failureReasonT(failureReasons[0] as IdDocImageProcessingError)}>
            <IcoInfo16 />
          </Tooltip>
        </ReasonContainer>
        <BaseImage alt={alt} src={objectUrl} />
      </Box>
    );
  }

  return <BaseImage alt={alt} src={objectUrl} />;
};

const ReasonContainer = styled(Box)`
  ${({ theme }) => css`
    --reason-container-size: ${theme.spacing[7]};
    width: var(--reason-container-size);
    height: var(--reason-container-size);
    top: ${theme.spacing[3]};
    right: calc(var(--reason-container-size) * -1);
    box-shadow: ${theme.elevation[1]};
    border-top-right-radius: ${theme.borderRadius.default};
    border-bottom-right-radius: ${theme.borderRadius.default};
  `};
`;

export default UploadImage;
