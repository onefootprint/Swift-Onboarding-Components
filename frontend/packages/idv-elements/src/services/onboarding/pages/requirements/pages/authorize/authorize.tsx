import { useTranslation } from '@onefootprint/hooks';
import { IcoForbid40 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
  getRequirement,
  OnboardingRequirementKind,
} from '@onefootprint/types';
import { Divider, Typography, useToast } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../../components/layout/components/navigation-header';
import {
  isDocCdo,
  isInvestorProfileCdo,
  isKybCdo,
  isKycCdo,
} from '../../../../utils/cdo-utils';
import { useOnboardingRequirementsMachine } from '../../components/machine-provider';
import useOnboardingProcess from '../../hooks/use-onboarding-process';
import Button from './components/button';
import KybFields from './components/kyb-fields';
import KycFields from './components/kyc-fields';
import useOnboardingAuthorize from './hooks/use-onboarding-authorize';

export type AuthorizeProps = {
  onDone: () => void;
};

const Authorize = ({ onDone }: AuthorizeProps) => {
  const { t } = useTranslation('pages.authorize');
  const [state] = useOnboardingRequirementsMachine();
  const {
    onboardingContext: { authToken, config },
    requirements,
  } = state.context;
  const authorizeRequirement = getRequirement(
    requirements,
    OnboardingRequirementKind.authorize,
  );
  const processRequirement = getRequirement(
    requirements,
    OnboardingRequirementKind.process,
  );
  const onboardingAuthorizeMutation = useOnboardingAuthorize();
  const processMutation = useOnboardingProcess();
  const isLoading =
    onboardingAuthorizeMutation.isLoading || processMutation.isLoading;
  const isError =
    onboardingAuthorizeMutation.isError || processMutation.isError;
  const toast = useToast();

  if (!authorizeRequirement) {
    return null;
  }

  const { collectedData, documentTypes } =
    authorizeRequirement.fieldsToAuthorize;
  const { orgName: tenantName } = config;
  const kycData = collectedData.filter(
    data => isKycCdo(data) || isDocCdo(data) || isInvestorProfileCdo(data),
  ) as (
    | CollectedKycDataOption
    | CollectedDocumentDataOption
    | CollectedInvestorProfileDataOption
  )[];

  const kybData = collectedData.filter(data =>
    isKybCdo(data),
  ) as CollectedKybDataOption[];
  const hasBothSections = kycData.length > 0 && kybData.length > 0;

  const handleAuthorizeSuccess = () => {
    if (!processRequirement) {
      onDone();
      return;
    }
    processMutation.mutate(
      { authToken },
      {
        onSuccess: onDone,
      },
    );
  };

  const handleClick = () => {
    onboardingAuthorizeMutation.mutate(
      { authToken },
      {
        onSuccess: handleAuthorizeSuccess,
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
        {isError ? (
          <>
            <TitleContainer>
              <IcoForbid40 color="error" />
              <Typography variant="heading-3">{t('error.title')}</Typography>
            </TitleContainer>
            <Typography variant="body-2">{t('error.description')}</Typography>
          </>
        ) : (
          <>
            <HeaderTitle
              title={t('title')}
              subtitle={t('subtitle', { tenantName })}
            />
            <KycFields
              showTitle={hasBothSections}
              data={kycData}
              documentTypes={documentTypes}
            />
            {hasBothSections && <Divider />}
            <KybFields showTitle={hasBothSections} data={kybData} />
            <Button isLoading={isLoading} onClick={handleClick} />
          </>
        )}
      </Container>
    </>
  );
};

const TitleContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[2]};
    justify-content: center;
  `}
`;

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
