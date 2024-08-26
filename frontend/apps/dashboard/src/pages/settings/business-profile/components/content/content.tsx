import { RoleScopeKind } from '@onefootprint/types';
import { Button, CopyButton, Form, LinkButton, Stack, Text, TextInput, useToast } from '@onefootprint/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import usePermissions from 'src/hooks/use-permissions';
import useUpdateOrg from 'src/hooks/use-update-org';
import styled from 'styled-components';
import BusinessProfileInput from './components/business-profile-input';
import HelpDialog from './components/help-dialog';
import Logo from './components/logo';
import type { ContentProps } from './content.types';

type FormData = {
  name: string;
  websiteUrl: string;
  id: string;
  supportEmail: string;
  supportPhone: string;
  supportWebsite: string;
};

const Content = ({ organization }: ContentProps) => {
  const { t } = useTranslation('settings', {
    keyPrefix: 'pages.business-profile',
  });
  const updateOrgMutation = useUpdateOrg();
  const toast = useToast();
  const { hasPermission } = usePermissions();
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const canEdit = hasPermission(RoleScopeKind.orgSettings);
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      name: organization.name || '',
      websiteUrl: organization.websiteUrl || '',
      id: organization.id || '',
      supportEmail: organization.supportEmail || '',
      supportPhone: organization.supportPhone || '',
      supportWebsite: organization.supportWebsite || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    // no id mutation because it will stay the same
    const { id, ...updateData } = data;
    updateOrgMutation.mutate(updateData, {
      onSuccess: () => {
        toast.show({
          title: t('form.success.title'),
          description: t('form.success.description'),
        });
      },
      // no error toast here because updateOrgMutation already handles
    });
  };

  const handleHelpDialogClose = () => {
    setHelpDialogOpen(false);
  };

  const handleHelpDialogOpen = () => {
    setHelpDialogOpen(true);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="column" gap={9}>
        <Stack direction="column" gap={7}>
          <Logo organization={organization} />
          <Stack direction="column" gap={10}>
            <Stack direction="column" gap={5} style={{ maxWidth: '640px' }}>
              <Form.Field variant="horizontal">
                <Form.Label>{t('name.label')}</Form.Label>
                <BusinessProfileInput
                  {...register('name')}
                  type="text"
                  placeholder={t('name.form.placeholder')}
                  disabled={!canEdit}
                />
              </Form.Field>
              <Form.Field variant="horizontal">
                <Form.Label>{t('website.label')}</Form.Label>
                <BusinessProfileInput
                  {...register('websiteUrl')}
                  type="url"
                  placeholder={t('website.form.placeholder')}
                  disabled={!canEdit}
                />
              </Form.Field>
              <Form.Field variant="horizontal">
                <Form.Label>{t('id.label')}</Form.Label>
                <InputContainer direction="column">
                  <Stack direction="row" gap={4}>
                    <StyledTextInput
                      {...register('id')}
                      size="compact"
                      disabled
                      type="text"
                      readOnly
                      placeholder={t('id.form.placeholder')}
                    />
                    <CopyButton contentToCopy={organization.id} />
                  </Stack>
                </InputContainer>
              </Form.Field>
            </Stack>
            <Stack direction="column" gap={7} style={{ maxWidth: '640px' }}>
              <Stack direction="column" gap={3}>
                <Text variant="label-2">{t('support-links.title')}</Text>
                <Stack direction="row" inline gap={2} align="center">
                  <Text variant="body-3">{t('support-links.subtitle')}</Text>
                  <LinkButton onClick={handleHelpDialogOpen}>{t('support-links.more-details')}</LinkButton>
                  <HelpDialog open={helpDialogOpen} onClose={handleHelpDialogClose} />
                </Stack>
              </Stack>
              <Stack gap={5} direction="column">
                <Form.Field variant="horizontal">
                  <Form.Label>{t('support-email.label')}</Form.Label>
                  <BusinessProfileInput
                    {...register('supportEmail')}
                    type="email"
                    placeholder={t('support-email.form.placeholder')}
                    disabled={!canEdit}
                  />
                </Form.Field>
                <Form.Field variant="horizontal">
                  <Form.Label>{t('support-phone.label')}</Form.Label>
                  <BusinessProfileInput
                    {...register('supportPhone')}
                    type="tel"
                    placeholder={t('support-phone.form.placeholder')}
                    disabled={!canEdit}
                  />
                </Form.Field>
                <Form.Field variant="horizontal">
                  <Form.Label>{t('support-website.label')}</Form.Label>
                  <BusinessProfileInput
                    {...register('supportWebsite')}
                    type="url"
                    placeholder={t('support-website.form.placeholder')}
                    disabled={!canEdit}
                  />
                </Form.Field>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
        <div>
          <Button type="submit" loading={updateOrgMutation.isLoading} disabled={!canEdit}>
            {t('save-changes')}
          </Button>
        </div>
      </Stack>
    </form>
  );
};

const StyledTextInput = styled(TextInput)`
  width: 300px;
`;

const InputContainer = styled(Stack)`
  min-width: 350px;
`;

export default Content;
