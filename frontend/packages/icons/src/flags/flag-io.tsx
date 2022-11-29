import React from 'react';

import type { FlagProps } from '../types';

const FlagIo = ({ className, testID }: FlagProps) => (
  <svg
    width={20}
    height={15}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
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
        fill="#F7FCFF"
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
          d="m-.941 1.657.93.886c.767-.726 1.491-1.068 2.18-1.068.332 0 .473.08.857.443.608.575 1.018.807 1.787.807.77 0 1.179-.232 1.787-.807.384-.363.525-.443.858-.443.332 0 .474.08.857.443.609.575 1.018.807 1.787.807.77 0 1.18-.232 1.787-.807.384-.363.526-.443.858-.443.333 0 .474.08.858.443.608.575 1.017.807 1.787.807s1.178-.232 1.787-.807c.383-.363.525-.443.857-.443.689 0 1.413.342 2.18 1.068l.93-.886C20.15.716 19.11.225 18.036.225c-.769 0-1.178.232-1.787.807-.383.363-.525.443-.857.443-.333 0-.474-.08-.858-.443-.608-.575-1.018-.807-1.787-.807-.77 0-1.179.232-1.787.807-.384.363-.525.443-.858.443-.332 0-.474-.08-.857-.443C8.637.457 8.227.225 7.458.225c-.77 0-1.18.232-1.787.807-.384.363-.525.443-.858.443-.332 0-.474-.08-.858-.443C3.347.457 2.938.225 2.168.225 1.093.225.055.716-.942 1.657zm.93 3.386-.93-.886c.996-.941 2.034-1.432 3.11-1.432.769 0 1.178.232 1.786.807.384.363.526.443.858.443.333 0 .474-.08.858-.443.608-.575 1.017-.807 1.787-.807s1.178.232 1.787.807c.383.363.525.443.857.443.333 0 .474-.08.858-.443.608-.575 1.018-.807 1.787-.807.77 0 1.179.232 1.787.807.384.363.525.443.858.443.332 0 .474-.08.857-.443.609-.575 1.018-.807 1.787-.807 1.075 0 2.114.491 3.11 1.432l-.93.886c-.767-.726-1.491-1.068-2.18-1.068-.332 0-.474.08-.857.443-.608.575-1.018.807-1.787.807-.77 0-1.18-.232-1.787-.807-.384-.363-.525-.443-.858-.443-.332 0-.474.08-.858.443-.608.575-1.017.807-1.787.807s-1.178-.232-1.787-.807c-.383-.363-.525-.443-.857-.443-.333 0-.474.08-.858.443-.608.575-1.018.807-1.787.807-.77 0-1.179-.232-1.787-.807-.384-.363-.525-.443-.858-.443-.688 0-1.412.342-2.18 1.068zm0 2.5-.93-.886c.996-.941 2.034-1.432 3.11-1.432.769 0 1.178.232 1.786.807.384.363.526.443.858.443.333 0 .474-.08.858-.443.608-.575 1.017-.807 1.787-.807s1.178.232 1.787.807c.383.363.525.443.857.443.333 0 .474-.08.858-.443.608-.575 1.018-.807 1.787-.807.77 0 1.179.232 1.787.807.384.363.525.443.858.443.332 0 .474-.08.857-.443.609-.575 1.018-.807 1.787-.807 1.075 0 2.114.491 3.11 1.432l-.93.886c-.767-.726-1.491-1.068-2.18-1.068-.332 0-.474.08-.857.443-.608.575-1.018.807-1.787.807-.77 0-1.18-.232-1.787-.807-.384-.363-.525-.443-.858-.443-.332 0-.474.08-.858.443-.608.575-1.017.807-1.787.807s-1.178-.232-1.787-.807c-.383-.363-.525-.443-.857-.443-.333 0-.474.08-.858.443-.608.575-1.018.807-1.787.807-.77 0-1.179-.232-1.787-.807-.384-.363-.525-.443-.858-.443-.688 0-1.412.342-2.18 1.068zm0 2.5-.93-.886c.996-.941 2.034-1.432 3.11-1.432.769 0 1.178.232 1.786.807.384.363.526.443.858.443.333 0 .474-.08.858-.443.608-.575 1.017-.807 1.787-.807s1.178.232 1.787.807c.383.363.525.443.857.443.333 0 .474-.08.858-.443.608-.575 1.018-.807 1.787-.807.77 0 1.179.232 1.787.807.384.363.525.443.858.443.332 0 .474-.08.857-.443.609-.575 1.018-.807 1.787-.807 1.075 0 2.114.491 3.11 1.432l-.93.886c-.767-.726-1.491-1.068-2.18-1.068-.332 0-.474.08-.857.443-.608.575-1.018.807-1.787.807-.77 0-1.18-.232-1.787-.807-.384-.363-.525-.443-.858-.443-.332 0-.474.08-.858.443-.608.575-1.017.807-1.787.807s-1.178-.232-1.787-.807c-.383-.363-.525-.443-.857-.443-.333 0-.474.08-.858.443-.608.575-1.018.807-1.787.807-.77 0-1.179-.232-1.787-.807-.384-.363-.525-.443-.858-.443-.688 0-1.412.342-2.18 1.068zm0 2.5-.93-.886c.996-.941 2.034-1.432 3.11-1.432.769 0 1.178.232 1.786.807.384.363.526.443.858.443.333 0 .474-.08.858-.443.608-.575 1.017-.807 1.787-.807s1.178.232 1.787.807c.383.363.525.443.857.443.333 0 .474-.08.858-.443.608-.575 1.018-.807 1.787-.807.77 0 1.179.232 1.787.807.384.363.525.443.858.443.332 0 .474-.08.857-.443.609-.575 1.018-.807 1.787-.807 1.075 0 2.114.491 3.11 1.432l-.93.886c-.767-.726-1.491-1.068-2.18-1.068-.332 0-.474.08-.857.443-.608.575-1.018.807-1.787.807-.77 0-1.18-.232-1.787-.807-.384-.363-.525-.443-.858-.443-.332 0-.474.08-.858.443-.608.575-1.017.807-1.787.807s-1.178-.232-1.787-.807c-.383-.363-.525-.443-.857-.443-.333 0-.474.08-.858.443-.608.575-1.018.807-1.787.807-.77 0-1.179-.232-1.787-.807-.384-.363-.525-.443-.858-.443-.688 0-1.412.342-2.18 1.068zm0 2.5-.93-.886c.996-.941 2.034-1.432 3.11-1.432.769 0 1.178.232 1.786.807.384.363.526.443.858.443.333 0 .474-.08.858-.443.608-.575 1.017-.807 1.787-.807s1.178.232 1.787.807c.383.363.525.443.857.443.333 0 .474-.08.858-.443.608-.575 1.018-.807 1.787-.807.77 0 1.179.232 1.787.807.384.363.525.443.858.443.332 0 .474-.08.857-.443.609-.575 1.018-.807 1.787-.807 1.075 0 2.114.491 3.11 1.432l-.93.886c-.767-.726-1.491-1.068-2.18-1.068-.332 0-.474.08-.857.443-.608.575-1.018.807-1.787.807-.77 0-1.18-.232-1.787-.807-.384-.363-.525-.443-.858-.443-.332 0-.474.08-.858.443-.608.575-1.017.807-1.787.807s-1.178-.232-1.787-.807c-.383-.363-.525-.443-.857-.443-.333 0-.474.08-.858.443-.608.575-1.018.807-1.787.807-.77 0-1.179-.232-1.787-.807-.384-.363-.525-.443-.858-.443-.688 0-1.412.342-2.18 1.068z"
          fill="#2E42A5"
        />
        <mask
          id="prefix__c"
          maskUnits="userSpaceOnUse"
          x={0}
          y={0}
          width={9}
          height={7}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 0h9v7H0V0z"
            fill="#fff"
          />
        </mask>
        <g mask="url(#prefix__c)">
          <path fill="#2E42A5" d="M0 0h10v8H0z" />
          <path
            d="m-1.549 7.083 2.286.965L10.044.91 11.25-.524 8.806-.846 5.01 2.23 1.954 4.302-1.55 7.083z"
            fill="#fff"
          />
          <path
            d="m-1.236 7.76 1.164.56L10.817-.658H9.182L-1.236 7.759z"
            fill="#F50100"
          />
          <path
            d="m11.149 7.083-2.286.965L-.444.91-1.65-.524.794-.846 4.59 2.23l3.056 2.072 3.503 2.781z"
            fill="#fff"
          />
          <path
            d="m11.07 7.569-1.164.56L5.27 4.285l-1.374-.43-5.662-4.374H-.13l5.658 4.271 1.503.515 4.04 3.302z"
            fill="#F50100"
          />
          <mask
            id="prefix__d"
            maskUnits="userSpaceOnUse"
            x={-1}
            y={-1}
            width={13}
            height={10}
            fill="#000"
          >
            <path fill="#fff" d="M-1-1h13V9H-1z" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5 0H4v3H0v1h4v4h1V4h6V3H5V0z"
            />
          </mask>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5 0H4v3H0v1h4v4h1V4h6V3H5V0z"
            fill="#F50100"
          />
          <path
            d="M4 0v-.5h-.5V0H4zm1 0h.5v-.5H5V0zM4 3v.5h.5V3H4zM0 3v-.5h-.5V3H0zm0 1h-.5v.5H0V4zm4 0h.5v-.5H4V4zm0 4h-.5v.5H4V8zm1 0v.5h.5V8H5zm0-4v-.5h-.5V4H5zm6 0v.5h.5V4H11zm0-1h.5v-.5H11V3zM5 3h-.5v.5H5V3zM4 .5h1v-1H4v1zM4.5 3V0h-1v3h1zM0 3.5h4v-1H0v1zm.5.5V3h-1v1h1zM4 3.5H0v1h4v-1zM4.5 8V4h-1v4h1zm.5-.5H4v1h1v-1zM4.5 4v4h1V4h-1zm6.5-.5H5v1h6v-1zm-.5-.5v1h1V3h-1zM5 3.5h6v-1H5v1zM4.5 0v3h1V0h-1z"
            fill="#F7FCFF"
            mask="url(#prefix__d)"
          />
        </g>
        <rect
          x={12.75}
          y={5.862}
          width={0.625}
          height={7.888}
          rx={0.313}
          fill="#D86D00"
        />
        <path
          d="M12.753 1.286c.638.876.72 2.052.638 3.105l-.498-.036c.077-1.005-.14-3.07-.14-3.07z"
          fill="#449A01"
          stroke="#fff"
          strokeWidth={0.15}
        />
        <path
          d="m13.567 4.615-.46-.19c.443-1.403 2.655-2.598 2.655-2.598-.99.474-1.327 1.757-2.195 2.788z"
          fill="#449A01"
          stroke="#fff"
          strokeWidth={0.15}
        />
        <path
          d="m13.36 4.907-.241-.426c1.182-.822 3.092-.999 3.092-.999-.985.28-1.98.958-2.85 1.425z"
          fill="#449A01"
          stroke="#fff"
          strokeWidth={0.15}
        />
        <path
          d="m13.053 5.113.208-.441c2.313.718 2.652 1.918 2.652 1.918-.304-.268-1.268-.768-2.86-1.477z"
          fill="#449A01"
          stroke="#fff"
          strokeWidth={0.15}
        />
        <path
          d="m12.81 5.081.49-.091c.17.862.609 1.384.84 1.937 0 0-1.297-.58-1.33-1.846z"
          fill="#449A01"
          stroke="#fff"
          strokeWidth={0.15}
        />
        <path
          d="m12.772 4.677.53.133c-.87 1.062-2.16 1.62-2.67 1.802 0 0 1.121-1.011 2.14-1.935z"
          fill="#449A01"
          stroke="#fff"
          strokeWidth={0.15}
        />
        <path
          d="m13.007 4.447-.08.494c-1.035-.316-2.897-.184-2.897-.184.782-.185 1.862-.492 2.977-.31z"
          fill="#449A01"
          stroke="#fff"
          strokeWidth={0.15}
        />
        <path
          d="m13.097 4.195-.204.443c-1.527-.66-2.344-1.895-2.344-1.895.052.227 1.199.868 2.548 1.452z"
          fill="#449A01"
          stroke="#fff"
          strokeWidth={0.15}
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.945 9.567v-.09c-.288-.227-.59-.341-.905-.341a1.662 1.662 0 0 0-.918-.172v-.001c-.465-.05-.934.173-.934.173-.473 0-.905.341-.905.341v.09l.565.624s.159.601 1.272.46v.002s.737-.023.79-.042l.063-.021c.144-.046.31-.1.407-.399l.565-.624zm-1.825-.575c-.016.208-.108 1.46 0 1.655V8.992z"
          fill="#F50100"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.2 8.866c.06-.202.166-.271.422-.271.159 0 .279.04.362.12v.542h.045v.055c-.03.027-.045.081-.033.14a.18.18 0 0 0 .018.054.198.198 0 0 0-.069-.012c-.077 0-.14.041-.14.092s.063.093.14.093c.077 0 .14-.042.14-.093 0 .026.016.05.042.066h-.071c0 .14-.065.228-.161.228-.068 0-.115-.034-.15-.11l-.096-.207-.01.233c-.003.082-.036.114-.117.114-.078 0-.134-.053-.172-.173a.208.208 0 0 0 .035.003c.077 0 .14-.041.14-.092s-.063-.093-.14-.093a.205.205 0 0 0-.05.006.193.193 0 0 0 .002-.083c-.015-.075-.067-.13-.117-.12-.05.01-.08.08-.064.156.003.02.01.037.018.053a.198.198 0 0 0-.069-.012c-.077 0-.14.042-.14.093 0 .05.063.092.14.092.063 0 .116-.027.134-.064l-.005.054c-.012.153-.05.225-.107.235-.076.014-.135.008-.175-.017l-.083-.049v.084a.434.434 0 0 1-.131-.017l-.01.048-.098-.102a.186.186 0 0 0 .093-.023c.069-.036.104-.102.08-.147-.023-.045-.098-.052-.166-.016a.2.2 0 0 0-.05.037.21.21 0 0 0-.008-.043c-.023-.074-.08-.122-.13-.107-.024.008-.042.03-.05.06l-.044-.045-.038.045.08.084a.28.28 0 0 0 .005.017c.02.068.072.114.118.11l.194.2v.002l.003.001.114.118.044.093a.513.513 0 0 0 .064.17.142.142 0 0 1 .004.03c0 .064.15.102.444.14.23.03.5.051.722.054h.056a6.57 6.57 0 0 0 .722-.053c.293-.04.444-.077.444-.14 0-.042.037-.142.112-.294l.514-.532-.038-.045-.142.146a.227.227 0 0 0 .008-.019c.022-.074 0-.146-.048-.16-.049-.016-.107.032-.13.106a.204.204 0 0 0-.008.043.201.201 0 0 0-.049-.037c-.068-.036-.143-.029-.167.016-.024.045.012.111.08.147.069.037.143.03.167-.015l.003-.006a.065.065 0 0 0 .06.013l-.187.194-.018-.09a.434.434 0 0 1-.131.017v-.084l-.083.05c-.04.024-.099.03-.176.016-.056-.01-.094-.082-.106-.235l-.001-.014c.02.011.043.02.069.023.076.01.144-.021.151-.072.007-.05-.049-.1-.126-.111a.205.205 0 0 0-.052 0 .19.19 0 0 0 .014-.085c-.004-.077-.049-.137-.1-.135-.05.003-.089.068-.085.145a.207.207 0 0 0 .01.052.2.2 0 0 0-.064-.02c-.076-.01-.144.022-.151.072-.007.05.049.1.126.111a.175.175 0 0 0 .11-.018l-.01.039c-.039.134-.097.193-.18.193-.08 0-.113-.032-.116-.114l-.01-.233-.096.208c-.035.075-.082.109-.15.109-.092 0-.155-.08-.16-.209a.203.203 0 0 0 .054.008c.077 0 .14-.042.14-.093 0-.05-.063-.092-.14-.092a.205.205 0 0 0-.05.006.193.193 0 0 0 .002-.083.194.194 0 0 0-.03-.073h.106v-.619c.084-.08.204-.12.363-.12.256 0 .36.068.42.27.04.13.002.24-.118.343l.068.097c.135-.115.194-.252.173-.404.288-.01.504.023.645.1.123.065.146.233.053.525l.105.04c.11-.343.079-.576-.109-.676-.165-.09-.405-.125-.723-.111v.009c-.08-.229-.23-.317-.514-.317a.658.658 0 0 0-.363.093v-.031h-.224v.054a.625.625 0 0 0-.407-.125c-.28 0-.43.084-.51.302l.001-.047c-.317-.014-.557.022-.723.11-.187.102-.218.335-.109.678l.106-.04c-.093-.292-.07-.46.053-.526.142-.077.358-.11.648-.1-.043.173.013.329.163.457l.069-.098c-.12-.103-.158-.213-.12-.342zm.885.72c0-.005 0-.01.002-.015h-.004l.002.015zm1.382.51c-.092.018-.158.016-.194-.015a.4.4 0 0 1-.192.006c-.08-.014-.134-.072-.167-.167a.254.254 0 0 1-.162.11c.358.055.609.134.609.134s-.006.058-.021.127l.056-.12.006-.008.065-.067zm-.885-.09a.187.187 0 0 1-.074-.074.245.245 0 0 1-.09.057c.056.005.111.01.165.017zm-.362-.029a.266.266 0 0 1-.107-.103.266.266 0 0 1-.106.103l.077-.002h.045l.09.002zm-1.352.182-.052-.054c.063.007.109 0 .136-.024a.4.4 0 0 0 .193.006c.079-.014.134-.072.167-.167a.255.255 0 0 0 .157.108 4.75 4.75 0 0 0-.6.131zm.938-.17a4.13 4.13 0 0 0-.16.015.187.187 0 0 0 .071-.072.246.246 0 0 0 .089.056zm1.378.51c.039.021.07 0 .095-.038a.221.221 0 0 0-.004.03.51.51 0 0 1-.098.035 2.786 2.786 0 0 1-.296.051 6.42 6.42 0 0 1-.744.054 6.443 6.443 0 0 1-.744-.054 2.79 2.79 0 0 1-.296-.052.58.58 0 0 1-.073-.022l.006-.003c.122-.063.93-.122 1.077-.133.145.01.954.07 1.077.133zm.162-.01z"
          fill="#FECA00"
        />
        <path
          d="M12.127 8.677v.062c-.497-.01-.782.07-.854.229-.075.164-.061.364.043.6l-.05.028c-.112-.253-.127-.473-.043-.656.085-.189.387-.273.904-.263z"
          fill="#fff"
        />
        <path
          d="m12.223 9.223-.028.053c-.109-.07-.163-.192-.163-.36 0-.24.113-.38.361-.476.16-.062.376-.037.651.073l-.019.058c-.264-.105-.469-.13-.613-.073-.228.088-.324.208-.324.419 0 .147.045.247.135.306zm1.859-.484V8.8c.497-.01.782.07.854.23.075.164.061.363-.044.6l.05.027c.112-.253.128-.472.044-.655-.086-.189-.387-.273-.905-.263z"
          fill="#fff"
        />
        <path
          d="m13.906 9.236.029.053c.108-.071.162-.192.162-.36 0-.24-.112-.38-.361-.477-.159-.061-.376-.036-.651.074l.02.058c.264-.106.468-.13.612-.073.228.088.324.208.324.419 0 .146-.045.247-.135.306z"
          fill="#fff"
        />
      </g>
    </g>
  </svg>
);
export default FlagIo;
