import { IcoCheckSmall16 } from '@onefootprint/icons';
import { Dropdown, Stack } from '@onefootprint/ui';
import i18n from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const LanguagesSubmenu = () => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.components.footer',
  });
  const handleLanguageChange = (newValue: string) => {
    i18n.changeLanguage(newValue);
  };

  i18n.languages = ['en', 'es'];
  const languageLabels = {
    en: 'English',
    es: 'Español',
  };

  return i18n.languages.length > 1 ? (
    <Dropdown.Sub open={submenuOpen}>
      <Dropdown.SubTrigger size="tiny" onPointerDown={() => setSubmenuOpen(!submenuOpen)}>
        {`${t('languages')}...`}
      </Dropdown.SubTrigger>
      <StyledSubcontent onPointerDownOutside={() => setSubmenuOpen(false)}>
        {i18n.languages.map(language => (
          <StyledItem key={language} onSelect={() => handleLanguageChange(language)} size="tiny">
            {languageLabels[language as keyof typeof languageLabels]}
            {language === i18n.language && (
              <Stack align="center" justify="center">
                <IcoCheckSmall16 color="tertiary" />
              </Stack>
            )}
          </StyledItem>
        ))}
      </StyledSubcontent>
    </Dropdown.Sub>
  ) : null;
};

const StyledItem = styled(Dropdown.Item)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StyledSubcontent = styled(Dropdown.SubContent)`
  min-width: 120px;
`;

export default LanguagesSubmenu;
