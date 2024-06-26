import { type OnboardingConfig } from '@onefootprint/types';
import { Box, Divider, InlineAlert, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

import CollectedInformation from '@/playbooks/components/collected-information';

export type DataCollectionProps = {
  playbook: OnboardingConfig;
};

const DataCollection = ({
  playbook: {
    allowInternationalResidents,
    allowUsResidents,
    allowUsTerritoryResidents,
    internationalCountryRestrictions,
    isDocFirstFlow,
    mustCollectData,
    documentTypesAndCountries,
    optionalData = [],
  },
}: DataCollectionProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details.data-collection',
  });
  const requiresSSN = mustCollectData.includes('ssn9') || mustCollectData.includes('ssn4');
  const optionalSSN = optionalData.includes('ssn9') || optionalData.includes('ssn4');
  const documentsAsString = mustCollectData.filter(scopes => scopes.includes('document'))?.[0];
  const selfie = !!documentsAsString?.includes('selfie');
  const hasInvestorProfile = mustCollectData.includes('investor_profile');
  const isKYB = mustCollectData.includes(
    'business_name' || 'business_address' || 'business_tin' || 'business_kyced_beneficial_owners' || 'business_tin',
  );
  const showIdDocScan = mustCollectData.some(
    scope => scope.includes('document'), // to make it backwards compatible; new playbooks will have 'document' or "document_and_selfie"
  );
  const idDocKind = documentTypesAndCountries?.global;
  const countrySpecificIdDocKind = documentTypesAndCountries?.countrySpecific;

  return (
    <Stack direction="column">
      {isKYB && (
        <Stack direction="column" gap={7}>
          <Text variant="label-3" color="secondary">
            {t('kyb.business')}
          </Text>
          <Stack direction="column" gap={7}>
            <CollectedInformation
              title={t('kyb.basic_information')}
              options={{
                businessName: mustCollectData.includes('business_name'),
                businessAddress: mustCollectData.includes('business_address'),
                businessBeneficialOwners: mustCollectData.includes('business_beneficial_owners'),
                businessTin: mustCollectData.includes('business_tin'),
              }}
            />
            <CollectedInformation
              title={t('kyb.other')}
              options={{
                businessPhoneNumber: mustCollectData.includes('business_phone_number'),
                businessWebsite: mustCollectData.includes('business_website'),
                businessType: mustCollectData.includes('business_corporation_type'),
              }}
            />
          </Stack>
        </Stack>
      )}
      <Stack direction="column" gap={7}>
        {isKYB && (
          <Text variant="label-3" color="secondary" marginTop={9}>
            {t('kyb.business_beneficial_owners')}
          </Text>
        )}
        <Stack direction="column" gap={7}>
          <CollectedInformation
            title={t('basic-information')}
            options={{
              name: mustCollectData.includes('name'),
              email: mustCollectData.includes('email'),
              phoneNumber: mustCollectData.includes('phone_number'),
              dob: mustCollectData.includes('dob'),
              fullAddress: mustCollectData.includes('full_address'),
            }}
          />
          {allowUsResidents ? (
            <CollectedInformation
              title={t('us-residents.title')}
              options={{
                ssn: {
                  active: requiresSSN || optionalSSN,
                  kind: mustCollectData.includes('ssn9') || optionalData.includes('ssn9') ? 'ssn9' : 'ssn4',
                  optional: optionalSSN,
                },
                usLegalStatus: mustCollectData.includes('us_legal_status'),
              }}
            />
          ) : (
            <CollectedInformation title={t('us-residents.title')} subtitle={t('us-residents.empty')} />
          )}
          {allowInternationalResidents ? (
            <CollectedInformation
              title={t('non-us-residents.title')}
              options={{
                internationalCountryRestrictions,
              }}
            />
          ) : (
            <CollectedInformation title={t('non-us-residents.title')} subtitle={t('non-us-residents.empty')} />
          )}
          {showIdDocScan && (
            <CollectedInformation
              title={t('id-doc.title')}
              options={{
                idDocKind,
                selfie,
                countrySpecificIdDocKind,
              }}
            />
          )}

          {hasInvestorProfile && (
            <CollectedInformation title={t('investor_profile.title')} subtitle={t('investor_profile.subtitle')} />
          )}
        </Stack>
      </Stack>
      {isDocFirstFlow && <InlineAlert variant="info">{t('id-doc-first')}</InlineAlert>}
      {allowUsTerritoryResidents && (
        <footer>
          <Box marginTop={5} marginBottom={5}>
            <Divider variant="secondary" />
          </Box>
          <Text variant="label-3" color="primary">
            {t('us-territories.label')}{' '}
            <Text variant="label-3" color="tertiary" tag="span">
              {t('us-territories.content')}
            </Text>
          </Text>
        </footer>
      )}
    </Stack>
  );
};

export default DataCollection;
