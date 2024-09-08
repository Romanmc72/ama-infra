import {BaseGCPStackProps} from '../constructs';

/**
 * The set of properties that make up a specific environment.
 */
export interface DeploymentEnvironment extends Omit<
  BaseGCPStackProps, 'stateBucket'> {
  /**
   * Whether or not this environment is production.
   */
  isProd: boolean;
  /**
   * The unique, human readable name for this environment.
   */
  name: string;
  /**
   * The gcp project name for this environment (may differ from the projectId).
   */
  projectName: string;
}

/**
 * The array of environment names
 */
export const ENV_NAMES: {[name: string]: string} = {
  DEV: 'dev',
  QA: 'qa',
  PROD: 'prod',
} as const;

/**
 * The development environment for testing purposes.
 */
export const DEV_ENVIRONMENT: DeploymentEnvironment = {
  isProd: false,
  location: 'US',
  name: ENV_NAMES.DEV,
  projectId: 'ama-dev-414718',
  projectName: 'ama-dev',
  projectNumber: 616001859564,
  region: 'us-central1',
  zone: 'us-central1-a',
};

/**
 * The development environment for pre-prod testing purposes.
 */
export const QA_ENVIRONMENT: DeploymentEnvironment = {
  isProd: false,
  location: 'US',
  name: ENV_NAMES.QA,
  projectId: 'ama-qa-414718',
  projectName: 'ama-qa',
  projectNumber: 794241200699,
  region: 'us-central1',
  zone: 'us-central1-a',
};

/**
 * The development environment for production.
 */
export const PROD_ENVIRONMENT: DeploymentEnvironment = {
  isProd: true,
  location: 'US',
  name: ENV_NAMES.PROD,
  projectId: 'ama-prod-414718',
  projectName: 'ama-prod',
  projectNumber: 140603603674,
  region: 'us-central1',
  zone: 'us-central1-a',
};

export const ENVIRONMENTS: DeploymentEnvironment[] = [
  DEV_ENVIRONMENT,
  QA_ENVIRONMENT,
  PROD_ENVIRONMENT,
];
