import useSession from '../use-session';

const useUserSession = () => {
  const { data: sessionData, dangerouslyCastedData: dangerouslySessionData } =
    useSession();
  const data = sessionData?.user;
  const dangerouslyCastedData = dangerouslySessionData.user;

  return {
    dangerouslyCastedData,
    data,
  };
};

export default useUserSession;
