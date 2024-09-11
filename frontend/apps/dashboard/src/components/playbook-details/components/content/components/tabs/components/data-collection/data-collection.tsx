import CollectedInformation from '@/playbooks/components/collected-information';
import { AuthMethodKind, type OnboardingConfig } from '@onefootprint/types';
import { Box, Divider, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import AdditionalDocs from '../../../additional-docs';
import CountrySpecific from '../../../country-specific';
import Global from '../../../global';
import Section from './components/section';
import SingleItem from './components/single-item';

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
  const hasAnyRequiredAuthMethods = !!requiredAuthMethods && requiredAuthMethods.length > 0;
  const hasBusinessDocumentsToCollect = !!businessDocumentsToCollect && businessDocumentsToCollect.length > 0;
  const hasKYCDocsToCollect = !!documentsToCollect && documentsToCollect.length > 0;

  const kycOnlyPrimaryBusinessOwner = mustCollectData.includes('business_beneficial_owners');
  const kycAllBusinessOwners = mustCollectData.includes('business_kyced_beneficial_owners');
  const collectBoInfo = kycOnlyPrimaryBusinessOwner || kycAllBusinessOwners;

  return (
    <Stack direction="column" gap={5}>
      {isKYB && (
        <Section title={t('kyb.business')} variant="withDivider">
          <Stack direction="column" gap={8}>
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
            {hasBusinessDocumentsToCollect && <AdditionalDocs docs={businessDocumentsToCollect} />}
          </Stack>
        </Section>
      )}
      <Section
        title={isKYB ? t('kyb.business_beneficial_owners') : undefined}
        variant={isKYB ? 'withDivider' : 'default'}
      >
        <Stack direction="column" gap={8}>
          <CollectedInformation
            title={t('sign-up-information')}
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
            <SingleItem name="usResidents" value={false} />
          )}
          <SingleItem name="nonUSResidents" value={allowInternationalResidents} />
          {hasInvestorProfile && <SingleItem name="investorProfile" value={hasInvestorProfile} />}
          {documentTypesAndCountries?.global && (
            <Global
              global={documentTypesAndCountries.global}
              hasSelfie={mustCollectData.includes('document_and_selfie')}
            />
          )}
          {documentTypesAndCountries?.countrySpecific && (
            <CountrySpecific
              countrySpecific={documentTypesAndCountries.countrySpecific}
              hasSelfie={mustCollectData.includes('document_and_selfie')}
            />
          )}
          {hasKYCDocsToCollect && <AdditionalDocs docs={documentsToCollect} />}
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
