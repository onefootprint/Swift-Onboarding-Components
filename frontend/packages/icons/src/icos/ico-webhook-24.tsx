import React from 'react';
import { useTheme } from 'styled-components';

import type { IconProps } from '../types';

const IcoWebhook24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <mask id="prefix__a" maskUnits="userSpaceOnUse" x={2.4} y={3} width={19} height={18} fill={theme.color[color]}>
        <path fill="#fff" d="M2.4 3h19v18h-19z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.2 8c0-2.205 1.795-4 4-4a4.006 4.006 0 0 1 3.825 5.175l-.762-.238c.092-.298.137-.607.137-.937 0-1.772-1.428-3.2-3.2-3.2A3.194 3.194 0 0 0 9 8c0 1.177.633 2.206 1.575 2.762l.35.2-.213.35-2.175 3.575c.091.094.183.197.25.313.215.37.274.8.163 1.213a1.606 1.606 0 0 1-2.938.387 1.605 1.605 0 0 1 1.823-2.344l.027.007L9.837 11.2C8.853 10.47 8.2 9.316 8.2 8Zm2.4 0a1.601 1.601 0 0 1 3.2 0c0 .46-.2.87-.513 1.162l1.763 3.188c.481-.205.995-.35 1.55-.35 2.205 0 4 1.795 4 4s-1.795 4-4 4a3.999 3.999 0 0 1-2.775-1.125l.55-.575c.577.555 1.36.9 2.225.9 1.772 0 3.2-1.428 3.2-3.2a3.194 3.194 0 0 0-4.738-2.8l-.362.188-.188-.35-1.925-3.488c-.123.031-.254.05-.387.05-.883 0-1.6-.717-1.6-1.6Zm-7.2 8a4.007 4.007 0 0 1 3.025-3.887l.2.787A3.195 3.195 0 0 0 4.2 16c0 1.772 1.428 3.2 3.2 3.2 1.772 0 3.2-1.428 3.2-3.2v-.4h4.463a1.59 1.59 0 0 1 1.537-1.2 1.601 1.601 0 0 1 0 3.2 1.59 1.59 0 0 1-1.538-1.2h-3.737C11.115 18.408 9.462 20 7.4 20c-2.205 0-4-1.795-4-4Z"
        />
      </mask>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.2 8c0-2.205 1.795-4 4-4a4.006 4.006 0 0 1 3.825 5.175l-.762-.238c.092-.298.137-.607.137-.937 0-1.772-1.428-3.2-3.2-3.2A3.194 3.194 0 0 0 9 8c0 1.177.633 2.206 1.575 2.762l.35.2-.213.35-2.175 3.575c.091.094.183.197.25.313.215.37.274.8.163 1.213a1.606 1.606 0 0 1-2.938.387 1.605 1.605 0 0 1 1.823-2.344l.027.007L9.837 11.2C8.853 10.47 8.2 9.316 8.2 8Zm2.4 0a1.601 1.601 0 0 1 3.2 0c0 .46-.2.87-.513 1.162l1.763 3.188c.481-.205.995-.35 1.55-.35 2.205 0 4 1.795 4 4s-1.795 4-4 4a3.999 3.999 0 0 1-2.775-1.125l.55-.575c.577.555 1.36.9 2.225.9 1.772 0 3.2-1.428 3.2-3.2a3.194 3.194 0 0 0-4.738-2.8l-.362.188-.188-.35-1.925-3.488c-.123.031-.254.05-.387.05-.883 0-1.6-.717-1.6-1.6Zm-7.2 8a4.007 4.007 0 0 1 3.025-3.887l.2.787A3.195 3.195 0 0 0 4.2 16c0 1.772 1.428 3.2 3.2 3.2 1.772 0 3.2-1.428 3.2-3.2v-.4h4.463a1.59 1.59 0 0 1 1.537-1.2 1.601 1.601 0 0 1 0 3.2 1.59 1.59 0 0 1-1.538-1.2h-3.737C11.115 18.408 9.462 20 7.4 20c-2.205 0-4-1.795-4-4Z"
        fill={theme.color[color]}
      />
      <path
        d="m16.025 9.175-.06.19.192.06.059-.19-.191-.06Zm-.762-.238-.192-.059-.059.191.191.06.06-.191Zm-4.688 1.825-.102.173.003.001.099-.174Zm.35.2.171.104.107-.175-.179-.102-.099.174Zm-.213.35.171.104-.17-.104Zm-2.175 3.575-.17-.104-.08.133.107.11.143-.139Zm.25.313.174-.1-.174.1Zm.163 1.213.193.051-.193-.051Zm-.75.974.1.174-.1-.174ZM6.012 16.8l.174-.1-.174.1Zm.588-2.188-.1-.173.1.174Zm1.212-.162.053-.193-.053.193Zm.023.006.046-.195-.046.195Zm.027.007-.057.191.148.045.08-.133-.17-.104ZM9.837 11.2l.172.104.094-.156-.146-.109-.12.161Zm3.45-2.037-.136-.147-.114.107.075.136.175-.097Zm1.763 3.187-.175.097.087.158.166-.071-.078-.184Zm-1.225 6.525-.144-.138-.138.144.143.138.139-.144Zm.55-.575.139-.144-.145-.14-.139.146.145.138Zm.688-5.1.091.178.005-.003-.097-.175Zm-.363.188-.176.094.093.174.175-.09-.092-.179Zm-.188-.35.177-.095-.001-.002-.176.096ZM12.587 9.55l.176-.097-.075-.135-.15.038.05.194Zm-6.162 2.563.194-.05-.05-.193-.192.048.048.195Zm.2.787.048.194.195-.049-.05-.194-.193.049Zm3.975 2.7v-.2h-.2v.2h.2Zm4.463 0v.2h.154l.04-.15-.194-.05Zm0 .8.193-.05-.039-.15h-.155v.2Zm-3.738 0v-.2h-.18l-.019.18.199.02ZM12.2 3.8A4.206 4.206 0 0 0 8 8h.4c0-2.094 1.706-3.8 3.8-3.8v-.4ZM16.4 8c0-2.315-1.885-4.2-4.2-4.2v.4C14.294 4.2 16 5.906 16 8h.4Zm-.184 1.234c.122-.393.184-.805.184-1.234H16c0 .39-.056.762-.166 1.116l.382.118Zm-1.013-.106.763.238.118-.382-.762-.237-.119.381ZM15.2 8c0 .31-.043.6-.129.878l.383.119c.098-.32.146-.648.146-.997h-.4Zm-3-3c1.661 0 3 1.339 3 3h.4c0-1.882-1.518-3.4-3.4-3.4V5Zm-3 3c0-1.661 1.339-3 3-3v-.4A3.394 3.394 0 0 0 8.8 8h.4Zm1.477 2.59A3.005 3.005 0 0 1 9.2 8h-.4c0 1.25.672 2.344 1.673 2.935l.204-.345Zm.347.199-.35-.2-.198.347.35.2.198-.347Zm-.14.627.212-.35-.342-.207-.213.35.342.207Zm-2.176 3.575 2.175-3.575-.341-.207-2.175 3.575.341.207Zm.252.109a1.87 1.87 0 0 0-.279-.351l-.287.277c.088.092.166.18.22.274l.346-.2Zm.183 1.364c.125-.464.058-.949-.182-1.364l-.347.2c.188.325.24.7.143 1.06l.386.104ZM8.3 17.561c.416-.24.718-.633.843-1.097l-.386-.103a1.405 1.405 0 0 1-.657.853l.2.347Zm-.9.239c.305 0 .616-.075.9-.24l-.2-.346c-.22.127-.461.186-.7.186v.4Zm-1.56-.9c.332.577.939.9 1.56.9v-.4a1.4 1.4 0 0 1-1.214-.7l-.347.2Zm.66-2.46a1.805 1.805 0 0 0-.66 2.46l.346-.2a1.405 1.405 0 0 1 .514-1.914l-.2-.347Zm1.364-.183a1.79 1.79 0 0 0-1.364.182l.2.347a1.39 1.39 0 0 1 1.06-.143l.104-.386Zm.017.004-.016-.004-.105.386.03.007.09-.39Zm.039.01-.04-.01-.09.39.015.003.115-.383Zm1.746-3.175L7.691 14.36l.343.207 1.975-3.262-.343-.208ZM8 8c0 1.384.687 2.597 1.718 3.36l.239-.32C9.019 10.343 8.4 9.246 8.4 8H8Zm4.2-1.8c-.993 0-1.8.807-1.8 1.8h.4c0-.772.628-1.4 1.4-1.4v-.4ZM14 8c0-.993-.807-1.8-1.8-1.8v.4c.772 0 1.4.628 1.4 1.4h.4Zm-.576 1.309C13.774 8.982 14 8.52 14 8h-.4c0 .401-.174.759-.45 1.016l.274.293Zm1.801 2.944-1.762-3.187-.35.193 1.762 3.188.35-.194ZM16.6 11.8c-.59 0-1.132.155-1.628.366l.156.368c.466-.198.953-.334 1.472-.334v-.4Zm4.2 4.2c0-2.315-1.885-4.2-4.2-4.2v.4c2.094 0 3.8 1.706 3.8 3.8h.4Zm-4.2 4.2c2.315 0 4.2-1.885 4.2-4.2h-.4c0 2.094-1.706 3.8-3.8 3.8v.4Zm-2.914-1.18A4.2 4.2 0 0 0 16.6 20.2v-.4a3.8 3.8 0 0 1-2.636-1.07l-.278.29Zm.544-.858-.55.575.29.276.55-.575-.29-.276ZM16.6 19c-.81 0-1.545-.323-2.086-.844l-.278.288a3.403 3.403 0 0 0 2.364.956V19Zm3-3c0 1.661-1.339 3-3 3v.4c1.882 0 3.4-1.518 3.4-3.4h-.4Zm-3-3c1.661 0 3 1.339 3 3h.4c0-1.882-1.518-3.4-3.4-3.4v.4Zm-1.44.375c.43-.238.915-.375 1.44-.375v-.4c-.597 0-1.149.157-1.634.425l.193.35Zm-.368.19.362-.187-.183-.356-.363.188.184.355Zm-.456-.433.188.35.352-.189-.187-.35-.353.189Zm-1.924-3.485 1.925 3.487.35-.193-1.924-3.488-.35.194ZM12.2 9.8c.151 0 .3-.021.437-.056l-.099-.388c-.11.028-.224.044-.338.044v.4ZM10.4 8c0 .993.807 1.8 1.8 1.8v-.4c-.772 0-1.4-.628-1.4-1.4h-.4Zm-4.023 3.918A4.207 4.207 0 0 0 3.2 16h.4a3.807 3.807 0 0 1 2.873-3.693l-.096-.389Zm.442.933-.2-.788-.388.099.2.787.388-.098ZM4.4 16c0-1.408.969-2.58 2.273-2.906l-.096-.388A3.395 3.395 0 0 0 4 16h.4Zm3 3c-1.661 0-3-1.339-3-3H4c0 1.882 1.518 3.4 3.4 3.4V19Zm3-3c0 1.661-1.339 3-3 3v.4c1.882 0 3.4-1.518 3.4-3.4h-.4Zm0-.4v.4h.4v-.4h-.4Zm4.662-.2H10.6v.4h4.463v-.4Zm1.538-1.2a1.79 1.79 0 0 0-1.731 1.35l.387.1A1.39 1.39 0 0 1 16.6 14.6v-.4Zm1.8 1.8c0-.993-.807-1.8-1.8-1.8v.4c.772 0 1.4.628 1.4 1.4h.4Zm-1.8 1.8c.993 0 1.8-.807 1.8-1.8H18c0 .772-.628 1.4-1.4 1.4v.4Zm-1.731-1.35c.2.773.892 1.35 1.731 1.35v-.4a1.39 1.39 0 0 1-1.344-1.05l-.387.1Zm-3.544.15h3.738v-.4h-3.738v.4ZM7.4 20.2c2.17 0 3.903-1.675 4.124-3.78l-.398-.04c-.2 1.911-1.772 3.42-3.726 3.42v.4ZM3.2 16c0 2.315 1.885 4.2 4.2 4.2v-.4A3.806 3.806 0 0 1 3.6 16h-.4Z"
        fill={theme.color[color]}
        mask="url(#prefix__a)"
      />
    </svg>
  );
};
export default IcoWebhook24;
