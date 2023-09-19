import { useTranslation } from '@onefootprint/hooks';
import { IcoPencil16 } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import type { OnboardingConfig } from '@onefootprint/types';
import { CodeInline, LinkButton, Typography } from '@onefootprint/ui';
import React, { useState } from 'react';
import isKybPlaybook from 'src/pages/playbooks/components/table/components/row/utils/is-kyb-playbook';

import EditName from './components/edit-name';

export type BasicsProps = {
  playbook: OnboardingConfig;
};

const Basics = ({ playbook }: BasicsProps) => {
  const { t } = useTranslation('pages.playbooks.details.basics');
  const isKYB = isKybPlaybook(playbook);
  const kind = isKYB ? 'kyb' : 'kyc';
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen(!open);

  return (
    <Container>
      <Header>
        <Typography sx={{ whiteSpace: 'nowrap' }} variant="label-3">
          {t('title')}
        </Typography>
        {!open && (
          <LinkButton
            onClick={toggleOpen}
            iconComponent={IcoPencil16}
            iconPosition="left"
            size="tiny"
          >
            {t('edit-name.edit')}
          </LinkButton>
        )}
      </Header>
      {open ? (
        <EditName open={open} setOpen={setOpen} playbook={playbook} />
      ) : (
        <ItemsContainer>
          <Item>
            <Typography variant="body-3" color="tertiary">
              {t('type.label')}
            </Typography>
            <Typography variant="body-3">{t(`type.${kind}`)}</Typography>
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
