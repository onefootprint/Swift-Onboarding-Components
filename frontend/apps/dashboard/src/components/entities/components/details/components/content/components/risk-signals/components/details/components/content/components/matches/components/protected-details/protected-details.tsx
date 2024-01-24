import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { IcoShield40 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { type Entity, IdDI } from '@onefootprint/types';
import { Button, LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type ProtectedDetailsProps = {
  entity: Entity;
  onClick: () => void;
  isLoading: boolean;
};

const REQUIRED_DECRYPTABLE_ATTRS = [
  IdDI.firstName,
  IdDI.middleName,
  IdDI.lastName,
  IdDI.dob,
];

const ProtectedDetails = ({
  entity,
  onClick,
  isLoading,
}: ProtectedDetailsProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.risk-signals.details.matches.protected-details',
  });
  const canDecrypt = REQUIRED_DECRYPTABLE_ATTRS.every(
    di =>
      !entity.attributes.includes(di) ||
      entity.decryptableAttributes.includes(di),
  );

  return (
    <ProtectedSection>
      <IcoShield40 />
      <Typography variant="label-1">{t('title')}</Typography>
      <Typography variant="body-3">{t('description')}</Typography>
      {canDecrypt ? (
        <Button
          size="default"
          loading={isLoading}
          onClick={onClick}
          sx={{ marginTop: 3 }}
        >
          {t('button')}
        </Button>
      ) : (
        <InstructionsBox>
          <Typography variant="body-4" color="tertiary">
            {t('no-permission.message')}
          </Typography>
          <LinkButton
            size="tiny"
            href={`${DASHBOARD_BASE_URL}/settings`}
            target="_blank"
            sx={{ marginTop: 3 }}
          >
            {t('no-permission.button')}
          </LinkButton>
        </InstructionsBox>
      )}
    </ProtectedSection>
  );
};

const ProtectedSection = styled.section`
  ${({ theme }) => css`
    height: 100%;
    position: absolute;
    z-index: 2;
    opacity: 0.9;
    padding: 0 ${theme.spacing[9]};

    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    align-items: center;
    justify-content: center;
    text-align: center;
  `}
`;

const InstructionsBox = styled.div`
  ${({ theme }) => css`
    padding: ${theme.spacing[4]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default ProtectedDetails;
