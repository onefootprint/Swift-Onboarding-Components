import { useStore } from 'src/hooks/use-session';

const originalState = useStore.getState();

beforeEach(() => {
  useStore.setState({
    data: {
      auth: '1',
      user: {
        id: 'orguser_0WFrWMZwP0C65s21w9lBBy',
        email: 'jane.doe@acme.com',
        firstName: 'Jane',
        lastName: 'Doe',
      },
      org: {
        isLive: false,
        logoUrl: null,
        name: 'Acme',
        isSandboxRestricted: true,
      },
    },
  });
});

afterAll(() => {
  useStore.setState(originalState);
});

const memberFixture = {
  id: 'orguser_k0xUYuO2fFCwMHFPShuK77',
  email: 'jane.doe@acme.com',
  firstName: 'Jane',
  lastName: 'Doe',
  lastLoginAt: '3 hours ago',
  createdAt: '2022-09-20T09:26:24.292959Z',
  roleName: 'Admin',
  roleId: 'orgrole_aExxX6XgSBpvqIJ2VcHH6J',
};

export default memberFixture;
