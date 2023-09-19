import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { type CountryCode, SupportedIdDocTypes } from '@onefootprint/types';
import { InlineAlert } from '@onefootprint/ui';
import React from 'react';

import CollectedInformation from '@/playbooks/components/collected-information';

export type DataCollectionProps = {
  allowInternationalResidents: boolean;
  allowUsResidents: boolean;
  internationalCountryRestrictions: null | CountryCode[];
  isDocFirstFlow: boolean;
  mustCollectData: string[];
  optionalData?: string[];
};

const DataCollection = ({
  allowInternationalResidents,
  allowUsResidents,
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
  const documentsAsString = mustCollectData.filter(scopes =>
    scopes.includes('document'),
  )?.[0];
  const idDocKinds = Object.values(SupportedIdDocTypes).filter(docType =>
    documentsAsString?.includes(docType),
  );
  const selfie = documentsAsString?.includes('selfie');

  return (
    <Container>
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
            idDocKind: idDocKinds,
            selfie,
            usLegalStatus: mustCollectData.includes('us_legal_status'),
            ssn: {
              active: requiresSSN || optionalSSN,
              kind: mustCollectData.includes('ssn9') ? 'ssn9' : 'ssn4',
              optional: optionalSSN,
            },
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
      {isDocFirstFlow && (
        <InlineAlert variant="info">
          {t('data-collection.id-doc-first')}
        </InlineAlert>
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
