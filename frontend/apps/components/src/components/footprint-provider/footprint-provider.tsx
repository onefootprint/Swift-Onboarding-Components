import constate from 'constate';

import useLocalFootprintProvider from './hooks/use-footprint-provider';

const [Provider, useBareFootprintProvider] = constate(useLocalFootprintProvider);

export const useFootprintProvider = () => useBareFootprintProvider();

export default Provider;
