import { Logger } from '@onefootprint/dev-tools';
import { useTranslation } from '@onefootprint/hooks';
import { getErrorMessage } from '@onefootprint/request';
import styled, { css } from '@onefootprint/styled';
import type {
  CollectedDocumentDataOption,
  CollectedInvestorProfileDataOption,
  CollectedKybDataOption,
  CollectedKycDataOption,
} from '@onefootprint/types';
import { getRequirement, OnboardingRequirementKind } from '@onefootprint/types';
import { Divider, useToast } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../../../components/layout/components/header-title';
import NavigationHeader from '../../../../../../components/layout/components/navigation-header';
import Error from '../../../../components/error';
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

    if (processMutation.isLoading) {
      return;
    }

    processMutation.mutate(
      { authToken },
      {
        onSuccess: onDone,
        onError: (error: unknown) => {
          console.error(
            'Error while processing onboarding on authorize page',
            getErrorMessage(error),
          );
          Logger.error(
            `Error while processing onboarding on authorize page: ${getErrorMessage(
              error,
            )}`,
            'onboarding-authorize',
          );
        },
      },
    );
  };

  const handleClick = () => {
    if (onboardingAuthorizeMutation.isLoading) {
      return;
    }

    onboardingAuthorizeMutation.mutate(
      { authToken },
      {
        onSuccess: handleAuthorizeSuccess,
        onError: (error: unknown) => {
          console.error(
            'Error while authorizing onboarding on authorize page',
            getErrorMessage(error),
          );
          Logger.error(
            `Error while authorizing onboarding on authorize page: ${getErrorMessage(
              error,
            )}`,
            'onboarding-authorize',
          );
          toast.show({
            title: t('onboarding-complete-error.title'),
            description: t('onboarding-complete-error.description'),
            variant: 'error',
          });
        },
      },
    );
  };

  return isError ? (
    <Error />
  ) : (
    <Container>
      <NavigationHeader leftButton={{ variant: 'close', confirmClose: true }} />
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
    </Container>
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
