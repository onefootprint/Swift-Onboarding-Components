import { IcoInfo16 } from '@onefootprint/icons';
import type { IdDocImageProcessingError } from '@onefootprint/types';
import { Box, Text, Tooltip } from '@onefootprint/ui';
import styled, { css } from 'styled-components';
import BaseImage from './components/base-image';
import RotatedImage from './components/rotated-image';
import useFailureReasonText from './hooks/use-failure-reason-text';

type UploadImageProps = {
  objectUrl: string;
  alt: string;
  failureReasons: IdDocImageProcessingError[];
  rotateIndex?: number;
  timestamp?: string;
};

export const UploadImage = ({ objectUrl, alt, failureReasons, rotateIndex, timestamp }: UploadImageProps) => {
  const failureReasonT = useFailureReasonText();

  if (typeof rotateIndex === 'number') {
    return <RotatedImage alt={alt} src={objectUrl} rotateIndex={rotateIndex} />;
  }

  if (failureReasons.length > 0) {
    return (
      <Box position="relative" backgroundColor="primary">
        <Container position="absolute" display="flex" alignItems="center" justifyContent="start" gap={3}>
          <ReasonContainer display="flex" alignItems="center" justifyContent="center" backgroundColor="primary">
            <Tooltip alignment="end" text={failureReasonT(failureReasons[0] as IdDocImageProcessingError)}>
              <IcoInfo16 />
            </Tooltip>
          </ReasonContainer>
          {timestamp && (
            <Text variant="snippet-1" truncate>
              {timestamp}
            </Text>
          )}
        </Container>
        <BaseImage alt={alt} src={objectUrl} />
      </Box>
    );
  }

  return <BaseImage alt={alt} src={objectUrl} />;
};

const Container = styled(Box)`
  ${({ theme }) => css`
    --container-size: ${theme.spacing[11]};
    width: var(--container-size);
    top: ${theme.spacing[3]};
    right: calc(-1 * var(--container-size));
  `};
`;

const ReasonContainer = styled(Box)`
  ${({ theme }) => css`
    --reason-container-size: ${theme.spacing[7]};
    width: var(--reason-container-size);
    height: var(--reason-container-size);
    box-shadow: ${theme.elevation[1]};
    border-top-right-radius: ${theme.borderRadius.default};
    border-bottom-right-radius: ${theme.borderRadius.default};
  `};
`;

export default UploadImage;
