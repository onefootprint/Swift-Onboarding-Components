import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';

export type GoogleLoginResponse = {
  redirectUrl: string;
};

const loginGoogle = async () => {
  const { data: response } = await request<
    RequestResponse<GoogleLoginResponse>
  >({
    method: 'GET',
    url: '/auth/google_oauth',
    params: { redirect_url: `${window.location.origin}/auth` },
  });
  return response.data;
};
const useLoginGoogle = () =>
  useMutation<GoogleLoginResponse, RequestError>(loginGoogle);

export default useLoginGoogle;
