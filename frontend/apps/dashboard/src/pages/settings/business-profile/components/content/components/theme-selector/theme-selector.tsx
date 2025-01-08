import { SelectCustom } from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

const ThemeSelector = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'pages.business-profile.preferences.theme' });
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'light', label: t('options.light') },
    { value: 'dark', label: t('options.dark') },
  ];

  const renderThemeValue = (value: string | undefined) => {
    if (!value) return t('placeholder');
    const option = themeOptions.find(opt => opt.value === value);
    return option ? option.label : t('placeholder');
  };

  const handleToggleTheme = (value: string) => {
    setTheme(value);
  };

  return (
    <div className="flex flex-row gap-4 items-center justify-between max-w-[590px]">
      <p className="text-label-3">{t('label')}</p>
      <SelectCustom.Root value={theme || ''} onValueChange={handleToggleTheme}>
        <SelectCustom.Input placeholder={t('placeholder')} size="compact" width="300px">
          <SelectCustom.Value placeholder={t('placeholder')}>{renderThemeValue(theme)}</SelectCustom.Value>
        </SelectCustom.Input>
        <SelectCustom.Content>
          <SelectCustom.Group>
            {themeOptions.map(option => (
              <SelectCustom.Item key={option.value} value={option.value}>
                {option.label}
              </SelectCustom.Item>
            ))}
          </SelectCustom.Group>
        </SelectCustom.Content>
      </SelectCustom.Root>
    </div>
  );
};

export default ThemeSelector;
