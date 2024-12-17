export const SHOULD_USE_DEV =
  process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development';

const DEV_OB_CONFIG_KEY = 'pb_test_Ly508VDujEz1kQPrkwSyHu';
const PROD_OB_CONFIG_KEY = 'pb_test_uStuJNEaq6dS16QYu3CDOK';

export const OB_CONFIG_KEY = SHOULD_USE_DEV ? DEV_OB_CONFIG_KEY : PROD_OB_CONFIG_KEY;
