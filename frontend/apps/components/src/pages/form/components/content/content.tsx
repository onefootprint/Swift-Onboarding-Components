import type {
  FootprintFormDataProps,
  FootprintVariant,
} from '@onefootprint/footprint-js';
import {
  FootprintPrivateEvent,
  FootprintPublicEvent,
} from '@onefootprint/footprint-js';
import { Logger } from '@onefootprint/idv-elements';
import { getErrorMessage } from '@onefootprint/request';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { useFootprintProvider } from '../../../../components/footprint-provider';
import useProps from '../../../../components/footprint-provider/hooks/use-props';
import useClientTokenFields from '../../hooks/use-client-token-fields';
import useVaultData from '../../hooks/use-vault-data';
import arePropsValid from '../../utils/are-props-valid';
import checkIsExpired from '../../utils/check-is-expired';
import convertFormData from '../../utils/convert-form-data';
import getCardAlias from '../../utils/get-card-alias';
import getFormSectionsFromFields from '../../utils/get-form-sections-from-fields';
import processFieldErrors from '../../utils/process-field-errors';
import type { FormData } from '../form-base';
import FormBase from '../form-base';
import Invalid from '../invalid';

const Content = () => {
  const footprintProvider = useFootprintProvider();
  const [props, setProps] = useState<FootprintFormDataProps>();
  useProps<FootprintFormDataProps>(setProps);
  const router = useRouter();
  const variant = router.query.variant as FootprintVariant;
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormData, string>> | undefined
  >(undefined);
  const [formErrorMessage, setFormErrorMessage] = useState<
    string | undefined
  >();

  const { authToken = '', title, options = {} } = props || {};
  const { hideFootprintLogo, hideButtons } = options;
  useEffect(() => {
    Logger.info(
      `Received form props: title=${title}, hideFootprintLogo=${
        hideFootprintLogo ? 'true' : 'false'
      }, hideButtons=${hideButtons ? 'true' : 'false'}. ${
        authToken ? 'Has' : 'No'
      } auth token.`,
    );
  }, [authToken, title, hideFootprintLogo, hideButtons]);
  const { vaultData, usersVaultMutation } = useVaultData();
  const clientTokenFields = useClientTokenFields(authToken);

  const handleCancel = () => {
    Logger.info('Triggered form cancel');
    footprintProvider.send(FootprintPublicEvent.canceled);
  };

  const handleClose = () => {
    Logger.info('Triggered form close');
    footprintProvider.send(FootprintPublicEvent.closed);
  };

  const handleComplete = () => {
    Logger.info('Triggered form complete');
    // Triggers the onComplete callback on the SDK
    footprintProvider.send(FootprintPublicEvent.completed);
    // Resolves the promise returned from the save ref method
    footprintProvider.send(FootprintPrivateEvent.formSaveComplete);
  };

  const handleSave = async (formData: FormData) => {
    Logger.info('Triggered save form data to vault');
    setFieldErrors(undefined);
    setFormErrorMessage(undefined);

    if (usersVaultMutation.isLoading) {
      Logger.info('Vault mutation is already in progress, skipping save');
      return;
    }

    if (!clientTokenFields.data) {
      console.error('Cannot save to vault without client token fields');
      return;
    }
    const { vaultFields } = clientTokenFields.data;
    const cardAlias = getCardAlias(vaultFields);
    Logger.info(
      `Received vaultFields: ${vaultFields.join(
        ', ',
      )}. Card alias is ${cardAlias}`,
    );
    if (!cardAlias) {
      console.error(
        'Cannot extract cardAlias from auth token. Please verify auth token has correct fields set on it.',
      );
      return;
    }

    const convertedData = convertFormData(formData, cardAlias);
    Logger.info(
      `Form data has keys: ${Object.keys(formData).join(
        ', ',
      )}. Converted data has keys: ${Object.keys(convertedData).join(', ')}`,
    );

    vaultData({
      authToken,
      data: convertedData,
      onSuccess: handleComplete,
      onError: error => {
        if (typeof error === 'string') {
          Logger.info(`Setting form-wide error, ${error}`);
          setFormErrorMessage(error);
          return;
        }
        if (typeof error === 'object') {
          const processedFieldErrors = processFieldErrors(error);
          setFieldErrors(processedFieldErrors);
          Logger.info(`Setting field errors: ${JSON.stringify(error)}`);
          return;
        }
        console.error(
          `Unknown error while vaulting data, ${getErrorMessage(error)}`,
        );
      },
    });
  };

  const { data, isError, isLoading } = clientTokenFields;
  if (isLoading) {
    Logger.info('Fetching client token fields');
    return null; // Default to a loading state here
  }
  if (!props) {
    Logger.info('No props passed to secure form');
    return null; // Default to a loading state here
  }

  if (isError) {
    console.error(`Fetching client token fields failed.`);
    return <Invalid onClose={handleClose} />;
  }

  const { vaultFields, expiresAt } = data;
  const sections = getFormSectionsFromFields(vaultFields);
  if (!sections.length) {
    console.error('Auth token is missing fields');
    return <Invalid onClose={handleClose} />;
  }

  const isExpired = checkIsExpired(expiresAt);
  if (isExpired) {
    console.error('Client auth token is expired, cannot save to vault');
    return <Invalid onClose={handleClose} />;
  }

  const isValid = arePropsValid(props);
  if (!isValid) {
    console.error('Invalid props passed to secure form');
    return <Invalid onClose={handleClose} />;
  }

  if (!data) {
    console.error('Received empty response while fetching client token fields');
    return <Invalid onClose={handleClose} />;
  }

  return (
    <FormBase
      title={title}
      sections={sections}
      variant={variant}
      isLoading={usersVaultMutation.isLoading}
      hideFootprintLogo={hideFootprintLogo}
      hideButtons={hideButtons}
      formErrorMessage={formErrorMessage}
      fieldErrors={fieldErrors}
      onSave={handleSave}
      onCancel={handleCancel}
      onClose={handleClose}
    />
  );
};

export default Content;
