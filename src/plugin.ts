import type {
  Action,
  ActionResult,
  Content,
  GenerateTextParams,
  HandlerCallback,
  IAgentRuntime,
  Memory,
  Plugin,
  Provider,
  ProviderResult,
  State,
} from '@elizaos/core';
import { ModelType, Service, logger } from '@elizaos/core';
import { z } from 'zod';
import { HusbandosPluginTestSuite } from './tests';

/**
 * Defines the configuration schema for a plugin, including the validation rules for the plugin name.
 *
 * @type {import('zod').ZodObject<{ EXAMPLE_PLUGIN_VARIABLE: import('zod').ZodString }>}
 */
const configSchema = z.object({
  API_URL: z
    .string()
    .describe('The URL of the API on Haifu terminal to use')
    .optional()
    .default('https://somnia-testnet-ponder-release.standardweb3.com/api'),
});

/**
 * Example token analysis action
 * This demonstrates the simplest possible action structure on Haifu to analyze a token
 */
const tokenAnalysisAction: Action = {
  name: 'TOKEN_ANALYSIS',
  similes: ['TOKEN_ANALYSIS'],
  description: 'Analyzes the market and provides a summary of the current state of a token',
  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State | undefined
  ): Promise<boolean> => {
    // Always valid
    return true;
  },
  handler: async (
    _runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: any,
    callback?: HandlerCallback,
    _responses?: Memory[]
  ): Promise<ActionResult> => {
    try {
      logger.info('Handling TOKEN_ANALYSIS action');

      // Simple response content for callback
      const responseContent: Content = {
        text: 'Here is the market analysis for the token',
        actions: ['TOKEN_ANALYSIS'],
        source: message.content.source,
      };

      // Call back with the hello world message if callback is provided
      if (callback) {
        await callback(responseContent);
      }

      // Return ActionResult
      return {
        text: 'hello world!',
        success: true,
        data: {
          actions: ['TOKEN_ANALYSIS'],
          source: message.content.source,
        },
      };
    } catch (error) {
      logger.error('Error in TOKEN_ANALYSIS action:', error);
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },
  examples: [
    [
      {
        name: '{{name1}}',
        content: {
          text: 'Can you analyze the market for this token?',
        },
      },
      {
        name: '{{name2}}',
        content: {
          text: 'Here is the market analysis for the token',
          actions: ['MARKET_ANALYSIS'],
        },
      },
    ],
  ],
};

/**
 * Example Hello World Provider
 * This demonstrates the simplest possible provider implementation
 */
const tokenAnalysisProvider: Provider = {
  name: 'TOKEN_ANALYSIS_PROVIDER',
  description: 'A provider that analyzes the market for a token',

  get: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State | undefined
  ): Promise<ProviderResult> => {
    return {
      text: 'I am a provider that analyzes the market for a token',
      values: {},
      data: {},
    };
  },
};

class HusbandosService extends Service {
  static serviceType = 'husbandos';
  capabilityDescription =
    'This is a husbandos service which is attached to the agent through the husbandos plugin.';
  constructor(protected runtime: IAgentRuntime) {
    super(runtime);
  }

  static async start(runtime: IAgentRuntime) {
    logger.info(`*** Starting husbandos service - MODIFIED: ${new Date().toISOString()} ***`);
    const service = new HusbandosService(runtime);
    return service;
  }

  static async stop(runtime: IAgentRuntime) {
    logger.info('*** TESTING DEV MODE - STOP MESSAGE CHANGED! ***');
    // get the service from the runtime
    const service = runtime.getService(HusbandosService.serviceType);
    if (!service) {
      throw new Error('Husbandos service not found');
    }
    service.stop();
  }

  async stop() {
    logger.info('*** THIRD CHANGE - TESTING FILE WATCHING! ***');
  }
}

export const husbandosPlugin: Plugin = {
  name: 'plugin-husbandos',
  description: 'ElizaOS plugin for building wAIfu agents',
  config: {
    NETWORK_URL: process.env.NETWORK_URL,
  },
  async init(config: Record<string, string>) {
    logger.info('*** TESTING DEV MODE - PLUGIN MODIFIED AND RELOADED! ***');
    try {
      const validatedConfig = await configSchema.parseAsync(config);

      // Set all environment variables at once
      for (const [key, value] of Object.entries(validatedConfig)) {
        if (value) process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid plugin configuration: ${error.errors.map((e) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  },
  models: {
    [ModelType.TEXT_SMALL]: async (
      _runtime,
      { prompt, stopSequences = [] }: GenerateTextParams
    ) => {
      return 'The market for the token is doing well';
    },
    [ModelType.TEXT_LARGE]: async (
      _runtime,
      {
        prompt,
        stopSequences = [],
        maxTokens = 8192,
        temperature = 0.7,
        frequencyPenalty = 0.7,
        presencePenalty = 0.7,
      }: GenerateTextParams
    ) => {
      return 'The market for the token is not doing well';
    },
  },
  routes: [
    {
      name: 'token-analysis-route',
      path: '/token-analysis',
      type: 'GET',
      handler: async (_req: any, res: any) => {
        // TODO: get the token from the request
        // send a response
        res.json({
          message: 'Here is the market analysis for the token',
        });
      },
    }
  ],
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        logger.debug('MESSAGE_RECEIVED event received');
        // print the keys
        logger.debug(Object.keys(params));
      },
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger.debug('VOICE_MESSAGE_RECEIVED event received');
        // print the keys
        logger.debug(Object.keys(params));
      },
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger.debug('WORLD_CONNECTED event received');
        // print the keys
        logger.debug(Object.keys(params));
      },
    ],
    WORLD_JOINED: [
      async (params) => {
        logger.debug('WORLD_JOINED event received');
        // print the keys
        logger.debug(Object.keys(params));
      },
    ],
  },
  services: [HusbandosService],
  actions: [tokenAnalysisAction],
  providers: [tokenAnalysisProvider],
  tests: [HusbandosPluginTestSuite],
  // dependencies: ['@elizaos/plugin-knowledge'], <--- plugin dependencies go here (if requires another plugin)
};

export default husbandosPlugin;
