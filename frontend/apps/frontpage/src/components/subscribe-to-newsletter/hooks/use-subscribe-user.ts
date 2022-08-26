import { useMutation } from '@tanstack/react-query';
import request, { RequestError, RequestResponse } from 'request';

type SubscribeUserResponse = {};

type SubscribeUserRequest = {
  email: string;
};

const subscribeUser = async (payload: SubscribeUserRequest) => {
  const response = await request<RequestResponse<SubscribeUserResponse>>({
    method: 'POST',
    url: '/api/subscribe-to-newsletter',
    data: payload,
  });
  return response;
};

const useSubscribeUser = () =>
  useMutation<SubscribeUserResponse, RequestError, SubscribeUserRequest>(
    subscribeUser,
  );

export default useSubscribeUser;
