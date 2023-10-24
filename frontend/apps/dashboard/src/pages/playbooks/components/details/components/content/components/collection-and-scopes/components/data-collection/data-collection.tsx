import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { type CountryCode, SupportedIdDocTypes } from '@onefootprint/types';
import { InlineAlert } from '@onefootprint/ui';
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
    <Container>
      {isKYB && (
        <CollectedInformation
          title={t('kyb.title')}
          options={{
            businessName: mustCollectData.includes('business_name'),
            businessAddress: mustCollectData.includes('business_address'),
            businessTin: mustCollectData.includes('business_tin'),
            businessOwnersKyc: mustCollectData.includes(
              'business_kyced_beneficial_owners',
            ),
          }}
        />
      )}
      <CollectedInformation
        title={t('basic-information')}
        options={{
          name: true,
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
      {isDocFirstFlow && (
        <InlineAlert variant="info">{t('id-doc-first')}</InlineAlert>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[8]};
  `}
`;

export default DataCollection;
