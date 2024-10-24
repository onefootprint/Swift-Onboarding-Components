import NavigationHeader from '../../../../components/layout/components/navigation-header';
import useCollectKybDataMachine from '../../hooks/use-collect-kyb-data-machine';

const CollectKybDataNavigationHeader = () => {
  const [state, send] = useCollectKybDataMachine();
  const shouldShowCloseButton = state.matches('introduction') || state.matches('manageBos');

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
