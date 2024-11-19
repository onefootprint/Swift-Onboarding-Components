import Content from './components/content';
import ErrorComponent from './components/error';
import Loading from './components/loading';
import usePlaybook from './hooks/use-playbook';

const PlaybookDetails = () => {
  const { data, isPending, errorMessage } = usePlaybook();

  return (
    <>
      {data && <Content playbook={data} />}
      {isPending && <Loading />}
      {errorMessage && <ErrorComponent message={errorMessage} />}
    </>
  );
};

export default PlaybookDetails;
