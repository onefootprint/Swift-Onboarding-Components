import { QueryClientProvider } from '@tanstack/react-query';
import type React from 'react';
import queryClient from '../config/initializers/react-query';
import '../config/initializers/request';

const Providers = ({ children }: React.PropsWithChildren) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default Providers;
