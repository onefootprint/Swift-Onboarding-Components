import { IcoPencil16 } from '@onefootprint/icons';
import type { OnboardingConfig } from '@onefootprint/types';
import { RoleScopeKind } from '@onefootprint/types';
import { CodeInline, LinkButton, Typography } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PermissionGate from 'src/components/permission-gate';
import styled, { css } from 'styled-components';

import EditName from './components/edit-name';

export type BasicsProps = {
  playbook: OnboardingConfig;
};

const Basics = ({ playbook }: BasicsProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.details.basics',
  });
  const [showForm, setShowForm] = useState(false);

  const handleShowForm = () => {
    setShowForm(true);
  };

  const handleHideForm = () => {
    setShowForm(false);
  };

  return (
    <Container>
      <Header>
        <Typography sx={{ whiteSpace: 'nowrap' }} variant="label-3">
          {t('title')}
        </Typography>
        {!showForm && (
          <PermissionGate
            scopeKind={RoleScopeKind.onboardingConfiguration}
            fallbackText={t('edit-name.cta-not-allowed')}
            tooltipPosition="left"
          >
            <LinkButton
              iconComponent={IcoPencil16}
              iconPosition="left"
              onClick={handleShowForm}
              size="tiny"
            >
              {t('edit-name.cta')}
            </LinkButton>
          </PermissionGate>
        )}
      </Header>
      {showForm ? (
        <EditName onDone={handleHideForm} playbook={playbook} />
      ) : (
        <ItemsContainer>
          <Item>
            <Typography variant="body-3" color="tertiary">
              {t('type.label')}
            </Typography>
            <Typography variant="body-3">
              {t(`type.${playbook.kind}` as ParseKeys<'common'>)}
            </Typography>
          </Item>
          <Item>
            <Typography variant="body-3" color="tertiary">
              {t('name')}
            </Typography>
            <Typography variant="body-3">{playbook?.name}</Typography>
          </Item>
          <Item>
            <Typography variant="body-3" color="tertiary">
              {t('publishable-key')}
            </Typography>
            <CodeInline>{playbook.key}</CodeInline>
          </Item>
        </ItemsContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const Header = styled.div`
  ${({ theme }) => css`
    gap: ${theme.spacing[5]};
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  `};
`;

const ItemsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[2]};
  `}
`;

const Item = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export default Basics;
