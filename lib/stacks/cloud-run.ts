import {Construct} from 'constructs';
import {ServiceAccount} from '@cdktf/provider-google/lib/service-account';
import {
  SecretManagerSecretIamBinding,
} from '@cdktf/provider-google/lib/secret-manager-secret-iam-binding';
import {
  ProjectIamBinding,
} from '@cdktf/provider-google/lib/project-iam-binding';
import {
  BaseGCPStack,
  BaseGCPStackProps,
  CloudRunServiceWrapper,
  SecretWithVersion,
} from '../constructs';
import {TerraformVariable} from 'cdktf';

export interface CloudRunStackProps extends BaseGCPStackProps {
  /**
   * The artifact registry path where the container image resides
   */
  registryPath: string;
}

/**
 * This stack hold our cloud run resource definitions
 */
export class CloudRunStack extends BaseGCPStack {
  /**
   * The service account that will be running the web server application
   */
  public readonly serviceAccount: ServiceAccount;

  /**
   * Initializes the stack
   * @param {Construct} scope - The app this stack lives in
   * @param {string} id - the unique id for the stack
   * @param {CloudRunStackProps} props - The props to initialize the stack
   */
  constructor(scope: Construct, id: string, props: CloudRunStackProps) {
    super(scope, id, props);
    this.serviceAccount = new ServiceAccount(this, 'service-account', {
      accountId: 'cloud-run-server',
      description: 'Responsible for executing the Cloud Run Server',
      project: props.projectId,
    });
    const secret = new SecretWithVersion(this, 'next-supabase-url', {
      project: props.projectId,
      secretId: 'NEXT_PUBLIC_SUPABASE_URL',
      replication: {automatic: true},
    });
    const secretIam = new SecretManagerSecretIamBinding(
        this,
        'service-account-to-secret',
        {
          members: [`serviceAccount:${this.serviceAccount.email}`],
          role: 'roles/secretmanager.secretAccessor',
          secretId: secret.secretId,
        },
    );
    const serviceName = 'crappy-server';
    const serviceAdmin = new ProjectIamBinding(
        this,
        'service-account-iam-admin',
        {
          role: 'roles/run.admin',
          members: [`serviceAccount:${this.serviceAccount.email}`],
          project: this.provider.project!,
        },
    );
    const imageTag = new TerraformVariable(this, 'image-tag', {
      default: 'latest',
      description: 'While building and pushing the Docker image, the tag ' +
        'should be specified here so Cloud Run can deploy the correct image ' +
        'version.',
      type: 'string',
    });
    new CloudRunServiceWrapper(this, 'server', {
      name: serviceName,
      region: this.provider.region!,
      project: this.provider.project!,
      registryPath: props.registryPath,
      imageName: 'crap',
      imageTag: imageTag.value,
      maxScale: 1,
      serviceAccount: this.serviceAccount,
      ports: [8080],
      secrets: [secret],
      dependsOn: [secretIam, serviceAdmin],
      env: {
        [secret.secretId]: 'butts',
      },
    });
  }
}
