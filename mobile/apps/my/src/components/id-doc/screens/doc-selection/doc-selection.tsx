import type { CountryRecord } from '@onefootprint/global-constants';
import { DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import type { CountryCode, IdDocRequirement, SupportedIdDocTypes } from '@onefootprint/types';
import type { SelectOption } from '@onefootprint/ui';
import { Box, Button, CountrySelect, Divider, RadioSelect, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';

import ScrollLayout from '@/components/scroll-layout';
import { PREVIEW_AUTH_TOKEN } from '@/config/constants';
import useApp from '@/domains/idv/hooks/use-app';
import useRequestError from '@/hooks/use-request-error';
import useTranslation from '@/hooks/use-translation';
import { Events, useAnalytics } from '@/utils/analytics';

import getSupportedCountryByCode from '../../utils/get-supported-country-by-code';
import useSubmitDocType from '../doc-scan/hooks/use-submit-doc-type';
import ConsentDialog from './components/consent-dialog';
import PermissionsDialog from './components/permissions-dialog';
import useCountryOptions from './hooks/use-country-options';
import useDocumentOptions from './hooks/use-document-options';

export type DocSelectionProps = {
  authToken: string;
  defaultCountry?: CountryRecord;
  defaultType?: SupportedIdDocTypes;
  onConsentCompleted: () => void;
  onSubmit: (countryCode: CountryCode, docType: SupportedIdDocTypes, docId: string) => void;
  requirement: IdDocRequirement;
  shouldCollectConsent: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  supportedCountryAndDocTypes: any;
};

const DocSelection = ({
  authToken,
  defaultCountry = DEFAULT_COUNTRY,
  defaultType,
  onConsentCompleted,
  onSubmit,
  requirement,
  shouldCollectConsent,
  supportedCountryAndDocTypes,
}: DocSelectionProps) => {
  const { getErrorMessage } = useRequestError();
  const { t } = useTranslation('scan.doc-selection');
  const [showConsent, setShowConsent] = useState(false);
  const app = useApp();
  const docTypeMutation = useSubmitDocType();
  const [country, setCountry] = useState<CountryRecord>(defaultCountry);
  const docTypeOptions = useDocumentOptions(supportedCountryAndDocTypes, country);
  const countryOptions = useCountryOptions(supportedCountryAndDocTypes);
  const [docType, setDocType] = useState<SupportedIdDocTypes>(defaultType || docTypeOptions[0].value);
  const analytics = useAnalytics();

  const oneCountrySupported = Object.keys(supportedCountryAndDocTypes).length === 1;
  const countrySelectHint = oneCountrySupported && t('country-select.hint', { country: country.label });
  const isPreview = authToken === PREVIEW_AUTH_TOKEN;

  const handleCountryChange = (newCountry: SelectOption<CountryRecord>) => {
    setCountry(newCountry);
    const docs = getSupportedCountryByCode(supportedCountryAndDocTypes, newCountry.value);
    const firstDoc = docs?.at(0);
    if (firstDoc) {
      setDocType(firstDoc);
    }
  };

  const submit = () => {
    analytics.track(Events.DocSelectionSubmitted, {
      docType,
      countryCode: country.value,
    });

    if (isPreview) {
      onSubmit(country.value, docType, '1234512345');
    } else {
      docTypeMutation.mutate(
        {
          authToken,
          documentType: docType,
          countryCode: country.value,
          fixtureResult: app?.sandboxIdDocOutcome ?? undefined,
          requestId: requirement.documentRequestId,
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

  const handleContinue = () => {
    if (shouldCollectConsent && !showConsent) {
      setShowConsent(true);
    } else {
      submit();
    }
  };

  const handleConsentSubmit = () => {
    onConsentCompleted();
    submit();
  };

  return (
    <>
      <ScrollLayout
        Footer={
          <PermissionsDialog onGranted={handleContinue}>
            <Button onPress={handleContinue}>{t('cta')}</Button>
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
      <ConsentDialog authToken={authToken} onSubmit={handleConsentSubmit} open={showConsent} />
    </>
  );
};

export default DocSelection;
