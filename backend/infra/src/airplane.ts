import { StackEnvironment } from './stack_metadata';
import { GlobalState } from './main';
import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import { readFileSync } from 'fs';
import axios from 'axios';
import * as crypto from 'crypto';

export type AirplaneOutput = {
  envSlug: string;
};

/**
 * Deploys an airplane agent to the VPC using CloudFormation
 * https://docs.airplane.dev/self-hosting/aws#install-with-aws-cloudformation
 */
export function CreateAirplaneAgentStack(g: GlobalState): AirplaneOutput {
  const provider = g.provider;
  const templateBody = readFileSync('./config/airplane-agent.yaml', 'utf8');
  const subnets = pulumi.all(g.vpc.privateSubnetIds).apply(subnetIds => {
    return subnetIds.join(',');
  });

  let envSlug: string;
  switch (g.stackMetadata.environment) {
    case StackEnvironment.DevEphemeral: {
      // TODO: eventually support ephem airpalne
      // for now we can skip this.
      envSlug = 'dev_ephem';
      return {
        envSlug,
      };
    }
    case StackEnvironment.Dev: {
      envSlug = 'dev';
      break;
    }
    case StackEnvironment.Prod: {
      envSlug = 'prod';
      break;
    }
  }

  const apiTokenSecret = new aws.secretsmanager.Secret(
    `airplane-api-token`,
    {
      name: `airplane-apiToken-${g.stackMetadata.shortStackName}`,
    },
    { provider },
  );

  const apiTokenSecretVersion = new aws.secretsmanager.SecretVersion(
    `airplane-api-token-version`,
    {
      secretId: apiTokenSecret.id,
      secretString: g.secretsStore.airplaneApiToken,
    },
    { provider },
  );

  const airplane_stack = new aws.cloudformation.Stack(
    `airplane-agent-stack-${g.stackMetadata.shortStackName}`,
    {
      capabilities: ['CAPABILITY_IAM'],
      parameters: {
        TeamID: g.constants.airplane.teamId,
        APITokenSecretARN: apiTokenSecret.arn,
        EnvSlug: envSlug,
        SubnetIDs: subnets,
        VpcID: g.vpc.vpc.id,
        SecurityGroupID: g.coreSecurityGroups.airplane.id,
      },
      templateBody,
    },
    { provider },
  );

  const airplaneConfDb = new AirplaneConfigResource(
    `airplane-env-conf-${g.stackMetadata.shortStackName}`,
    {
      envSlug: envSlug,
      apiToken: g.secretsStore.airplaneApiToken,
      name: 'DATABASE_URL',
      value: g.database.readOnlyDatabaseUrl,
    },
  );

  const airplaneConfDashboard = new AirplaneConfigResource(
    `airplane-env-conf-dashboard-url-${g.stackMetadata.shortStackName}`,
    {
      envSlug: envSlug,
      apiToken: g.secretsStore.airplaneApiToken,
      name: 'DASHBOARD_URL',
      value: `https://dashboard.${g.constants.domain.frontendBase}`,
    },
  );

  const fpcPrivateProtectedToken = new AirplaneConfigResource(
    `airplane-env-conf-fpc-protected-token-${g.stackMetadata.shortStackName}`,
    {
      envSlug: envSlug,
      apiToken: g.secretsStore.airplaneApiToken,
      name: 'FPC_PRIVATE_PROECTED_TOKEN',
      value: g.secretsStore.fpcProtectedCustodianKey,
    },
  );

  return {
    envSlug,
  };
}

interface AirplaneConfigInputs {
  envSlug: string;
  apiToken: string;
  name: string;
  value: string;
}

interface CreateAirplaneConfigInputs {
  envSlug: string;
  apiToken: pulumi.Input<string>;
  name: string;
  value: pulumi.Input<string>;
}

type AirplaneEnv = {
  id: string;
  slug: string;
  name: string;
};

/**
 *  Sets an airplane config secret var
 *
 *  curl  -H 'content-type: application/json' \
 *        -H "X-Airplane-API-Key: xxx" \
 *        -H 'X-Airplane-Env-Slug: yyy' \
 *        https://api.airplane.dev/v0/configs/set \
 *         -d '{"name": "zzz", "value":"aaa", "isSecret": true }'
 */
const airplaneConfigProvider: pulumi.dynamic.ResourceProvider = {
  async create(
    inputs: AirplaneConfigInputs,
  ): Promise<pulumi.dynamic.CreateResult> {
    // check if the envslug exists or create it
    const getEnv = await axios.get<AirplaneEnv>(
      `https://api.airplane.dev/v0/envs/get?slug=${inputs.envSlug}`,
      {
        headers: {
          'content-type': 'application/json',
          'X-Airplane-API-Key': inputs.apiToken,
        },
        validateStatus: function (status) {
          // status OK or already exists
          return (status >= 200 && status < 300) || status === 404;
        },
      },
    );

    console.log('got airplane env: ', getEnv.data);

    if (getEnv.status === 404) {
      const envResponse = await axios.post(
        'https://api.airplane.dev/v0/envs/create',
        {
          name: inputs.envSlug,
          slug: inputs.envSlug,
        },
        {
          headers: {
            'content-type': 'application/json',
            'X-Airplane-API-Key': inputs.apiToken,
          },
          validateStatus: function (status) {
            // status OK or already exists
            return status >= 200 && status < 300;
          },
        },
      );
      console.log('created airplane env: ', envResponse.data);
    }

    const configOut = await axios.post(
      'https://api.airplane.dev/v0/configs/set',
      {
        name: inputs.name,
        value: inputs.value,
        isSecret: true,
      },
      {
        headers: {
          'content-type': 'application/json',
          'X-Airplane-API-Key': inputs.apiToken,
          'X-Airplane-Env-Slug': inputs.envSlug,
        },
      },
    );

    const id = crypto
      .createHash('sha256')
      .update(inputs.name)
      .update(inputs.value)
      .digest('hex')
      .substring(0, 16);

    return { id, outs: {} };
  },
};

class AirplaneConfigResource extends pulumi.dynamic.Resource {
  constructor(
    name: string,
    props: CreateAirplaneConfigInputs,
    opts?: pulumi.CustomResourceOptions,
  ) {
    super(airplaneConfigProvider, name, props, opts);
  }
}
