import React from 'react';

import type { FlagProps } from '../types';

const FlagNf = ({ className, testID }: FlagProps) => (
  <svg
    width={20}
    height={15}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    data-testid={testID}
    className={className}
    aria-hidden="true"
  >
    <mask
      id="prefix__a"
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={20}
      height={15}
    >
      <path fill="#fff" d="M0 0h20v15H0z" />
    </mask>
    <g mask="url(#prefix__a)" fillRule="evenodd" clipRule="evenodd">
      <path d="M14 0h6v15h-6V0zM0 0h6v15H0V0z" fill="#409100" />
      <path d="M6 0h8v15H6V0z" fill="#fff" />
      <path
        d="M7.935 11.732c-.973.158-1.28-.317-1.28-.317l.123-.1c.082-.068.36-.045.628-.022.132.01.262.022.366.022.151 0 .326-.023.508-.047.198-.026.404-.053.6-.053.374 0-1.108-.49-1.425-.19-.317.3-1.205-.139-1.205-.39 0-.17.327-.108.625-.051.14.027.272.052.362.052.285 0-.285-.556-.581-.556-.297 0 .296-.13.581-.13.163 0 .313.043.443.079.098.027.184.05.255.05.163 0-.818-.42-.983-.42h.82c.28 0 .35.039.414.076.058.034.114.066.319.066.433 0 .196-.237.196-.237s-1.464-.152-1.749-.361c-.192-.142.325-.092.813-.045.234.023.462.045.602.045.432 0-.912-.309-1.13-.309h.99c.218 0 .456.07.705.143.276.08.566.166.857.166.308 0-.292-.184-.951-.385-.533-.163-1.104-.337-1.267-.436-.167-.103-.04-.063.193.01.27.083.683.211.937.211.473 0-.63-.464-.93-.464-.3 0-.586-.135-.316-.26.166-.076.598.04.974.14.236.063.45.12.563.12.137 0 .238.053.345.11a.895.895 0 0 0 .452.133c.377 0-.797-.502-1.284-.502-.488 0-.57-.237-.277-.237.293 0-.657-.403-.657-.403s-.137-.285.2-.285h.457c.156 0-.156-.496-.456-.496-.3 0-.039-.15.456-.15.3 0 .476.104.688.229.136.08.288.17.497.246.533.193.13-.325 0-.325-.131 0-1.478-.422-1.478-.422s.137-.156 0-.368c-.104-.16.326-.078.588-.029.085.017.152.03.178.03.062 0 .24.044.458.098.148.037.314.078.475.113.4.088-1.36-.646-1.563-.646-.203 0 .434-.12.808-.12a1 1 0 0 1 .364.058c.093.03.188.062.391.062.4 0-.755-.43-1.13-.43-.374 0-.152-.369 0-.369.06 0 .211.02.395.044.29.038.66.087.89.087.175 0 .015-.049-.217-.12-.268-.082-.632-.194-.693-.294-.066-.111.07-.091.306-.056l.138.02c.161.084.296.139.316.074a.073.073 0 0 1 .034-.041c.039.002.077.003.116.003.224 0 .12-.034-.094-.075l-.02-.006c-.326-.1-1.03-.313-.767-.181.052.026.11.057.17.09a4.5 4.5 0 0 0-.377-.039c-.178 0-.357-.138 0-.138h.712c-.222 0-.534 0-.534-.174 0-.118.247-.075.475-.036.107.018.21.036.28.036.222 0 .277 0 .155-.103-.115-.098-.512-.098-.759-.098h-.038c-.241 0 .513-.126.797-.126h.07c0-.002-.014-.003-.037-.005-.124-.012-.536-.052-.83-.185-.263-.12-.032-.09.27-.05.18.023.386.05.527.05.377 0-.155-.253-.555-.253-.321 0-.168-.088.03-.202.05-.028.1-.058.149-.088.144-.09.25.064.312.156.042.062.064.094.064-.003a.35.35 0 0 0-.044-.185c.01.008.025.02.044.032.156.104 0-.271 0-.271s-.155-.104 0-.104c.156 0-.05-.178-.155-.178s.277-.17.277-.17l.084-.722s.208.786.208.892v.553c0 .132-.093.224-.155.285-.079.077-.108.107.155.107.473 0 .453.15.165.15-.288 0 .083.191.6.191s-.434.224-.765.224.331.103.765.103c.293 0-.008.101-.285.195a2.826 2.826 0 0 0-.315.117c-.086.046.126.045.35.032-.118.035-.235.07-.324.098-.108.033-.144.044-.143.049 0 .002.01.002.026.003.045.003.136.008.154.067.027.09.274-.049.507-.179l.11-.061.1-.009s.215.247.215.398c0 .088-.282.114-.583.142l-.03.003c.015-.02-.049-.01-.143.013a2.162 2.162 0 0 0-.404.07c-.097.03-.08.044-.002.046l-.021.007c-.074.022-.1.03-.099.035 0 .002.008.003.02.006.032.006.097.019.115.078.027.09.192-.024.348-.13l.015-.01.148-.01c.17-.012.332-.023.421-.023.28 0-.279.135-.492.135-.091 0 .024.02.198.052.236.042.58.104.678.162.117.069-.225.043-.53.02-.139-.01-.27-.02-.346-.02-.243 0-.288.198-.122.198h.614c.233 0 .475.356.384.356a.855.855 0 0 0-.167.044c-.188.058-.498.155-.831.155h.829c.214 0 .825 0 .825.212 0 .132-.115.16-.267.198a1.25 1.25 0 0 0-.298.104c-.267.145.797.276.797.276s-.421.131-.626.131c-.205 0 .095.194.626.194.41 0 .29.223.214.363a.277.277 0 0 0-.04.093c0 .037-.078.069-.19.115-.145.059-.347.141-.515.288-.193.17.042.12.308.063.144-.03.299-.063.397-.063.279 0 .398.012.307.147-.091.135-.902.35-1.107.35h1.107c.307 0-.086.242-.481.242-.265 0-.413.1-.51.165-.049.032-.085.056-.116.056h.8c.04 0 .086-.065.127-.124.036-.053.069-.101.094-.097.362.057.2.512 0 .512-.23 0-.926.154-.816.309.053.075.136.04.27-.014.143-.059.345-.141.632-.141.555 0 .053.155-.086.155-.14 0-.73.112-.926.21-.13.064.325.043.78.021.226-.01.451-.022.603-.022.457 0-1.084.39-1.65.39-.565 0 .377.149.566.149.073 0 .214.019.388.042.28.038.643.087.945.087.49 0-.49.322-.927.322h-.1c-.39-.002-.684-.003-.495.234.105.131.455.096.82.058.346-.035.707-.072.885.031.32.186-1.095.17-1.705.163l-.205-.002c-.375 0 .375.14 1.02.14h.082c.577 0 .714-.001.714.189 0 .167-1.257.123-1.781.105a8.881 8.881 0 0 0-.206-.005c-.1 0-.159.06-.22.123-.064.067-.13.137-.255.137-.101 0-.15-.065-.193-.124-.059-.08-.11-.15-.275-.036-.288.2.288 2.21.288 2.21H9.413v-1.893s-.506-.159-1.478 0zM9.72 2.51c-.002 0 .004.01.024.028-.012-.02-.022-.028-.024-.028zm-.541 7.505c-.246-.093.377-.097.665-.097.093 0 .126 0 .128.008 0 .004-.007.01-.02.021a.255.255 0 0 0-.108.208c0 .178-.234.064-.454-.044a2.427 2.427 0 0 0-.211-.096zm.509-.724c-.288 0-.91.005-.665.097.062.024.136.06.21.096.221.108.455.222.455.045 0-.12.072-.179.108-.208.013-.01.02-.018.02-.022-.002-.008-.035-.008-.128-.008zm-.52-.419c-.2-.048.308-.05.543-.05.078 0 .104 0 .105.004 0 .002-.006.005-.016.01-.03.016-.089.048-.089.11 0 .093-.19.033-.37-.023a2.867 2.867 0 0 0-.172-.05zm.506-1.98c-.326-.1-1.03-.313-.767-.182.067.033.145.077.224.121.233.13.48.269.507.18.018-.06.109-.065.154-.067.015-.001.026-.002.026-.004 0-.005-.036-.016-.144-.049zm-.767-.808c-.264-.132.441.081.767.18.108.034.145.045.144.05 0 .002-.01.002-.026.003-.045.003-.136.008-.154.067-.027.09-.274-.049-.507-.18a5.654 5.654 0 0 0-.224-.12zm.767-.602c-.326-.1-1.03-.313-.767-.182.067.034.145.077.224.122.233.13.48.268.507.18.018-.06.109-.066.154-.068.015 0 .026-.001.026-.004 0-.004-.036-.015-.144-.048zm.706 4.279c.288 0 .91.005.665.097-.063.024-.136.06-.211.096-.22.108-.454.222-.454.045a.255.255 0 0 0-.108-.208c-.013-.01-.021-.018-.02-.022.002-.008.035-.008.128-.008zm.665-.373c.245-.092-.377-.097-.665-.097-.093 0-.126 0-.128.008-.001.004.007.011.02.022.036.03.108.089.108.208 0 .177.233.063.454-.045.075-.036.148-.072.21-.096zm.385-1.083a.256.256 0 0 1-.007.002c-.066.016-.205.07-.361.132-.317.124-.706.277-.706.194 0-.063-.058-.094-.088-.11-.01-.005-.017-.008-.016-.01 0-.005.027-.005.104-.005.196 0 .946-.173 1.074-.203zm-.27-1.908c.264-.132-.44.081-.767.181a.674.674 0 0 0-.143.049c0 .002.01.003.026.003.045.003.136.008.154.067.027.09.274-.048.507-.179.079-.044.157-.088.224-.121zm-.767.808c.326-.1 1.031-.313.768-.182a5.52 5.52 0 0 0-.224.122c-.233.13-.48.268-.507.179-.018-.06-.11-.065-.154-.067-.016 0-.026-.001-.026-.004-.001-.004.035-.015.143-.048zm.768-1.435c.263-.131-.442.082-.768.182A.674.674 0 0 0 10.25 6c0 .002.01.003.026.004.045.002.136.007.154.067.027.089.274-.049.507-.18.079-.044.157-.087.224-.12zm-.982-.366c.225-.069.711-.215.534-.11a2.727 2.727 0 0 0-.15.099c-.156.107-.32.22-.348.13-.018-.06-.083-.072-.116-.078-.011-.002-.018-.004-.019-.006 0-.005.025-.012.099-.035zm.143 2.384c-.258 0 0-.204 0-.204h.133a.339.339 0 0 0 .14-.044c.102-.047.252-.116.571-.116.486 0-.585.364-.844.364z"
        fill="#409100"
      />
    </g>
  </svg>
);
export default FlagNf;
