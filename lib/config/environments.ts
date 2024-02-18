import {BaseGCPStackProps} from '../constructs';

/**
 * The set of properties that make up a specific environment
 */
export interface DeploymentEnvironment extends Omit<
  BaseGCPStackProps, 'stateBucket'> {
  /**
   * Whether or not this environment is production
   */
  isProd: boolean;
  /**
   * The unique, human readable name for this environment
   */
  name: string;
  /**
   * The gcp project name for this environment (may differ from the projectId)
   */
  projectName: string;
}

/**
 * The development environment for testing purposes
 */
export const DEV_ENVIRONMENT: DeploymentEnvironment = {
  isProd: false,
  location: 'US',
  name: 'dev',
  projectId: 'r0m4n-dev',
  projectName: 'r0m4n-dev',
  projectNumber: 218289013170,
  region: 'us-central1',
  zone: 'us-central1-a',
};

export const ENVIRONMENTS: DeploymentEnvironment[] = [DEV_ENVIRONMENT];
