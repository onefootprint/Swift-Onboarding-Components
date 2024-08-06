import React from 'react';
import type { IconProps } from '../types';
const IcoMastercard16 = ({ 'aria-label': ariaLabel, className, testID }: IconProps) => {
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
      data-colored={true}
      viewBox="0 0 16 16"
    >
      <g clipPath="url(#prefix__a)">
        <path d="M10.163 4.057H5.837v7.775h4.326V4.057Z" fill="#FF5F00" />
        <path
          d="M6.112 7.945A4.936 4.936 0 0 1 8 4.057a4.945 4.945 0 1 0 0 7.775 4.936 4.936 0 0 1-1.888-3.887Z"
          fill="#EB001B"
        />
        <path
          d="M16 7.945a4.944 4.944 0 0 1-8 3.887 4.945 4.945 0 0 0 0-7.775 4.944 4.944 0 0 1 8 3.888ZM15.528 11.008v-.159h.065v-.032h-.164v.032h.064v.16h.035Zm.318 0v-.192h-.05l-.058.132-.058-.132h-.05v.192h.036v-.144l.054.124h.036l.054-.125v.145h.036Z"
          fill="#F79E1B"
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
export default IcoMastercard16;
