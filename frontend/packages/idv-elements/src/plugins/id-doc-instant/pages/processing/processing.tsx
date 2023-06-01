import { SubmitDocResponse } from '@onefootprint/types';
import React, { useState } from 'react';
import { useEffectOnce } from 'usehooks-ts';

import IdDocAnimation from '../../components/id-doc-animation';
import Loading from '../../components/loading';
import NextSide from '../../components/next-side';
import Success from '../../components/success';
import { ImageTypes } from '../../constants/image-types';
import useIdDocMachine from '../../hooks/use-id-doc-machine';
import useSubmitDoc from './hooks/use-submit-doc';

const imageRequestFields = {
  [ImageTypes.front]: 'frontImage',
  [ImageTypes.back]: 'backImage',
  [ImageTypes.selfie]: 'selfieImage',
};

const Processing = () => {
  const [state, send] = useIdDocMachine();
  const submitDocMutation = useSubmitDoc();
  const [mode, setMode] = useState<'loading' | 'success'>('loading');
  const [nextSide, setNextSide] = useState<ImageTypes | undefined>();

  const {
    idDoc: { type, country },
    image,
    authToken,
    currSide,
  } = state.context;

  const handleSubmitDocSuccess = (data: SubmitDocResponse) => {
    const { errors, nextSideToCollect } = data;

    // If we are staying on the same side, we show error
    // If we are moving on from the current side, we show success
    // If there is no next side, the flow is complete
    if (nextSideToCollect === state.context.currSide) {
      send({
        type: 'processingErrored',
        payload: {
          errors,
        },
      });
    } else if (!nextSideToCollect) {
      setMode('success');
    } else {
      setMode('success');
      setNextSide(nextSideToCollect as ImageTypes);
    }
  };

  const handleSubmitDocError = () => {
    send({
      type: 'processingErrored',
      payload: {
        errors: [],
      },
    });
  };

  useEffectOnce(() => {
    if (!image || !authToken || !type || !country || !currSide) {
      return;
    }

    if (currSide === ImageTypes.front)
      submitDocMutation.mutate(
        {
          [imageRequestFields[currSide]]: image,
          authToken,
          documentType: type,
          countryCode: country,
        },
        {
          onSuccess: handleSubmitDocSuccess,
          onError: handleSubmitDocError,
        },
      );
  });

  const onSuccessComplete = () => {
    send({
      type: 'processingSucceeded',
      payload: { nextSideToCollect: undefined },
    });
  };

  const onNextSideComplete = () => {
    send({
      type: 'processingSucceeded',
      payload: { nextSideToCollect: nextSide },
    });
  };

  return type && currSide ? (
    <IdDocAnimation
      loadingComponent={<Loading imageType={currSide} docType={type} />}
      successComponent={
        <Success
          imageType={currSide}
          docType={type}
          onComplete={
            mode === 'success' && !nextSide ? onSuccessComplete : undefined
          }
        />
      }
      nextSideComponent={
        nextSide && (
          <NextSide
            docType={type}
            nextSideImageType={nextSide}
            onComplete={onNextSideComplete}
          />
        )
      }
      mode={mode}
    />
  ) : null;
};

export default Processing;
