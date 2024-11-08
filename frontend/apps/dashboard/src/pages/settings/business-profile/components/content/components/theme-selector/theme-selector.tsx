import { SelectCustom, Stack, Text } from '@onefootprint/ui';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';

const ThemeSelector = () => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'pages.business-profile.preferences.theme',
  });
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
    <Stack direction="row" gap={5} align="center" justify="space-between" maxWidth="590px">
      <Text variant="label-3">{t('label')}</Text>
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
    </Stack>
  );
};

export default ThemeSelector;
