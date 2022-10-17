import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoCheck16 = ({ color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={16}
      height={16}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      data-testid={testID}
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.39 3.986a.646.646 0 1 1 .914.914l-7.107 7.107a.646.646 0 0 1-.914 0L2.7 9.422a.646.646 0 1 1 .913-.913l2.128 2.127 6.65-6.65Z"
        fill={theme.color[color]}
      />
      <path
        d="m12.835 3.79-.008-.25.008.25Zm-.445.196.177.177.003-.003-.18-.174Zm.813-.094-.135.21.135-.21Zm.246.292.23-.097-.23.097Zm.038.38-.245-.05.245.05Zm-.183.336-.174-.18-.003.003.177.177Zm-7.107 7.107.177.177-.177-.177Zm-.914 0-.177.177.177-.177ZM2.7 9.422l.176-.176-.003-.004-.173.18Zm-.146-.21-.23.1.23-.1Zm-.053-.25.25-.002-.25.003Zm.048-.25.231.095-.231-.095Zm.141-.213-.177-.176.177.176Zm.464-.189-.003.25.003-.25Zm.46.199-.181.173.004.004.176-.177Zm2.127 2.127-.177.177.177.177.177-.177-.177-.177Zm7.087-7.096a.896.896 0 0 0-.616.272l.359.348a.396.396 0 0 1 .272-.12l-.015-.5Zm.51.142a.896.896 0 0 0-.51-.142l.015.5c.08-.002.159.02.226.063l.27-.421Zm.342.405a.896.896 0 0 0-.341-.405l-.27.42c.067.044.12.106.15.18l.461-.195Zm.053.527a.896.896 0 0 0-.053-.527l-.46.195c.03.073.039.154.023.233l.49.099Zm-.253.465a.896.896 0 0 0 .253-.465l-.49-.1a.396.396 0 0 1-.112.206l.348.359Zm-7.105 7.105 7.107-7.108-.354-.353L6.02 11.83l.354.354Zm-.634.262a.896.896 0 0 0 .634-.262l-.354-.354a.396.396 0 0 1-.28.116v.5Zm-.634-.262a.896.896 0 0 0 .634.262v-.5a.396.396 0 0 1-.28-.116l-.354.354ZM2.522 9.599l2.584 2.585.354-.354-2.585-2.584-.353.353Zm-.198-.287c.047.11.116.208.202.29l.346-.36a.396.396 0 0 1-.09-.129l-.458.199Zm-.074-.347c.001.12.026.237.074.347l.459-.199a.396.396 0 0 1-.033-.153l-.5.005Zm.066-.347a.896.896 0 0 0-.066.347l.5-.005c0-.052.01-.105.03-.153l-.464-.19Zm.196-.295a.896.896 0 0 0-.196.295l.463.189a.396.396 0 0 1 .087-.13l-.354-.354Zm.295-.196a.896.896 0 0 0-.295.196l.354.353a.396.396 0 0 1 .13-.087l-.189-.462Zm.348-.067a.896.896 0 0 0-.348.067l.19.462a.396.396 0 0 1 .153-.029l.005-.5Zm.347.074a.896.896 0 0 0-.347-.074l-.005.5c.053 0 .105.012.153.033l.199-.46Zm.29.202a.896.896 0 0 0-.29-.202l-.199.459c.049.02.092.05.129.089l.36-.346Zm2.125 2.124L3.789 8.332l-.353.354 2.127 2.127.354-.353Zm6.297-6.65-6.65 6.65.353.353 6.65-6.65-.353-.354Z"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoCheck16;
