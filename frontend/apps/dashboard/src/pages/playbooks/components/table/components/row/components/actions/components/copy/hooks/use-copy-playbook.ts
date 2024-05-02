import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type {
  CopyPlaybookRequest,
  CopyPlaybookResponse,
  OnboardingConfig,
} from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import useSession, { type AuthHeaders } from 'src/hooks/use-session';

const copyPlaybook = async (
  authHeaders: AuthHeaders,
  { playbookId, name, isLive }: CopyPlaybookRequest,
) => {
  const response = await request<CopyPlaybookResponse>({
    method: 'POST',
    url: `/org/onboarding_configs/${playbookId}/copy`,
    headers: authHeaders,
    data: {
      name,
      isLive,
    },
  });

  return response.data;
};

const useCopyPlaybook = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'copy.form.feedback',
  });
  const { authHeaders, isLive, setIsLive } = useSession();
  const queryClient = useQueryClient();
  const showErrorToast = useRequestErrorToast();
  const toast = useToast();
  const router = useRouter();

  const handleCtaClick = async (playbook: OnboardingConfig) => {
    const needsToSwitchMode = playbook.isLive !== isLive;

    if (needsToSwitchMode) {
      await setIsLive(playbook.isLive);
      const newMode = playbook.isLive ? 'Live' : 'Sandbox';
      toast.show({
        description: t('mode.description', { mode: newMode }),
        title: t('mode.title', { mode: newMode }),
      });
    }

    router.push({
      pathname: `/playbooks/${playbook.id}`,
    });
  };

  return useMutation({
    mutationFn: (data: CopyPlaybookRequest) => copyPlaybook(authHeaders, data),
    onSuccess: (response, payload) => {
      toast.show({
        description: t('success.description', {
          mode: payload.isLive ? 'Live' : 'Sandbox',
        }),
        title: t('success.title'),
        cta: {
          label: t('success.cta'),
          onClick: () => handleCtaClick(response),
        },
      });
      queryClient.invalidateQueries();
    },
    onError: showErrorToast,
  });
};

export default useCopyPlaybook;
