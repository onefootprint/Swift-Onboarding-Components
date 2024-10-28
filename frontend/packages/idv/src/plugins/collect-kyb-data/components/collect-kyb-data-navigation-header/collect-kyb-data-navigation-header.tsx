import NavigationHeader from '../../../../components/layout/components/navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';

const CollectKybDataNavigationHeader = () => {
  const [state, send] = useCollectKybDataMachine();
  const { dataCollectionScreensToShow } = state.context;
  const currentPageIdx = dataCollectionScreensToShow.indexOf(state.value);
  const shouldShowCloseButton = currentPageIdx === 0;

  const handleBackButtonClick = () => {
    send('navigatedToPrevPage');
  };

  return (
    <NavigationHeader
      leftButton={{
        confirmClose: shouldShowCloseButton,
        onBack: shouldShowCloseButton ? undefined : handleBackButtonClick,
        variant: shouldShowCloseButton ? 'close' : 'back',
      }}
    />
  );
};

export default CollectKybDataNavigationHeader;
