import { getErrorMessage } from '@onefootprint/request';
import Link from 'next/link';
import { Trans } from 'react-i18next';

type ErrorProps = {
  error: unknown;
};

const ErrorComponent = ({ error }: ErrorProps) => (
  <p className="text-body-2 text-secondary text-decoration-none">
    {`${getErrorMessage(error)}. `}
    <Trans
      ns="home"
      i18nKey="error"
      components={{
        refresh: (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <Link onClick={() => window.location.reload()} href="" className="no-underline text-accent" />
        ),
      }}
    />
  </p>
);

export default ErrorComponent;
