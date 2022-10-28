import request from '@onefootprint/request';
import {
  CreateOrgRoleRequest,
  CreateOrgRoleResponse,
} from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import { DASHBOARD_AUTHORIZATION_HEADER } from 'src/config/constants';

const createOrgRole = async (payload: CreateOrgRoleRequest) => {
  const { name, permissions, authToken } = payload;
  const response = await request<CreateOrgRoleResponse>({
    method: 'POST',
    url: '/org/roles',
    data: {
      name,
      permissions,
    },
    headers: {
      [DASHBOARD_AUTHORIZATION_HEADER]: authToken,
    },
  });
  return response.data;
};

const useCreateOrgRole = () => useMutation(createOrgRole);
export default useCreateOrgRole;
