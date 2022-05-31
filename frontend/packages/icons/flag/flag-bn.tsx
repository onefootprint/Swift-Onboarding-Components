import React from 'react';

import type { FlagProps } from '../src/types';

const FlagBn = ({ className, testID }: FlagProps) => (
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
        fill="#FFD221"
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
          d="m-1.917 6.635 1.255-2.862 21.767 9.545-1.255 2.862-21.767-9.545z"
          fill="#313131"
        />
        <path
          d="M-1.886 3.48-.63.62l22.849 10.014-1.255 2.863L-1.886 3.48z"
          fill="#FAF9F9"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M4.582 7.748c-.887-1.088-.739-1.824-.739-1.824s.908.034.898.619c0 .247.325.48.605.683.213.152.399.286.399.393 0 .249.187 2.756.187 2.756s-.13.229-.757.229c-.626 0-.593-.361-.593-.361.38-.466 0-2.495 0-2.495zm10.836 0c.887-1.088.739-1.824.739-1.824s-.907.034-.897.619c0 .247-.326.48-.606.683-.212.152-.399.286-.399.393 0 .249-.187 2.756-.187 2.756s.13.229.757.229.594-.361.594-.361c-.38-.466 0-2.495 0-2.495zm-5.381-5.951.705.502-.462.124.462.399-.575-.146v.403h.575l.192.945-.223-.158-.222.158-.222-.158-.223.158-.229-.158-.229.158-.229-.158-.229.158.289-.945h.531V1.797h.09zm3.141 3.173s-.215.19-.675 0a3.25 3.25 0 0 1-.498-.29c-.35-.23-.73-.48-1.08-.411-.524.104-.757.354-.757.354v-.576h-.226v.576s-.233-.25-.757-.354c-.35-.07-.729.18-1.08.41a3.249 3.249 0 0 1-.498.29c-.46.19-.675 0-.675 0s0 .161.342.409c.149.107.319.1.463.056-.107.081-.159.176.012.252.354.158.936-.257 1-.304-.072.053-.775.581-.453.581.34 0 .889-.444.889-.444s-.667.64-.308.74c.228.063.5-.27.629-.467.004.042.042.067.084.095.054.036.113.076.113.158 0 .106.027.124.05.14.018.012.033.023.033.073v.146l-.083.122s0 .191.083.342c.063.115.031.211-.025.377a4.24 4.24 0 0 0-.058.183c-.083.288.083.78.083.78h-.083s.083.06.083.303c0 .198-.055.31-.159.522-.023.048-.05.102-.078.163-.155.328.154.745.154.745s-.518-.228-.414 0c.08.175.518.345.717.414v.033l.05-.016.048.016v-.033c.2-.07.638-.24.718-.414.103-.228-.415 0-.415 0s.31-.417.155-.745c-.03-.061-.055-.115-.08-.163-.103-.212-.158-.324-.158-.522 0-.242.083-.303.083-.303h-.083s.166-.492.083-.78a4.15 4.15 0 0 0-.058-.183c-.056-.166-.088-.262-.025-.377.083-.151.083-.342.083-.342l-.083-.122v-.146c0-.05.016-.061.034-.073.023-.016.049-.034.049-.14 0-.082.06-.122.113-.158.042-.028.08-.053.085-.095.128.197.4.53.628.466.359-.1-.308-.739-.308-.739s.55.444.889.444c.322 0-.381-.528-.452-.581.064.047.645.462 1 .304.17-.076.118-.171.011-.252.145.043.314.051.463-.056.342-.248.342-.408.342-.408zm-1.14.291s.146.117.335.173a1.614 1.614 0 0 0-.335-.173zm-1.476.425c-.057-.075-.03-.007.043.106.002-.027-.01-.06-.043-.106zm-1.013 0c.056-.075.03-.007-.043.106-.003-.027.009-.06.043-.106zm-1.477-.425s-.146.117-.335.173c.128-.096.335-.173.335-.173z"
          fill="#CF1225"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.018 5.986s-.746 1.015-.663 2.1c.083 1.084.968 3.606 3.592 3.606h.068c2.78 0 3.57-2.782 3.57-3.782 0-1.009-.63-1.924-.63-1.924s.074 1.354 0 1.924c-.221 1.719-1.304 2.513-2.959 2.513-1.665 0-2.696-.824-2.978-2.513-.09-.546 0-1.924 0-1.924z"
          fill="#CF1225"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M5.666 12.345s.135-.388.302-.388c.166 0-.319-.337 0-.432.318-.095.808.38.808-.095s-.414-.734-.11-.734c.305 0 .623-.09.623-.09s1.295 1.35 2.593 1.35c1.297 0 2.857-1.26 2.857-1.26s.575-.146.575.082c0 .228-.126.572-.126.572s.402-.079.607 0c.205.08 0 .46 0 .46v.147s.534-.118.534.092-.258.09-.78.15c-.521.06-.719.469-1.047.469-.327 0-.398-.323-.398-.323s-1.016.55-2.222.55c-1.207 0-1.936-.55-1.936-.55s.114.565-.272.444c-.385-.121-.78-.89-1.243-.74-.463.15-.765.296-.765.296z"
          fill="#CF1225"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.539 10.103c.022-.021.045-.045.075-.078a1.02 1.02 0 0 1 .126-.128.385.385 0 0 1 .006.078c0 .235.008.412.031.536.016.088.04.145.08.172.058.04.117.005.171-.077.126-.188.361-.211.361-.14 0 .02-.007.04-.053.151a2.07 2.07 0 0 0-.02.05.423.423 0 0 0-.04.2c.011.08.07.124.164.124.106 0 .175-.068.252-.203a7.54 7.54 0 0 0 .036-.065l.004-.007a.58.58 0 0 1 .033-.055c.028-.04.034-.036.096.11l.079.19.05.12c.04.095.069.152.099.191.069.09.15.09.249.006a.762.762 0 0 1 .066-.05c.013-.01.044-.03.074-.049l.065-.042c.057-.04.085-.07.084-.117 0-.058-.05-.095-.147-.131a.342.342 0 0 1-.045-.02l-.017-.006.012-.005.004-.003a.77.77 0 0 1 .295-.052l.01.001c.003.002.003.008.003.022v.002a.747.747 0 0 1-.036.167l-.009.036c-.03.12-.04.191-.018.254.031.091.12.123.256.096.185-.037.275-.11.299-.223a.42.42 0 0 0 .007-.094c0-.073 0-.073.063-.073.088 0 .123.031.16.118l.013.032c.043.104.083.15.174.15.06 0 .102-.026.095-.085a.141.141 0 0 0-.017-.046l-.007-.014-.013-.026c-.056-.114-.034-.202.16-.325.054-.036.14-.095.213-.147l.126-.087a.892.892 0 0 1 .005.069l.003.082.002.04c.008.21.051.401.115.479.107.132.211.01.282-.28a2.78 2.78 0 0 1 .258-.697c.046-.078.09-.127.122-.142.022-.01.037-.002.06.038.085.155.215.298.326.34.164.063.26-.07.26-.365 0-.248.041-.446.108-.599a.74.74 0 0 1 .1-.165l-.071-.076a.658.658 0 0 0-.123.198 1.6 1.6 0 0 0-.116.642c0 .233-.046.296-.122.267-.084-.032-.199-.159-.273-.293-.047-.085-.116-.117-.19-.083-.057.026-.113.088-.169.183-.1.169-.2.44-.27.726-.03.125-.062.204-.104.238-.044-.055-.084-.227-.09-.415l-.002-.04-.004-.083a.825.825 0 0 0-.006-.086c-.01-.068-.045-.107-.106-.091a2.2 2.2 0 0 0-.244.158c-.058.04-.112.079-.145.1-.238.152-.276.299-.196.461l.006.013c-.019-.009-.032-.031-.053-.08l-.013-.033c-.052-.122-.119-.181-.255-.181-.13 0-.164.054-.165.178a.33.33 0 0 1-.004.072c-.014.067-.07.112-.218.142-.093.018-.13.005-.14-.028-.012-.035-.005-.094.02-.193l.01-.034a.783.783 0 0 0 .038-.193c.002-.079-.037-.133-.115-.133a.86.86 0 0 0-.34.064c-.125.062-.1.168.057.227a.5.5 0 0 1 .063.027l.015.006a.04.04 0 0 0-.009.006l-.03.024-.057.037-.08.052a.893.893 0 0 0-.076.057c-.057.05-.073.05-.103.01a.848.848 0 0 1-.086-.168 17.817 17.817 0 0 1-.128-.31c-.088-.208-.183-.255-.272-.13a.676.676 0 0 0-.04.065l-.005.008-.035.063c-.06.104-.106.15-.163.15-.046 0-.059-.009-.062-.032a.351.351 0 0 1 .034-.147l.019-.048c.057-.14.06-.15.06-.191 0-.214-.377-.176-.547.08a.195.195 0 0 1-.036.043.325.325 0 0 1-.03-.099 3.137 3.137 0 0 1-.03-.516c0-.145-.043-.222-.137-.18-.042.019-.044.02-.171.158-.028.031-.05.053-.07.072a.347.347 0 0 1-.07.053c-.029.015-.04.006-.055-.062a1.603 1.603 0 0 1-.022-.335v-.14c0-.117-.031-.183-.107-.183a.19.19 0 0 0-.086.026.874.874 0 0 0-.04.022l-.042.024c-.07.04-.117.058-.161.058-.008 0-.013.002-.015.002H6.87h.001l.013-.02c.029-.057.107-.15.233-.273l-.07-.076c-.134.13-.218.23-.254.3-.05.097-.011.173.094.173a.418.418 0 0 0 .211-.072c.098-.056.103-.059.118-.059 0 0 .005.012.005.078v.14c0 .174.005.278.024.36.029.124.1.184.202.13a.436.436 0 0 0 .092-.068zm.212-.212h.001-.001zm1.664.967a.024.024 0 0 1-.003-.002c.001.004.002.007.004.008l-.001-.006zm1.813-.309zm-2.583 1.795c-.045.123-.117.163-.198.102a.466.466 0 0 1-.082-.088l-.007-.01a7.41 7.41 0 0 0-.078-.102.533.533 0 0 0-.195-.169l-.006-.002c-.08-.034-.097-.041-.114-.05l-.018-.008a.422.422 0 0 1-.203-.186 2.283 2.283 0 0 1-.149-.352l.096-.037c.066.18.104.271.14.335a.32.32 0 0 0 .16.145l.016.008.111.048.006.002c.084.036.155.1.235.2l.081.105.005.007a.397.397 0 0 0 .07.077c.008-.005.02-.024.035-.062.031-.085.003-.15-.073-.22l-.02-.016c-.03-.024-.08-.063-.088-.076-.03-.044-.004-.088.04-.1a.422.422 0 0 1 .098-.007c.166 0 .211.097.242.346v.004c.025.196.05.25.133.25.094 0 .152-.038.252-.145l.022-.024c.128-.136.217-.182.367-.14.12.033.172.092.184.184l.003.035c.006.077.02.09.17.09.113 0 .218.005.356.018l.016.001c.032.003.101.01.122.01a.866.866 0 0 0 .101.006.26.26 0 0 0 .041-.002c.004-.03.022-.052.094-.133l.02-.024a.225.225 0 0 0 .048-.07s-.03-.012-.111-.012c-.075 0-.112-.009-.119-.061-.005-.044.02-.066.076-.095.065-.035.182-.08.323-.124.136-.043.279-.082.388-.105a.941.941 0 0 1 .142-.022c.066-.004.106.005.106.065 0 .026.07.111.14.15.084.047.144.03.185-.08.06-.16.184-.332.306-.43.066-.054.126-.082.178-.078.07.007.106.067.106.158h-.102c0-.043-.006-.052-.013-.053-.02-.002-.059.017-.105.055a.998.998 0 0 0-.275.386c-.064.172-.193.21-.328.135a.44.44 0 0 1-.187-.203.912.912 0 0 0-.133.02 4.12 4.12 0 0 0-.604.182c.074.01.116.038.127.09.011.05-.014.095-.07.161a1.018 1.018 0 0 0-.09.106c0 .07-.053.09-.143.09-.028 0-.062-.002-.11-.006l-.123-.011-.015-.002a3.798 3.798 0 0 0-.348-.018c-.202 0-.26-.053-.27-.186a.494.494 0 0 0-.004-.029c-.006-.05-.028-.074-.108-.096-.105-.03-.163 0-.267.111l-.022.024c-.118.126-.196.176-.326.176-.147 0-.195-.078-.226-.282a.36.36 0 0 1-.01.034zm.009-.093v-.004a.902.902 0 0 0-.033-.152.22.22 0 0 1 .043.215 1.92 1.92 0 0 1-.01-.06zm1.874-.076h.003-.002zm-.002.343-.002.001h.002z"
          fill="#F6E017"
        />
      </g>
    </g>
  </svg>
);

export default FlagBn;
