import { getOrgPlaybooksByPlaybookIdVersionsOptions } from '@onefootprint/axios/dashboard';
import { getErrorMessage } from '@onefootprint/request';
import { useQuery } from '@tanstack/react-query';
import Content from './components/content';
import ErrorComponent from './components/error';
import Loading from './components/loading';
import usePlaybookId from './hooks/use-playbook-id';

const PlaybookDetails = () => {
  const id = usePlaybookId();
  const { data, isPending, error } = useQuery({
    ...getOrgPlaybooksByPlaybookIdVersionsOptions({ path: { playbookId: id } }),
    enabled: !!id,
  });
  const playbooks = data?.data ?? [];
  const [playbook] = playbooks;

  return (
    <>
      {playbooks.length > 0 && <Content playbook={playbook} />}
      {isPending && <Loading />}
      {error && <ErrorComponent message={getErrorMessage(error)} />}
    </>
  );
};

export default PlaybookDetails;
