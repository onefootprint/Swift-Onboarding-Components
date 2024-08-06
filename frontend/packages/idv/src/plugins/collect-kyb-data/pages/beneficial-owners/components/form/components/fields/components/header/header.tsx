import { LinkButton, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

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
      <Text variant="label-2">{t('beneficial-owner-other')}</Text>
      <LinkButton onClick={onRemove}>{t('remove')}</LinkButton>
    </HeaderContainer>
  ) : (
    <Text variant="label-2">{t('beneficial-owner-you')}</Text>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

export default Header;
