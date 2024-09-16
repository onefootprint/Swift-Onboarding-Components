import request from '@onefootprint/request';
import { useMutation } from '@tanstack/react-query';

type SubscribeUserResponse = {};

type SubscribeUserRequest = {
  email: string;
};

const subscribeUser = async (payload: SubscribeUserRequest) => {
  const response = await request<SubscribeUserResponse>(
    {
      method: 'POST',
      url: '/api/subscribe-to-newsletter',
      data: payload,
      baseURL: undefined,
      withCredentials: false,
    },
    { omitSessionId: true },
  );
  return response.data;
};

const useSubscribeUser = () => {
  return useMutation({
    mutationFn: subscribeUser,
  });
};

export default useSubscribeUser;
