import { useTranslation } from '@onefootprint/hooks';
import {
  IcoBuilding24,
  IcoCake24,
  IcoCar24,
  IcoEmail24,
  IcoFileText24,
  IcoIdCard24,
  IcoPassport24,
  IcoPhone24,
  IcoUserCircle24,
} from '@onefootprint/icons';
import { CollectedKycDataOption, IdScanDocType } from '@onefootprint/types';
import {
  FootprintButton,
  LoadingIndicator,
  Typography,
  useToast,
} from '@onefootprint/ui';
import { useIsMutating } from '@tanstack/react-query';
import {
  HeaderTitle,
  NavigationHeader,
  useGetOnboardingStatus,
  useOnboardingAuthorize,
} from 'footprint-elements';
import React, { useState } from 'react';
import useOnboardingMachine from 'src/hooks/use-onboarding-machine';
import { Events } from 'src/utils/state-machine/onboarding/types';
import styled, { css } from 'styled-components';

const IconByCollectedKycDataOption: Record<
  CollectedKycDataOption,
  JSX.Element
> = {
  [CollectedKycDataOption.name]: <IcoUserCircle24 />,
  [CollectedKycDataOption.email]: <IcoEmail24 />,
  [CollectedKycDataOption.phoneNumber]: <IcoPhone24 />,
  [CollectedKycDataOption.ssn4]: <IcoFileText24 />,
  [CollectedKycDataOption.ssn9]: <IcoFileText24 />,
  [CollectedKycDataOption.dob]: <IcoCake24 />,
  [CollectedKycDataOption.fullAddress]: <IcoBuilding24 />,
  [CollectedKycDataOption.partialAddress]: <IcoBuilding24 />,
};

const IconByIdDocType: Record<IdScanDocType, JSX.Element> = {
  [IdScanDocType.idCard]: <IcoIdCard24 />,
  [IdScanDocType.driversLicense]: <IcoCar24 />,
  [IdScanDocType.passport]: <IcoPassport24 />,
};

const Authorize = () => {
  const onboardingAuthorizeMutation = useOnboardingAuthorize();
  const toast = useToast();
  const { t } = useTranslation('pages.authorize');
  const isMutating = useIsMutating();
  const [state, send] = useOnboardingMachine();
  const [collectedDocs, setCollectedDocs] = useState<IdScanDocType[]>();
  const {
    authToken,
    tenant: { pk: tenantPk },
  } = state.context;

  const statusQuery = useGetOnboardingStatus(authToken, tenantPk, {
    onSuccess: ({ fieldsToAuthorize }) => {
      setCollectedDocs(fieldsToAuthorize?.identityDocumentType ?? []);
    },
  });

  if (statusQuery.isLoading) {
    return (
      <Container>
        <LoadingIndicator />
      </Container>
    );
  }

  const handleClick = () => {
    onboardingAuthorizeMutation.mutate(
      { authToken, tenantPk },
      {
        onSuccess: ({ validationToken }) => {
          send({
            type: Events.authorized,
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

  const { canAccessData } = state.context.tenant;
  const requiredCategories = canAccessData;

  const collectedKycDataOptionLabels: Record<CollectedKycDataOption, string> = {
    [CollectedKycDataOption.name]: t('data-labels.name'),
    [CollectedKycDataOption.email]: t('data-labels.email'),
    [CollectedKycDataOption.phoneNumber]: t('data-labels.phone'),
    [CollectedKycDataOption.ssn4]: t('data-labels.ssn4'),
    [CollectedKycDataOption.ssn9]: t('data-labels.ssn9'),
    [CollectedKycDataOption.dob]: t('data-labels.dob'),
    [CollectedKycDataOption.fullAddress]: t('data-labels.address-full'),
    [CollectedKycDataOption.partialAddress]: t('data-labels.address-partial'),
  };

  const docTypeLabels: Record<IdScanDocType, string> = {
    [IdScanDocType.idCard]: t('data-labels.id-card'),
    [IdScanDocType.driversLicense]: t('data-labels.passport'),
    [IdScanDocType.passport]: t('data-labels.driversLicense'),
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle
          title={t('title')}
          subtitle={t('subtitle', { tenantName: state.context.tenant.name })}
        />
        <CategoriesContainer>
          {requiredCategories.map((kycDataOpt: CollectedKycDataOption) => (
            <Category key={kycDataOpt}>
              <IconContainer>
                {IconByCollectedKycDataOption[kycDataOpt]}
              </IconContainer>
              <Typography variant="label-3">
                {collectedKycDataOptionLabels[kycDataOpt]}
              </Typography>
            </Category>
          ))}
          {collectedDocs?.map((collectedDoc: IdScanDocType) => (
            <Category key={collectedDoc}>
              <IconContainer>{IconByIdDocType[collectedDoc]}</IconContainer>
              <Typography variant="label-3">
                {docTypeLabels[collectedDoc]}
              </Typography>
            </Category>
          ))}
        </CategoriesContainer>
        <FootprintButton
          fullWidth
          loading={isMutating > 0}
          onClick={handleClick}
          text={t('cta')}
        />
      </Container>
    </>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[8]};
    justify-content: center;
    align-items: center;
  `}
`;

const IconContainer = styled.span`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[2]};
  `}
`;

const Category = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: left;
    align-items: center;
    margin-bottom: ${theme.spacing[3]};
  `}
`;

const CategoriesContainer = styled.div`
  ${({ theme }) => css`
    column-count: 2;
    width: 100%;
    margin-bottom: -${theme.spacing[3]};
  `}
`;

export default Authorize;
