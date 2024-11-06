import { postEntitiesByFpIdBusinessOwnersKycLinksMutation } from '@onefootprint/axios/dashboard';
import { useClipboard, useToggle } from '@onefootprint/hooks';
import type { PrivateBusinessOwnerKycLink } from '@onefootprint/request-types/dashboard';
import { Checkbox, Dialog, InlineAlert, LinkButton, Stack, Text, useToast } from '@onefootprint/ui';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type FormValues = {
  boIds: string[];
  hasOptionSelected?: boolean;
};

type AwaitingBosEventProps = {
  fpId: string;
};

const AwaitingBosEvent = ({ fpId }: AwaitingBosEventProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'audit-trail.timeline.awaiting-bos-event' });
  const toast = useToast();
  const [isOpen, open, close] = useToggle();
  const [bos, setBos] = useState<PrivateBusinessOwnerKycLink[]>([]);
  const mutation = useMutation(postEntitiesByFpIdBusinessOwnersKycLinksMutation());

  const handleGenerateLinks = async () => {
    const data = await mutation.mutateAsync({ path: { fpId }, body: {} });
    setBos(data);
    open();
  };

  const handleSubmit = async ({ boIds: sendToBoIds }: FormValues) => {
    await mutation.mutateAsync({ path: { fpId }, body: { sendToBoIds } });
    toast.show({
      title: t('feedback.title'),
      description: t('feedback.description'),
    });
    close();
  };

  return (
    <>
      <Stack gap={2}>
        <Text variant="label-3" color="info">
          {t('waiting-message')}
        </Text>
        <Text variant="label-3" color="tertiary">
          ·
        </Text>
        <LinkButton variant="label-3" onClick={handleGenerateLinks} disabled={mutation.isPending}>
          {t('resend-link')}
        </LinkButton>
      </Stack>
      <Dialog
        title={t('dialog.title')}
        open={isOpen}
        size="compact"
        onClose={close}
        primaryButton={{
          label: t('dialog.buttons.send'),
          type: 'submit',
          form: 'resend-form',
          loading: mutation.isPending,
        }}
        secondaryButton={{
          label: t('dialog.buttons.cancel'),
          disabled: mutation.isPending,
          onClick: close,
        }}
      >
        {bos && <Form onSubmit={handleSubmit} businessOwners={bos} />}
      </Dialog>
    </>
  );
};

const Form = ({
  onSubmit,
  businessOwners,
}: { onSubmit: (data: FormValues) => void; businessOwners: Array<PrivateBusinessOwnerKycLink> }) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'audit-trail.timeline.awaiting-bos-event' });
  const { copy, copiedText } = useClipboard();
  const { control, register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      boIds: businessOwners.map(bo => bo.id),
    },
  });
  const boIds = useWatch({ control, name: 'boIds' });
  const noOptionSelected = boIds.length === 0;

  return (
    <form id="resend-form" onSubmit={handleSubmit(onSubmit)}>
      <Stack gap={5} direction="column">
        <Text variant="body-2">{t('dialog.description')}</Text>
        <Stack gap={4} direction="column">
          {businessOwners.map(bo => (
            <Stack key={bo.id} justifyContent="space-between">
              <Checkbox label={bo.name} value={bo.id} defaultChecked {...register('boIds')} />
              <LinkButton variant="label-3" onClick={() => copy(bo.link)}>
                {copiedText === bo.link ? t('dialog.copied') : t('dialog.copy-link')}
              </LinkButton>
            </Stack>
          ))}
        </Stack>
      </Stack>
      {noOptionSelected ? (
        <>
          <InlineAlert marginTop={5} variant="warning">
            {t('error')}
          </InlineAlert>
          <input type="hidden" {...register('hasOptionSelected', { required: true })} />
        </>
      ) : null}
    </form>
  );
};

export default AwaitingBosEvent;
