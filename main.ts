import {App} from 'cdktf';
import {
  BaseGCPStackProps,
  CloudRunStack,
  ContainerRegistryStack,
  DatabaseStack,
  ENVIRONMENTS,
  ServicesStack,
  TerraformStateBucketStack,
} from './lib';

const APP = new App();

ENVIRONMENTS.forEach((environment) => {
  const stateBucketStack = new TerraformStateBucketStack(
      APP,
      `terraform-state-${environment.name}`,
      environment,
  );
  const serviceStack = new ServicesStack(APP, `services-${environment.name}`, {
    ...environment,
    stateBucket: stateBucketStack.stateBucket,
  });
  const baseStackProps: BaseGCPStackProps = {
    ...environment,
    stateBucket: stateBucketStack.stateBucket,
    dependsOn: [serviceStack],
  };
  new DatabaseStack(APP, `database-${environment.name}`, baseStackProps);
  const registry = new ContainerRegistryStack(
      APP,
      `registry-${environment.name}`,
      baseStackProps,
  );
  new CloudRunStack(APP, `cloud-run-${environment.name}`, {
    ...baseStackProps,
    registryPath: registry.getRegistryPath('crappy-server'),
  });
});

APP.synth();
