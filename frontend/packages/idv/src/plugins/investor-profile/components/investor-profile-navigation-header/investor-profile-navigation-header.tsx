import NavigationHeader from '../../../../components/layout/components/navigation-header';
import useInvestorProfileMachine from '../../hooks/use-investor-profile-machine';

const InvestorProfileNavigationHeader = () => {
  const [state, send] = useInvestorProfileMachine();
  const shouldShowCloseButton = state.matches('employment');

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

export default InvestorProfileNavigationHeader;
