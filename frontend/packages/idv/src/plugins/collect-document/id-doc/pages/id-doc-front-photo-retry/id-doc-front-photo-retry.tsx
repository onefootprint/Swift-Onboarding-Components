import { IdDocImageTypes } from '@onefootprint/types';

import type { CaptureKind } from '../../../types';
import { getCountryFromCode } from '../../../utils/get-country-from-code';
import IdDocPhotoRetryPrompt from '../../components/id-doc-photo-retry-prompt';
import { useIdDocMachine } from '../../components/machine-provider';

const IdDocFrontPhotoRetry = () => {
  const [state, send] = useIdDocMachine();
  const {
    idDoc: { type, country },
    errors,
  } = state.context;

  if (!type || !country) {
    return null;
  }

  const countryName = getCountryFromCode(country)?.label;

  const handleComplete = (payload: {
    imageFile: File | Blob;
    extraCompressed: boolean;
    captureKind: CaptureKind;
  }) => {
    send({
      type: 'receivedImage',
      payload,
    });
  };

  return (
    <IdDocPhotoRetryPrompt
      docType={type}
      countryName={countryName ?? country}
      imageType={IdDocImageTypes.front}
      onComplete={handleComplete}
      errors={errors || []}
    />
  );
};

export default IdDocFrontPhotoRetry;
