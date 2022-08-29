import { useMutation } from '@tanstack/react-query';
import request, { RequestError } from 'request';

type SubscribeUserResponse = {};

type SubscribeUserRequest = {
  email: string;
};

const subscribeUser = async (payload: SubscribeUserRequest) => {
  const response = await request<SubscribeUserResponse>({
    method: 'POST',
    url: '/api/subscribe-to-newsletter',
    data: payload,
  });
  return response.data;
};

const useSubscribeUser = () =>
  useMutation<SubscribeUserResponse, RequestError, SubscribeUserRequest>(
    subscribeUser,
  );

export default useSubscribeUser;
