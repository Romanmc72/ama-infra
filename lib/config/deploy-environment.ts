import {App} from 'cdktf';
import {DeploymentEnvironment} from './environments';
import {
  CloudRunStack,
  ContainerRegistryStack,
  DatabaseStack,
  RegistryName,
  ServicesStack,
  TerraformStateBucketStack,
} from '../stacks';
import {BaseGCPStackProps} from '../constructs';

/**
 * Create a single environment.
 * @param {App} app The overall app this environment will exist in.
 * @param {DeploymentEnvironment} environment The settings specific to
 * this environment.
 */
export function deployEnvironment(
    app: App,
    environment: DeploymentEnvironment,
): void {
  const stateBucketStack = new TerraformStateBucketStack(
      app,
      environment,
      environment,
  );
  const serviceStack = new ServicesStack(app, environment, {
    ...environment,
    stateBucket: stateBucketStack.stateBucket,
  });
  const baseStackProps: BaseGCPStackProps = {
    ...environment,
    stateBucket: stateBucketStack.stateBucket,
    dependsOn: [serviceStack],
  };
  new DatabaseStack(app, environment, baseStackProps);
  const registry = new ContainerRegistryStack(
      app,
      environment,
      baseStackProps,
  );
  // new NetworkingStack(app, environment, baseStackProps);
  new CloudRunStack(app, environment, {
    ...baseStackProps,
    registryPath: registry.getRegistryPath(RegistryName.AMA_API),
    dependsOn: [serviceStack, registry],
  });
}
