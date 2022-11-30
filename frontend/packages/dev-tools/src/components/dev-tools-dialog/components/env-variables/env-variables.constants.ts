import { getCustomEnvVariable } from '../../../../utils/custom-env-variable';

const defaultValues = {
  apiBaseUrl: getCustomEnvVariable(
    'NEXT_PUBLIC_API_BASE_URL',
    process.env.NEXT_PUBLIC_API_BASE_URL,
  ),
};

export default defaultValues;
