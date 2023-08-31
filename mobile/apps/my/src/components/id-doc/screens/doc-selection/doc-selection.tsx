import { CountryRecord, DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import styled, { css } from '@onefootprint/styled';
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
import { NativeScrollEvent } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import StickyFooter from '@/components/sticky-footer';
import { PREVIEW_AUTH_TOKEN } from '@/config/constants';
import useApp from '@/domains/idv/hooks/use-app';
import useTranslation from '@/hooks/use-translation';

import useSubmitDocType from '../doc-scan/hooks/use-submit-doc-type';
import PermissionsDialog from './components/permissions-dialog';
import useCountryOptions from './hooks/use-country-options';
import useDocumentOptions from './hooks/use-document-options';
import { getDocTypeByCountry } from './utils/get-documents-by-country';

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
  requirement,
  defaultType,
  defaultCountry = DEFAULT_COUNTRY,
  authToken,
  onSubmit,
}: DocSelectionProps) => {
  const { t } = useTranslation('components.scan.doc-selection');
  const app = useApp();
  const { supportedCountries, supportedDocumentTypes } = requirement;
  const [country, setCountry] = useState<CountryRecord>(defaultCountry);
  const docTypeOptions = useDocumentOptions(supportedDocumentTypes, country);
  const countryOptions = useCountryOptions(supportedCountries);
  const [docType, setDocType] = useState<SupportedIdDocTypes>(
    defaultType || docTypeOptions[0].value,
  );
  const docTypeMutation = useSubmitDocType();
  const isEndOfScroll = useSharedValue(false);
  const onlyOneCountrySupported = supportedCountries.length === 1;
  const countrySelectHint =
    onlyOneCountrySupported &&
    t('country-select.hint', { country: country.label });

  const handleScroll = (event: NativeScrollEvent, isEnd: boolean) => {
    isEndOfScroll.value = isEnd;
  };

  const handleCountryChange = (newCountry: SelectOption<CountryRecord>) => {
    setCountry(newCountry);
    setDocType(getDocTypeByCountry(newCountry));
  };

  const handleSubmit = () => {
    if (authToken === PREVIEW_AUTH_TOKEN) {
      onSubmit(country.value, docType, '12345');
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
            onSubmit(country.value, docType, response.id);
          },
        },
      );
    }
  };

  return (
    <>
      <StyledContainer scroll onScroll={handleScroll}>
        <Box center marginBottom={7}>
          <Typography variant="heading-3" marginTop={7} marginBottom={3}>
            {t('title')}
          </Typography>
          <Typography variant="body-2">{t('subtitle')}</Typography>
        </Box>
        <Box justifyContent="space-between" flex={1}>
          <Box>
            <CountrySelect
              disabled={onlyOneCountrySupported}
              hint={countrySelectHint}
              onChange={handleCountryChange}
              options={countryOptions}
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
        </Box>
      </StyledContainer>
      <StickyFooter isFixed={isEndOfScroll}>
        <PermissionsDialog onContinue={handleSubmit}>
          <Button onPress={handleSubmit}>{t('cta')}</Button>
        </PermissionsDialog>
      </StickyFooter>
    </>
  );
};

const StyledContainer = styled(Container)`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[4]};
    margin-top: -${theme.spacing[7]};
  `}
`;

export default DocSelection;
