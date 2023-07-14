import { FootprintClient } from '../types';

type UseFootprintProvider = {
  client: FootprintClient;
};

const useFootprintProvider = ({ client }: UseFootprintProvider) => {
  const send = (name: string, data?: any) => client.send(name, data);

  const on = (name: string, callback: (data?: any) => void) =>
    client.on(name, callback);

  const load = () => client.load();

  return {
    send,
    on,
    load,
  };
};

export default useFootprintProvider;
