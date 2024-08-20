import { Button, CopyButton, LinkButton, Stack, Text, TextInput, useToast } from '@onefootprint/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components';

import { useRequestErrorToast } from '@onefootprint/hooks';
import { RoleScopeKind } from '@onefootprint/types';
import usePermissions from 'src/hooks/use-permissions';
import useUpdateOrg from 'src/hooks/use-update-org';
import HelpDialog from './components/help-dialog';
import Logo from './components/logo';
import type { ContentProps } from './content.types';

type FormData = {
  name?: string;
  websiteUrl?: string;
  id?: string | null;
  supportEmail?: string;
  supportPhone?: string;
  supportWebsite?: string;
};

const Content = ({ organization }: ContentProps) => {
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const { t } = useTranslation('settings', {
    keyPrefix: 'pages.business-profile',
  });
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission(RoleScopeKind.orgSettings);

  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      name: organization.name ?? '',
      websiteUrl: organization.websiteUrl ?? '',
      id: organization.id ?? '',
      supportEmail: organization.supportEmail ?? '',
      supportPhone: organization.supportPhone ?? '',
      supportWebsite: organization.supportWebsite ?? '',
    },
  });
  const updateOrgMutation = useUpdateOrg();
  const requestErrorToast = useRequestErrorToast();
  const toast = useToast();
  const onSubmit = (data: FormData) => {
    updateOrgMutation.mutate(
      {
        name: data.name,
        websiteUrl: data.websiteUrl,
        supportEmail: data.supportEmail,
        supportPhone: data.supportPhone,
        supportWebsite: data.supportWebsite,
      },
      {
        onSuccess: () => {
          toast.show({
            title: t('form.success.title'),
            description: t('form.success.description'),
          });
        },
        onError: requestErrorToast,
      },
    );
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
              <Stack direction="row" justify="space-between" align="center">
                <Text variant="label-4">{t('name.label')}</Text>
                <InputContainer direction="column">
                  <StyledTextInput
                    size="compact"
                    {...register('name', { required: true })}
                    type="text"
                    placeholder={t('name.form.placeholder')}
                    disabled={!canEdit}
                  />
                </InputContainer>
              </Stack>
              <Stack direction="row" justify="space-between" align="center">
                <Text variant="label-4">{t('website.label')}</Text>
                <InputContainer direction="column">
                  <StyledTextInput
                    size="compact"
                    {...register('websiteUrl', { required: true })}
                    type="url"
                    placeholder={t('website.form.placeholder')}
                    disabled={!canEdit}
                  />
                </InputContainer>
              </Stack>
              <Stack direction="row" justify="space-between" align="center">
                <Text variant="label-4">{t('id.label')}</Text>
                <InputContainer direction="column">
                  <Stack direction="row" gap={4}>
                    <StyledTextInput
                      size="compact"
                      disabled
                      {...register('id')}
                      type="text"
                      readOnly
                      placeholder={organization.id ?? ''}
                    />
                    <CopyButton contentToCopy={organization.id} />
                  </Stack>
                </InputContainer>
              </Stack>
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
                <Stack direction="row" justify="space-between" align="center">
                  <Text variant="label-4">{t('support-email.label')}</Text>
                  <InputContainer direction="column">
                    <StyledTextInput
                      size="compact"
                      {...register('supportEmail')}
                      type="email"
                      placeholder={t('support-email.form.placeholder')}
                      disabled={!canEdit}
                    />
                  </InputContainer>
                </Stack>
                <Stack direction="row" justify="space-between" align="center">
                  <Text variant="label-4">{t('support-phone.label')}</Text>
                  <InputContainer direction="column">
                    <StyledTextInput
                      size="compact"
                      {...register('supportPhone')}
                      placeholder={t('support-phone.form.placeholder')}
                      type="tel"
                      disabled={!canEdit}
                    />
                  </InputContainer>
                </Stack>
                <Stack direction="row" justify="space-between" align="center">
                  <Text variant="label-4">{t('support-website.label')}</Text>
                  <InputContainer direction="column">
                    <StyledTextInput
                      size="compact"
                      {...register('supportWebsite')}
                      type="url"
                      placeholder={t('support-website.form.placeholder')}
                      disabled={!canEdit}
                    />
                  </InputContainer>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
        <div>
          <Button variant="primary" type="submit" size="default" loading={updateOrgMutation.isLoading}>
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
