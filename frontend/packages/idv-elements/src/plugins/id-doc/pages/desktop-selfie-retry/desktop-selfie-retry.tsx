import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import {
  IdDocImageProcessingError,
  IdDocImageTypes,
} from '@onefootprint/types';
import { Button } from '@onefootprint/ui';
import React from 'react';

import { NavigationHeader } from '../../../../components';
import DesktopHeader from '../../components/desktop-header';
import Error from '../../components/error';
import DESKTOP_INTERACTION_BOX_HEIGHT from '../../constants/desktop-interaction-box.constants';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import { getCountryFromCode } from '../../utils/get-country-from-code';

const DesktopSelfieRetry = () => {
  const { t } = useTranslation('pages.desktop-selfie-retry');
  const [state, send] = useIdDocMachine();
  const {
    idDoc: { type, country },
    errors,
  } = state.context;

  if (!type || !country) {
    return null;
  }

  const countryName = getCountryFromCode(country)?.label;

  const handleSelfieRetake = () => {
    send({
      type: 'startImageCapture',
    });
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
      <Container>
        <DesktopHeader
          type={type}
          country={country}
          imageType={IdDocImageTypes.selfie}
        />
        <ErrorContainer height={DESKTOP_INTERACTION_BOX_HEIGHT}>
          <Error
            errors={
              errors ?? [{ errorType: IdDocImageProcessingError.unknownError }]
            }
            imageType={IdDocImageTypes.selfie}
            docType={type}
            countryName={countryName ?? country}
          />
        </ErrorContainer>
        <Button fullWidth onClick={handleSelfieRetake}>
          {t('take-selfie-again')}
        </Button>
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[7]};
    padding-bottom: ${theme.spacing[5]};
  `}
`;

const ErrorContainer = styled.div<{
  height: number;
}>`
  ${({ theme, height }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: ${height}px;
    background-color: ${theme.backgroundColor.secondary};
    border: 1px dashed ${theme.borderColor.primary};
    border-radius: ${theme.borderRadius.default};
    padding: 0 ${theme.spacing[6]};
  `}
`;

export default DesktopSelfieRetry;
