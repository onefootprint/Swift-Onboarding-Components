import React from 'react';

import type { FlagProps } from '../types';

const FlagEs = ({ className, testID }: FlagProps) => (
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
        d="M0 0v15h20V0H0z"
        fill="#FFB400"
      />
      <mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={20}
        height={15}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v15h20V0H0z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#prefix__b)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v3.75h20V0H0zm0 11.25V15h20v-3.75H0z"
          fill="#C51918"
        />
        <path fill="#F1F9FF" d="M3.13 6.42h.7v3.64h-.7z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.11 5.79H2.85v.35h.21v.28h.84v-.28h.21v-.35zm-.21 4.48h.21v.35H2.85v-.35h.21v-.28h.84v.28z"
          fill="#C88A02"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.48 5.86c.152 0 .168-.057.258-.143.07-.067.232-.15.232-.242 0-.213-.22-.385-.49-.385s-.49.172-.49.385c0 .104.112.173.197.242.089.073.154.143.293.143z"
          fill="#AD1619"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.85 10.62h1.26v.56s-.157-.07-.315-.07c-.157 0-.315.07-.315.07s-.157-.07-.315-.07a.898.898 0 0 0-.315.07v-.56z"
          fill="#005BBF"
        />
        <mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={2}
          y={10}
          width={3}
          height={2}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.85 10.62h1.26v.56s-.157-.07-.315-.07c-.157 0-.315.07-.315.07s-.157-.07-.315-.07a.898.898 0 0 0-.315.07v-.56z"
            fill="#fff"
          />
        </mask>
        <g mask="url(#prefix__c)" fill="#fff">
          <path d="m2.839 11.07-.028-.067a.834.834 0 0 1 .342-.076.37.37 0 0 1 .177.04.306.306 0 0 0 .15.033.306.306 0 0 0 .15-.034.37.37 0 0 1 .178-.039c.114 0 .228.025.341.076l-.027.067a.767.767 0 0 0-.314-.07.306.306 0 0 0-.15.034.37.37 0 0 1-.178.039.37.37 0 0 1-.177-.04.306.306 0 0 0-.15-.033.767.767 0 0 0-.314.07zm0-.21-.028-.067a.834.834 0 0 1 .342-.076.37.37 0 0 1 .177.04.306.306 0 0 0 .15.033.306.306 0 0 0 .15-.034.37.37 0 0 1 .178-.039c.114 0 .228.025.341.076l-.027.067a.767.767 0 0 0-.314-.07.306.306 0 0 0-.15.034.37.37 0 0 1-.178.039.37.37 0 0 1-.177-.04.306.306 0 0 0-.15-.033.767.767 0 0 0-.314.07z" />
        </g>
        <path fill="#F1F9FF" d="M9.99 6.42h.7v3.64h-.7z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.97 5.79H9.71v.35h.21v.28h.84v-.28h.21v-.35zm-.21 4.48h.21v.35H9.71v-.35h.21v-.28h.84v.28z"
          fill="#C88A02"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.34 5.86c.152 0 .168-.057.258-.143.07-.067.232-.15.232-.242 0-.213-.22-.385-.49-.385s-.49.172-.49.385c0 .104.112.173.197.242.089.073.154.143.293.143z"
          fill="#AD1619"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.71 10.62h1.26v.56s-.158-.07-.315-.07-.315.07-.315.07-.158-.07-.315-.07a.89.89 0 0 0-.315.07v-.56z"
          fill="#005BBF"
        />
        <mask
          id="prefix__d"
          maskUnits="userSpaceOnUse"
          x={9}
          y={10}
          width={2}
          height={2}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.71 10.62h1.26v.56s-.158-.07-.315-.07-.315.07-.315.07-.158-.07-.315-.07a.89.89 0 0 0-.315.07v-.56z"
            fill="#fff"
          />
        </mask>
        <g mask="url(#prefix__d)" fill="#fff">
          <path d="m9.699 11.07-.028-.067a.834.834 0 0 1 .342-.076.37.37 0 0 1 .177.04.307.307 0 0 0 .15.033.306.306 0 0 0 .15-.034.371.371 0 0 1 .178-.039c.114 0 .228.025.341.076l-.027.067a.767.767 0 0 0-.314-.07.307.307 0 0 0-.15.034.37.37 0 0 1-.178.039.371.371 0 0 1-.177-.04.306.306 0 0 0-.15-.033.767.767 0 0 0-.314.07zm0-.21-.028-.067a.834.834 0 0 1 .342-.076.37.37 0 0 1 .177.04.307.307 0 0 0 .15.033.306.306 0 0 0 .15-.034.371.371 0 0 1 .178-.039c.114 0 .228.025.341.076l-.027.067a.767.767 0 0 0-.314-.07.307.307 0 0 0-.15.034.37.37 0 0 1-.178.039.371.371 0 0 1-.177-.04.306.306 0 0 0-.15-.033.767.767 0 0 0-.314.07z" />
        </g>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.117 9.8c.127-.153.197-.292.197-.44a.395.395 0 0 0-.076-.24l.008-.003s.139-.06.187-.084c.09-.043.17-.089.247-.145a1.93 1.93 0 0 1 .216-.13l.095-.05.026-.013.12-.066a.757.757 0 0 0 .228-.18.335.335 0 0 0-.077-.499c-.087-.06-.204-.093-.376-.12l-.035-.005-.21-.033a13.234 13.234 0 0 1-.222-.036c.43-.072 1.045-.046 1.316.094l.256-.498c-.55-.284-1.806-.255-2.274.068-.344.237-.298.595.06.749.15.064.344.107.705.165-.06.035-.11.067-.157.101a.997.997 0 0 1-.16.093l-.157.07-.02.009c-.291.132-.433.316-.39.647l.023.179.04.012.43.355zm-.36-.463v.003-.003zm7.684.023c0 .148.07.287.197.44l.43-.355.04-.012.024-.18c.042-.33-.1-.514-.39-.646l-.02-.009h-.001a8.57 8.57 0 0 1-.156-.07 1.001 1.001 0 0 1-.16-.093 1.78 1.78 0 0 0-.157-.101c.36-.058.555-.1.705-.165.357-.154.404-.512.06-.75-.469-.322-1.724-.351-2.275-.067l.257.498c.27-.14.885-.166 1.315-.094l-.22.036-.211.033-.036.005c-.172.027-.289.06-.376.12a.335.335 0 0 0-.077.499.757.757 0 0 0 .23.18c.033.02.07.04.119.066l.025.013.095.05a2.1 2.1 0 0 1 .217.13c.077.056.156.102.246.145l.187.084.009.003a.395.395 0 0 0-.077.24z"
          fill="#AD1619"
        />
        <path
          d="m3.702 7.75.207.043V8.1c-.22.175-.779.471-.779.471V7.75h.572zm6.495 0-.207.043V8.1c.22.175.779.471.779.471V7.75h-.572z"
          fill="#F1F9FF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.235 4.504V4.4c-.36-.258-.737-.387-1.131-.387a2.258 2.258 0 0 0-1.147-.195v-.002c-.582-.057-1.168.197-1.168.197-.591 0-1.131.387-1.131.387v.103l.706.709s.198.682 1.59.522v.002s.921-.026.986-.047c.026-.009.053-.016.08-.024.18-.053.386-.113.509-.453l.706-.71zM6.954 3.85c-.02.236-.135 1.66 0 1.88V3.85z"
          fill="#AD1619"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.196 5.093v-.002L4.7 4.624l.048-.051.466.439.012-.055a.594.594 0 0 0 .164.019V4.88l.104.056c.05.027.123.035.219.019.07-.011.118-.093.133-.267l.032-.352.105.337c.048.152.12.22.224.22.1 0 .141-.037.146-.13l.012-.265.12.236c.043.085.103.124.187.124.121 0 .202-.1.202-.26h.142c0 .16.08.26.202.26.084 0 .144-.039.187-.124l.12-.236.012.264c.005.094.045.13.146.13.104 0 .176-.067.224-.22l.105-.336.031.352c.016.174.063.256.134.267.096.016.168.008.22-.02L8.5 4.88v.095a.594.594 0 0 0 .164-.02l.022.102.516-.485.048.051-.642.604c-.094.173-.14.286-.14.334 0 .072-.189.115-.555.159a9.025 9.025 0 0 1-.903.06v.001h-.07a9.024 9.024 0 0 1-.903-.061c-.367-.044-.554-.087-.554-.16a.147.147 0 0 0-.005-.033.55.55 0 0 1-.08-.194 3.518 3.518 0 0 0-.056-.106L5.2 5.094h-.004zm3.441.012c-.115.02-.197.018-.241-.018a.55.55 0 0 1-.242.007c-.098-.016-.166-.081-.208-.19a.32.32 0 0 1-.203.125c.448.063.762.153.762.153s-.008.066-.027.144l.071-.136.007-.009.081-.076zm-1.105-.103a.225.225 0 0 1-.093-.083.312.312 0 0 1-.113.064c.07.005.14.012.206.02zm-.453-.033a.32.32 0 0 1-.134-.117.32.32 0 0 1-.133.117l.097-.002h.056l.114.002zm-1.69.207-.065-.061c.078.008.136 0 .17-.028a.55.55 0 0 0 .242.007c.098-.016.166-.081.207-.19a.321.321 0 0 0 .197.124 6.546 6.546 0 0 0-.751.148zm1.172-.194A6.277 6.277 0 0 0 6.362 5a.224.224 0 0 0 .089-.081c.032.028.07.05.11.063zm1.722.581c.05.023.088 0 .12-.044a.226.226 0 0 0-.005.033.677.677 0 0 1-.123.04 4.23 4.23 0 0 1-.37.06c-.297.035-.65.058-.93.06a8.867 8.867 0 0 1-.93-.06 3.834 3.834 0 0 1-.37-.06.787.787 0 0 1-.092-.026.108.108 0 0 0 .008-.003c.153-.071 1.164-.139 1.346-.15.182.011 1.193.079 1.346.15zm.193-.013-.001.002V5.55h.001z"
          fill="#C88A02"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.945 3.342a.21.21 0 1 0 0-.42.21.21 0 0 0 0 .42z"
          fill="#005BBF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.809 4.373a.278.278 0 0 0 .02.064.265.265 0 0 0-.094-.017c-.097 0-.175.047-.175.105 0 .058.078.105.175.105.097 0 .175-.047.175-.105 0 .058.078.105.175.105.097 0 .175-.047.175-.105 0-.058-.078-.105-.175-.105a.278.278 0 0 0-.069.009.265.265 0 0 0-.001-.096c-.019-.095-.08-.163-.137-.152-.057.011-.088.097-.07.192zm.101.152v-.003.003zm-1.131-.018a.278.278 0 0 1-.02-.064c-.019-.095.012-.18.07-.192.056-.01.117.057.136.152a.265.265 0 0 1 .001.096.278.278 0 0 1 .069-.009c.097 0 .175.047.175.105 0 .058-.078.105-.175.105-.097 0-.175-.047-.175-.105v-.003.003c0 .058-.078.105-.175.105-.097 0-.175-.047-.175-.105 0-.058.078-.105.175-.105a.25.25 0 0 1 .094.017zm2.192.064c-.008.057-.092.093-.188.08-.095-.014-.166-.072-.158-.13.008-.056.092-.092.188-.079a.265.265 0 0 1 .09.03.279.279 0 0 1-.011-.066c-.005-.097.038-.177.096-.18.058-.004.109.072.114.169a.265.265 0 0 1-.012.095.277.277 0 0 1 .07.001c.095.013.166.07.158.128-.008.058-.092.093-.188.08-.096-.013-.167-.07-.159-.128zm0 0v-.004.004zm.667.277c.085.046.176.041.204-.01l.001-.003a.068.068 0 0 0 .03.019c.055.017.123-.045.151-.137.029-.092.006-.181-.049-.198-.055-.017-.123.044-.152.137a.279.279 0 0 0-.012.065.265.265 0 0 0-.075-.058c-.085-.046-.176-.04-.204.01-.027.052.02.13.106.175zm-3.435.022c-.085.045-.177.04-.204-.01l-.001-.004a.068.068 0 0 1-.03.02c-.055.016-.123-.045-.152-.137-.028-.093-.006-.182.05-.199.055-.016.123.045.151.137a.271.271 0 0 1 .012.066.265.265 0 0 1 .075-.059c.086-.045.177-.04.204.01.027.052-.02.13-.105.176zm1.664-2.322h.146v.092h.095v.146h-.095v.292h.095v.145H6.77v-.145h.097v-.292H6.77V2.64h.097v-.092z"
          fill="#C88A02"
        />
        <path fill="#C88A02" d="M6.84 3.34h.28v.91h-.28z" />
        <path
          d="m5.713 3.492-.001.07c-.621-.01-.977.08-1.067.26-.094.187-.077.414.054.684l-.063.03c-.14-.287-.158-.536-.054-.745.107-.214.484-.31 1.13-.299z"
          fill="#fff"
        />
        <path
          d="m5.833 4.113-.036.06c-.135-.08-.203-.218-.203-.408 0-.273.14-.433.452-.542.198-.07.469-.041.813.083l-.023.066c-.331-.12-.587-.147-.767-.083-.285.1-.405.236-.405.476 0 .167.056.28.169.348z"
          fill="#fff"
        />
        <path
          d="m4.788 4.398-.132.047c-.138-.39-.098-.655.136-.77.206-.1.507-.142.904-.125l-.006.14c-.376-.016-.655.022-.837.111-.154.075-.182.266-.065.597z"
          fill="#C88A02"
        />
        <path
          d="M6.33 3.4c-.32 0-.45.077-.526.307-.048.147-.001.272.15.39l-.087.11c-.194-.152-.263-.337-.196-.543.096-.293.284-.405.66-.405.246 0 .438.065.572.197l.021.02v.675h-.14v-.615c-.104-.09-.254-.137-.453-.137z"
          fill="#C88A02"
        />
        <path
          d="M8.156 3.562v.07c.622-.01.978.08 1.068.26.093.187.076.414-.055.684l.063.03c.14-.287.159-.536.055-.745-.108-.214-.484-.31-1.131-.299z"
          fill="#fff"
        />
        <path
          d="m7.936 4.128.036.06c.135-.08.203-.219.203-.408 0-.273-.14-.433-.451-.543-.199-.07-.47-.04-.814.084l.024.066c.33-.12.586-.147.767-.084.285.1.404.237.404.477 0 .166-.056.28-.169.348z"
          fill="#fff"
        />
        <path
          d="m9.125 4.468.132.047c.137-.39.098-.655-.137-.77-.206-.1-.507-.142-.903-.125l.005.14c.376-.016.655.022.837.111.154.075.182.266.066.597z"
          fill="#C88A02"
        />
        <path
          d="M7.573 3.41c.32 0 .452.078.527.308.048.147.001.272-.15.389l.087.11c.195-.15.263-.336.196-.542-.096-.294-.283-.405-.66-.405-.246 0-.438.065-.572.197l-.021.02v.675h.14v-.615c.104-.09.255-.137.453-.137z"
          fill="#C88A02"
        />
        <path
          opacity={0.3}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.67 5.79h4.55v4.088s-.338 1.372-2.275 1.372c-1.937 0-2.275-1.408-2.275-1.408V5.79z"
          fill="#E1E5E8"
        />
        <mask
          id="prefix__e"
          maskUnits="userSpaceOnUse"
          x={4}
          y={5}
          width={6}
          height={7}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.67 5.79h4.55v4.088s-.338 1.372-2.275 1.372c-1.937 0-2.275-1.408-2.275-1.408V5.79z"
            fill="#fff"
          />
        </mask>
        <g mask="url(#prefix__e)">
          <path fill="#FFC034" d="M4.67 8.31h2.31v2.73H4.67z" />
          <path
            fill="#AD1619"
            d="M4.95 8.45h.28v2.59h-.28zm.98 0h.28v2.59h-.28zm-.49 0h.28v2.59h-.28zm.98 0h.28v2.59h-.28zM4.67 5.72h2.31v2.66H4.67z"
          />
          <path fill="#AD1619" d="M6.91 8.24h2.31v2.66H6.91z" />
          <path fill="#F1F9FF" d="M6.91 5.79h2.45v2.59H6.91z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.65 6h.21v.58H6v-.29h.21v.29h.21v.364h-.21v.653h.21v.363H5.16v-.363h.21v-.653h-.21V6.58h.14v-.29h.21v.29h.14V6z"
            fill="#C88A02"
          />
          <path
            d="m8.112 6.122.143-.154.301.282-.143.153-.301-.281z"
            fill="#C88A02"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.975 10.088V8.555h-1.75v1.52l.003.012c.088.377.39.568.872.568.481 0 .783-.186.872-.555l.003-.012zm-.875.357c-.387 0-.598-.13-.665-.395V8.765h1.33v1.297c-.067.256-.278.383-.665.383z"
            fill="#FFC034"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.172 8.683h-.146v.695l-.574-.625-.104.094.52.566h-.47v.21h.481l-.53.578.103.095.574-.626v.812h.146v-.739l.508.553.103-.095-.531-.578h.593v-.21h-.582l.52-.566-.103-.094-.508.552v-.622z"
            fill="#FFC034"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8.427 10.902s-1.483.116-1.483-.84c0 0-.014.84-1.562.84v.755h3.045v-.755z"
            fill="#F1F9FF"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.945 8.87c.29 0 .525-.25.525-.56 0-.31-.235-.56-.525-.56-.29 0-.525.25-.525.56 0 .31.235.56.525.56z"
            fill="#005BBF"
            stroke="#AD1619"
            strokeWidth={0.729}
          />
        </g>
      </g>
    </g>
  </svg>
);
export default FlagEs;
