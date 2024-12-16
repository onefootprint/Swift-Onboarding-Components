import Header from '../../components/header';
import Layout from '../../components/layout';
import logo from '../../images/avis.png';

const WaitingConfirmation = () => {
  return (
    <Layout>
      <Header
        title="Let's verify your customer's identity!"
        subtitle="Enter their email and phone number to begin the identity verification process."
      >
        <img src={logo} alt="Avis Logo" className="mx-auto mb-6" width={92} height={30} />
      </Header>
    </Layout>
  );
};

export default WaitingConfirmation;
