import type { CountryRecord } from '@onefootprint/global-constants';
import { COUNTRIES, DEFAULT_COUNTRY } from '@onefootprint/global-constants';
import { useRequestErrorToast } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import styled, { css } from '@onefootprint/styled';
import type { CountryCode, SubmitDocTypeResponse } from '@onefootprint/types';
import { SupportedIdDocTypes } from '@onefootprint/types/src/data/id-doc-type';
import type {
  CountrySelectOption,
  RadioSelectOptionFields,
} from '@onefootprint/ui';
import {
  Button,
  CountrySelect,
  Divider,
  RadioSelect,
  Typography,
} from '@onefootprint/ui';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useL10nContext } from '../../../../../components/l10n-provider';
import HeaderTitle from '../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../components/layout/components/navigation-header';
import StickyBottomBox from '../../../../../components/layout/components/sticky-bottom-box/sticky-bottom-box';
import Logger from '../../../../../utils/logger';
import ConsentMobile from '../../../components/id-doc-photo-prompt/components/consent-mobile';
import { useIdDocMachine } from '../../../components/machine-provider';
import { getCountryFromCode } from '../../../utils/get-country-from-code';
import useOptionsByDocType from '../hooks/use-options-by-doc-type';
import useSubmitDocType from '../hooks/use-submit-doc-type';
import detectWebcam from '../utils/detect-webcam';

type IdDocCountryAndTypeContainerProps = {
  onSubmitDocTypeSuccess: (
    data: SubmitDocTypeResponse,
    country: CountryRecord,
    docType: SupportedIdDocTypes,
  ) => void;
  onConsentSubmit: () => void;
};

const getDefaultCountry = (
  supportedCountries: Set<CountryCode>,
  supportedCountryRecords: CountryRecord[],
) => {
  let defaultCountry;
  if (supportedCountries.has('US')) {
    defaultCountry = getCountryFromCode('US');
  }

  if (!defaultCountry) [defaultCountry] = supportedCountryRecords;
  return defaultCountry;
};

const getRecordKeys = <T extends object>(object: T) =>
  Object.keys(object) as (keyof T)[];

const IdDocCountryAndTypeContainer = ({
  onSubmitDocTypeSuccess,
  onConsentSubmit,
}: IdDocCountryAndTypeContainerProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'id-doc.pages.country-and-type-selection',
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
    requirement: { shouldCollectConsent: consentRequired },
  } = state.context;
  const { country: defaultCountry, type: defaultType } = defaultCountryDoc;
  const supportedCountries = new Set(
    getRecordKeys(supportedCountryAndDocTypes),
  );
  const supportedCountryRecords = COUNTRIES.filter(country =>
    supportedCountries.has(country.value),
  );
  const defaultSupportedCountry = getDefaultCountry(
    supportedCountries,
    supportedCountryRecords,
  );
  const { type: deviceType } = device;

  const requestErrorToast = useRequestErrorToast();
  const [country, setCountry] = useState<CountryRecord>(
    getCountryFromCode(defaultCountry) ?? defaultSupportedCountry,
  );

  const types: SupportedIdDocTypes[] =
    supportedCountryAndDocTypes[country.value] ?? [];
  const firstTypeFromOptions = types.length
    ? types[0]
    : SupportedIdDocTypes.passport;
  const [docType, setDocType] = useState<SupportedIdDocTypes>(
    defaultType ?? firstTypeFromOptions,
  );

  const handleCountryChange = (option: CountrySelectOption) => {
    const nextCountry = getCountryFromCode(option.value);
    // Update both selected country and type
    if (nextCountry) {
      setCountry(nextCountry);
      const typesForNextCountry =
        supportedCountryAndDocTypes[nextCountry.value] ?? [];
      const nextType = typesForNextCountry.length
        ? typesForNextCountry[0]
        : SupportedIdDocTypes.passport;
      setDocType(nextType);
    }
  };

  const handleDocTypeChange = (value: string) => {
    setDocType(value as SupportedIdDocTypes);
  };

  const handleSubmit = async () => {
    const selectedCountry =
      getCountryFromCode(country.value)?.value ?? DEFAULT_COUNTRY.value;
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
        deviceType: deviceType === 'mobile' ? 'mobile' : 'desktop',
        skipSelfie: !hasWebcam,
      },
      {
        onSuccess: data => {
          if (consentRequired && device.type === 'mobile') {
            setConsentVisible(true);
          }
          onSubmitDocTypeSuccess(data, country, docType);
        },
        onError: err => {
          Logger.error(
            `Failed to submit doc type and country. Selected doctype: ${docType}, country ${selectedCountry}. Error: ${getErrorMessage(
              err,
            )}`,
            'id-doc-country-and-type-container',
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
    <Container data-mobile={device.type === 'mobile'}>
      <NavigationHeader
        leftButton={
          device.type !== 'mobile'
            ? { variant: 'close', confirmClose: true }
            : undefined
        }
      />
      <HeaderTitle title={t('title')} subtitle={t('subtitle')} />
      <InputsContainer>
        <CountrySelect
          data-private
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
          <Typography
            variant="body-4"
            sx={{ textAlign: 'center', marginLeft: 5, marginRight: 5 }}
          >
            {t('form.not-supported')}
          </Typography>
        )}
      </InputsContainer>
      <ConsentMobile
        open={consentVisible}
        onClose={handleConsentClose}
        onConsent={handleConsent}
      />
      {options.length > 0 && (
        <StickyBottomBox>
          <Button
            fullWidth
            onClick={handleSubmit}
            loading={isDocTypeSubmissionLoading}
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
