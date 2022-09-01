import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import { Region } from '@pulumi/aws';
import * as kms from '@aws-sdk/client-kms';
import * as crypto from 'crypto';

export interface CreateSealedIkekResourceInputs {
  rootKeyId: pulumi.Input<string>;
}

interface CreateSealedIkekInputs {
  rootKeyId: string;
}

export interface SealedIkekProviderOutputs {
  hexValue: string;
}

const sealedIkekProvider: pulumi.dynamic.ResourceProvider = {
  async create(
    inputs: CreateSealedIkekInputs,
  ): Promise<pulumi.dynamic.CreateResult> {
    const kmsClient = new kms.KMSClient({ region: Region.USEast1 });
    const command = new kms.GenerateDataKeyWithoutPlaintextCommand({
      KeyId: inputs.rootKeyId,
      NumberOfBytes: 32,
    });

    const response = await kmsClient.send(command);

    if (!response.CiphertextBlob) {
      throw 'Failed to generate Sealed IKEK';
    }

    const ciphertext = response.CiphertextBlob;
    const ciphertextHex = Buffer.from(ciphertext!).toString('hex');

    const id = crypto
      .createHash('sha256')
      .update(ciphertextHex)
      .digest('hex')
      .substring(0, 16);

    return { id, outs: { hexValue: ciphertextHex } };
  },
};

export class SealedIkek extends pulumi.dynamic.Resource {
  public readonly rootKeyId!: pulumi.Output<string>;
  public readonly hexValue!: pulumi.Output<string>;

  constructor(
    name: string,
    props: CreateSealedIkekResourceInputs,
    opts?: pulumi.CustomResourceOptions,
  ) {
    super(sealedIkekProvider, name, { hexValue: undefined, ...props }, opts);
  }
}
