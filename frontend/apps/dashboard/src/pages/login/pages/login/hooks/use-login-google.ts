import { useMutation } from 'react-query';
import request, { RequestError, RequestResponse } from 'request';
import { GOOGLE_REDIRECT_URL } from 'src/config/constants';

export type GoogleLoginResponse = {
  redirectUrl: string;
};

const loginGoogle = async () => {
  const { data: response } = await request<
    RequestResponse<GoogleLoginResponse>
  >({
    method: 'GET',
    url: '/auth/google_oauth',
    params: { redirect_url: `${GOOGLE_REDIRECT_URL}/auth` },
  });
  return response.data;
};
const useLoginGoogle = () =>
  useMutation<GoogleLoginResponse, RequestError>(loginGoogle);

export default useLoginGoogle;
