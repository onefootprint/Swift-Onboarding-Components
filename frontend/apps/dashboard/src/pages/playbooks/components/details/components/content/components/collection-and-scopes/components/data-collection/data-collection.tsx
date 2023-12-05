import { useTranslation } from '@onefootprint/hooks';
import { type CountryCode, SupportedIdDocTypes } from '@onefootprint/types';
import { InlineAlert, Stack, Typography } from '@onefootprint/ui';
import React from 'react';

import CollectedInformation from '@/playbooks/components/collected-information';

export type DataCollectionProps = {
  allowInternationalResidents: boolean;
  allowUsResidents: boolean;
  docScanForOptionalSsn?: string;
  internationalCountryRestrictions: null | CountryCode[];
  isDocFirstFlow: boolean;
  mustCollectData: string[];
  optionalData?: string[];
};

const DataCollection = ({
  allowInternationalResidents,
  allowUsResidents,
  docScanForOptionalSsn,
  internationalCountryRestrictions,
  isDocFirstFlow,
  mustCollectData,
  optionalData = [],
}: DataCollectionProps) => {
  const { t } = useTranslation('pages.playbooks.details.data-collection');
  const requiresSSN =
    mustCollectData.includes('ssn9') || mustCollectData.includes('ssn4');
  const optionalSSN =
    optionalData.includes('ssn9') || optionalData.includes('ssn4');
  const documentsAsString =
    docScanForOptionalSsn ||
    mustCollectData.filter(scopes => scopes.includes('document'))?.[0];
  const idDocKinds = Object.values(SupportedIdDocTypes).filter(
    docType => documentsAsString?.includes(docType),
  );
  const selfie = !!documentsAsString?.includes('selfie');
  const hasInvestorProfile = mustCollectData.includes('investor_profile');
  const isKYB = mustCollectData.includes(
    'business_name' ||
      'business_address' ||
      'business_tin' ||
      'business_kyced_beneficial_owners' ||
      'business_tin',
  );

  return (
    <Stack direction="column" gap={8}>
      {isKYB && (
        <Stack direction="column" gap={7}>
          <Typography variant="label-3" color="secondary">
            {t('kyb.business')}
          </Typography>
          <Stack direction="column" gap={5}>
            <CollectedInformation
              title={t('kyb.basic_information')}
              options={{
                businessName: mustCollectData.includes('business_name'),
                businessAddress: mustCollectData.includes('business_address'),
                businessBeneficialOwners: mustCollectData.includes(
                  'business_beneficial_owners',
                ),
                businessTin: mustCollectData.includes('business_tin'),
              }}
            />
            <CollectedInformation
              title={t('kyb.other')}
              options={{
                businessPhoneNumber: mustCollectData.includes(
                  'business_phone_number',
                ),
                businessWebsite: mustCollectData.includes('business_website'),
                businessType: mustCollectData.includes(
                  'business_corporation_type',
                ),
              }}
            />
          </Stack>
        </Stack>
      )}
      <Stack direction="column" gap={7}>
        {isKYB && (
          <Typography variant="label-3" color="secondary">
            {t('kyb.business_beneficial_owners')}
          </Typography>
        )}
        <Stack direction="column" gap={5}>
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
                  kind: mustCollectData.includes('ssn9') ? 'ssn9' : 'ssn4',
                  optional: optionalSSN,
                },
                usLegalStatus: mustCollectData.includes('us_legal_status'),
                idDocKind: idDocKinds,
                selfie,
                ssnDocScanStepUp: !!docScanForOptionalSsn,
              }}
            />
          ) : (
            <CollectedInformation
              title={t('us-residents.title')}
              subtitle={t('us-residents.empty')}
            />
          )}
          {allowInternationalResidents ? (
            <CollectedInformation
              title={t('non-us-residents.title')}
              options={{
                internationalCountryRestrictions,
                idDocKind: [SupportedIdDocTypes.passport],
                selfie: true,
              }}
            />
          ) : (
            <CollectedInformation
              title={t('non-us-residents.title')}
              subtitle={t('non-us-residents.empty')}
            />
          )}

          {hasInvestorProfile && (
            <CollectedInformation
              title={t('investor_profile.title')}
              subtitle={t('investor_profile.subtitle')}
            />
          )}
        </Stack>
      </Stack>
      {isDocFirstFlow && (
        <InlineAlert variant="info">{t('id-doc-first')}</InlineAlert>
      )}
    </Stack>
  );
};

export default DataCollection;
