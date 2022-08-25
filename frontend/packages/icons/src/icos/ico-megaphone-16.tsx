import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoMegaphone16 = ({
  color = 'primary',
  className,
  testID,
}: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.927 3.36c-.4.75-.682 1.792-.682 2.883 0 1.09.282 2.132.682 2.883.2.375.418.652.619.827.087.076.164.126.228.159l.01.002.232.047c.08-.014.206-.064.371-.208.201-.175.418-.452.618-.827.401-.75.683-1.792.683-2.883 0-1.09-.282-2.133-.683-2.883-.2-.375-.417-.652-.618-.827-.165-.144-.29-.194-.371-.208l-.232.047-.01.002a1.116 1.116 0 0 0-.228.159c-.201.175-.418.452-.619.827ZM8.845 6.243c0 1.26.308 2.48.787 3.425l-1.375-.286c-1.993-.415-4.063-.85-4.486-.956-.25-.063-.62-.293-.935-.703a2.44 2.44 0 0 1-.516-1.48c0-.569.21-1.082.516-1.48.314-.41.685-.64.935-.703.423-.105 2.493-.542 4.486-.957l1.375-.285c-.479.945-.787 2.165-.787 3.425Zm1.796 5.064.72.149c.19.07.392.11.605.11.521 0 .978-.242 1.34-.556.364-.317.678-.745.934-1.225.513-.96.848-2.23.848-3.542 0-1.312-.335-2.582-.848-3.542-.256-.48-.57-.908-.935-1.225-.361-.314-.818-.556-1.339-.556-.213 0-.416.04-.605.11l-.72.149c-.715.148-1.679.347-2.67.554-1.97.41-4.082.855-4.54.969-.63.158-1.25.615-1.706 1.209A3.84 3.84 0 0 0 .92 6.243c0 .919.34 1.726.805 2.332.271.354.6.659.956.88v3.172a2.461 2.461 0 0 0 2.461 2.461h.44a2.461 2.461 0 0 0 2.462-2.461v-1.859l2.598.54Zm-3.997-.831c-1.008-.212-1.946-.41-2.563-.545v2.696c0 .586.475 1.061 1.061 1.061h.44c.587 0 1.062-.475 1.062-1.061v-2.151Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};

export default IcoMegaphone16;
