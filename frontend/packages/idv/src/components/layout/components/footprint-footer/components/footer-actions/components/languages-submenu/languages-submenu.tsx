import { Dropdown } from '@onefootprint/ui';
import i18n from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguagesSubmenu = () => {
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.components.footer',
  });
  const handleLanguageChange = (newValue: string) => {
    i18n.changeLanguage(newValue);
  };

  const handlePointerDownOutside = () => {
    setSubmenuOpen(false);
  };

  const toggleSubmenu = () => {
    setSubmenuOpen(!submenuOpen);
  };

  i18n.languages = ['en', 'es'];
  const languageLabels = {
    en: 'English',
    es: 'Español',
  };

  return i18n.languages.length > 1 ? (
    <Dropdown.Sub open={submenuOpen}>
      <Dropdown.SubTrigger size="compact" onPointerDown={toggleSubmenu}>
        {`${t('languages')}...`}
      </Dropdown.SubTrigger>
      <Dropdown.SubContent onPointerDownOutside={handlePointerDownOutside} $minWidth="120px">
        <Dropdown.Group>
          {i18n.languages.map(language => (
            <Dropdown.Item
              key={language}
              onSelect={() => handleLanguageChange(language)}
              size="compact"
              checked={language === i18n.language}
            >
              {languageLabels[language as keyof typeof languageLabels]}
            </Dropdown.Item>
          ))}
        </Dropdown.Group>
      </Dropdown.SubContent>
    </Dropdown.Sub>
  ) : null;
};

export default LanguagesSubmenu;
