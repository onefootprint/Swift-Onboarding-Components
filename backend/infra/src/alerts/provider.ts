import * as pulumi from '@pulumi/pulumi';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import { Trigger } from './trigger';

export interface TriggerInputs {
  apiKey: string;
  datasetName: string;
  trigger: Trigger;
}

export interface CreateTriggerInputs {
  apiKey: pulumi.Input<string>;
  datasetName: string;
  trigger: Trigger;
}

interface CreateTriggerResponse {
  id: string;
}

const triggerProvider: pulumi.dynamic.ResourceProvider = {
  async create(inputs: TriggerInputs): Promise<pulumi.dynamic.CreateResult> {
    const headers = {
      'x-honeycomb-team': inputs.apiKey,
    };

    try {
      let response = await axios.post<CreateTriggerResponse>(
        `https://api.honeycomb.io/1/triggers/${inputs.datasetName}`,
        inputs.trigger,
        {
          headers,
          validateStatus: function (status) {
            // status OK or already exists
            return status >= 200 && status < 300;
          },
        },
      );

      const id = response.data.id;

      return {
        id,
        // We need to pass these args in order to be able to delete the resource later
        outs: {
          datasetName: inputs.datasetName,
          honeycombApiKey: inputs.apiKey,
        },
      };
    } catch (error) {
      console.log('honeycomb failure: ', error);
      throw 'Failed to create trigger in honeycomb';
    }
  },

  async update(id, olds: TriggerInputs, news: TriggerInputs) {
    const headers = {
      'x-honeycomb-team': news.apiKey,
    };

    // TODO this will probably break if we change the datasetName of an existing alert
    try {
      await axios.put<CreateTriggerResponse>(
        `https://api.honeycomb.io/1/triggers/${news.datasetName}/${id}`,
        news.trigger,
        {
          headers,
          validateStatus: function (status) {
            // status OK or already exists
            return status >= 200 && status < 300;
          },
        },
      );

      return {
        // We need to pass these args in order to be able to delete the resource later
        outs: {
          datasetName: news.datasetName,
          honeycombApiKey: news.apiKey,
        },
      };
    } catch (error) {
      console.log('honeycomb failure: ', error);
      throw 'Failed to create trigger in honeycomb';
    }
  },

  async delete(id, props: { honeycombApiKey: string; datasetName: string }) {
    const headers = {
      'x-honeycomb-team': props.honeycombApiKey,
    };

    try {
      await axios.delete<{}>(
        `https://api.honeycomb.io/1/triggers/${props.datasetName}/${id}`,
        {
          headers,
          validateStatus: function (status) {
            return status >= 200 && status < 300;
          },
        },
      );
    } catch (error) {
      console.log('honeycomb failure: ', error);
      throw 'Failed to delete trigger in honeycomb';
    }
  },
};

export class TriggerResource extends pulumi.dynamic.Resource {
  constructor(
    name: string,
    props: CreateTriggerInputs,
    opts?: pulumi.CustomResourceOptions,
  ) {
    super(
      triggerProvider,
      name,
      { ...props },
      { ...opts, additionalSecretOutputs: ['honeycombApiKey'] },
    );
  }
}
