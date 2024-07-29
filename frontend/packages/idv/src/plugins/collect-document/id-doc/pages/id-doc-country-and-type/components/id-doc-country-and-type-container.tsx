import type { CountryRecord } from '@onefootprint/global-constants';
import { COUNTRIES, DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import { getErrorMessage } from '@onefootprint/request';
import type { CountryCode, SubmitDocTypeResponse } from '@onefootprint/types';
import { SupportedIdDocTypes } from '@onefootprint/types/src/data/id-doc-type';
import type { CountrySelectOption, RadioSelectOptionFields } from '@onefootprint/ui';
import { Button, CountrySelect, Divider, RadioSelect, Text } from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import { useL10nContext } from '../../../../../../components/l10n-provider';
import HeaderTitle from '../../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../../components/layout/components/navigation-header';
import StickyBottomBox from '../../../../../../components/layout/components/sticky-bottom-box/sticky-bottom-box';
import { useIdvRequestErrorToast } from '../../../../../../hooks';
import { getLogger } from '../../../../../../utils/logger';
import useSubmitDocType from '../../../../hooks/use-submit-doc-type';
import { isMobileKind } from '../../../../utils/capture';
import { getCountryFromCode, getDefaultCountry } from '../../../../utils/get-country-from-code';
import { useIdDocMachine } from '../../../components/machine-provider';
import detectWebcam from '../../../utils/detect-webcam';
import useOptionsByDocType from '../hooks/use-options-by-doc-type';
import ConsentMobile from './components/consent-mobile';

type IdDocCountryAndTypeContainerProps = {
  onSubmitDocTypeSuccess: (data: SubmitDocTypeResponse, country: CountryRecord, docType: SupportedIdDocTypes) => void;
  onConsentSubmit: () => void;
};

const { logError } = getLogger({ location: 'id-doc-country-and-type-container' });

const getRecordKeys = <T extends object>(object: T) => Object.keys(object) as (keyof T)[];

const IdDocCountryAndTypeContainer = ({
  onSubmitDocTypeSuccess,
  onConsentSubmit,
}: IdDocCountryAndTypeContainerProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'document-flow.id-doc.pages.country-and-type-selection',
  });
  const [state] = useIdDocMachine();
  const submitDocTypeMutation = useSubmitDocType();
  const { isLoading: isDocTypeSubmissionLoading } = submitDocTypeMutation;
  const [consentVisible, setConsentVisible] = useState(false);
  const l10n = useL10nContext();
  const {
    idDoc: defaultCountryDoc,
    authToken,
    sandboxOutcome,
    device,
    supportedCountryAndDocTypes,
    isConsentMissing,
    documentRequestId,
  } = state.context;
  const { country: defaultCountry, type: defaultType } = defaultCountryDoc;
  const supportedCountries = new Set(getRecordKeys(supportedCountryAndDocTypes));
  const supportedCountryRecords = COUNTRIES.filter(country => supportedCountries.has(country.value));
  const defaultSupportedCountry = getDefaultCountry(supportedCountries, supportedCountryRecords);
  const { type: deviceType } = device;

  const requestErrorToast = useIdvRequestErrorToast();
  const [country, setCountry] = useState<CountryRecord>(getCountryFromCode(defaultCountry) ?? defaultSupportedCountry);

  const types: SupportedIdDocTypes[] = supportedCountryAndDocTypes[country.value] ?? [];
  const firstTypeFromOptions = types.length ? types[0] : SupportedIdDocTypes.passport;
  const [docType, setDocType] = useState<SupportedIdDocTypes>(defaultType ?? firstTypeFromOptions);

  const handleCountryChange = (option: CountrySelectOption) => {
    const nextCountry = getCountryFromCode(option.value);
    // Update both selected country and type
    if (nextCountry) {
      setCountry(nextCountry);
      const typesForNextCountry = supportedCountryAndDocTypes[nextCountry.value as CountryCode] ?? [];
      const nextType = typesForNextCountry.length ? typesForNextCountry[0] : SupportedIdDocTypes.passport;
      setDocType(nextType);
    }
  };

  const handleDocTypeChange = (value: string) => {
    setDocType(value as SupportedIdDocTypes);
  };

  const handleSubmit = async () => {
    const selectedCountry = getCountryFromCode(country.value)?.value ?? DEFAULT_COUNTRY.value;
    const hasWebcam = await detectWebcam();
    if (submitDocTypeMutation.isLoading) {
      return;
    }

    submitDocTypeMutation.mutate(
      {
        authToken,
        documentType: docType,
        countryCode: selectedCountry,
        fixtureResult: sandboxOutcome,
        deviceType: isMobileKind(deviceType) ? 'mobile' : 'desktop',
        skipSelfie: !hasWebcam,
        requestId: documentRequestId,
      },
      {
        onSuccess: data => {
          if (isConsentMissing && isMobileKind(device.type)) {
            setConsentVisible(true);
          }
          onSubmitDocTypeSuccess(data, country, docType);
        },
        onError: err => {
          logError(
            `Failed to submit doc type and country. Selected doctype: ${docType}, country ${selectedCountry}. Error: ${getErrorMessage(err)}`,
            err,
          );
          requestErrorToast(err);
        },
      },
    );
  };

  const handleConsentClose = () => {
    setConsentVisible(false);
  };

  const handleConsent = () => {
    onConsentSubmit();
  };

  const optionsByDocType = useOptionsByDocType(types);

  // We only show the doc types supported by both the country and onboarding config
  const options: RadioSelectOptionFields[] = types
    .map(type => optionsByDocType[type])
    .filter((option): option is RadioSelectOptionFields => !!option);

  return (
    <Container data-mobile={isMobileKind(device.type)}>
      <NavigationHeader
        leftButton={!isMobileKind(device.type) ? { variant: 'close', confirmClose: true } : undefined}
      />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <InputsContainer>
        <CountrySelect
          data-dd-privacy="mask"
          disabled={supportedCountryRecords.length <= 1}
          label={t('form.country')}
          onChange={handleCountryChange}
          options={supportedCountryRecords}
          value={country}
          hint={
            supportedCountryRecords.length === 1
              ? t('form.hint.label', {
                  country: country.label,
                })
              : undefined
          }
          testID="country-selector"
          locale={l10n?.locale}
        />
        <Divider />
        {options.length > 0 ? (
          <RadioSelect
            value={optionsByDocType[docType]?.value}
            options={options}
            onChange={handleDocTypeChange}
            testID="doc-selector"
            size="compact"
          />
        ) : (
          <Text variant="body-4" textAlign="center" marginLeft={5} marginRight={5}>
            {t('form.not-supported')}
          </Text>
        )}
      </InputsContainer>
      <ConsentMobile open={consentVisible} onClose={handleConsentClose} onConsent={handleConsent} />
      {options.length > 0 && (
        <StickyBottomBox>
          <Button
            fullWidth
            onClick={handleSubmit}
            loading={isDocTypeSubmissionLoading}
            size="large"
            data-dd-action-name="country-doc:continue"
          >
            {t('form.cta')}
          </Button>
        </StickyBottomBox>
      )}
    </Container>
  );
};

const InputsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[5]};
    justify-content: center;
    align-items: center;
    width: 100%;

    > div {
      width: 100%;
    }
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    justify-content: center;
    align-items: center;

    &[data-mobile='true'] {
      margin-top: calc(-1 * ${theme.spacing[5]});
    }
  `}
`;

export default IdDocCountryAndTypeContainer;
