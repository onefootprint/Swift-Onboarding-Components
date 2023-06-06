import { CountryRecord, DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import { IcoIdGeneric40 } from '@onefootprint/icons';
import { CountryCode, IdDocType } from '@onefootprint/types';
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
import useDocumentOptions from './hooks/use-document-options';
import {
  getAvailableDocumentTypesByCountry,
  getDocumentTypeByCountry,
} from './utils/get-documents-by-country';

export type DocSelectionProps = {
  onSubmit: (countryCode: CountryCode, documentType: IdDocType) => void;
};

const DocSelection = ({ onSubmit }: DocSelectionProps) => {
  const { t } = useTranslation('components.scan.doc-selection');
  const [country, setCountry] = useState<CountryRecord>(DEFAULT_COUNTRY);
  const [availableTypes, setAvailableTypes] = useState<IdDocType[]>(
    getAvailableDocumentTypesByCountry(country),
  );
  const [documentType, setDocumentType] = useState<IdDocType>(
    getDocumentTypeByCountry(country),
  );
  const options = useDocumentOptions(availableTypes);

  const handleSubmit = () => {
    onSubmit(country.value, documentType);
  };

  const handleCountryChange = (newCountry: SelectOption<CountryRecord>) => {
    setCountry(newCountry);
    setAvailableTypes(getAvailableDocumentTypesByCountry(newCountry));
    setDocumentType(getDocumentTypeByCountry(newCountry));
  };

  return (
    <Container>
      <Box center marginBottom={7} marginTop={8}>
        <IcoIdGeneric40 />
        <Typography variant="heading-3">{t('title')}</Typography>
        <Typography variant="body-3">{t('subtitle')}</Typography>
      </Box>
      <Box justifyContent="space-between" flex={1}>
        <Box>
          <CountrySelect onChange={handleCountryChange} value={country} />
          <Divider marginVertical={7} />
          <RadioSelect<IdDocType>
            marginBottom={7}
            onChange={setDocumentType}
            options={options}
            value={documentType}
          />
        </Box>
        <PermissionsDialog>
          <Button onPress={handleSubmit}>{t('cta')}</Button>
        </PermissionsDialog>
      </Box>
    </Container>
  );
};

export default DocSelection;
