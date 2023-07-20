import { CountryRecord, DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import { IcoIdGeneric40 } from '@onefootprint/icons';
import { CountryCode, IdDocRequirement, IdDocType } from '@onefootprint/types';
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

import useTranslation from '@/hooks/use-translation';

import PermissionsDialog from './components/permissions-dialog';
import useCountryOptions from './hooks/use-country-options';
import useDocumentOptions from './hooks/use-document-options';
import { getDocTypeByCountry } from './utils/get-documents-by-country';

export type DocSelectionProps = {
  requirement: IdDocRequirement;
  defaultType: IdDocType;
  defaultCountry?: CountryRecord;
  onSubmit: (countryCode: CountryCode, docType: IdDocType) => void;
};

const DocSelection = ({
  requirement,
  defaultType,
  defaultCountry = DEFAULT_COUNTRY,
  onSubmit,
}: DocSelectionProps) => {
  const { t } = useTranslation('components.scan.doc-selection');
  const { onlyUsSupported, supportedDocumentTypes } = requirement;
  const [country, setCountry] = useState<CountryRecord>(defaultCountry);
  const docTypeOptions = useDocumentOptions(supportedDocumentTypes, country);
  const countryOptions = useCountryOptions(onlyUsSupported);
  const [docType, setDocType] = useState<IdDocType>(
    docTypeOptions[0].value ?? defaultType,
  );

  const handleSubmit = () => {
    onSubmit(country.value, docType);
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
        <Box>
          <CountrySelect
            disabled={!!onlyUsSupported}
            onChange={handleCountryChange}
            options={countryOptions}
            value={country}
          />
          <Divider marginVertical={7} />
          <RadioSelect<IdDocType>
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
