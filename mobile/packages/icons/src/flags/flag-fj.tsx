import React from 'react';
import Svg, { G, Mask, Path } from 'react-native-svg';

import type { FlagProps } from '../types';

const FlagFj = ({ style }: FlagProps) => (
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
        fill="#67BFE5"
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
        <Path fill="#2E42A5" d="M0 0h11v9H0z" />
        <Mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={11}
          height={9}
        >
          <Path fill="#fff" d="M0 0h11v9H0z" />
        </Mask>
        <G mask="url(#prefix__c)">
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
            id="prefix__d"
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
            mask="url(#prefix__d)"
          />
        </G>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.5 6.25h6.035v5.208s-.507 2.292-3.018 2.292c-2.511 0-3.017-2.292-3.017-2.292V6.25z"
          fill="#F7FCFF"
        />
        <Mask
          id="prefix__e"
          maskUnits="userSpaceOnUse"
          x={12}
          y={6}
          width={7}
          height={8}
        >
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.5 6.25h6.035v5.208s-.507 2.292-3.018 2.292c-2.511 0-3.017-2.292-3.017-2.292V6.25z"
            fill="#fff"
          />
        </Mask>
        <G mask="url(#prefix__e)">
          <Path fill="#C3352C" d="M12.5 6.25h6.034v1.875H12.5z" />
          <Path fill="#C3352C" d="M15.086 7.917h.862v5.833h-.862z" />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.5 10.208h6.035v.834H12.5v-.834z"
            fill="#C3352C"
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.088 12.96c.363.514.658.714.867.411.147-.212.162-.424-.047-.466a3.509 3.509 0 0 1-.256-.358l.007-.007c.059-.057.061-.133.05-.162-.005-.038.024-.091.213-.235.17-.13.246-.254.134-.39-.058-.07-.111-.085-.278-.11l-.051-.008a.893.893 0 0 1-.108-.023l-.116-.222a1.43 1.43 0 0 0-.639.122l-.19.08a.738.738 0 0 1-.073.03c.005-.004.013-.01.001-.01-.043 0-.09-.006-.222-.022l-.025-.004c-.378-.047-.472-.045-.533.13-.093.267.457.757.75.816.146.03.321.17.516.429zm.41-.367a.336.336 0 0 0 .087-.008l.007-.016a.164.164 0 0 1-.094.024zm-1.377-.738c-.007-.009-.01-.02-.004-.036-.001.003.002.01.01.02a.45.45 0 0 0 .032.036.076.076 0 0 1-.038-.02zm.512.37c-.104-.02-.37-.242-.474-.35a.652.652 0 0 0 .103.016l.054.006.025.003c.147.018.199.024.261.024.037 0 .03.012.025.02-.002.002-.003.004-.002.005.002.004.03-.009.173-.069l.188-.08c.11-.046.211-.077.322-.09.012.052.043.1.093.138.066.051.141.073.27.094-.16.133-.24.243-.266.351-.145.046-.132.209-.045.371.06.114.175.275.345.488l.122.058a.104.104 0 0 1-.072-.029c-.019-.016-.03-.025-.057.013-.001.002-.115-.075-.358-.417-.238-.318-.47-.504-.707-.551zm.763.188c.002-.002.001-.004.001-.007l-.002.007zm.1-.133h-.01.009zm.002 0h-.003.003z"
            fill="#979797"
          />
          <Path
            d="M13.534 10.069s-.298-.413-.298-.56"
            stroke="#964C36"
            strokeWidth={0.625}
          />
          <Path
            d="M13.35 9.714s-.382-.163-.382 0m.375-.171s-.268-.341-.47-.341c-.201 0-.196.17-.196.17m.513-.171s-.12-.558-.311-.558c-.192 0-.192.28-.192.28m.551.277s-.053-.478.194-.478"
            stroke="#2A8E51"
            strokeWidth={0.625}
          />
          <Path
            d="M13.913 9.988s-.139-.49-.089-.628"
            stroke="#964C36"
            strokeWidth={0.625}
          />
          <Path
            d="M13.86 9.592s-.302-.284-.358-.13m.411-.033s-.135-.413-.325-.482c-.189-.069-.243.093-.243.093m.541.015s.079-.565-.101-.63c-.18-.066-.276.196-.276.196m.423.449s.114-.467.345-.383"
            stroke="#2A8E51"
            strokeWidth={0.625}
          />
          <Path
            d="M14.22 10.163s.198-.47.165-.613"
            stroke="#964C36"
            strokeWidth={0.5}
          />
          <Path
            d="M14.32 9.775s.335-.244.372-.085m-.404-.083s.185-.393.381-.438c.197-.045.23.122.23.122m-.539-.051s-.008-.57.178-.614c.187-.043.25.229.25.229m-.475.395s-.056-.478-.296-.423m2.669 1.049s.151-.696.582-.696c.43 0 .623.735.623.735"
            stroke="#2A8E51"
            strokeWidth={0.5}
          />
          <Path
            d="M16.33 9.401s.233-.411.998-.377c.764.033.904.377.904.377m-2.056-.523s.42-.52 1.01-.079l.199.08s.2-.59 1.166 0"
            stroke="#2A8E51"
            strokeWidth={0.5}
          />
          <Path
            d="M17.337 10.023s.03-.65.133-.828m.717 2.251s-.387-.181-.502 0c-.116.182-1.508 1.851-1.508 1.851"
            stroke="#964C36"
            strokeWidth={0.625}
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="m16.853 11.622.863.603s.397-.283.198-.443c-.198-.16-.74-.442-.74-.442l-.321.282z"
            fill="#FFF203"
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.823 11.653s-.2.21-.2.37-.186.588-.186.588.52.32.628.116c.108-.204.81-.082.686-.393-.124-.312-.928-.681-.928-.681z"
            fill="#00A651"
          />
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.16 6.989s.461-.237.69 0c.227.236.414-.02.414-.162 0-.143.362-.633.362-.235 0 .397-.112.621.206.621s1.752-.549 2.096-.386c.343.162.607.122.52-.111-.088-.233-.313-.378-.745-.251-.433.127-.33.25-.704.25-.374 0-.79-.123-.79-.123s.117-.21.543-.06c.427.148 1.016-.184 1.176-.184.16 0 .6-.01.644.117.044.127.31.243.107.362-.203.118-.537.192-.307.344.23.152.759.123.784.28.026.158.277.394.176.394-.1 0-.283.222-.452.155-.17-.068-.19-.127-.027-.182.163-.055.161-.286.027-.286s-.068.081-.373 0c-.305-.08-.709-.17-.685 0 .025.17.223.433-.143.468-.366.035-.538.175-.61.062-.07-.113-.325-.263-.125-.312.2-.048.392.164.464.13.072-.035.236-.054.099-.201-.137-.147-.363-.233-.154-.343.21-.11.044-.112-.355.115-.399.228-.62.421-.97.394-.351-.027-.482.01-.595-.027-.113-.037-.66.407-.819.294-.158-.112-.668-.156-.576-.294.092-.139.215-.21.352-.139.138.071.274.143.367.071.092-.071.36-.316.292-.365-.067-.049-.002-.214-.383-.214-.38 0-.514.184-.604.068-.09-.116.098-.25.098-.25z"
            fill="#FFD100"
          />
        </G>
      </G>
    </G>
  </Svg>
);
export default FlagFj;
