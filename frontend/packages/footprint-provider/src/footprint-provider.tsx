import constate from 'constate';

import useLocalFootprint from './use-footprint';

const [Provider, useFootprintJs] = constate(useLocalFootprint);

export default Provider;

export { useFootprintJs };
