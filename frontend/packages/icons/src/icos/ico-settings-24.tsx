import { useTheme } from 'styled-components';
import type { IconProps } from '../types';
const IcoSettings24 = ({ 'aria-label': ariaLabel, color = 'primary', className, testID }: IconProps) => {
  const theme = useTheme();
  return (
    <svg
      width={24}
      height={24}
      fill={theme.color[color]}
      xmlns="http://www.w3.org/2000/svg"
      data-testid={testID}
      aria-label={ariaLabel}
      className={className}
      role="img"
      data-colored={false}
    >
      <path
        d="M11.22 3.614c-.478.156-.679.357-1.311 1.306-.285.429-.53.793-.544.808-.014.015-.412-.062-.885-.172-1.029-.24-1.266-.245-1.709-.037-.384.179-1.075.872-1.256 1.259-.204.435-.201.674.022 1.628.101.433.183.829.182.88-.001.077-.132.18-.73.574-.877.577-1.137.81-1.291 1.152-.231.512-.231 1.464 0 1.976.154.342.414.575 1.291 1.152.598.394.729.497.73.574.001.051-.081.447-.182.88-.223.954-.226 1.193-.022 1.628.182.388.872 1.08 1.257 1.26.443.207.711.202 1.708-.034.451-.107.838-.188.86-.18.022.008.256.343.52.743.578.877.81 1.137 1.152 1.291.512.231 1.464.231 1.976 0 .342-.154.574-.414 1.152-1.291.264-.4.498-.735.52-.743.022-.008.409.073.86.18.709.168.862.192 1.13.177.487-.027.747-.169 1.276-.699.769-.768.838-1.088.522-2.413-.092-.389-.168-.749-.167-.8.001-.076.133-.18.73-.573.877-.577 1.137-.81 1.291-1.152.231-.512.231-1.464 0-1.976-.154-.342-.414-.575-1.291-1.152-.597-.393-.729-.497-.73-.573-.001-.051.075-.411.167-.8.224-.941.232-1.297.04-1.705-.18-.382-.864-1.07-1.252-1.259-.438-.213-.678-.208-1.716.033-.473.11-.871.187-.885.172a42.152 42.152 0 0 1-.544-.808c-.558-.837-.765-1.065-1.124-1.234-.215-.1-.264-.106-.907-.115-.473-.006-.729.007-.84.043m1.625 2.156c.653.981.77 1.113 1.137 1.295.462.228.683.228 1.678-.001.44-.101.836-.184.879-.184.105 0 .581.474.581.579 0 .044-.083.441-.184.881-.229.995-.229 1.216-.001 1.678.182.367.314.484 1.296 1.138l.732.487-.012.369-.011.368-.828.56c-.456.308-.876.605-.933.659-.057.055-.168.23-.247.39-.225.454-.224.68.004 1.671.101.44.184.838.184.883 0 .051-.107.187-.272.346l-.271.262-.839-.197c-.729-.172-.878-.196-1.148-.18a1.64 1.64 0 0 0-.963.386c-.083.072-.402.507-.711.967l-.56.836-.368-.012-.368-.011-.56-.828a17.301 17.301 0 0 0-.659-.933 1.833 1.833 0 0 0-.385-.245 1.27 1.27 0 0 0-.601-.159c-.276-.017-.418.005-1.153.179l-.839.197-.271-.262c-.165-.159-.272-.295-.272-.346 0-.045.083-.443.184-.883.228-.991.229-1.217.004-1.671a1.847 1.847 0 0 0-.247-.39 17.301 17.301 0 0 0-.933-.659l-.828-.56v-.76l.828-.56c.456-.308.876-.605.933-.659.057-.055.168-.23.247-.39.225-.454.224-.68-.004-1.671-.101-.44-.184-.836-.184-.879 0-.105.474-.581.579-.581.044 0 .441.083.881.184.666.153.848.181 1.084.167.314-.02.692-.171.926-.368.072-.061.367-.464.656-.897.289-.432.553-.817.586-.856.049-.057.127-.07.414-.07h.353l.486.73m-1.374 3.229a3.122 3.122 0 0 0-2.285 1.841 3.087 3.087 0 0 0 .249 2.8c.181.281.641.742.925.926.804.521 1.863.617 2.786.251.377-.15.664-.344.996-.675.331-.332.525-.619.675-.996.669-1.686-.214-3.519-1.957-4.065-.314-.098-1.062-.142-1.389-.082m1.178 1.609c.293.137.606.449.743.743.096.203.108.277.108.649s-.012.446-.108.649c-.447.956-1.727 1.18-2.474.433-.292-.292-.413-.576-.431-1.01-.029-.696.307-1.231.942-1.497.199-.083.284-.095.611-.086.314.01.42.03.609.119"
        fillRule="evenodd"
        fill={theme.color[color]}
      />
    </svg>
  );
};
export default IcoSettings24;
