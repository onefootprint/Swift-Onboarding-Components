import request from '@onefootprint/request';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

const generateInvoice = async (authHeaders: AuthHeaders, id: string) => {
  const response = await request<{}>({
    method: 'POST',
    url: '/private/invoice',
    headers: authHeaders,
    data: {
      tenantId: id,
      billingDate: new Date().toISOString().split('T')[0],
    },
  });

  return response.data;
};

const useGenerateInvoice = () => {
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => generateInvoice(authHeaders, id),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
};

export default useGenerateInvoice;
