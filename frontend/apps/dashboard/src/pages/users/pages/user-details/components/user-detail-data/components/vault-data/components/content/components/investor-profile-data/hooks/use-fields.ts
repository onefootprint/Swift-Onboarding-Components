// TODO: https://linear.app/footprint/issue/FP-3139/dashboard-broker-use-real-fields

const useRows = () => {
  const left = [
    {
      title: "What's your employment status and occupation?",
      fields: [
        {
          canAccess: false,
          canSelect: false,
          hasDataInVault: false,
          hasPermission: false,
          isFilled: false,
          label: 'Employment status',
          name: 'employmentStatus',
          showCheckbox: false,
          value: null,
        },
        {
          canAccess: false,
          canSelect: false,
          hasDataInVault: false,
          hasPermission: false,
          isFilled: false,
          label: 'Occupation',
          name: 'employmentStatus',
          showCheckbox: false,
          value: null,
        },
      ],
    },
    {
      title: 'Are you employed by a brokerage firm?',
      fields: [
        {
          canAccess: false,
          canSelect: false,
          hasDataInVault: false,
          hasPermission: false,
          isFilled: false,
          label: 'Employed by brokerage firm?',
          name: 'employmentStatus',
          showCheckbox: false,
          value: null,
        },
      ],
    },
    {
      title: "What's your annual income?",
      fields: [
        {
          canAccess: false,
          canSelect: false,
          hasDataInVault: false,
          hasPermission: false,
          isFilled: false,
          label: 'Annual income',
          name: 'employmentStatus',
          showCheckbox: false,
          value: null,
        },
      ],
    },
    {
      title: "What's your net worth?",
      fields: [
        {
          canAccess: false,
          canSelect: false,
          hasDataInVault: false,
          hasPermission: false,
          isFilled: false,
          label: 'Net worth',
          name: 'employmentStatus',
          showCheckbox: false,
          value: null,
        },
      ],
    },
  ];
  const right = [
    {
      title: 'What are your investment goals?',
      fields: [
        {
          canAccess: false,
          canSelect: false,
          hasDataInVault: false,
          hasPermission: false,
          isFilled: false,
          label: 'Investment goals',
          name: 'employmentStatus',
          showCheckbox: false,
          value: null,
        },
      ],
    },
    {
      title: 'How would you describe your risk tolerance?',
      fields: [
        {
          canAccess: false,
          canSelect: false,
          hasDataInVault: false,
          hasPermission: false,
          isFilled: false,
          label: 'Risk tolerance',
          name: 'employmentStatus',
          showCheckbox: false,
          value: null,
        },
      ],
    },
    {
      title:
        'Do any of the following apply to you or a member of your immediate family?',
      fields: [
        {
          canAccess: false,
          canSelect: false,
          hasDataInVault: false,
          hasPermission: false,
          isFilled: false,
          label: 'Declaration(s)',
          name: 'employmentStatus',
          showCheckbox: false,
          value: null,
        },
        {
          canAccess: false,
          canSelect: false,
          hasDataInVault: false,
          hasPermission: false,
          isFilled: false,
          label: 'Compliance letter',
          name: 'employmentStatus',
          showCheckbox: false,
          value: null,
        },
      ],
    },
  ];

  return [left, right];
};

export default useRows;
