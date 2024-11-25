import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useSession from 'src/hooks/use-session';

type PrivateGateProps = {
  children: React.ReactNode;
  redirectTo?: string;
  firmEmployeesOnly?: boolean;
};

const PrivateGate = ({ children, redirectTo = '/404', firmEmployeesOnly = false }: PrivateGateProps) => {
  const {
    isLoggedIn,
    data: { user },
  } = useSession();
  const router = useRouter();
  const isFirmEmployee = user?.isFirmEmployee;
  const shouldRedirect = !isLoggedIn || (firmEmployeesOnly && !isFirmEmployee);

  useEffect(() => {
    if (shouldRedirect) {
      router.push(redirectTo);
    }
  }, [shouldRedirect, redirectTo]);

  return isLoggedIn ? <>{children}</> : null;
};

export default PrivateGate;
