import CollectedInformation from '@/playbooks/components/collected-information';
import { AuthMethodKind, type OnboardingConfig } from '@onefootprint/types';
import { Box, Divider, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import AdditionalDocs from './components/additional-docs';
import Auth from './components/auth';
import GovDocs from './components/gov-docs';
import Section from './components/section';

export type DataCollectionProps = {
  playbook: OnboardingConfig;
};

const DataCollection = ({ playbook }: DataCollectionProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection' });
  const {
    kind,
    allowInternationalResidents,
    allowUsResidents,
    allowUsTerritoryResidents,
    internationalCountryRestrictions,
    mustCollectData,
    documentTypesAndCountries,
    optionalData = [],
    documentsToCollect = [],
    businessDocumentsToCollect = [],
    requiredAuthMethods,
  } = playbook;
  const requiresSSN = mustCollectData.includes('ssn9') || mustCollectData.includes('ssn4');
  const optionalSSN = optionalData.includes('ssn9') || optionalData.includes('ssn4');
  const hasInvestorProfile = mustCollectData.includes('investor_profile');
  const isKYB = kind === 'kyb';
  const isAuth = kind === 'auth';
  const hasAnyRequiredAuthMethods = !!requiredAuthMethods && requiredAuthMethods.length > 0;

  const kycOnlyPrimaryBusinessOwner = mustCollectData.includes('business_beneficial_owners');
  const kycAllBusinessOwners = mustCollectData.includes('business_kyced_beneficial_owners');
  const collectBoInfo = kycOnlyPrimaryBusinessOwner || kycAllBusinessOwners;

  if (isAuth) {
    return (
      <Auth
        requiredAuthMethods={requiredAuthMethods}
        mustCollectData={mustCollectData}
        allowUsTerritoryResidents={allowUsTerritoryResidents}
      />
    );
  }

  return (
    <Stack direction="column" gap={5}>
      {isKYB && (
        <Section title={t('kyb.business')} type="withBorders">
          <CollectedInformation
            title={t('kyb.basic_information')}
            options={{
              businessName: mustCollectData.includes('business_name'),
              businessAddress: mustCollectData.includes('business_address'),
              businessBeneficialOwners: collectBoInfo,
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
          <AdditionalDocs docs={businessDocumentsToCollect || []} />
        </Section>
      )}
      <Section title={isKYB ? t('kyb.business_beneficial_owners') : undefined} type={isKYB ? 'withBorders' : 'default'}>
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
          {hasAnyRequiredAuthMethods && (
            <CollectedInformation
              title={t('otp')}
              options={{
                phoneNumber: requiredAuthMethods?.includes(AuthMethodKind.phone),
                email: requiredAuthMethods?.includes(AuthMethodKind.email),
              }}
            />
          )}
          {allowUsResidents ? (
            <CollectedInformation
              title={t('us-residents.title')}
              options={{
                ssn: mustCollectData.includes('us_tax_id')
                  ? { active: true, kind: 'ssn9', optional: false }
                  : {
                      active: requiresSSN || optionalSSN,
                      kind: mustCollectData.includes('ssn9') || optionalData.includes('ssn9') ? 'ssn9' : 'ssn4',
                      optional: optionalSSN,
                    },
                usTaxIdAcceptable: mustCollectData.includes('us_tax_id'),
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
          {hasInvestorProfile && (
            <CollectedInformation title={t('investor_profile.title')} subtitle={t('investor_profile.subtitle')} />
          )}
          <GovDocs
            countrySpecific={documentTypesAndCountries?.countrySpecific || {}}
            global={documentTypesAndCountries?.global || []}
            hasSelfie={mustCollectData.includes('document_selfie')}
          />
          <AdditionalDocs docs={documentsToCollect || []} />
        </Stack>
      </Section>
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
