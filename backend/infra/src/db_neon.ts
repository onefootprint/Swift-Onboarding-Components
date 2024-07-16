import axios from 'axios';
import { DatabaseOutput } from './db';
import { StackMetadata } from './stack_metadata';
import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import axiosRetry from 'axios-retry';

type NeonSecrets = {
  dbUser: string;
  dbPassword: string;
  apiKey: string;
};

export function NeonDBOutput(
  stackMeta: StackMetadata,
  neonDatabaseProjectId: string,
): DatabaseOutput {
  let config = new pulumi.Config();
  let neonSecrets = config.getSecretObject<NeonSecrets>('neon');

  if (!neonSecrets) {
    throw 'Missing Neon API key from secrets config';
  }

  const neonDb = new NeonEphemeralBranchResource(
    `neon-db-fpc-branch-${stackMeta.shortStackName}`,
    {
      branchName: stackMeta.shortStackName,
      apiKey: neonSecrets.apiKey,
      projectId: neonDatabaseProjectId,
    },
  );

  const dbSecretName = `/db/url-${stackMeta.shortStackName}`;
  const databaseUrlSecretParam = new aws.ssm.Parameter(
    `ssm-neon-db-url-${stackMeta.shortStackName}`,
    {
      type: 'SecureString',
      value: neonDb.databaseUrl,
      name: dbSecretName,
      overwrite: true,
    },
    {
      parent: neonDb,
    },
  );

  return {
    databaseUrl: pulumi.secret(neonDb.databaseUrl),
    readOnlyDatabaseUrl: pulumi.secret(neonDb.databaseUrl),
    databaseUrlSecretParam,
    databaseUrlRoSecretParam: databaseUrlSecretParam,
    db: undefined,
    instances: [],
  };
}

interface NeonDbBranchInputs {
  branchName: string;
  projectId: string;
  apiKey: string;
}

interface CreateNeonDbBranchInputs {
  branchName: string;
  projectId: string;
  apiKey: pulumi.Input<string>;
}

type CreateBranchResult = {
  branch: Branch;
  endpoints: Endpoint[];
};

type Branch = {
  id: string;
  name: string;
};
type Endpoint = {
  id: string;
  host: string;
  branch_id: string;
};

type RoleResult = {
  name: string;
  password: string;
};

type GetBranchesResult = {
  branches: [Branch];
};

type GetEndpointResults = {
  endpoints: [Endpoint];
};

type RoleResetResult = {
  role: RoleResult;
};

/**
 *  Creates a NeonDB Branch
 */
const neonBranchProvider: pulumi.dynamic.ResourceProvider = {
  async create(
    inputs: NeonDbBranchInputs,
  ): Promise<pulumi.dynamic.CreateResult> {
    const auth = `Bearer ${inputs.apiKey}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: auth,
    };

    axiosRetry(axios, {
      retryCondition: err => {
        // NEON is annoying here: https://community.neon.tech/t/project-already-has-running-operations-scheduling-of-new-ones-is-prohibited/242
        console.log('did retry');
        if (err.response?.status === 423) {
          return true;
        } else {
          return false;
        }
      },
      retryDelay: count => {
        return count * 10000;
      },

      retries: 60,
    });

    try {
      let branchResult = await axios.post<CreateBranchResult>(
        `https://console.neon.tech/api/v2/projects/${inputs.projectId}/branches`,
        {
          endpoints: [
            {
              type: 'read_write',
            },
          ],
          branch: {
            name: inputs.branchName,
          },
        },
        {
          headers,
          validateStatus: function (status) {
            // status OK or already exists
            return (status >= 200 && status < 300) || status === 409;
          },
        },
      );

      let id: string, endpoint: Endpoint;

      if (branchResult.status === 409) {
        let branches = await axios.get<GetBranchesResult>(
          `https://console.neon.tech/api/v2/projects/${inputs.projectId}/branches`,
          {
            headers,
          },
        );

        let branch = branches.data.branches.filter(branch => {
          return branch.name === inputs.branchName;
        })[0];

        if (!branch) {
          throw 'failed to find branch';
        }
        id = branch.id;

        let endpoints = await axios.get<GetEndpointResults>(
          `https://console.neon.tech/api/v2/projects/${inputs.projectId}/endpoints`,
          {
            headers,
          },
        );

        let endpointFilter = endpoints.data.endpoints.filter(ep => {
          return ep.branch_id === id;
        });

        if (endpointFilter.length !== 1) {
          throw 'Missing endpoint';
        }
        endpoint = endpointFilter[0];
      } else {
        if (
          branchResult.data &&
          branchResult.data.endpoints &&
          branchResult.data.endpoints.length !== 1
        ) {
          throw 'Invalid Neon branch result: missing endpoints';
        }
        id = branchResult.data.branch.id;
        endpoint = branchResult.data.endpoints[0];
      }

      console.log('created branch id: ', id);

      const roleName = 'fpc';

      // reset password
      const roleResetResult = await axios.post<RoleResetResult>(
        `https://console.neon.tech/api/v2/projects/${inputs.projectId}/branches/${id}/roles/${roleName}/reset_password`,
        null,
        {
          headers,
        },
      );
      const rolePassword = roleResetResult.data.role.password;
      console.log('reset role pwd');

      const databaseUrl = `postgres://${roleName}:${rolePassword}@${endpoint.host}/footprint_db?options=project%3D${endpoint.id}`;

      return {
        id,
        outs: {
          neonApiKey: inputs.apiKey,
          projectId: inputs.projectId,
          branchId: id,
          branchName: inputs.branchName,
          databaseUrl: databaseUrl,
        },
      };
    } catch (error) {
      console.log('neon failure: ', error);
      throw 'Failed to create branch in neon';
    }
  },

  async update(id, olds: NeonDbBranchInputs, news: NeonDbBranchInputs) {
    return await this.create(news);
  },

  async delete(
    id,
    inputs: {
      neonApiKey: string;
      projectId: string;
      branchId: string;
      branchName: string;
      databaseUrl: string;
    },
  ) {
    const auth = `Bearer ${inputs.neonApiKey}`;

    try {
      const branchResult = await axios.delete(
        `https://console.neon.tech/api/v2/projects/${inputs.projectId}/branches/${inputs.branchId}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: auth,
          },
          validateStatus: function (status) {
            // status OK or already exists
            return (status >= 200 && status < 300) || status === 404;
          },
        },
      );

      console.log('deleted branch ', id);

      const roleResult = await axios.delete(
        `https://console.neon.tech/api/v2/projects/${inputs.projectId}/branches/${inputs.branchId}/roles/${inputs.branchName}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: auth,
          },
          validateStatus: function (status) {
            // status OK or already exists
            return (status >= 200 && status < 300) || status === 404;
          },
        },
      );

      console.log('deleted role ', inputs.branchName);
    } catch (error) {
      console.log('neon failure: ', error);
      throw 'Failed to delete branch in neon';
    }
  },
};

class NeonEphemeralBranchResource extends pulumi.dynamic.Resource {
  public databaseUrl!: pulumi.Output<string>;

  constructor(
    name: string,
    props: CreateNeonDbBranchInputs,
    opts?: pulumi.CustomResourceOptions,
  ) {
    super(
      neonBranchProvider,
      name,
      { databaseUrl: undefined, ...props },
      { ...opts, additionalSecretOutputs: ['neonApiKey', 'databaseUrl'] },
    );
  }
}
