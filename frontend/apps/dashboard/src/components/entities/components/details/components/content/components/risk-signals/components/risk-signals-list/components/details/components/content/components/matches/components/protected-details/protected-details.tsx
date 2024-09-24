import { DASHBOARD_BASE_URL } from '@onefootprint/global-constants';
import { IcoShield40 } from '@onefootprint/icons';
import { type Entity, IdDI } from '@onefootprint/types';
import { Box, Button, LinkButton, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

type ProtectedDetailsProps = {
  entity: Entity;
  onClick: () => void;
  isPending: boolean;
};

const REQUIRED_DECRYPTABLE_ATTRS = [IdDI.firstName, IdDI.middleName, IdDI.lastName, IdDI.dob];

const ProtectedDetails = ({ entity, onClick, isPending }: ProtectedDetailsProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.risk-signals.details.matches.protected-details',
  });
  const canDecrypt = REQUIRED_DECRYPTABLE_ATTRS.every(
    di => !entity.attributes.includes(di) || entity.decryptableAttributes.includes(di),
  );

  return (
    <ProtectedSection>
      <IcoShield40 />
      <Text variant="label-1">{t('title')}</Text>
      <Text variant="body-3">{t('description')}</Text>
      {canDecrypt ? (
        <Box marginTop={3}>
          <Button loading={isPending} onClick={onClick}>
            {t('button')}
          </Button>
        </Box>
      ) : (
        <InstructionsBox>
          <Text variant="body-3" color="tertiary">
            {t('no-permission.message')}
          </Text>
          <LinkButton href={`${DASHBOARD_BASE_URL}/settings`} target="_blank" $marginTop={3}>
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
