import styled from '@onefootprint/styled';
import { LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

type HeaderProps = {
  shouldShowRemove?: boolean;
  onRemove: () => void;
};

const Header = ({ shouldShowRemove, onRemove }: HeaderProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'kyb.pages.beneficial-owners.form.fields-header',
  });

  return shouldShowRemove ? (
    <HeaderContainer>
      <Typography variant="label-2">{t('beneficial-owner-other')}</Typography>
      <LinkButton onClick={onRemove} size="compact">
        {t('remove')}
      </LinkButton>
    </HeaderContainer>
  ) : (
    <Typography variant="label-2">{t('beneficial-owner-you')}</Typography>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

export default Header;
