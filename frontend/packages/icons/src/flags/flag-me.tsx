import React from 'react';

import type { FlagProps } from '../types';

const FlagMe = ({ className, testID }: FlagProps) => (
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
    <g mask="url(#prefix__a)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h20v15H0V0z"
        fill="#E8AA00"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 2h16v11H2V2z"
        fill="#C51918"
      />
      <mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={2}
        y={2}
        width={16}
        height={11}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2 2h16v11H2V2z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#prefix__b)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.644 9.845a.467.467 0 0 0 .462-.473.467.467 0 0 0-.462-.473.467.467 0 0 0-.461.473c0 .26.206.473.461.473z"
          fill="#1E5E91"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.642 7.707c-1.21-1.407.525-3.849.525-3.849s.26 1.459 1.22 2.44c0 .07-.091.173-.183.277a1.36 1.36 0 0 0-.164.209c-.084.153.206.24.346.24.064 0 .098.092.13.175.038.101.072.19.146.078.135-.202-.135-.647-.135-.647l.428-.45.144-.292h-.144v-.3l-.102.084s-.11-.268-.326-.268c-.214 0-.281-.123-.281-.123h.281c.141 0-.022-.187-.14-.284-.054-.044-.134-.029-.207-.015-.09.017-.167.031-.167-.069 0-.11.085-.124.184-.14a.445.445 0 0 0 .19-.063c.091-.066.215-.046.35-.024.07.012.144.024.218.024h.348c.125 0-.204.203-.204.203l.204.181.303.31-.152.09.313.302s-.106.173 0 .173c.043 0 .072.036.09.078.02-.042.048-.078.092-.078.106 0 0-.173 0-.173l.312-.303-.151-.09.303-.309.203-.18s-.329-.204-.203-.204h.348c.073 0 .147-.012.218-.024.134-.022.258-.042.35.024.056.04.126.052.19.063.098.016.184.03.184.14 0 .1-.078.086-.167.069-.073-.014-.154-.029-.207.015-.118.097-.282.284-.14.284h.28s-.066.123-.28.123c-.216 0-.327.268-.327.268l-.101-.083v.3h-.145l.145.29.427.451s-.27.445-.135.647c.075.111.108.023.147-.078.031-.083.066-.174.13-.174.14 0 .43-.088.345-.241-.035-.063-.1-.137-.163-.21-.092-.103-.183-.206-.183-.276.96-.981 1.22-2.44 1.22-2.44s1.735 2.442.524 3.85c-1.21 1.407-2.1.982-2.1.982l.497.445-.14.122h.413l-.152.102.112.049.118.052s-.32.235 0 .235l.16-.003c.06-.002.121-.004.184-.004.016 0-.021-.092-.058-.183-.037-.09-.073-.18-.057-.179.035.002.103.084.17.166.055.065.11.131.147.156.025.017.12-.016.208-.047.075-.026.144-.05.162-.041.074.037.055.113.037.185a.69.69 0 0 0-.012.055c-.003.016.092-.046.192-.111.105-.068.216-.14.224-.13a.372.372 0 0 0 .006.008c.036.043.093.112-.332.44 0 .063.003.114.004.156.006.134.008.168-.083.168-.04 0-.097.02-.163.044-.168.06-.395.14-.56-.043-.229-.255-.58-.637-.58-.637v.187l-.417-.422-.08.235-.56-.644-.152.084s.516 1.424.792 1.434c.137.005-.07.138-.347.314-.279.179-.627.401-.757.58-.039.053-.068-.028-.091-.204-.023.176-.053.257-.091.204-.13-.179-.479-.401-.758-.58-.276-.176-.484-.31-.347-.314.276-.01.792-1.434.792-1.434l-.151-.084-.56.644-.08-.235-.417.422v-.187s-.352.382-.58.636c-.166.184-.393.103-.56.044-.066-.023-.123-.043-.163-.043-.145 0-.193-.202 0-.45.162-.208.5-.198.792-.19l.16.003c.319 0 0-.235 0-.235l.118-.052.112-.05-.152-.101h.413l-.14-.122.496-.445s-.889.425-2.1-.983z"
          fill="#F6C540"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m7.77 10.644-.546-.959s-.715-1.649-.715-1.849c0-.2-.288-.793-.288-.62v.62l1.206 2.718v.214h.163l.18-.124z"
          fill="#F6C540"
        />
        <path
          d="m12.151 9.353.083-.276 1.017.306-.084.276-1.016-.306z"
          fill="#F6C540"
        />
        <path
          d="m12.692 8.85.275.09-.268.861-.275-.09.268-.86z"
          fill="#F6C540"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m12.948 8.57-.059-.014-.024.095-.108-.027-.014.058.108.027-.028.108.06.013.027-.107.106.026.014-.058-.106-.026.024-.096zM9.809 3.264l.03.104h.09l.03-.104c.075.023.143.048.204.077l.002-.023c.482.044.733.246.706.601-.022.294-.171.448-.42.444v.22s-.403.155-.605.155c-.202 0-.606-.155-.606-.155V4.36c-.204-.026-.326-.177-.346-.44-.027-.356.224-.558.706-.602l.002.024c.062-.029.13-.055.207-.078zm-.51.903a3.753 3.753 0 0 0-.055.015c-.11-.02-.165-.109-.177-.275-.013-.168.066-.285.252-.353-.127.163-.136.37-.02.613zm.171-.045a2.34 2.34 0 0 1 .314-.057v-.607c-.387.136-.48.344-.314.664zm.487-.052c.13.017.288.056.39.084l-.051-.029c.172-.329.072-.54-.339-.676v.621zm.492-.514c.13.166.136.38.01.631.153.002.225-.086.24-.28.012-.167-.066-.284-.25-.351z"
          fill="#F6C540"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.846 3.45a.202.202 0 1 0 0-.404.202.202 0 0 0 0 .403z"
          fill="#3D58DB"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m9.874 2.811-.06.002v.098h-.112v.06h.111v.11h.06V2.97h.11v-.06h-.109v-.099z"
          fill="#F6C540"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.721 6.475s.711-.135 1.096-.135c.346 0 1.097.135 1.097.135 0 .85.239 1.37 0 1.95-.24.581-.824.302-1.089.858-.338-.527-.795-.237-1.104-.988-.309-.75.188-1.096 0-1.82z"
          fill="#1E5E91"
        />
        <mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={8}
          y={6}
          width={4}
          height={4}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.721 6.475s.711-.135 1.096-.135c.346 0 1.097.135 1.097.135 0 .85.239 1.37 0 1.95-.24.581-.824.302-1.089.858-.338-.527-.795-.237-1.104-.988-.309-.75.188-1.096 0-1.82z"
            fill="#fff"
          />
        </mask>
        <g mask="url(#prefix__c)">
          <path fill="#5EAA22" d="M8.721 8.248h2.192v1.064H8.721z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.37 6.894c-.084-.178.44-.2.44-.2s.113.2 0 .482c-.083.206.054.188.243.162.071-.01.15-.02.226-.02.118 0 .18-.008.231.011.072.027.123.108.276.342.07.107.067.178.025.22.004.109-.115.199-.334.257l-.029-.115c.116-.03.187-.06.22-.092-.165.01-.389-.071-.389-.176 0-.155-.528-.122-.846-.103-.08.005-.148.01-.19.01-.184 0-.042-.226.087-.432l.04-.064c.066-.107.087-.134.082-.155-.005-.022-.04-.037-.083-.127zm1.256-.028c-.316-.05-.494-.002-.494.175 0 .17.169.242.477.241a.43.43 0 0 1 .031.012.48.48 0 0 1-.042.017l.039.111c.194-.07.194-.194-.003-.256l-.008-.002h-.009c-.256.002-.37-.046-.37-.123 0-.069.108-.098.362-.058l.017-.117z"
            fill="#F6C540"
          />
        </g>
      </g>
    </g>
  </svg>
);
export default FlagMe;
