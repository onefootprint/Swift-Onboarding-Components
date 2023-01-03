import request from '@onefootprint/request';
import {
  OrgAssumeRoleRequest,
  OrgAssumeRoleResponse,
} from '@onefootprint/types/src/api/org-assume-role';
import { useMutation } from '@tanstack/react-query';

import { DASHBOARD_AUTHORIZATION_HEADER } from '../../../config/constants';

const assumeRole = async ({ tenantId, authToken }: OrgAssumeRoleRequest) => {
  const response = await request<OrgAssumeRoleResponse>({
    method: 'POST',
    url: '/org/auth/assume_role',
    headers: {
      [DASHBOARD_AUTHORIZATION_HEADER]: authToken,
    },
    data: { tenantId },
  });
  return response.data;
};

const useAssumeRole = () => useMutation(assumeRole);

export default useAssumeRole;
