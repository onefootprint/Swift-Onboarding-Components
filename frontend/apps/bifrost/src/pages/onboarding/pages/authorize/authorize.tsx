import {
  HeaderTitle,
  NavigationHeader,
  useGetOnboardingStatus,
  useOnboardingAuthorize,
} from '@onefootprint/footprint-elements';
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
  IcoSelfie24,
  IcoUserCircle24,
} from '@onefootprint/icons';
import { CollectedKycDataOption, IdDocType } from '@onefootprint/types';
import {
  FootprintButton,
  LoadingIndicator,
  Typography,
  useToast,
} from '@onefootprint/ui';
import Link from 'next/link';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';
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

const IconByIdDocType: Record<IdDocType, JSX.Element> = {
  [IdDocType.idCard]: <IcoIdCard24 />,
  [IdDocType.driversLicense]: <IcoCar24 />,
  [IdDocType.passport]: <IcoPassport24 />,
};

const Authorize = () => {
  const onboardingAuthorizeMutation = useOnboardingAuthorize();
  const toast = useToast();
  const { t } = useTranslation('pages.authorize');
  const [state, send] = useOnboardingMachine();
  const [collectedIdDocTypes, setCollectedIdDocTypes] = useState<IdDocType[]>();
  const {
    authToken,
    config: {
      name: tenantName,
      privacyPolicyUrl,
      canAccessData,
      canAccessSelfieImage,
    },
  } = state.context;

  const statusQuery = useGetOnboardingStatus(authToken, {
    onSuccess: ({ fieldsToAuthorize }) => {
      setCollectedIdDocTypes(fieldsToAuthorize?.identityDocumentTypes ?? []);
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
      { authToken },
      {
        onSuccess: ({ validationToken, status }) => {
          send({
            type: Events.authorized,
            payload: {
              validationToken,
              status,
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
  const docTypeLabels: Record<IdDocType, string> = {
    [IdDocType.idCard]: t('data-labels.id-card'),
    [IdDocType.passport]: t('data-labels.passport'),
    [IdDocType.driversLicense]: t('data-labels.driversLicense'),
  };

  return (
    <>
      <NavigationHeader button={{ variant: 'close', confirmClose: true }} />
      <Container>
        <HeaderTitle
          title={t('title')}
          subtitle={t('subtitle', { tenantName })}
        />
        <CategoriesContainer>
          {canAccessData.map((kycDataOpt: CollectedKycDataOption) => (
            <Category key={kycDataOpt}>
              <IconContainer>
                {IconByCollectedKycDataOption[kycDataOpt]}
              </IconContainer>
              <Typography variant="label-3">
                {collectedKycDataOptionLabels[kycDataOpt]}
              </Typography>
            </Category>
          ))}
          {collectedIdDocTypes?.map((collectedDoc: IdDocType) => (
            <Category key={collectedDoc}>
              <IconContainer>{IconByIdDocType[collectedDoc]}</IconContainer>
              <Typography variant="label-3">
                {docTypeLabels[collectedDoc]}
              </Typography>
            </Category>
          ))}
          {canAccessSelfieImage && (
            <Category key="selfie">
              <IconContainer>
                <IcoSelfie24 />
              </IconContainer>
              <Typography variant="label-3">
                {t('data-labels.selfie')}
              </Typography>
            </Category>
          )}
        </CategoriesContainer>
        <ButtonContainer>
          <FootprintButton
            fullWidth
            loading={onboardingAuthorizeMutation.isLoading}
            onClick={handleClick}
            text={t('cta')}
          />
          {privacyPolicyUrl && (
            <Typography
              variant="label-4"
              color="secondary"
              sx={{ textAlign: 'center' }}
            >
              <Trans
                i18nKey="pages.authorize.footer"
                values={{ tenantName }}
                components={{
                  a: (
                    <Link
                      href={privacyPolicyUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    />
                  ),
                }}
              />
            </Typography>
          )}
        </ButtonContainer>
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

const ButtonContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    row-gap: ${theme.spacing[4]};
  `}
`;

export default Authorize;
