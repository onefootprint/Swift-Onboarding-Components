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
    true,
  );
  return response.data;
};

const useSubscribeUser = () => useMutation(subscribeUser);

export default useSubscribeUser;
