import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagPn = ({ style }: FlagProps) => (
  <Svg width={20} height={15} fill="none" style={style} aria-hidden={true}>
    <Mask
      id="prefix__a"
      maskUnits="userSpaceOnUse"
      x={0}
      y={0}
      width={20}
      height={15}
    >
      <Path fill="#fff" d="M0 0h20v15H0z" />
    </Mask>
    <G mask="url(#prefix__a)">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0v15h20V0H0z"
        fill="#2E42A5"
      />
      <Mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={20}
        height={15}
      >
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 0v15h20V0H0z"
          fill="#fff"
        />
      </Mask>
      <G mask="url(#prefix__b)">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.943 7.032s.057.643-.069 1.007c-.126.364-.19.575-.19.343 0-.233-.09-.418-.16-.418-.072 0-.015.231-.087.231s-.319.04-.319-.095c0-.136-.032.363.128.407.16.045-.078.183-.184.14 0 0 .437.143.609.265 0 0 .513.646.994.567 0 0-.654-.227-.54-.662.116-.435.54-.497.54-.497s.199.067.193.242c-.006.175.146-.055.146-.055s.024-.222-.003-.276c-.027-.054.456-.158.486-.387 0 0-.493.023-.527-.036-.034-.058.153-.15.095-.264-.059-.115-.93.651-.93.651s.301-.521.301-.801-.076-.471-.3-.471c-.224 0-.183.109-.183.109zm4.531.153h.001c.032-.031.232-.217.4-.07.182.16-.093.315-.093.315s.129.125.276.125c.147 0 .183-.125.183-.125s.011.279.49.385c0 0 .17-.247 0-.383 0 0 .202-.042.187-.206 0 0-.166.057-.284-.074-.119-.131-.35-.191-.517-.161-.426-.155-.618.149-.643.194z"
          fill="#5EAA22"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.569 8.593s.495.938.186 1.132c-.31.194 1.472.056 1.64 0 .168-.056-.034-.352-.22-.434-.187-.082-.952-.355-1.156-.561-.203-.206-.079-.28.085-.483.164-.203.771-.285.771-.475s.385-.974.654-1.033c.27-.059.124-.152.062-.152s-.434.386-.575.316c-.14-.07-.158-.064 0-.233.159-.168.278-.362.069-.223-.21.14-.555.36-.72.36-.167 0-.757-.075-.684.096.074.171.105.468.423.669.319.2.18.347-.085.54-.264.194-.45.48-.45.48z"
          fill="#96877D"
        />
        <Path
          d="m17.856 7.352-.944 1.906s-.028.538.647.18c.675-.36.648-.614.843-.614.195 0 .256-.108.256-.108l-.13-.103s-.014-.187.068-.23c0 0-.161-.088-.184-.014-.023.075-.137-.156-.072-.156 0 0-.142.232-.172.322 0 0-.206-.084-.196-.474a2.01 2.01 0 0 0-.116-.709zm-4.493-.302s-.48.113-.429.23c.052.117.128-.003-.107.138 0 0-.413.322-.504.287-.09-.035.064.081.064-.287s-.24-.068 0-.314c.24-.245.324-.054.44-.195.115-.141.012-.066.325-.066s.21.207.21.207zm1.467 1.894s-1.346 1.065-1.615 1.144c-.27.08.553-.021.754-.162.2-.14.86-.982.86-.982z"
          fill="#FFD018"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.498 10.812s.129.839-.208.756a10.141 10.141 0 0 1-.478-.125s.124.39.3.39c0 0 .302.591.186.778 0 0 .519-.424.435-.76-.084-.337.134.055.134.055s.19.093.329-.01c.138-.104-.002-.058-.14-.256-.138-.197-.104-.751-.523-1.038-.42-.287-.518-.278-.518-.278s-.309-.509-.124-.475c0 0 1.327.458 1.362.575.034.117.386.096.21-.24-.176-.335-1.124-.538-1.237-.632-.113-.095-.008-.454-.21-.532-.204-.078-.757-.633-.757-.9 0-.268-.26-.394-.487-.394-.227 0-.654-.066-.834-.066-.18 0-.348.304-.174.304s.025.568-.266.692c-.292.125-.517.303-.85.303-.333 0 .471.29.6.175.128-.114.086-.284.516-.478.43-.193.842-.308.79-.154-.053.154.08.412.283.319.203-.093.268-.329.268-.165 0 .165.311 1.009.549 1.338.237.33.844.818.844.818z"
          fill="#5EAA22"
        />
        <Path
          d="M14.666 7.73s-.157.253 0 .253c.158 0 .412 0 .258-.127-.155-.126-.258-.126-.258-.126zm.528-.006s0 .168.11.168.207.168.207 0 .152-.113-.083-.168c-.234-.056-.234 0-.234 0zm.673.038s-.105.08-.052.223c.052.142.171.424 0 .424-.172 0-.314.102-.18.102.135 0 .374.102.374 0s.097.168.097 0v-.346c0-.099.097-.127 0-.265s-.239-.138-.239-.138zm.243.981s.22.696.34.786c.12.09.173.846.226.928.052.082.767.497.767.72 0 .223.22-.171.11-.392-.11-.22-.457-.69-.706-.792-.249-.102-.217-.35-.27-.524-.052-.175.31.14 0-.255s-.302-.183-.214-.183c.087 0 .174-.046.087-.108-.087-.061-.34-.18-.34-.18zm-2.328 1.436s-.714 1.269-.841 1.334c-.128.066-.223.08-.288 0-.065-.079-.072.212 0 .292.072.079.287.079.407-.062 0 0 .02.357.205.626.187.269.264.195.264.347 0 .152.045.353.101.353.057 0 .101.48 0 .48-.1 0 .234.039.38-.081s.209-.211.178-.211c-.032 0-.406-.199-.406-.34 0-.14-.252-.25-.252-.458 0-.209-.131-.457-.131-.556 0-.098.112.038.232-.055.12-.094.15-.335.15-.335s-.188.128-.252.064c-.063-.064-.261-.19-.13-.406.13-.216.383-.992.383-.992z"
          fill="#FFD018"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M15.018 6.177s-.255.115-.17.285c.085.17.116.245.17.208.055-.038.438-.11.352-.3-.086-.193-.265-.193-.265-.193h-.087z"
          fill="#5EAA22"
        />
        <Path
          d="M15.905 6.086s-.338-.15-.225 0c.112.15.256.23.36.23.103 0 .319-.032.21-.093a2.632 2.632 0 0 0-.345-.137z"
          fill="#FFD018"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.573 9.992c.001-.008-.01-.015-.016-.008-.07.067-.282.292-.192.489.107.233.214.314.214.314s.065.357.199.455c0 0 .18-.01.19-.288 0 0 .306-.09.396.102 0 0-.06.022-.06.186 0 .163.14.34.14.34s.063-.564.348-.928c.285-.364.367-.436.367-.436v-.41s-.59.485-.716.888c0 0-.297.01-.418-.042-.12-.051.15-.136 0-.32-.15-.182-.082.259-.247.139-.26-.073-.223-.384-.205-.48z"
          fill="#5EAA22"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.859 9.638h3.024v1.86s-.246 1.52-1.563 2.269c0 0-1.276-.76-1.461-2.27v-1.86z"
          fill="#5EAA22"
        />
        <Mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={13}
          y={9}
          width={4}
          height={5}
        >
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.859 9.638h3.024v1.86s-.246 1.52-1.563 2.269c0 0-1.276-.76-1.461-2.27v-1.86z"
            fill="#fff"
          />
        </Mask>
        <G mask="url(#prefix__c)">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="m15.297 9.537-1.322 2.76 1.792-1.638 1.234 2.058v-3.18l-1.234 1.018-.47-1.018z"
            fill="#58A5FF"
          />
          <Path
            d="M15.255 11.527a.099.099 0 1 1 .197 0v1.774a.099.099 0 1 1-.197 0v-1.774z"
            fill="#FFD018"
          />
          <Path
            d="M14.913 11.965a.097.097 0 1 1 0-.195h.89a.098.098 0 0 1 0 .195h-.89zm.585 1.474-.086.07c-.127-.155-.242-.23-.345-.23-.15 0-.272-.126-.372-.365l.103-.043c.084.203.176.297.27.297.142 0 .284.092.43.27z"
            fill="#FFD018"
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.595 12.532h-.001v.541c0 .001 0 .002.001.001l.404-.167v-.002l-.404-.373z"
            fill="#FFD018"
          />
          <Path
            d="m15.319 13.439.086.07c.127-.155.242-.23.345-.23.15 0 .272-.126.372-.365l-.103-.043c-.084.203-.176.297-.27.297-.142 0-.284.092-.43.27z"
            fill="#FFD018"
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.221 12.532h.002v.541c0 .001 0 .002-.001.001l-.404-.167v-.002l.403-.373z"
            fill="#FFD018"
          />
          <Path fill="#fff" d="M15.155 10.732h.394v.592h-.394z" />
        </G>
        <Path fill="#2E42A5" d="M0 0h11v9H0z" />
        <Mask
          id="prefix__d"
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={11}
          height={9}
        >
          <Path fill="#fff" d="M0 0h11v9H0z" />
        </Mask>
        <G mask="url(#prefix__d)">
          <Path
            d="M-1.253 8.125 1.223 9.21l10.083-8.03 1.306-1.614-2.647-.363-4.113 3.46-3.31 2.332-3.795 3.129z"
            fill="#F7FCFF"
          />
          <Path
            d="m-.914 8.886 1.261.63L12.143-.583h-1.77L-.915 8.886z"
            fill="#F50100"
          />
          <Path
            d="M12.503 8.125 10.306 9.52-.056 1.18-1.362-.434l2.647-.363 4.113 3.46 3.31 2.332 3.795 3.129z"
            fill="#F7FCFF"
          />
          <Path
            d="m12.418 8.67-1.261.63-5.023-4.323-1.489-.483-6.133-4.921H.283l6.13 4.804 1.628.58 4.377 3.714z"
            fill="#F50100"
          />
          <Mask
            id="prefix__e"
            maskUnits="userSpaceOnUse"
            x={-1}
            y={-1}
            width={13}
            height={11}
            fill="#000"
          >
            <Path fill="#fff" d="M-1-1h13v11H-1z" />
            <Path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6 0H5v4H0v1h5v4h1V5h5V4H6V0z"
            />
          </Mask>
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6 0H5v4H0v1h5v4h1V5h5V4H6V0z"
            fill="#F50100"
          />
          <Path
            d="M5 0v-.938h-.938V0H5zm1 0h.938v-.938H6V0zM5 4v.938h.938V4H5zM0 4v-.938h-.938V4H0zm0 1h-.938v.938H0V5zm5 0h.938v-.938H5V5zm0 4h-.938v.938H5V9zm1 0v.938h.938V9H6zm0-4v-.938h-.938V5H6zm5 0v.938h.938V5H11zm0-1h.938v-.938H11V4zM6 4h-.938v.938H6V4zM5 .937h1V-.938H5V.938zM5.938 4V0H4.063v4h1.875zM0 4.938h5V3.063H0v1.874zM.938 5V4H-.938v1H.938zM5 4.062H0v1.875h5V4.063zM5.938 9V5H4.063v4h1.875zM6 8.062H5v1.876h1V8.062zM5.062 5v4h1.875V5H5.063zM11 4.062H6v1.875h5V4.063zM10.062 4v1h1.876V4h-1.876zM6 4.938h5V3.063H6v1.874zM5.062 0v4h1.875V0H5.063z"
            fill="#F7FCFF"
            mask="url(#prefix__e)"
          />
        </G>
      </G>
    </G>
  </Svg>
);
export default FlagPn;
