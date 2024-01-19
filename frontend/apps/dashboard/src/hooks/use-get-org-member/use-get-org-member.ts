import request from '@onefootprint/request';
import type { OrgMemberResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import {
  DASHBOARD_ALLOW_ASSUMED_WRITES,
  DASHBOARD_AUTHORIZATION_HEADER,
} from 'src/config/constants';

type GetOrgMemberRequest = {
  auth: string;
  isAssumedSessionEditMode: boolean;
};

export const getOrgMemberRequest = async ({
  auth,
  isAssumedSessionEditMode,
}: GetOrgMemberRequest) => {
  const response = await request<OrgMemberResponse>({
    headers: {
      [DASHBOARD_AUTHORIZATION_HEADER]: auth,
      [DASHBOARD_ALLOW_ASSUMED_WRITES]: isAssumedSessionEditMode,
    },
    method: 'GET',
    url: '/org/member',
  });

  return response.data;
};

export const useGetOrgMember = (req: GetOrgMemberRequest) =>
  useQuery(['org-member', req], () => getOrgMemberRequest(req));
