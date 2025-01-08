import type { Organization } from '@onefootprint/request-types/dashboard';
import { Button, CopyButton, Form, LinkButton, TextInput, useToast } from '@onefootprint/ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import usePermissions from 'src/hooks/use-permissions';
import useUpdateOrg from 'src/hooks/use-update-org';
import BusinessProfileInput from './components/business-profile-input';
import HelpDialog from './components/help-dialog';
import Logo from './components/logo';
import ThemeSelector from './components/theme-selector';

type FormData = {
  name: string;
  websiteUrl: string;
  id: string;
  supportEmail: string;
  supportPhone: string;
  supportWebsite: string;
};

export type ContentProps = {
  organization: Organization;
};

const Content = ({ organization }: ContentProps) => {
  const { t } = useTranslation('settings', { keyPrefix: 'pages.business-profile' });
  const updateOrgMutation = useUpdateOrg();
  const toast = useToast();
  const { hasPermission } = usePermissions();
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const canEdit = hasPermission('org_settings');
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
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <Logo organization={organization} />
          <div className="flex flex-col gap-16">
            <div className="flex flex-col gap-4 max-w-screen-sm">
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
                  placeholder={t('website.form.placeholder')}
                  disabled={!canEdit}
                />
              </Form.Field>
              <Form.Field variant="horizontal">
                <Form.Label>{t('id.label')}</Form.Label>
                <div className="flex flex-col min-w-[350px]">
                  <div className="flex gap-3">
                    <TextInput
                      {...register('id')}
                      size="compact"
                      disabled
                      type="text"
                      readOnly
                      placeholder={t('id.form.placeholder')}
                      className="min-w-[300px]"
                    />
                    <CopyButton contentToCopy={organization.id} />
                  </div>
                </div>
              </Form.Field>
            </div>
            <div className="flex flex-col gap-6 max-w-screen-sm">
              <div className="flex flex-col gap-2">
                <p className="text-heading-5">{t('support-links.title')}</p>
                <div className="flex gap-1 items-center">
                  <p className="text-body-2">{t('support-links.subtitle')}</p>
                  <LinkButton variant="label-2" onClick={handleHelpDialogOpen}>
                    {t('support-links.more-details')}
                  </LinkButton>
                  <HelpDialog open={helpDialogOpen} onClose={handleHelpDialogClose} />
                </div>
              </div>
              <div className="flex flex-col gap-4">
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
                    placeholder={t('support-website.form.placeholder')}
                    disabled={!canEdit}
                  />
                </Form.Field>
              </div>
            </div>
            <div className="flex flex-col gap-4 max-w-screen-sm">
              <p className="text-heading-5">{t('preferences.title')}</p>
              <ThemeSelector />
            </div>
          </div>
        </div>
        <div>
          <Button type="submit" loading={updateOrgMutation.isPending} disabled={!canEdit}>
            {t('save-changes')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default Content;
