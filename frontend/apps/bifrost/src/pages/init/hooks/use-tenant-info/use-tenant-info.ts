import { useQuery } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import { CLIENT_PUBLIC_KEY_HEADER } from 'src/config/constants';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import { Events } from 'src/utils/state-machine/bifrost';
import {
  UserDataAttribute,
  UserDataAttributeLabels,
} from 'src/utils/state-machine/types';

type TenantInfoRequest = {
  tenantPk: string;
};

type TenantInfoResponse = {
  name: string;
  requiredUserData: UserDataAttribute[];
};

const getTenantInfo = async (payload: TenantInfoRequest) => {
  const { data: response } = await request<RequestResponse<TenantInfoResponse>>(
    {
      method: 'GET',
      url: '/org/config',
      headers: {
        [CLIENT_PUBLIC_KEY_HEADER]: payload.tenantPk,
      },
    },
  );
  return response.data;
};

const useTenantInfo = (tenantPk: string) => {
  const [, send] = useBifrostMachine();

  useQuery<TenantInfoResponse, RequestError>(
    ['tenantInfo', tenantPk],
    () => getTenantInfo({ tenantPk }),
    {
      enabled: !!tenantPk,
      retry: 3,
      onSuccess: ({ name, requiredUserData }) => {
        send({
          type: Events.tenantInfoRequestSucceeded,
          payload: {
            pk: tenantPk,
            name,
            requiredUserData: requiredUserData.map(
              (attr: string) => UserDataAttributeLabels[attr],
            ),
          },
        });
      },
      onError: () => {
        send({
          type: Events.tenantInfoRequestFailed,
        });
      },
    },
  );
};

export default useTenantInfo;
