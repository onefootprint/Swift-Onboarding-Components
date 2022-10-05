import React from 'react';

import type { FlagProps } from '../types';

const FlagPt = ({ className, testID }: FlagProps) => (
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
        d="M5 0h15v15H5V0z"
        fill="#EF0000"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0h7.5v15H0V0z"
        fill="#2F8D00"
      />
      <mask
        id="prefix__b"
        maskUnits="userSpaceOnUse"
        x={2}
        y={2}
        width={11}
        height={11}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.44 12.38c-2.662 0-4.82-2.185-4.82-4.88-.001-2.695 2.158-4.88 4.82-4.88 2.663 0 4.822 2.185 4.822 4.88s-2.159 4.88-4.822 4.88z"
          fill="#fff"
        />
      </mask>
      <g mask="url(#prefix__b)" fill="#FFE017">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.143 2.5h.625v1.687h-.625V2.5zm0 8.434h.625V12.5h-.625v-1.566z"
        />
        <path d="m2.697 7.752-.175-.448c1.928-.77 3.383-1.266 4.37-1.49a36.708 36.708 0 0 1 4.777-.729l.042.48a36.242 36.242 0 0 0-4.714.72c-.958.216-2.393.706-4.3 1.467z" />
        <path d="m11.963 4.79-.142.46c-1.457-.46-2.644-.658-3.557-.597l-.031-.48c.98-.066 2.221.14 3.73.617zm.504 2.572-.27.398c-.742-.516-1.657-.775-2.751-.775v-.482c1.186 0 2.195.286 3.021.86z" />
        <path d="m12.064 7.507.123.465c-1.602.434-3.105.68-4.511.738-1.416.058-3.066-.189-4.952-.74l.132-.462c1.84.537 3.44.777 4.8.72 1.37-.056 2.839-.296 4.408-.721z" />
        <path d="m11.882 9.772-.752.772C9.7 9.115 8.44 8.094 7.36 7.48c-1.1-.624-2.533-1.258-4.298-1.9l.362-1.02c1.817.66 3.303 1.317 4.46 1.975 1.175.667 2.505 1.747 3.998 3.238zm-8.471.438-.284-.387a5.802 5.802 0 0 1 .742-.451c.531-.27 1.064-.438 1.573-.453l.074-.001V9.4h-.06c-.428.013-.899.162-1.374.403a5.335 5.335 0 0 0-.67.407z" />
        <path d="m3.633 10.377.12-.467c1.587.418 2.811.627 3.665.627.851 0 2.118-.246 3.792-.74l.133.463c-1.714.505-3.02.759-3.925.759-.902 0-2.162-.215-3.785-.642zm-.619-4.318.754-.77 1.105 1.109-.754.77-1.105-1.109z" />
        <path d="m9.272 9.905.562-.924 1.752 1.09-.561.924-1.753-1.09z" />
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.619 7.5c0 2.695 2.159 4.88 4.821 4.88 2.663 0 4.822-2.185 4.822-4.88S10.103 2.62 7.44 2.62c-2.662 0-4.82 2.185-4.82 4.88zm9.048.06c0 2.33-1.866 4.217-4.167 4.217-2.301 0-4.167-1.888-4.167-4.217 0-2.329 1.866-4.217 4.167-4.217 2.301 0 4.167 1.888 4.167 4.217z"
        fill="#F9E813"
      />
      <path
        d="M4.785 4.49v3.914c.258 1.549 1.126 2.323 2.604 2.323 1.478 0 2.346-.774 2.603-2.323V4.49H4.785z"
        fill="#fff"
      />
      <path
        d="M4.428 4.13h5.921v4.304l-.005.03c-.286 1.72-1.3 2.624-2.955 2.624-1.656 0-2.67-.904-2.956-2.624l-.005-.03V4.129z"
        fill="#C51918"
      />
      <path
        d="M5.783 5.444h3.212V8.22s-.238 1.433-1.606 1.433S5.783 8.22 5.783 8.22V5.444z"
        fill="#F7FCFF"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 4.428h.452v.3H5v-.3z"
        fill="#F9E813"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.762 4.548h.833v.15h-.833v-.15z"
        fill="#060101"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.762 4.669h.452v.15h-.452v-.15zm.476 0h.452v.15h-.452v-.15zm-.476.361h.301v.452h-.301V5.03zm.595 0h.301v.452h-.3V5.03zm-.238 0h.15v.452h-.15V5.03z"
        fill="#F9E813"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.762 4.91h.833v.15h-.833v-.15zm0 .361h.833v.15h-.833v-.15z"
        fill="#060101"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.881 4.79h.15v.15h-.15v-.15zm.476 0h.15v.15h-.15v-.15zm-.238-.121h.15v.3h-.15v-.3zm2.143-.241h.452v.3h-.452v-.3z"
        fill="#F9E813"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.024 4.548h.833v.15h-.833v-.15z"
        fill="#060101"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.024 4.669h.452v.15h-.452v-.15zm.476 0h.452v.15H7.5v-.15zm-.476.361h.301v.452h-.301V5.03zm.595 0h.301v.452h-.3V5.03zm-.238 0h.15v.452h-.15V5.03z"
        fill="#F9E813"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.024 4.91h.833v.15h-.833v-.15zm0 .361h.833v.15h-.833v-.15z"
        fill="#060101"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.143 4.79h.15v.15h-.15v-.15zm.476 0h.15v.15h-.15v-.15zm-.238-.121h.15v.3h-.15v-.3zm2.024-.241h.452v.3h-.452v-.3z"
        fill="#F9E813"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.167 4.548H10v.15h-.833v-.15z"
        fill="#060101"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.167 4.669h.451v.15h-.451v-.15zm.476 0h.452v.15h-.452v-.15zm-.476.361h.3v.452h-.3V5.03zm.595 0h.301v.452h-.301V5.03zm-.238 0h.15v.452h-.15V5.03z"
        fill="#F9E813"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.167 4.91H10v.15h-.833v-.15zm0 .361H10v.15h-.833v-.15z"
        fill="#060101"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.286 4.79h.15v.15h-.15v-.15zm.476 0h.15v.15h-.15v-.15zm-.238-.121h.15v.3h-.15v-.3zm-.119 1.927h.452v.302h-.452v-.302z"
        fill="#F9E813"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.167 6.717H10v.15h-.833v-.15z"
        fill="#060101"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.167 6.837h.451v.15h-.451v-.15zm.476 0h.452v.15h-.452v-.15zm-.476.362h.3v.452h-.3v-.452zm.595 0h.301v.452h-.301v-.452zm-.238 0h.15v.452h-.15v-.452z"
        fill="#F9E813"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.167 7.078H10v.15h-.833v-.15zm0 .362H10v.15h-.833v-.15z"
        fill="#060101"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.286 6.958h.15v.15h-.15v-.15zm.476 0h.15v.15h-.15v-.15zm-.238-.121h.15v.302h-.15v-.302zM5 6.596h.452v.302H5v-.302z"
        fill="#F9E813"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.762 6.717h.833v.15h-.833v-.15z"
        fill="#060101"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.762 6.837h.452v.15h-.452v-.15zm.476 0h.452v.15h-.452v-.15zm-.476.362h.301v.452h-.301v-.452zm.595 0h.301v.452h-.3v-.452zm-.238 0h.15v.452h-.15v-.452z"
        fill="#F9E813"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.762 7.078h.833v.15h-.833v-.15zm0 .362h.833v.15h-.833v-.15z"
        fill="#060101"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.881 6.958h.15v.15h-.15v-.15zm.476 0h.15v.15h-.15v-.15zm-.238-.121h.15v.302h-.15v-.302zm.171 2.478.29-.346.231.193-.29.347-.231-.194z"
        fill="#F9E813"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m5.23 9.575.535-.639.115.097-.536.639-.115-.097z"
        fill="#060101"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m5.321 9.652.29-.346.116.097-.29.346-.116-.097zm.306-.365.29-.346.116.097-.29.346-.116-.097zm-.029.598.194-.231.346.29-.194.231-.346-.29zm.382-.456.194-.231.347.29-.194.231-.346-.29zm-.152.182.097-.115.346.29-.097.115-.346-.29z"
        fill="#F9E813"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m5.506 9.807.536-.638.115.097-.536.638-.115-.097zm.277.233.536-.639.115.097-.536.638-.115-.096z"
        fill="#060101"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m5.49 9.638.097-.115.115.097-.096.115-.116-.097zm.306-.364.097-.116.115.097-.096.116-.116-.097zm-.245.105.097-.116.23.194-.096.115-.231-.193zm3.811-.338.29.346-.23.194-.291-.346.23-.194z"
        fill="#F9E813"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m9.116 8.936.536.639-.116.097-.535-.639.115-.097z"
        fill="#060101"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m9.024 9.014.29.346-.115.097-.29-.346.115-.097zm.306.365.29.346-.115.097-.29-.347.115-.096zm-.583-.133.194.23-.346.291-.194-.23.346-.29zm.383.456.193.23-.346.291-.193-.23.346-.29zm-.153-.182.096.115-.346.29-.097-.115.347-.29z"
        fill="#F9E813"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m8.84 9.169.535.638-.115.097-.536-.638.115-.097zm-.278.232.536.639-.115.096-.536-.638.115-.097z"
        fill="#060101"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="m9.008 9.182.097.116-.115.097-.097-.116.115-.097zm.306.365.097.116-.115.096-.097-.115.115-.097zm-.061-.26.097.116-.23.193-.097-.115.23-.194z"
        fill="#F9E813"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.849 5.753h-.825v.6s.061.311.412.311c.352 0 .413-.31.413-.31v-.601zm-.468.24a.12.12 0 0 1-.12.121.12.12 0 0 1-.118-.12.12.12 0 0 1 .119-.12.12.12 0 0 1 .119.12zm-.12.603a.12.12 0 0 0 .12-.12.12.12 0 0 0-.12-.12.12.12 0 0 0-.118.12c0 .066.053.12.119.12zm.477-.12a.12.12 0 0 1-.119.12.12.12 0 0 1-.119-.12.12.12 0 0 1 .119-.12.12.12 0 0 1 .12.12zm-.298-.12a.12.12 0 0 0 .12-.121.12.12 0 0 0-.12-.12.12.12 0 0 0-.119.12c0 .066.054.12.12.12zm.298-.362a.12.12 0 0 1-.119.12.12.12 0 0 1-.119-.12.12.12 0 0 1 .119-.12.12.12 0 0 1 .12.12zm.111 1.084h-.825v.601s.061.31.412.31c.352 0 .413-.31.413-.31v-.6zm-.468.241a.12.12 0 0 1-.12.12.12.12 0 0 1-.118-.12.12.12 0 0 1 .119-.12.12.12 0 0 1 .119.12zm-.12.603a.12.12 0 0 0 .12-.12.12.12 0 0 0-.12-.121.12.12 0 0 0-.118.12c0 .067.053.12.119.12zm.477-.12a.12.12 0 0 1-.119.12.12.12 0 0 1-.119-.12.12.12 0 0 1 .119-.121.12.12 0 0 1 .12.12zM7.44 7.68a.12.12 0 0 0 .12-.12.12.12 0 0 0-.12-.121.12.12 0 0 0-.119.12c0 .067.054.12.12.12zm.298-.362a.12.12 0 0 1-.119.12.12.12 0 0 1-.119-.12.12.12 0 0 1 .119-.12.12.12 0 0 1 .12.12zm1.182-.24h-.825v.601s.061.31.413.31c.351 0 .412-.31.412-.31v-.6zm-.468.241a.12.12 0 0 1-.119.12.12.12 0 0 1-.119-.12.12.12 0 0 1 .12-.12.12.12 0 0 1 .118.12zm-.119.603a.12.12 0 0 0 .12-.12.12.12 0 0 0-.12-.121.12.12 0 0 0-.119.12c0 .067.054.12.12.12zm.477-.12a.12.12 0 0 1-.12.12.12.12 0 0 1-.119-.12.12.12 0 0 1 .12-.121.12.12 0 0 1 .119.12zm-.298-.121a.12.12 0 0 0 .119-.12.12.12 0 0 0-.12-.121.12.12 0 0 0-.118.12c0 .067.053.12.119.12zm.298-.362a.12.12 0 0 1-.12.12.12.12 0 0 1-.119-.12.12.12 0 0 1 .12-.12.12.12 0 0 1 .119.12zm-2.032-.241h-.826v.601s.062.31.413.31.413-.31.413-.31v-.6zm-.468.241a.12.12 0 0 1-.12.12.12.12 0 0 1-.119-.12.12.12 0 0 1 .12-.12.12.12 0 0 1 .119.12zm-.12.603a.12.12 0 0 0 .12-.12.12.12 0 0 0-.12-.121.12.12 0 0 0-.119.12c0 .067.054.12.12.12zm.477-.12a.12.12 0 0 1-.12.12.12.12 0 0 1-.118-.12.12.12 0 0 1 .119-.121.12.12 0 0 1 .119.12zm-.298-.121a.12.12 0 0 0 .12-.12.12.12 0 0 0-.12-.121.12.12 0 0 0-.119.12c0 .067.053.12.119.12zm.298-.362a.12.12 0 0 1-.12.12.12.12 0 0 1-.118-.12.12.12 0 0 1 .119-.12.12.12 0 0 1 .119.12zm1.182 1.085h-.825v.6s.061.31.412.31c.352 0 .413-.31.413-.31v-.6zm-.468.24a.12.12 0 0 1-.12.121.12.12 0 0 1-.118-.12.12.12 0 0 1 .119-.12.12.12 0 0 1 .119.12zm-.12.603a.12.12 0 0 0 .12-.12.12.12 0 0 0-.12-.121.12.12 0 0 0-.118.12.12.12 0 0 0 .119.121zm.477-.12a.12.12 0 0 1-.119.12.12.12 0 0 1-.119-.12.12.12 0 0 1 .119-.121.12.12 0 0 1 .12.12zm-.298-.121a.12.12 0 0 0 .12-.12.12.12 0 0 0-.12-.121.12.12 0 0 0-.119.12.12.12 0 0 0 .12.121zm.298-.361a.12.12 0 0 1-.119.12.12.12 0 0 1-.119-.12.12.12 0 0 1 .119-.12.12.12 0 0 1 .12.12z"
        fill="#013399"
      />
    </g>
  </svg>
);

export default FlagPt;
