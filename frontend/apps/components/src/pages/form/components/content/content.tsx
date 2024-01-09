import type {
  FootprintFormDataProps,
  FootprintVariant,
} from '@onefootprint/footprint-js';
import {
  FootprintPrivateEvent,
  FootprintPublicEvent,
} from '@onefootprint/footprint-js';
import { useTranslation } from '@onefootprint/hooks';
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

type ContentProps = {
  fallback: JSX.Element;
};

const Content = ({ fallback }: ContentProps) => {
  const footprintProvider = useFootprintProvider();
  const { t } = useTranslation('pages.secure-form.card.form');
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
  const { hideFootprintLogo, hideCancelButton, hideButtons } = options;
  useEffect(() => {
    Logger.info(
      `Received form props: title=${title}, hideFootprintLogo=${
        hideFootprintLogo ? 'true' : 'false'
      }, hideCancelButton=${hideCancelButton ? 'true' : 'false'}, hideButtons=${
        hideButtons ? 'true' : 'false'
      }. ${authToken ? 'Has' : 'No'} auth token.`,
    );
  }, [authToken, title, hideFootprintLogo, hideButtons, hideCancelButton]);
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

  const handleVaultDataError = (err: unknown, savedViaRef?: boolean) => {
    if (!err) {
      return;
    }
    if (typeof err === 'string') {
      if (savedViaRef) {
        handleRefSaveError(err);
      }
      Logger.info(`Setting form-wide error, ${err}`);
      setFormErrorMessage(err);
      return;
    }
    if (typeof err === 'object') {
      if (savedViaRef) {
        handleRefSaveError(t('errors.invalid-data'));
      }
      const processedFieldErrors = processFieldErrors(err);
      setFieldErrors(processedFieldErrors);
      Logger.info(`Setting field errors: ${JSON.stringify(err)}`);
      return;
    }
    if (savedViaRef) {
      handleRefSaveError(t('errors.unknown error'));
    }
    Logger.error(`Unknown error while vaulting data, ${getErrorMessage(err)}`);
  };

  const handleComplete = () => {
    Logger.info('Triggered form complete');
    // Triggers the onComplete callback on the SDK
    footprintProvider.send(FootprintPublicEvent.completed);
    // Resolves the promise returned from the save ref method
    footprintProvider.send(FootprintPrivateEvent.formSaveComplete);
  };

  const handleRefSaveError = (error: string) => {
    // Rejects the promise returned from the save ref method
    footprintProvider.send(FootprintPrivateEvent.formSaveFailed, error);
  };

  const handleSave = async (formData: FormData, savedViaRef?: boolean) => {
    Logger.info('Triggered save form data to vault');
    setFieldErrors(undefined);
    setFormErrorMessage(undefined);

    if (usersVaultMutation.isLoading) {
      Logger.info('Vault mutation is already in progress, skipping save');
      return;
    }

    if (!clientTokenFields.data) {
      Logger.error('Cannot save to vault without client token fields');
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
      Logger.error(
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
      onError: err => handleVaultDataError(err, savedViaRef),
    });
  };

  const { data, isError, isLoading, error } = clientTokenFields;
  if (isLoading) {
    Logger.info('Fetching client token fields');
    return fallback; // Default to a loading state here
  }
  if (!props) {
    Logger.info('No props passed to secure form');
    return fallback; // Default to a loading state here
  }

  if (isError) {
    Logger.error(
      `Fetching client token fields failed with error: ${getErrorMessage(
        error,
      )}.`,
    );
    return <Invalid onClose={handleClose} />;
  }

  const { vaultFields, expiresAt } = data;
  const sections = getFormSectionsFromFields(vaultFields);
  if (!sections.length) {
    Logger.error('Auth token is missing fields');
    return <Invalid onClose={handleClose} />;
  }

  const isExpired = checkIsExpired(expiresAt);
  if (isExpired) {
    Logger.error('Client auth token is expired, cannot save to vault');
    return <Invalid onClose={handleClose} />;
  }

  const isValid = arePropsValid(props);
  if (!isValid) {
    Logger.error('Invalid props passed to secure form');
    return <Invalid onClose={handleClose} />;
  }

  if (!data) {
    Logger.error('Received empty response while fetching client token fields');
    return <Invalid onClose={handleClose} />;
  }

  return (
    <FormBase
      title={title}
      sections={sections}
      variant={variant}
      isLoading={usersVaultMutation.isLoading}
      hideFootprintLogo={hideFootprintLogo}
      hideSaveButton={hideButtons}
      hideCancelButton={hideCancelButton || hideButtons}
      formErrorMessage={formErrorMessage}
      fieldErrors={fieldErrors}
      onSave={handleSave}
      onSaveError={handleRefSaveError}
      onCancel={handleCancel}
      onClose={handleClose}
    />
  );
};

export default Content;
