import { IcoFileText24, IcoInfo16 } from '@onefootprint/icons';
import {
  Box,
  Divider,
  Grid,
  LinkButton,
  media,
  Shimmer,
  Text,
} from '@onefootprint/ui';
import type { TFunction } from 'i18next';
import type { ComponentProps } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import type { SectionItemProps } from '../../../../../../components/confirm-collected-data';
import {
  Section,
  SectionItem,
} from '../../../../../../components/confirm-collected-data';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import type { VerifiedMethods } from '../../../../types';
import BasicInformation from '../../../basic-information';
import {
  getBasicInfoItems,
  getNationalityItems,
  getVerifiableItems,
  isUsLegalStatusRequired,
} from './helpers';

type T = TFunction<'idv', 'kyc.pages'>;
type VerifiableItem = SectionItemProps & {
  isVerified: boolean;
  onClick: ComponentProps<typeof LinkButton>['onClick'];
};
type BasicInfoSectionProps = { verifiedMethods?: VerifiedMethods };

const BasicInfoSection = ({ verifiedMethods }: BasicInfoSectionProps) => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages' });
  const [state, send] = useCollectKycDataMachine();
  const { data, requirement } = state.context;
  const [isEditing, setIsEditing] = useState(false);

  const sectionItems = useMemo(
    () => ({
      basic: !isUsLegalStatusRequired(requirement)
        ? getBasicInfoItems(t, data).concat(getNationalityItems(t, data))
        : getBasicInfoItems(t, data),
      verifiable: getVerifiableItems(t, data).map(({ kind, ...rest }) => ({
        ...rest,
        isVerified: !!verifiedMethods?.[kind],
        onClick: () => send({ type: 'addVerification', payload: kind }),
      })),
    }),
    [data, requirement, send, t, verifiedMethods],
  );

  const getSectionContent = useCallback(
    (basicList: SectionItemProps[], verifiableList: VerifiableItem[]) => {
      const stopEditing = () => setIsEditing(false);
      const hasBasic = basicList.length > 0;
      const hasVerifiable = verifiableList.length > 0;
      const showVerifyHint =
        hasVerifiable && verifiableList.some(x => !x.isVerified);

      if (isEditing) {
        return (
          <BasicInformation
            onComplete={stopEditing}
            onCancel={stopEditing}
            hideHeader
            verifiedMethods={verifiedMethods}
            emailConfig={{
              visible: true,
              disabled: Boolean(verifiedMethods?.email),
            }}
            phoneConfig={{
              visible: true,
              disabled: Boolean(verifiedMethods?.phone),
            }}
          />
        );
      }

      return (
        <>
          {hasBasic ? (
            <ResponsiveGridContainer>
              {basicList.map(({ text, subtext, textColor }) => (
                <SectionItem
                  key={text + subtext}
                  text={text}
                  subtext={subtext}
                  textColor={textColor}
                />
              ))}
            </ResponsiveGridContainer>
          ) : null}
          {hasBasic && hasVerifiable ? (
            <StyledDivider variant="secondary" />
          ) : null}
          {hasVerifiable
            ? verifiableList.map(
                ({ isVerified, onClick, subtext, text, textColor }) => (
                  <Grid.Container
                    key={text + subtext}
                    paddingTop={7}
                    width="100%"
                    columns={['1fr auto']}
                  >
                    <Grid.Item width="100%" overflow="hidden">
                      <SectionItem
                        text={text}
                        subtext={subtext}
                        textColor={textColor}
                      />
                    </Grid.Item>
                    <Box>
                      {!verifiedMethods || verifiedMethods?.isLoading ? (
                        <Shimmer height="24px" width="100%" />
                      ) : (
                        <LinkButton onClick={onClick} disabled={isVerified}>
                          {isVerified ? t('verified') : t('verify')}
                        </LinkButton>
                      )}
                    </Box>
                  </Grid.Container>
                ),
              )
            : null}
          {showVerifyHint ? (
            <>
              <StyledDivider variant="secondary" />
              <VerifyRecommendation t={t} />
            </>
          ) : null}
        </>
      );
    },
    [isEditing, t, verifiedMethods],
  );

  if (!sectionItems.basic.length) {
    return null;
  }

  const actions = !isEditing
    ? [{ label: t('confirm.summary.edit'), onClick: () => setIsEditing(true) }]
    : [];

  return (
    <Section
      title={t('confirm.basic-info.title')}
      actions={actions}
      IconComponent={IcoFileText24}
      content={getSectionContent(sectionItems.basic, sectionItems.verifiable)}
      testID="basic-info-section"
    />
  );
};

const VerifyRecommendation = ({ t }: { t: T }) => (
  <Box display="flex" alignItems="center" justifyContent="center" marginTop={5}>
    <IcoInfo16 color="tertiary" />
    <Text marginLeft={3} variant="caption-2" color="tertiary" tag="span">
      {t('verify-recommendation')}
    </Text>
  </Box>
);

const ResponsiveGridContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};

    ${media.greaterThan('md')`
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      row-gap: ${theme.spacing[7]};
      column-gap: ${theme.spacing[5]};
    `}
  `}
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    width: auto;
    margin-top: ${theme.spacing[7]};
  `}
`;

export default BasicInfoSection;
