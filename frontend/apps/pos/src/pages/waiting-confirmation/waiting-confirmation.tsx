import Header from '../../components/header';
import Layout from '../../components/layout';
import LoadingSpinner from '../../components/ui/loading-spinner';
import logo from '../../images/avis.png';

type WaitingConfirmationProps = {
  onCancel: () => void;
};

const WaitingConfirmation = ({ onCancel }: WaitingConfirmationProps) => {
  return (
    <Layout onClose={onCancel}>
      <img src={logo} alt="Avis Logo" className="mx-auto mb-6" width={92} height={30} />
      <Header
        title="Waiting for customer..."
        subtitle="Text message sent to customer's phone number. Ask them to continue from their phone."
      />
      <LoadingSpinner className="mx-auto mb-4" />
    </Layout>
  );
};

export default WaitingConfirmation;
