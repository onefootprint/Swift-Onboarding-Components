import React from 'react';

import type { FlagProps } from '../types';

const FlagSm = ({ className, testID }: FlagProps) => (
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
          d="M0 7.5V15h20V7.5H0z"
          fill="#56C6F5"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.409 5.643a.35.35 0 0 0-.035-.134c-.16-.3-.109-.674-.109-.674s-.191.439-.304.851c-.118-.192-.16-.384-.16-.384s-.076 1.21.158 1.497c.234.287.39.413.39.413s.018-.502-.05-.896a2.94 2.94 0 0 0 .106-.498 5.96 5.96 0 0 0 .213-.166c-.042.235-.044.363-.044.363s.881-.64.904-.979c.022-.339.264-.629.264-.629s-.2.138-.429.321c.06-.284.248-.508.248-.508s-1.001.685-1.084 1.046a4.093 4.093 0 0 0-.068.377zm.043 2.081c-.096-.181-.514-.94-.806-1.007-.33-.075-.58-.36-.58-.36s.52 1.096.865 1.234c.276.11.457.154.518.167-.01.148-.011.25-.011.25s.162-.117.41-.392c.25-.274.236-1.487.236-1.487s-.098.365-.363.577c-.178.143-.244.68-.27 1.018zM5.67 7.61c.378-.003.96.925.96.925s-.226.012-.62-.05c-.393-.062-1.007-1.12-1.007-1.12s.288.247.667.245zm1.844 2.16s.224-1.182-.113-1.458a1.198 1.198 0 0 1-.396-.687s-.3 1.311 0 1.65c.299.34.509.495.509.495zm-1.36-.319c.22.261.921 0 .921 0s.155.14-.402-.368c-.556-.508-1.688-.187-1.383-.187.305 0 .643.294.864.555zm.52 1.388c.407.345 1.29-.476 1.29-.476s-.228-.275-.648-.478c-.421-.203-1.973 0-1.973 0l.69.308s-.768.3-.564.283c.204-.016.796.017 1.204.363z"
          fill="#006923"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.008 10.123s-.35-.59 0-.875c.351-.285.49-.095.49-.423 0-.327.036-.23.208-.392.172-.163.05-.558.281-.36.231.197.274-.181.274.605V7.523c0-.442-.274-.337-.274-.633 0-.297-.274-.74 0-.74s.435.33.435.33.27.459.27 0-.48-.322-.705-.829c-.225-.506-.19.057-.489-.595-.3-.653-.656-.86-.328-.86h.536c.281 0 .716-.233.716 0v.493c0 .367.27.367.27.367s.146-.733.33-.367c.184.367.058.962.193.962.134 0 .023-.615.317-.144.294.472 0 .791 0 .973 0 .182-.317.628-.317.628s.062.217.317 0c.255-.218.497-.436.497-.218s.497.285 0 .633c-.497.348-.18.696-.497.696s-.69.46-.84.46c-.15 0-.711.35-.43.35.28 0 .566-.702.76-.35.193.35.19-.058.35.146.16.205.32 1.313.16.868-.16-.445-.41-.445-.84-.445s-1.267.032-.986.239c.281.206.597-.207.716 0 .12.206.085.413.27.206.184-.206.366 0 .523 0 .157 0-.157.231 0 .43.157.198.508.462.157.462-.35 0-.53-.28-.68 0-.15.28-.157.767-.43.384-.275-.384-.764-.19-.764-.384s.107-.226-.191-.226c-.299 0-.299-.236-.299-.236z"
          fill="#093"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.448 5.906a.154.154 0 0 1-.152.157.154.154 0 0 1-.15-.157c0-.086.067-.156.15-.156.084 0 .152.07.152.156zm-6.986.344c.083 0 .15-.07.15-.156a.154.154 0 0 0-.15-.157.154.154 0 0 0-.152.157c0 .086.068.156.152.156zm.15.656a.154.154 0 0 1-.15.157.154.154 0 0 1-.152-.157c0-.086.068-.156.152-.156.083 0 .15.07.15.156zM6.705 8.5c.083 0 .15-.07.15-.156a.154.154 0 0 0-.15-.156.154.154 0 0 0-.152.156c0 .086.068.156.152.156zm1.21 1.563c.083 0 .15-.07.15-.157a.154.154 0 0 0-.15-.156.154.154 0 0 0-.152.156c0 .087.068.156.151.156zm5.806-2.376c.083 0 .151-.07.151-.156a.154.154 0 0 0-.151-.156.154.154 0 0 0-.152.156c0 .087.068.157.152.157zm-.333 1.094a.154.154 0 0 1-.151.156.154.154 0 0 1-.151-.156c0-.086.067-.156.15-.156.084 0 .152.07.152.156zm-1.421 1.531c.083 0 .15-.07.15-.156a.154.154 0 0 0-.15-.156.154.154 0 0 0-.151.156c0 .086.067.156.15.156zm-3.841.032a.154.154 0 0 1-.151.156.154.154 0 0 1-.151-.156c0-.086.067-.156.15-.156.084 0 .152.07.152.156z"
          fill="#C51918"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.274 12.387c0-.128-1.938-1.463-2.458-1.758-.52-.294-3.06-1.915-2.369-4.379h-.104S5.875 9.285 9.1 11.172c1.468.985 1.541 1.215 1.541 1.215s.633.128.633 0z"
          fill="#FECA00"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.703 12.387c0-.128 1.938-1.463 2.458-1.758.52-.294 3.06-1.915 2.368-4.379h.105s.468 3.035-2.757 4.922c-1.469.985-1.542 1.215-1.542 1.215s-.632.128-.632 0z"
          fill="#FECA00"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.03 10.553c1.353 0 2.45-1.75 2.45-3.46 0-1.708-1.097-2.593-2.45-2.593-1.353 0-2.45.885-2.45 2.594 0 1.708 1.097 3.46 2.45 3.46z"
          fill="#56C6F5"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.946 5.962s.377-.333.188-.333a.868.868 0 0 1-.129-.015c-.2-.032-.46-.074-.46.348v.725H8.49a.062.062 0 1 0 0 .125h.049l-.038.705-.071.006a.067.067 0 0 0-.061.073l.004.053a.067.067 0 0 0 .073.061l.045-.004c-.017.321-.03.602-.03.637 0 .084.573.051.573.051l-.037-.732.038-.003a.067.067 0 0 0 .061-.073l-.004-.053a.067.067 0 0 0-.073-.061l-.032.002c-.011-.235-.023-.475-.03-.662h.073a.062.062 0 1 0 0-.125h-.079a6.52 6.52 0 0 1-.005-.198v-.527z"
          fill="#fff"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.67 6.875h.201v.269h-.202v-.269zm-.061.938h.336v.625h-.336v-.626z"
          fill="#000"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.216 5.962s.377-.333.189-.333a.851.851 0 0 1-.13-.015c-.2-.032-.46-.074-.46.348v.725H9.76a.062.062 0 1 0 0 .125h.049l-.038.705-.071.006a.067.067 0 0 0-.061.073l.004.053a.067.067 0 0 0 .073.061l.045-.004c-.016.321-.03.602-.03.637 0 .084.573.051.573.051l-.037-.732.038-.003a.067.067 0 0 0 .061-.073l-.004-.053a.067.067 0 0 0-.073-.061l-.031.002-.031-.662h.073a.063.063 0 0 0 0-.125h-.078a6.476 6.476 0 0 1-.006-.198v-.527z"
          fill="#fff"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.94 6.875h.201v.269H9.94v-.269zm-.061.938h.336v.625H9.88v-.626z"
          fill="#000"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.426 5.962s.377-.333.188-.333a.868.868 0 0 1-.129-.015c-.2-.032-.46-.074-.46.348v.725h-.055a.062.062 0 1 0 0 .125h.049l-.038.705-.072.006a.067.067 0 0 0-.06.073l.004.053a.067.067 0 0 0 .073.061l.045-.004c-.017.321-.03.602-.03.637 0 .084.573.051.573.051l-.037-.732.038-.003a.067.067 0 0 0 .061-.073l-.005-.053a.067.067 0 0 0-.072-.061l-.032.002c-.011-.235-.023-.475-.03-.662h.073a.063.063 0 0 0 0-.125h-.079a6.476 6.476 0 0 1-.005-.198v-.527z"
          fill="#fff"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.15 6.875h.2v.269h-.2v-.269zm-.061.938h.336v.625h-.336v-.626z"
          fill="#000"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.573 4H8.367v.479l-.022.001S6.775 5.7 7.211 7.53c.436 1.827 2.167 3.183 2.167 3.183l.087-.315s-1.65-2.244-1.65-3.14c0-.896.312-1.738.641-1.868.199-.08.233-.063.287-.038.036.017.08.038.187.038.267 0 .535-.192.535-.192s.187.192.36.192c.172 0 .175-.192.175-.192v-.636h.02v.636s.002.192.175.192.359-.192.359-.192.268.192.535.192a.37.37 0 0 0 .187-.038c.055-.025.089-.041.287.038.33.13.64.972.64 1.868 0 .896-1.65 3.14-1.65 3.14l.088.315s1.732-1.356 2.167-3.184c.436-1.828-1.134-3.049-1.134-3.049l-.101-.009V4z"
          fill="#E8AA00"
        />
        <path
          d="M8.367 4v-.313h-.313V4h.313zm3.206 0h.312v-.313h-.312V4zm-3.206.479.028.31.284-.025V4.48h-.312zm-.022.001-.027-.31-.092.007-.072.057.191.246zM7.211 7.53l.304-.073-.304.072zm2.167 3.183-.193.246.37.29.124-.453-.301-.083zm.087-.315.301.083.04-.146-.089-.123-.252.186zM8.456 5.39l.116.29-.116-.29zm.287-.038.132-.283-.132.283zm.722-.154.224-.218-.187-.193-.219.157.182.254zm.535 0 .312.004v-.004H10zm0-.636V4.25h-.313v.313H10zm.02 0h.312V4.25h-.313v.313zm0 .636h-.313v.004l.312-.004zm.534 0 .182-.254-.219-.157-.187.193.224.218zm.722.154-.132-.283.132.283zm.287.038-.115.29.115-.29zm-1.01 5.008-.25-.185-.09.122.04.146.3-.083zm.088.315-.301.084.125.451.369-.289-.193-.246zm2.167-3.184.304.073-.304-.073zM11.674 4.48l.192-.246-.073-.057-.091-.008-.028.311zm-.101-.009h-.313v.286l.285.026.028-.312zm-3.206-.159h3.206v-.625H8.367v.626zm.312.167V4h-.625v.479h.625zm-.306.313.022-.002-.056-.623-.021.002.055.623zm-.858 2.665c-.193-.807.054-1.483.364-1.97a3.474 3.474 0 0 1 .648-.751l.01-.008v-.001l-.192-.247-.192-.246-.002.002-.005.004a1.475 1.475 0 0 0-.073.062 4.1 4.1 0 0 0-.722.85c-.368.58-.688 1.428-.444 2.45l.608-.145zm1.863 3.256.193-.246-.003-.002-.013-.01a5.953 5.953 0 0 1-.243-.212 7.677 7.677 0 0 1-.617-.64c-.472-.55-.979-1.301-1.18-2.146l-.608.145c.234.983.811 1.823 1.314 2.408a8.29 8.29 0 0 0 .94.93l.017.014.005.003.001.002h.001l.193-.246zm-.214-.399-.087.316.602.166.087-.315-.602-.167zM7.503 7.258c0 .298.13.66.286 1 .162.352.376.728.585 1.07a20.018 20.018 0 0 0 .82 1.228l.014.02.004.005.001.001.252-.184.252-.185v-.002c-.002 0-.003-.002-.004-.004l-.013-.018a12.722 12.722 0 0 1-.235-.333A19.373 19.373 0 0 1 8.907 9a10.009 10.009 0 0 1-.55-1.005c-.153-.333-.229-.587-.229-.738h-.625zM8.341 5.1a.876.876 0 0 0-.382.336c-.095.14-.176.312-.242.498a4.107 4.107 0 0 0-.214 1.325h.625c0-.415.072-.814.18-1.118a1.57 1.57 0 0 1 .168-.354c.06-.089.098-.107.096-.106L8.34 5.1zm.534-.03c-.037-.017-.12-.057-.242-.049a.998.998 0 0 0-.292.08l.23.58a1.04 1.04 0 0 1 .092-.033l.012-.003a.148.148 0 0 1-.055-.006.152.152 0 0 1-.017-.006l.008.003.264-.566zm.055.008a.314.314 0 0 1-.044-.003h.001l-.012-.005-.264.566c.02.01.063.03.122.045a.797.797 0 0 0 .197.022v-.625zm.535.121a65.861 65.861 0 0 1-.181-.254.013.013 0 0 1 0-.001.409.409 0 0 1-.028.019 1.016 1.016 0 0 1-.093.05.587.587 0 0 1-.233.065v.625c.201 0 .384-.07.502-.126a1.643 1.643 0 0 0 .212-.122l.002-.001-.18-.255zm.36-.12c.012 0 .011.002-.006-.005a.62.62 0 0 1-.128-.091l-.003-.003h.001v.001l-.224.218-.224.218h.001l.001.002a.842.842 0 0 0 .046.043c.027.024.065.056.111.089.08.055.237.152.424.152v-.625zm.175.12-.313-.004v-.002a.102.102 0 0 1 .001-.014s.001-.006.006-.016a.146.146 0 0 1 .046-.055.15.15 0 0 1 .084-.03v.625a.477.477 0 0 0 .481-.424.568.568 0 0 0 .007-.064v-.011L10 5.197zm-.313-.636v.636h.625v-.636h-.625zm.332-.312H10v.625h.02V4.25zm-.312.313v.635h.625v-.636h-.625zm.312.635-.312.004v.002a1.016 1.016 0 0 1 .001.026.578.578 0 0 0 .05.195.477.477 0 0 0 .436.277v-.625a.15.15 0 0 1 .085.03.158.158 0 0 1 .047.055l.005.016v.015l-.312.005zm.176.504a.762.762 0 0 0 .424-.152 1.25 1.25 0 0 0 .144-.119l.01-.01.003-.003.001-.001v-.001l-.223-.218-.224-.218.001-.001-.002.002a.563.563 0 0 1-.129.092c-.017.007-.018.004-.005.004v.625zm.359-.504-.182.254.001.001.002.001.004.003a1.297 1.297 0 0 0 .208.119c.118.056.301.126.502.126v-.625a.586.586 0 0 1-.233-.065 1.023 1.023 0 0 1-.117-.066l-.004-.003-.181.255zm.535.504a.797.797 0 0 0 .197-.022c.06-.015.102-.035.123-.045l-.265-.566a.216.216 0 0 1-.012.005h.001l-.01.002a.313.313 0 0 1-.034.001v.625zm.32-.067.007-.003a.182.182 0 0 1-.071.012c-.01 0-.008-.002.01.003.02.006.048.016.093.033l.23-.58a.998.998 0 0 0-.292-.08c-.122-.008-.204.032-.242.049l.265.566zm.039.045c-.002 0 .035.017.095.106.057.083.116.202.169.354.107.304.18.703.18 1.118h.624a4.12 4.12 0 0 0-.214-1.325 2.185 2.185 0 0 0-.241-.498.876.876 0 0 0-.383-.336l-.23.581zm.443 1.578c0 .15-.076.405-.229.738-.147.32-.347.673-.55 1.005a19.333 19.333 0 0 1-.741 1.117l-.051.07-.014.019-.003.004v.001l.25.186.253.185.001-.002.004-.005.014-.02a11.583 11.583 0 0 0 .244-.345c.157-.228.366-.541.576-.884.21-.341.423-.717.585-1.07.156-.34.286-.701.286-.999h-.625zm-1.638 3.223.087.316.602-.167-.087-.316-.602.167zm.388.232.193.246.002-.002.005-.003.017-.014a4.707 4.707 0 0 0 .272-.237c.176-.162.415-.398.668-.693.503-.585 1.08-1.425 1.314-2.408l-.607-.145c-.202.845-.709 1.596-1.18 2.146a7.666 7.666 0 0 1-.861.852l-.013.01-.002.002.192.246zm2.471-3.111c.244-1.022-.076-1.87-.444-2.45a4.096 4.096 0 0 0-.778-.899l-.017-.013a.577.577 0 0 1-.005-.004l-.001-.001h-.001v-.001l-.192.246-.192.247.001.001a1.022 1.022 0 0 1 .051.043 3.473 3.473 0 0 1 .606.715c.31.488.557 1.164.364 1.97l.608.146zm-1.41-3.433-.102-.01-.055.623.1.009.057-.623zM11.26 4v.471h.625V4h-.625z"
          fill="#FFD018"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.19 8.616s.196-.528.54-.352c.344.176.314.788.626.57.313-.218.136-.57.6-.57.463 0 .394.57.672.57s.302-.57.613-.57c.31 0 .626.352.626.352l-1.839 2.501L8.19 8.616z"
          fill="#8FC753"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m4.956 11.536-.198-.267s.82 0 .931.193c.031.055.045.096.056.128.026.08.031.096.254.096.31 0 0-.307-.13-.417-.128-.11-.05-.3.13-.3a3.2 3.2 0 0 0 .337-.036c.236-.03.542-.071.823-.071.456 0 .078.407.078.407s.59 0 .444-.17c-.147-.169.492-.375.768-.375.258 0 1.417.058 1.573.066a75.94 75.94 0 0 1 1.631-.066c.277 0 .916.206.769.376-.147.17.444.17.444.17s-.378-.408.078-.408c.28 0 .587.04.823.071.148.02.268.036.337.036.18 0 .258.19.129.3-.129.11-.439.417-.129.417.222 0 .228-.016.254-.096a.622.622 0 0 1 .056-.128c.107-.186.874-.192.928-.193a.159.159 0 0 1-.02-.076c0-.086.068-.156.152-.156.083 0 .151.07.151.156a.154.154 0 0 1-.151.156.15.15 0 0 1-.13-.077l-.197.264.204.253a.15.15 0 0 1 .123-.065c.083 0 .151.07.151.156a.154.154 0 0 1-.151.157.154.154 0 0 1-.151-.157c0-.018.002-.035.008-.05-.116-.057-.316-.144-.445-.144h-.361c.09 0 .59.33.44.473l-.027.024c-.148.141-.342.325-.524.225a1.15 1.15 0 0 1-.31-.249l-.152-.473s-.893-.23-.893-.07c0 .159-.002.237-.32.237-.176 0-.348-.03-.498-.056a1.957 1.957 0 0 0-.311-.04c-.124 0-.315.038-.456.066a1.41 1.41 0 0 1-.174.03c-.068 0-.43-.016-.181-.167.248-.15.305-.307.305-.307s-.992.147-1.385.156h-.036c-.389-.009-1.324-.156-1.324-.156s.057.157.305.307-.114.167-.181.167a1.41 1.41 0 0 1-.174-.03 2.788 2.788 0 0 0-.456-.066c-.086 0-.192.019-.31.04-.152.026-.323.056-.5.056-.317 0-.32-.078-.32-.238 0-.16-.893.071-.893.071L6 12.16s-.116.143-.31.25c-.183.1-.376-.085-.525-.226l-.025-.024c-.152-.143.348-.473.439-.473h-.361c-.192 0-.536.19-.536.19l.275-.34zm-.43-.187c.084 0 .151-.07.151-.156a.154.154 0 0 0-.15-.156.154.154 0 0 0-.152.156c0 .086.068.156.151.156zm0 .688c.084 0 .151-.07.151-.157a.154.154 0 0 0-.15-.156.154.154 0 0 0-.152.156c0 .087.068.157.151.157z"
          fill="#fff"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9.934 1.268h.125v.134h.154v.125h-.154v.228c.172.03.304.184.304.37A.37.37 0 0 1 10 2.5a.37.37 0 0 1-.363-.375c0-.184.128-.337.297-.369v-.229h-.141v-.125h.141v-.134z"
          fill="#FFD018"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8.592 3.266c-.175 0-.544.187-.544.187l.287.637 1.73-.065 1.73.065.287-.637s-.369-.187-.543-.187c-.077 0-.087-.045-.098-.096-.014-.065-.03-.138-.19-.138a1.04 1.04 0 0 0-.258.034c-.099.023-.162.038-.253-.034a8.982 8.982 0 0 1-.012-.01c-.147-.116-.3-.237-.549-.237-.05 0-.086.047-.114.122-.027-.075-.064-.122-.114-.122-.248 0-.401.121-.55.238a9.002 9.002 0 0 1-.01.009c-.092.072-.155.057-.254.034-.064-.015-.144-.034-.258-.034-.16 0-.176.073-.19.138-.01.051-.02.096-.097.096z"
          fill="#E31D1C"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="m9.755 2.23-.121.042c-.321.112-.6.149-.834.112-.484-.074-1.114.177-1.035.546a5.2 5.2 0 0 0 .24.724c.146.359.249.54.368.54l.232.011.017.001c.176.01.33.014.48.013.43-.002.697-.044.792-.173l.028-.038-.013-.046c-.113-.389-.165-.923-.156-1.6l.002-.132zm-1.813.66c-.039-.182.455-.378.831-.32.235.036.5.009.798-.08-.002.6.047 1.09.148 1.466-.086.045-.313.074-.619.076a8.46 8.46 0 0 1-.47-.013c.002 0-.177-.01-.239-.012a.596.596 0 0 1-.066-.098 5.14 5.14 0 0 1-.383-1.02zm2.342-.66.122.042c.32.112.599.149.833.112.484-.074 1.114.177 1.035.546a5.306 5.306 0 0 1-.24.724c-.146.359-.248.54-.368.54l-.232.011-.017.001c-.175.01-.33.014-.48.013-.43-.002-.697-.044-.792-.173l-.028-.038.013-.046c.113-.389.166-.923.156-1.6l-.002-.132zm1.813.66c.04-.182-.454-.378-.83-.32a1.828 1.828 0 0 1-.798-.08c.001.6-.048 1.09-.148 1.466.086.045.312.074.618.076.145 0 .297-.004.47-.013-.002 0 .177-.01.239-.012a.595.595 0 0 0 .066-.098 5.13 5.13 0 0 0 .383-1.02z"
          fill="#FFD018"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M11.947 4.044a.81.81 0 0 1 .064-.213c.06-.16.1-.21.188-.263.045-.027.062-.05.083-.13a1.152 1.152 0 0 1 .073-.208l.02-.043a.279.279 0 0 0 .018-.113c0-.056-.014-.1-.053-.182a1.09 1.09 0 0 1-.034-.076.303.303 0 0 1-.025-.114v-.24c0-.141-.006-.15-.075-.14a.45.45 0 0 0-.02.003l-.042.008a.078.078 0 0 1-.044-.006c-.024-.011-.043-.033-.086-.098-.02-.03-.043-.028-.121.01a1.187 1.187 0 0 1-.025.012c-.08.037-.136.038-.183-.02-.073-.089-.121-.083-.21.003-.043.042-.065.058-.093.062h-.002c-.03.005-.031.005-.114-.045-.005.011-.018.016-.038.02a.278.278 0 0 1-.092.005c-.022-.004-.038-.01-.048-.032a4.167 4.167 0 0 0-.124-.002V2.18c.061 0 .112 0 .153.002l.012-.01c.023-.02.058-.05.075-.046.002 0 .008.007.018.015.014.012.033.03.052.042l.002.001c.082.05.086.052.098.05.01-.001.026-.012.06-.046.111-.107.198-.118.297.003.025.03.054.03.112.003l.024-.011c.105-.051.151-.058.197.01.036.054.05.072.06.077h.003c.002.002.005.001.032-.004l.016-.003a.557.557 0 0 1 .023-.003c.115-.016.143.028.143.202v.24a.25.25 0 0 0 .02.09c.008.02.011.025.033.072.043.09.06.142.06.21a.343.343 0 0 1-.024.137l-.021.047-.019.043a1.1 1.1 0 0 0-.05.152c-.025.097-.052.134-.11.17-.076.046-.108.083-.163.23a1.753 1.753 0 0 0-.059.181c.009.007.008.012.005.026l-.004.007-.001.002-.008.008a.049.049 0 0 1-.005.004l.003-.002a.348.348 0 0 0-.015.019c-.059.077-.133.077-.205.002l.043-.044c.047.05.08.05.115.003l.011-.015zm-3.924 0a.803.803 0 0 0-.064-.213c-.06-.16-.1-.21-.188-.263-.045-.027-.062-.05-.083-.13a1.162 1.162 0 0 0-.053-.162l-.02-.046-.02-.043a.279.279 0 0 1-.018-.113c0-.056.014-.1.053-.182.023-.049.026-.055.034-.076a.302.302 0 0 0 .025-.114v-.24c0-.141.006-.15.075-.14.007 0 .013.002.02.003l.042.008a.09.09 0 0 0 .044-.006c.024-.011.043-.033.086-.098.02-.03.043-.028.121.01l.025.012c.08.037.136.038.183-.02.073-.089.12-.083.21.003.043.042.065.058.093.062h.002c.03.005.031.005.114-.045.005.011.018.016.038.02a.279.279 0 0 0 .092.005c.022-.004.038-.01.048-.032l.124-.002V2.18c-.061 0-.112 0-.153.002l-.012-.01c-.023-.02-.058-.05-.075-.046-.002 0-.009.007-.018.015a.429.429 0 0 1-.054.043c-.083.05-.086.052-.098.05-.01-.001-.026-.012-.06-.046-.111-.107-.198-.118-.297.003-.025.03-.054.03-.113.003a1.084 1.084 0 0 1-.023-.011c-.105-.051-.151-.058-.197.01-.036.054-.05.072-.06.077h-.003c-.002.002-.005.001-.032-.004l-.016-.003a.537.537 0 0 0-.023-.003c-.115-.016-.143.028-.143.202v.24a.241.241 0 0 1-.02.09c-.008.02-.011.025-.033.072a.453.453 0 0 0-.06.21c0 .057.007.095.024.137l.02.047.02.043a1.1 1.1 0 0 1 .05.152c.025.097.052.134.11.17.076.046.108.083.163.23a1.74 1.74 0 0 1 .059.181c-.009.007-.008.012-.005.026a.057.057 0 0 0 .004.007l.001.002c.003.005.003.005.008.008a.043.043 0 0 0 .005.004l-.003-.002.015.019c.059.077.133.077.205.002l-.043-.044c-.047.05-.08.05-.115.003l-.011-.015zm.726-1.835z"
          fill="#5E5E5E"
        />
        <path
          d="m8.609 11.178.038-.31c.671.082 1.12.123 1.346.123.34.016.747-.009 1.217-.074l.043.31a7.105 7.105 0 0 1-1.267.077c-.236 0-.693-.042-1.377-.126z"
          fill="#272727"
        />
      </g>
    </g>
  </svg>
);
export default FlagSm;
