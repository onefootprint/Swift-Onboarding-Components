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
import { CollectedDataOption, IdScanDocType } from '@onefootprint/types';
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

const IconByCollectedDataOption: Record<CollectedDataOption, JSX.Element> = {
  [CollectedDataOption.name]: <IcoUserCircle24 />,
  [CollectedDataOption.email]: <IcoEmail24 />,
  [CollectedDataOption.phoneNumber]: <IcoPhone24 />,
  [CollectedDataOption.ssn4]: <IcoFileText24 />,
  [CollectedDataOption.ssn9]: <IcoFileText24 />,
  [CollectedDataOption.dob]: <IcoCake24 />,
  [CollectedDataOption.fullAddress]: <IcoBuilding24 />,
  [CollectedDataOption.partialAddress]: <IcoBuilding24 />,
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

  const collectedDataOptionLabels: Record<CollectedDataOption, string> = {
    [CollectedDataOption.name]: t('data-labels.name'),
    [CollectedDataOption.email]: t('data-labels.email'),
    [CollectedDataOption.phoneNumber]: t('data-labels.phone'),
    [CollectedDataOption.ssn4]: t('data-labels.ssn4'),
    [CollectedDataOption.ssn9]: t('data-labels.ssn9'),
    [CollectedDataOption.dob]: t('data-labels.dob'),
    [CollectedDataOption.fullAddress]: t('data-labels.address-full'),
    [CollectedDataOption.partialAddress]: t('data-labels.address-partial'),
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
          {requiredCategories.map(
            (collectedDataOption: CollectedDataOption) => (
              <Category key={collectedDataOption}>
                <IconContainer>
                  {IconByCollectedDataOption[collectedDataOption]}
                </IconContainer>
                <Typography variant="label-3">
                  {collectedDataOptionLabels[collectedDataOption]}
                </Typography>
              </Category>
            ),
          )}
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
    row-gap: ${theme.spacing[8]}px;
    justify-content: center;
    align-items: center;
  `}
`;

const IconContainer = styled.span`
  ${({ theme }) => css`
    margin-right: ${theme.spacing[2]}px;
  `}
`;

const Category = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: left;
    align-items: center;
    margin-bottom: ${theme.spacing[3]}px;
  `}
`;

const CategoriesContainer = styled.div`
  ${({ theme }) => css`
    column-count: 2;
    width: 100%;
    margin-bottom: -${theme.spacing[3]}px;
  `}
`;

export default Authorize;
