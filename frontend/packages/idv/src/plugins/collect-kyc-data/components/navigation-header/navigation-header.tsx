import { NavigationHeader as FootprintNavigationHeader } from '../../../../components';
import useCollectKycDataMachine from '../../hooks/use-collect-kyc-data-machine';

const NavigationHeader = () => {
  const [state, send] = useCollectKycDataMachine();
  const { dataCollectionScreensToShow } = state.context;
  const currentPageIdx = dataCollectionScreensToShow.indexOf(state.value);
  const shouldShowCloseButton = currentPageIdx === 0;

  const handleBackButtonClick = () => {
    send('navigatedToPrevPage');
  };

  return (
    <FootprintNavigationHeader
      leftButton={{
        confirmClose: shouldShowCloseButton,
        onBack: shouldShowCloseButton ? undefined : handleBackButtonClick,
        variant: shouldShowCloseButton ? 'close' : 'back',
      }}
    />
  );
};

export default NavigationHeader;
