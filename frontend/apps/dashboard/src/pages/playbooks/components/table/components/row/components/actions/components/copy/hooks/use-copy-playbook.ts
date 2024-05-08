import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type {
  CopyPlaybookRequest,
  CopyPlaybookResponse,
  OnboardingConfig,
  OrgAssumeRoleResponse,
} from '@onefootprint/types';
import { useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import useSession, { type AuthHeaders } from 'src/hooks/use-session';

const copyPlaybook = async (
  authHeaders: AuthHeaders,
  { playbookId, name, isLive, tenantId }: CopyPlaybookRequest,
) => {
  const assumeResponse = await request<OrgAssumeRoleResponse>({
    method: 'POST',
    url: '/org/auth/assume_role',
    headers: authHeaders,
    data: {
      tenantId,
    },
  });

  const copyResponse = await request<CopyPlaybookResponse>({
    method: 'POST',
    url: `/org/onboarding_configs/${playbookId}/copy`,
    headers: {
      ...authHeaders,
      'x-fp-dashboard-authorization-secondary': assumeResponse.data.token,
    },
    data: {
      name,
      isLive,
    },
  });

  return copyResponse.data;
};

const useCopyPlaybook = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'copy.form.feedback',
  });
  const queryClient = useQueryClient();
  const showErrorToast = useRequestErrorToast();
  const toast = useToast();
  const router = useRouter();
  const { authHeaders, isLive, setIsLive, data } = useSession();

  const handleCtaClick = async (
    playbook: OnboardingConfig,
    payload: CopyPlaybookRequest,
  ) => {
    const needsToAssumeTenant = payload.tenantId !== data.org?.id;
    const needsToSwitchMode = playbook.isLive !== isLive;

    if (needsToAssumeTenant && data.auth) {
      router.push({
        pathname: '/switch-org',
        query: {
          tenant_id: payload.tenantId,
          mode: playbook.isLive ? 'live' : 'sandbox',
          redirect_url: `/playbooks/${playbook.id}`,
        },
      });
      return;
    }

    if (needsToSwitchMode) {
      await setIsLive(playbook.isLive);
    }

    router.push({
      pathname: `/playbooks/${playbook.id}`,
    });
  };

  return useMutation({
    mutationFn: (payload: CopyPlaybookRequest) =>
      copyPlaybook(authHeaders, payload),
    onSuccess: (response, payload) => {
      toast.show({
        description: t('success.description', {
          mode: payload.isLive ? 'Live' : 'Sandbox',
          orgName: data.org?.name,
        }),
        title: t('success.title'),
        cta: {
          label: t('success.cta'),
          onClick: () => handleCtaClick(response, payload),
        },
      });
      queryClient.invalidateQueries();
    },
    onError: showErrorToast,
  });
};

export default useCopyPlaybook;
