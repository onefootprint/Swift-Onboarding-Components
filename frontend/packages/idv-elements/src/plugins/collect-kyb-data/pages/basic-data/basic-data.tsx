import { useTranslation } from '@onefootprint/hooks';
import { IcoInfo16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import {
  BusinessDI,
  CollectedKybDataOption,
  CollectedKybDataOptionToRequiredAttributes,
} from '@onefootprint/types';
import { Banner, createFontStyles, media } from '@onefootprint/ui';
import React from 'react';

import HeaderTitle from '../../../../components/layout/components/header-title';
import CollectKybDataNavigationHeader from '../../components/collect-kyb-data-navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';
import useSyncData from '../../hooks/use-sync-data';
import type { BasicData as BasicDataFields } from '../../utils/state-machine/types';
import BasicDataForm from './components/basic-data-form';

type BasicDataProps = {
  hideHeader?: boolean;
  ctaLabel?: string;
  onComplete?: () => void;
  onCancel?: () => void;
};

const BasicData = ({
  ctaLabel,
  hideHeader,
  onComplete,
  onCancel,
}: BasicDataProps) => {
  const [state, send] = useCollectKybDataMachine();
  const { authToken, data, kybRequirement } = state.context;
  const { missingAttributes } = kybRequirement || {};
  const { mutation, syncData } = useSyncData();
  const { t } = useTranslation('pages.basic-data');

  const handleSubmit = (basicData: BasicDataFields) => {
    const handleSuccess = () => {
      send({
        type: 'basicDataSubmitted',
        payload: {
          ...basicData,
        },
      });
      onComplete?.();
    };

    const handleError = (error: string) => {
      console.error(
        `Speculatively vaulting data failed in kyb basic-data page: ${error}`,
      );
    };

    if (!authToken) {
      return;
    }
    syncData({
      authToken,
      data: basicData,
      speculative: true,
      onSuccess: handleSuccess,
      onError: handleError,
    });
  };

  const defaultValues = {
    name: data?.[BusinessDI.name],
    doingBusinessAs: data?.[BusinessDI.doingBusinessAs],
    tin: data?.[BusinessDI.tin],
    phoneNumber: data?.[BusinessDI.phoneNumber],
    website: data?.[BusinessDI.website],
  };
  const optionalFields = missingAttributes
    .filter(
      attr =>
        attr === CollectedKybDataOption.phoneNumber ||
        attr === CollectedKybDataOption.website,
    )
    .map(attr => CollectedKybDataOptionToRequiredAttributes[attr])
    .flat() as (BusinessDI.phoneNumber | BusinessDI.website)[];

  return (
    <>
      {!hideHeader && (
        <>
          <CollectKybDataNavigationHeader />
          <HeaderTitle
            title={t('title')}
            subtitle={t('subtitle')}
            sx={{ marginBottom: 7 }}
          />
        </>
      )}
      <HintBannerContainer>
        <Banner variant="info">
          <BannerChildrenContainer>
            <IcoInfo16 color="info" />
            {t('hint')}
          </BannerChildrenContainer>
        </Banner>
      </HintBannerContainer>
      <BasicDataForm
        defaultValues={defaultValues}
        optionalFields={optionalFields}
        onSubmit={handleSubmit}
        isLoading={mutation.isLoading}
        onCancel={onCancel}
        ctaLabel={ctaLabel}
      />
    </>
  );
};

const BannerChildrenContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[3]};
    ${createFontStyles('body-2')};

    ${media.lessThan('sm')`
      ${createFontStyles('body-3')};
    `}
  `};
`;

const HintBannerContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]};
    border-radius: ${theme.borderRadius.default};
    overflow: hidden;
  `};
`;

export default BasicData;
