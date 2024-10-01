import { FRONTPAGE_BASE_URL } from '@onefootprint/global-constants';
import { IcoDotsHorizontal24 } from '@onefootprint/icons';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { Dropdown, Stack, Text, useToast } from '@onefootprint/ui';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

type FooterActionsProps = {
  onWhatsThisClick?: () => void;
  config?: PublicOnboardingConfig;
};

const handleRedirect = (url: string) => {
  window.open(url, '_blank');
};

const FooterActions = ({ onWhatsThisClick, config }: FooterActionsProps) => {
  const { t } = useTranslation('idv', {
    keyPrefix: 'global.components.footer',
  });
  const toast = useToast();

  const toggleLanguage = () => {
    const currentLang = i18n.language;
    const newLang = currentLang === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  const sendEmail = (email?: string) => {
    if (email) {
      window.open(`mailto:${email}`, '_blank');
    } else {
      toast.show({
        title: t('support.email.toast-error.title'),
        description: t('support.email.toast-error.description'),
      });
    }
  };

  const copyToClipboard = (phoneNumber?: string) => {
    if (phoneNumber) {
      navigator.clipboard.writeText(phoneNumber);
      toast.show({
        title: t('support.phone.toast-success.title'),
        description: t('support.phone.toast-success.description'),
      });
    } else {
      toast.show({
        title: t('support.phone.toast-error.title'),
        description: t('support.phone.toast-error.description'),
      });
    }
  };

  return (
    <Dropdown.Root>
      <Dropdown.Trigger>
        <IcoDotsHorizontal24 />
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content align="end">
          <Dropdown.Group>
            <Dropdown.Item onClick={onWhatsThisClick} size="compact">
              {t('whats-this')}
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleRedirect(`${FRONTPAGE_BASE_URL}/privacy-policy`)} size="compact">
              {t('privacy')}
            </Dropdown.Item>
          </Dropdown.Group>
          <Dropdown.Divider />
          <Dropdown.Group>
            <Dropdown.Item onClick={() => sendEmail(config?.supportEmail)} size="compact">
              {t('support.email.label')}
            </Dropdown.Item>
            <Dropdown.Item onClick={() => copyToClipboard(config?.supportPhone)} size="compact">
              {t('support.phone.label')}
            </Dropdown.Item>
          </Dropdown.Group>
          <Dropdown.Divider />
          <Dropdown.Group>
            <Dropdown.Item onClick={toggleLanguage} size="compact" asChild>
              <Stack align="center" justify="space-between">
                <Text variant="body-3" color="secondary">
                  {t('change-language')}
                </Text>
                <Text variant="body-3" color="secondary">
                  {i18n.language === 'en' ? 'Spanish' : 'Inglés'}
                </Text>
              </Stack>
            </Dropdown.Item>
          </Dropdown.Group>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};

export default FooterActions;
