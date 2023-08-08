import { CountryRecord, DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import { IcoIdGeneric40 } from '@onefootprint/icons';
import {
  CountryCode,
  IdDocRequirement,
  SupportedIdDocTypes,
} from '@onefootprint/types';
import {
  Box,
  Button,
  Container,
  CountrySelect,
  Divider,
  RadioSelect,
  SelectOption,
  Typography,
} from '@onefootprint/ui';
import React, { useState } from 'react';

import { REVIEW_AUTH_TOKEN } from '@/config/constants';
import useApp from '@/domains/idv/hooks/use-app';
import useTranslation from '@/hooks/use-translation';

import ConsentDialog from '../doc-scan/components/selfie/components/consent-dialog';
import useSubmitDocType from '../doc-scan/hooks/use-submit-doc-type';
import PermissionsDialog from './components/permissions-dialog';
import useCountryOptions from './hooks/use-country-options';
import useDocumentOptions from './hooks/use-document-options';
import { getDocTypeByCountry } from './utils/get-documents-by-country';

export type DocSelectionProps = {
  requirement: IdDocRequirement;
  defaultType: SupportedIdDocTypes;
  defaultCountry?: CountryRecord;
  onSubmit: (
    countryCode: CountryCode,
    docType: SupportedIdDocTypes,
    docId: string,
  ) => void;
  authToken: string;
};

const DocSelection = ({
  requirement,
  defaultType,
  defaultCountry = DEFAULT_COUNTRY,
  authToken,
  onSubmit,
}: DocSelectionProps) => {
  const { t } = useTranslation('components.scan.doc-selection');
  const app = useApp();
  const { onlyUsSupported, supportedDocumentTypes, shouldCollectConsent } =
    requirement;
  const [country, setCountry] = useState<CountryRecord>(defaultCountry);
  const docTypeOptions = useDocumentOptions(supportedDocumentTypes, country);
  const countryOptions = useCountryOptions(onlyUsSupported);
  const [docType, setDocType] = useState<SupportedIdDocTypes>(
    docTypeOptions[0].value ?? defaultType,
  );
  const docTypeMutation = useSubmitDocType();
  const isAppStoreReview = authToken === REVIEW_AUTH_TOKEN;

  const handleSubmit = () => {
    docTypeMutation.mutate(
      {
        authToken,
        documentType: docType,
        countryCode: country.value,
        fixtureResult: app?.sandboxIdDocOutcome,
      },
      {
        onSuccess(response) {
          onSubmit(country.value, docType, response.id);
        },
      },
    );
  };

  const handleCountryChange = (newCountry: SelectOption<CountryRecord>) => {
    setCountry(newCountry);
    setDocType(getDocTypeByCountry(newCountry));
  };

  return (
    <Container>
      <Box center marginBottom={7} marginTop={3}>
        <IcoIdGeneric40 />
        <Typography variant="heading-3" marginTop={7} marginBottom={3}>
          {t('title')}
        </Typography>
        <Typography variant="body-2">{t('subtitle')}</Typography>
      </Box>
      <Box justifyContent="space-between" flex={1}>
        {shouldCollectConsent && !isAppStoreReview && (
          <ConsentDialog authToken={authToken} />
        )}
        <Box>
          <CountrySelect
            options={countryOptions}
            disabled={!!onlyUsSupported}
            onChange={handleCountryChange}
            value={country}
          />

          <Divider marginVertical={7} />
          <RadioSelect<SupportedIdDocTypes>
            marginBottom={7}
            onChange={setDocType}
            options={docTypeOptions}
            value={docType}
          />
        </Box>
        <PermissionsDialog onContinue={handleSubmit}>
          <Button onPress={handleSubmit}>{t('cta')}</Button>
        </PermissionsDialog>
      </Box>
    </Container>
  );
};

export default DocSelection;
