import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoWebhook16 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <g clipPath="url(#prefix__a)" fill={theme.color[color]}>
        <mask id="prefix__b" maskUnits="userSpaceOnUse" x={-0.42} y={0.1} width={17} height={15}>
          <path fill="#fff" d="M-.42.1h17v15h-17z" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.72 4.55A3.455 3.455 0 0 1 8.17 1.1a3.455 3.455 0 0 1 3.299 4.463l-.658-.204c.08-.258.119-.525.119-.809a2.755 2.755 0 0 0-2.76-2.76 2.755 2.755 0 0 0-2.76 2.76c0 1.015.546 1.903 1.358 2.383l.302.172-.183.302-1.876 3.083c.078.081.158.17.216.27.184.32.236.69.14 1.046a1.385 1.385 0 0 1-2.534.334 1.384 1.384 0 0 1 1.553-2.027l.006.002c.005 0 .01.002.014.003a2.055 2.055 0 0 1 .023.006L6.132 7.31C5.283 6.68 4.72 5.685 4.72 4.55Zm2.07 0a1.38 1.38 0 0 1 2.76 0c0 .398-.173.75-.442 1.003l1.52 2.749c.415-.177.859-.302 1.337-.302a3.455 3.455 0 0 1 3.45 3.45 3.455 3.455 0 0 1-3.45 3.45 3.45 3.45 0 0 1-2.393-.97l.474-.496a2.763 2.763 0 0 0 1.919.776 2.755 2.755 0 0 0 2.76-2.76 2.755 2.755 0 0 0-4.086-2.415l-.313.162-.162-.302-1.66-3.008A1.38 1.38 0 0 1 6.79 4.55Zm-6.21 6.9a3.456 3.456 0 0 1 2.609-3.353l.173.68A2.756 2.756 0 0 0 1.27 11.45a2.755 2.755 0 0 0 2.76 2.76 2.755 2.755 0 0 0 2.76-2.76v-.345h3.849a1.371 1.371 0 0 1 1.326-1.035 1.38 1.38 0 0 1 0 2.76c-.642 0-1.172-.44-1.326-1.035H7.415C7.233 13.527 5.81 14.9 4.03 14.9a3.455 3.455 0 0 1-3.45-3.45Z"
          />
        </mask>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.72 4.55A3.455 3.455 0 0 1 8.17 1.1a3.455 3.455 0 0 1 3.299 4.463l-.658-.204c.08-.258.119-.525.119-.809a2.755 2.755 0 0 0-2.76-2.76 2.755 2.755 0 0 0-2.76 2.76c0 1.015.546 1.903 1.358 2.383l.302.172-.183.302-1.876 3.083c.078.081.158.17.216.27.184.32.236.69.14 1.046a1.385 1.385 0 0 1-2.534.334 1.384 1.384 0 0 1 1.553-2.027l.006.002c.005 0 .01.002.014.003a2.055 2.055 0 0 1 .023.006L6.132 7.31C5.283 6.68 4.72 5.685 4.72 4.55Zm2.07 0a1.38 1.38 0 0 1 2.76 0c0 .398-.173.75-.442 1.003l1.52 2.749c.415-.177.859-.302 1.337-.302a3.455 3.455 0 0 1 3.45 3.45 3.455 3.455 0 0 1-3.45 3.45 3.45 3.45 0 0 1-2.393-.97l.474-.496a2.763 2.763 0 0 0 1.919.776 2.755 2.755 0 0 0 2.76-2.76 2.755 2.755 0 0 0-4.086-2.415l-.313.162-.162-.302-1.66-3.008A1.38 1.38 0 0 1 6.79 4.55Zm-6.21 6.9a3.456 3.456 0 0 1 2.609-3.353l.173.68A2.756 2.756 0 0 0 1.27 11.45a2.755 2.755 0 0 0 2.76 2.76 2.755 2.755 0 0 0 2.76-2.76v-.345h3.849a1.371 1.371 0 0 1 1.326-1.035 1.38 1.38 0 0 1 0 2.76c-.642 0-1.172-.44-1.326-1.035H7.415C7.233 13.527 5.81 14.9 4.03 14.9a3.455 3.455 0 0 1-3.45-3.45Z"
        />
        <path
          d="m11.469 5.563-.06.191.192.06.06-.191-.192-.06Zm-.658-.204-.19-.06-.06.191.19.06.06-.191ZM6.768 6.933l-.101.172.002.001.1-.173Zm.302.172.171.104.107-.176-.178-.102-.1.174Zm-.183.302.17.104h.001l-.171-.104ZM5.011 10.49l-.17-.104-.081.132.107.111.144-.139Zm.216.27.173-.1-.173.1Zm.14 1.046.193.052-.193-.052Zm-.647.84.1.174-.1-.173Zm-1.887-.506.174-.1-.174.1Zm.507-1.887-.1-.173.1.173Zm1.046-.14.052-.193-.052.193Zm.006.002-.049.194.049-.194Zm.014.003.045-.195-.045.195Zm.009.002.046-.194-.046.194Zm.014.004-.058.191.149.045.08-.133-.171-.103ZM6.132 7.31l.171.104.095-.156-.147-.109-.119.161Zm2.976-1.757-.137-.146-.114.106.076.136.175-.096Zm1.52 2.749-.175.097.087.158.166-.071-.078-.184ZM9.572 13.93l-.145-.139-.138.144.144.139.139-.144Zm.474-.496.139-.144-.145-.14-.139.146.145.138Zm.593-4.399.092.178.005-.003-.097-.175Zm-.313.162-.176.094.093.174.175-.09-.092-.178Zm-.162-.302.177-.095-.001-.002-.175.097Zm-1.66-3.008.175-.097-.074-.135-.15.038.05.194ZM3.19 8.097l.194-.05-.05-.192-.192.048.048.194Zm.173.68.048.193.195-.048-.05-.195-.193.05Zm3.428 2.328v-.2h-.2v.2h.2Zm3.849 0v.2h.155l.038-.15-.193-.05Zm0 .69.194-.05-.04-.15h-.154v.2Zm-3.224 0v-.2h-.18l-.019.18.2.02ZM8.17.9a3.655 3.655 0 0 0-3.65 3.65h.4A3.255 3.255 0 0 1 8.17 1.3V.9Zm3.65 3.65A3.655 3.655 0 0 0 8.17.9v.4a3.255 3.255 0 0 1 3.25 3.25h.4Zm-.16 1.073c.106-.342.16-.7.16-1.073h-.4c0 .333-.048.652-.142.954l.382.119Zm-.908-.073.658.204.118-.382-.657-.204-.12.382Zm-.022-1c0 .265-.036.512-.11.75l.383.118c.085-.278.127-.565.127-.868h-.4ZM8.17 1.99a2.555 2.555 0 0 1 2.56 2.56h.4a2.955 2.955 0 0 0-2.96-2.96v.4ZM5.61 4.55a2.555 2.555 0 0 1 2.56-2.56v-.4a2.955 2.955 0 0 0-2.96 2.96h.4Zm1.26 2.21a2.564 2.564 0 0 1-1.26-2.21h-.4c0 1.088.585 2.04 1.457 2.555l.203-.345Zm.3.171-.302-.172-.199.347.302.173.199-.348Zm-.112.58.183-.302L6.9 7l-.183.302.342.208Zm-1.876 3.083 1.876-3.083-.342-.208-1.876 3.083.342.208Zm.218.066a1.64 1.64 0 0 0-.245-.309l-.288.278c.076.079.142.154.187.232l.346-.202Zm.16 1.198c.11-.408.05-.834-.16-1.198l-.346.2c.158.274.201.59.12.894l.386.104Zm-.74.962c.365-.211.63-.555.74-.962l-.386-.104c-.082.304-.28.561-.554.72l.2.346Zm-.79.21c.267 0 .54-.066.79-.21l-.2-.347a1.176 1.176 0 0 1-.59.157v.4Zm-1.37-.79c.292.506.825.79 1.37.79v-.4a1.18 1.18 0 0 1-1.023-.59l-.347.2Zm.58-2.16a1.584 1.584 0 0 0-.58 2.16l.347-.2a1.185 1.185 0 0 1 .433-1.614l-.2-.346Zm1.198-.16a1.572 1.572 0 0 0-1.198.16l.2.347c.275-.158.59-.202.894-.12l.104-.387Zm.003 0h-.003l-.105.386.01.003.098-.388Zm.01.003-.01-.002-.098.388.017.004.09-.39Zm.01.003-.01-.003-.09.39.007.002.093-.39Zm.025.006a.477.477 0 0 0-.025-.006l-.093.389h.003l.115-.383Zm1.475-2.726L4.258 10.02l.342.207 1.703-2.813-.342-.208ZM4.52 4.55c0 1.203.598 2.257 1.493 2.92l.238-.32C5.45 6.553 4.92 5.615 4.92 4.55h-.4Zm3.65-1.58a1.58 1.58 0 0 0-1.58 1.58h.4c0-.651.529-1.18 1.18-1.18v-.4Zm1.58 1.58a1.58 1.58 0 0 0-1.58-1.58v.4c.65 0 1.18.529 1.18 1.18h.4Zm-.505 1.149c.306-.287.505-.691.505-1.149h-.4c0 .338-.146.64-.379.857l.274.292Zm1.558 2.506-1.52-2.75-.35.194 1.52 2.75.35-.194Zm1.162-.405c-.514 0-.985.135-1.415.318l.156.368c.4-.17.816-.286 1.259-.286v-.4Zm3.65 3.65a3.655 3.655 0 0 0-3.65-3.65v.4a3.255 3.255 0 0 1 3.25 3.25h.4Zm-3.65 3.65a3.655 3.655 0 0 0 3.65-3.65h-.4a3.255 3.255 0 0 1-3.25 3.25v.4Zm-2.532-1.026a3.65 3.65 0 0 0 2.532 1.026v-.4a3.25 3.25 0 0 1-2.255-.914l-.277.288Zm.468-.778-.474.495.29.277.473-.496-.289-.276Zm2.064.714c-.69 0-1.318-.276-1.78-.72l-.278.288a2.963 2.963 0 0 0 2.058.832v-.4Zm2.56-2.56a2.555 2.555 0 0 1-2.56 2.56v.4a2.955 2.955 0 0 0 2.96-2.96h-.4Zm-2.56-2.56a2.555 2.555 0 0 1 2.56 2.56h.4a2.955 2.955 0 0 0-2.96-2.96v.4Zm-1.23.32a2.52 2.52 0 0 1 1.23-.32v-.4c-.52 0-1 .136-1.423.37l.194.35Zm-.317.164.313-.161-.184-.356-.313.162.184.355Zm-.43-.385.162.302.352-.189-.161-.302-.353.19ZM8.33 5.983l1.66 3.008.35-.193L8.68 5.79l-.35.194Zm-.159.147c.133 0 .263-.019.383-.05l-.098-.387c-.092.023-.189.037-.285.037v.4ZM6.59 4.55c0 .872.708 1.58 1.58 1.58v-.4a1.18 1.18 0 0 1-1.18-1.18h-.4ZM3.14 7.903A3.656 3.656 0 0 0 .38 11.45h.4a3.256 3.256 0 0 1 2.457-3.159l-.096-.388Zm.415.824-.172-.68-.388.1.173.678.387-.098ZM1.47 11.45c0-1.202.827-2.202 1.94-2.48l-.097-.388A2.956 2.956 0 0 0 1.07 11.45h.4Zm2.56 2.56a2.555 2.555 0 0 1-2.56-2.56h-.4a2.955 2.955 0 0 0 2.96 2.96v-.4Zm2.56-2.56a2.555 2.555 0 0 1-2.56 2.56v.4a2.955 2.955 0 0 0 2.96-2.96h-.4Zm0-.345v.345h.4v-.345h-.4Zm4.049-.2H6.79v.4h3.849v-.4Zm1.326-1.035c-.737 0-1.344.507-1.52 1.185l.387.1c.132-.51.587-.885 1.133-.885v-.4Zm1.58 1.58a1.58 1.58 0 0 0-1.58-1.58v.4c.651 0 1.18.529 1.18 1.18h.4Zm-1.58 1.58a1.58 1.58 0 0 0 1.58-1.58h-.4c0 .65-.529 1.18-1.18 1.18v.4Zm-1.52-1.185a1.571 1.571 0 0 0 1.52 1.185v-.4c-.546 0-1-.375-1.133-.885l-.387.1Zm-3.03.15h3.224v-.4H7.415v.4ZM4.03 15.1c1.887 0 3.392-1.457 3.584-3.284l-.398-.042C7.045 13.41 5.701 14.7 4.03 14.7v.4ZM.38 11.45a3.655 3.655 0 0 0 3.65 3.65v-.4a3.255 3.255 0 0 1-3.25-3.25h-.4Z"
          mask="url(#prefix__b)"
        />
      </g>
      <defs>
        <clipPath id="prefix__a">
          <path fill="#fff" d="M0 0h16v16H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
export default IcoWebhook16;
