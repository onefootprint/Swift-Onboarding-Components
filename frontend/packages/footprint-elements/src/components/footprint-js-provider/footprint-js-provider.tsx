import constate from 'constate';

import useLocalFootprint from './hooks/use-footprint-js';

const [Provider, useFootprintJs] = constate(useLocalFootprint);

export default Provider;

export { useFootprintJs };
