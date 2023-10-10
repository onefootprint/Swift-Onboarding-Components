import { CountryRecord, DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import { getErrorMessage } from '@onefootprint/request';
import {
  CountryCode,
  IdDocRequirement,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import {
  Box,
  Button,
  CountrySelect,
  Divider,
  RadioSelect,
  SelectOption,
  Typography,
} from '@onefootprint/ui';
import React, { useState } from 'react';

import ScrollLayout from '@/components/scroll-layout';
import { PREVIEW_AUTH_TOKEN } from '@/config/constants';
import useApp from '@/domains/idv/hooks/use-app';
import useTranslation from '@/hooks/use-translation';
import { Events, useAnalytics } from '@/utils/analytics';

import getSupportedCountryByCode from '../../utils/get-supported-country-by-code';
import useSubmitDocType from '../doc-scan/hooks/use-submit-doc-type';
import PermissionsDialog from './components/permissions-dialog';
import useCountryOptions from './hooks/use-country-options';
import useDocumentOptions from './hooks/use-document-options';

export type DocSelectionProps = {
  requirement: IdDocRequirement;
  defaultType?: SupportedIdDocTypes;
  defaultCountry?: CountryRecord;
  onSubmit: (
    countryCode: CountryCode,
    docType: SupportedIdDocTypes,
    docId: string,
  ) => void;
  authToken: string;
};

const DocSelection = ({
  requirement: { supportedCountryAndDocTypes },
  defaultType,
  defaultCountry = DEFAULT_COUNTRY,
  authToken,
  onSubmit,
}: DocSelectionProps) => {
  const { t } = useTranslation('components.scan.doc-selection');
  const app = useApp();
  const docTypeMutation = useSubmitDocType();
  const [country, setCountry] = useState<CountryRecord>(defaultCountry);
  const docTypeOptions = useDocumentOptions(
    supportedCountryAndDocTypes,
    country,
  );
  const countryOptions = useCountryOptions(supportedCountryAndDocTypes);
  const [docType, setDocType] = useState<SupportedIdDocTypes>(
    defaultType || docTypeOptions[0].value,
  );
  const analytics = useAnalytics();

  const oneCountrySupported =
    Object.keys(supportedCountryAndDocTypes).length === 1;
  const countrySelectHint =
    oneCountrySupported && t('country-select.hint', { country: country.label });

  const handleCountryChange = (newCountry: SelectOption<CountryRecord>) => {
    setCountry(newCountry);
    const docs = getSupportedCountryByCode(
      supportedCountryAndDocTypes,
      newCountry.value,
    );
    if (docs) {
      setDocType(docs.at(0));
    }
  };

  const handleSubmit = () => {
    analytics.track(Events.DocSelectionSubmitted, {
      docType,
      countryCode: country.value,
    });

    if (authToken === PREVIEW_AUTH_TOKEN) {
      onSubmit(country.value, docType, '1234512345');
    } else {
      docTypeMutation.mutate(
        {
          authToken,
          documentType: docType,
          countryCode: country.value,
          fixtureResult: app?.sandboxIdDocOutcome,
        },
        {
          onSuccess(response) {
            analytics.track(Events.DocSelectionSubmittedSucceeded);
            onSubmit(country.value, docType, response.id);
          },
          onError(error) {
            analytics.track(Events.DocSelectionSubmittedFailed, {
              message: getErrorMessage(error),
            });
          },
        },
      );
    }
  };

  return (
    <ScrollLayout
      Footer={
        <PermissionsDialog onContinue={handleSubmit}>
          <Button onPress={handleSubmit}>{t('cta')}</Button>
        </PermissionsDialog>
      }
    >
      <Box center marginBottom={7}>
        <Typography variant="heading-3" marginTop={7} marginBottom={3}>
          {t('title')}
        </Typography>
        <Typography variant="body-2">{t('subtitle')}</Typography>
      </Box>
      <Box justifyContent="space-between" flex={1}>
        <Box>
          <CountrySelect
            disabled={oneCountrySupported}
            hint={countrySelectHint}
            onChange={handleCountryChange}
            options={countryOptions}
            value={country}
          />
          <Divider marginVertical={7} />
          <RadioSelect<SupportedIdDocTypes>
            marginBottom={10}
            onChange={setDocType}
            options={docTypeOptions}
            value={docType}
          />
        </Box>
      </Box>
    </ScrollLayout>
  );
};

export default DocSelection;
