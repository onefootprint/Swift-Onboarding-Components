import React from 'react';
import Svg, { Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagMq = ({ style }: FlagProps) => (
  <Svg width={20} height={15} fill="none" style={style} aria-hidden={true}>
    <Path fill="#21428E" d="M0 0h20v15H0z" />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M8.75 0h2.5v6.25H20v2.5h-8.75V15h-2.5V8.75H0v-2.5h8.75V0z"
      fill="#F7FCFF"
    />
    <Path
      d="M1.597 3.963c.277.044.763.096.809-.008.061-.138.29-.78 1.116-.765.825.016 1.513-.153 1.513-.688 0-.544-.244-.565-.733-.428-.49.138-1.294.04-1.315-.275-.014-.209-.943-.089-.935-.255.003-.063.847-.071.957-.198.08-.204.3-.32.819-.311.84.015 1.941.29 2.048 1.04.122.855.122 1.39-.84 1.605-.911.202-1.208.152-1.07.275.29.259 1.91-.26 2.506 0 .35.152.474 1.13-.688 1.146-1.161.015-1.987.184-2.583-.275-.596-.459-.245-.275-.795-.367-.505-.084-.637-.439-.809-.496zm0 8.847c.277.044.763.096.809-.008.061-.138.29-.78 1.116-.764.825.015 1.513-.153 1.513-.688 0-.545-.244-.566-.733-.428-.49.137-1.294.04-1.315-.276-.014-.208-.943-.089-.935-.255.003-.063.847-.071.957-.198.08-.204.3-.32.819-.31.84.015 1.941.29 2.048 1.039.122.856.122 1.39-.84 1.605-.911.202-1.208.153-1.07.275.29.259 1.91-.26 2.506 0 .35.153.474 1.131-.688 1.146-1.161.016-1.987.184-2.583-.275-.596-.458-.245-.275-.795-.367-.505-.084-.637-.439-.809-.496zm11.465-8.847c.278.044.763.096.81-.008.06-.138.29-.78 1.115-.765.826.016 1.513-.153 1.513-.688 0-.544-.244-.565-.733-.428-.49.138-1.294.04-1.315-.275-.014-.209-.943-.089-.935-.255.003-.063.848-.071.957-.198.08-.204.3-.32.819-.311.84.015 1.941.29 2.048 1.04.122.855.122 1.39-.84 1.605-.91.202-1.208.152-1.07.275.29.259 1.91-.26 2.506 0 .35.152.474 1.13-.688 1.146-1.161.015-1.987.184-2.583-.275-.596-.459-.245-.275-.795-.367-.505-.084-.637-.439-.809-.496zm0 8.847c.278.044.763.096.81-.008.06-.138.29-.78 1.115-.764.826.015 1.513-.153 1.513-.688 0-.545-.244-.566-.733-.428-.49.137-1.294.04-1.315-.276-.014-.208-.943-.089-.935-.255.003-.063.848-.071.957-.198.08-.204.3-.32.819-.31.84.015 1.941.29 2.048 1.039.122.856.122 1.39-.84 1.605-.91.202-1.208.153-1.07.275.29.259 1.91-.26 2.506 0 .35.153.474 1.131-.688 1.146-1.161.016-1.987.184-2.583-.275-.596-.458-.245-.275-.795-.367-.505-.084-.637-.439-.809-.496z"
      fill="#fff"
    />
  </Svg>
);
export default FlagMq;
