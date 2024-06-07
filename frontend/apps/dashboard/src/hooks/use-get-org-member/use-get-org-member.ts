import request from '@onefootprint/request';
import type { OrgMemberResponse } from '@onefootprint/types';
import { useQuery } from '@tanstack/react-query';
import {
  DASHBOARD_ALLOW_ASSUMED_WRITES,
  DASHBOARD_AUTHORIZATION_HEADER,
  DASHBOARD_IS_LIVE_HEADER,
} from 'src/config/constants';

type GetOrgMemberRequest = {
  auth: string;
  isLive: boolean;
  isAssumedSessionEditMode: boolean;
};

export const getOrgMemberRequest = async ({ auth, isLive, isAssumedSessionEditMode }: GetOrgMemberRequest) => {
  const headers = {
    [DASHBOARD_AUTHORIZATION_HEADER]: auth,
    [DASHBOARD_IS_LIVE_HEADER]: JSON.stringify(isLive),
    [DASHBOARD_ALLOW_ASSUMED_WRITES]: JSON.stringify(isAssumedSessionEditMode),
  };
  const response = await request<OrgMemberResponse>({
    headers,
    method: 'GET',
    url: '/org/member',
  });

  return response.data;
};

export const useGetOrgMember = (req: GetOrgMemberRequest) =>
  useQuery(['org-member', req], () => getOrgMemberRequest(req));
