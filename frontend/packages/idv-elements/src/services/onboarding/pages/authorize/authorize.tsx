import { useTranslation } from '@onefootprint/hooks';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  IdDocType,
} from '@onefootprint/types';
import { Divider, useToast } from '@onefootprint/ui';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

import HeaderTitle from '../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../components/layout/components/navigation-header';
import { useOnboardingMachine } from '../../components/machine-provider';
import {
  isDocCdo,
  isInvestorProfileCdo,
  isKybCdo,
  isKycCdo,
} from '../../utils/cdo-utils';
import Button from './components/button/button';
import KybFields from './components/kyb-fields';
import KycFields from './components/kyc-fields';
import Loading from './components/loading';
import useGetOnboardingStatus from './hooks/use-get-onboarding-status';
import useOnboardingAuthorize from './hooks/use-onboarding-authorize';

const Authorize = () => {
  const { t } = useTranslation('pages.authorize');
  const [state, send] = useOnboardingMachine();
  const { authToken, config } = state.context;
  const onboardingAuthorizeMutation = useOnboardingAuthorize();
  const toast = useToast();
  const [collectedIdDocTypes, setCollectedIdDocTypes] = useState<IdDocType[]>(
    [],
  );

  const statusQuery = useGetOnboardingStatus(authToken, {
    onSuccess: ({ fieldsToAuthorize }) => {
      setCollectedIdDocTypes(fieldsToAuthorize?.identityDocumentTypes ?? []);
    },
  });

  if (!config) {
    return null;
  }

  const { orgName: tenantName, canAccessData } = config;
  const kycData = canAccessData.filter(
    data => isKycCdo(data) || isDocCdo(data) || isInvestorProfileCdo(data),
  ) as (
    | CollectedKycDataOption
    | CollectedDocumentDataOption
    | CollectedInvestorProfileDataOption
  )[];
  const kybData = canAccessData.filter(data =>
    isKybCdo(data),
  ) as CollectedKybDataOption[];
  const hasBothSections = kycData.length > 0 && kybData.length > 0;

  if (statusQuery.isLoading) {
    return <Loading />;
  }

  const handleClick = () => {
    onboardingAuthorizeMutation.mutate(
      { authToken },
      {
        onSuccess: ({ validationToken }) => {
          send({
            type: 'authorized',
            payload: {
              validationToken,
            },
          });
        },
        onError() {
          toast.show({
            title: t('onboarding-complete-error.title'),
            description: t('onboarding-complete-error.description'),
            variant: 'error',
          });
        },
      },
    );
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle
          title={t('title')}
          subtitle={t('subtitle', { tenantName })}
        />
        <KycFields
          showTitle={hasBothSections}
          data={kycData}
          documentTypes={collectedIdDocTypes}
        />
        {hasBothSections && <Divider />}
        <KybFields showTitle={hasBothSections} data={kybData} />
        <Button
          isLoading={onboardingAuthorizeMutation.isLoading}
          onClick={handleClick}
        />
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[7]};
    justify-content: center;
    align-items: center;
    min-height: var(--loading-container-min-height);
  `}
`;

export default Authorize;
