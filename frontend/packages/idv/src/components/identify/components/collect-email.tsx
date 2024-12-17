import { getLogger } from '@/idv/utils/logger';
import { patchHostedIdentifySessionVault } from '@onefootprint/axios';
import { useRequestErrorToast } from '@onefootprint/hooks';
import { useMutation } from '@tanstack/react-query';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';
import LegalFooter from '../../legal-footer';
import type { Context } from '../identify.types';
import getHeader from '../utils/get-header';
import EmailPageStructure from './identify-login/components/email-page-structure';

const { logError } = getLogger({ location: 'collect-email' });

type CollectEmailProps = {
  context: Context;
  onDone: (email: string) => Promise<void>;
};

const CollectEmail = ({ context, onDone }: CollectEmailProps) => {
  const {
    state: { identifyToken, email },
    initArgs: { logoConfig },
    onPrev,
  } = context;
  const { t } = useTranslation('identify');
  const showRequestErrorToast = useRequestErrorToast();
  const vaultMutation = useMutation({
    mutationFn: async (emailToVault: string | null) => {
      const { data } = await patchHostedIdentifySessionVault({
        headers: { 'X-Fp-Authorization': identifyToken },
        // @ts-expect-error: Autogenerated types don't support null values
        body: { 'id.email': emailToVault },
        throwOnError: true,
      });
      if (emailToVault) {
        await onDone(emailToVault);
      }
      return data;
    },
    onError: error => {
      logError('Error while vaulting email:', error);
      showRequestErrorToast(error);
    },
  });

  const handleSubmit = (emailFromForm: string) => {
    vaultMutation.mutate(emailFromForm);
  };

  // Clear out the email if the user goes back
  const handleGoBack = onPrev
    ? () => {
        vaultMutation.mutate(null, { onSuccess: onPrev });
      }
    : undefined;

  return (
    <EmailPageStructure
      defaultEmail={email?.value}
      Header={getHeader(logoConfig, handleGoBack)}
      Footer={<LegalFooter />}
      isLoading={vaultMutation.isPending}
      onSubmit={vaultMutation.isPending ? noop : handleSubmit}
      texts={{
        header: {
          title: t('email-step.title'),
          subtitle: t('email-step.subtitle'),
        },
        email: {
          invalid: t('email.errors.invalid'),
          label: t('email.label'),
          placeholder: t('email.placeholder'),
          required: t('email.errors.required'),
        },
        cta: t('continue'),
      }}
    />
  );
};

export default CollectEmail;
