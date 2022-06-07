import constate from 'constate';

import usePostmate from './use-postmate';

const [Provider, useFootprintJs] = constate(usePostmate);

export default Provider;

export { useFootprintJs };
