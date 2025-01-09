import { IdDocImageProcessingError, IdDocImageTypes } from '@onefootprint/types';
import { Box, Button } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { NavigationHeader } from '@/idv/components';
import upperFirst from 'lodash/upperFirst';
import DesktopHeader from '../../../components/desktop-header';
import ErrorComponent from '../../../components/error';
import { DESKTOP_INTERACTION_BOX_HEIGHT } from '../../../constants';
import useDocName from '../../hooks/use-doc-name';
import useIdDocMachine from '../../hooks/use-id-doc-machine';

const DesktopSelfieRetry = () => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.id-doc.pages.desktop-selfie-retry',
  });
  const [state, send] = useIdDocMachine();
  const { errors } = state.context;
  const { getSideName } = useDocName({
    imageType: IdDocImageTypes.selfie,
  });
  const sideName = getSideName();

  const handleSelfieRetake = () => {
    send({
      type: 'startImageCapture',
    });
  };

  return (
    <>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
      <Box display="flex" flexDirection="column" gap={7} paddingBottom={5}>
        <DesktopHeader sideName={upperFirst(sideName)} isSelfie />
        <ErrorContainer $height={DESKTOP_INTERACTION_BOX_HEIGHT}>
          <ErrorComponent
            errors={errors ?? [{ errorType: IdDocImageProcessingError.unknownError }]}
            sideName={sideName}
          />
        </ErrorContainer>
        <Button fullWidth onClick={handleSelfieRetake} size="large" data-dd-action-name="selfie:retry">
          {t('take-selfie-again')}
        </Button>
      </Box>
    </>
  );
};

const ErrorContainer = styled.div<{ $height: number }>`
  ${({ theme, $height }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: ${$height}px;
    background-color: ${theme.backgroundColor.secondary};
    border: 1px dashed ${theme.borderColor.primary};
    border-radius: ${theme.borderRadius.default};
    padding: 0 ${theme.spacing[6]};
  `}
`;

export default DesktopSelfieRetry;
