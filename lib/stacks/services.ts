import {ProjectService} from '@cdktf/provider-google/lib/project-service';
import {Construct} from 'constructs';
import {BaseGCPStack, BaseGCPStackProps} from '../constructs';

export interface ServiceStackProps extends BaseGCPStackProps {}

/**
 * Instead of clicking through the UI to enable all of the API's in GCP that we
 * wish to use, we can specify them in this stack and have the rest of the
 * stacks wait for this one to deploy in order to leverage the resources that
 * it enables. This way no single stack is responsible for both keeping a
 * project service API up and running as well as provisioning resources for
 * that API. If there become multiple stacks that deploy those types of
 * resources and one of those stacks ends up needing deletion then we would
 * not want the API disabled for the rest of the stacks.
 */
export class ServicesStack extends BaseGCPStack {
  /**
   * Creates the stack
   * @param {Construct} scope - the app in which this stack lives
   * @param {string} id - the unique id for this stack
   * @param {ServiceStackProps} props - the pros to create the stack
   */
  constructor(scope: Construct, id: string, props: ServiceStackProps) {
    super(scope, id, props);
    // storage, iam, and kms are already enabled in the terraform-state stack
    const servicesToEnable = [
      'artifactregistry',
      'bigquery',
      'cloudfunctions',
      'eventarc',
      'firestore',
      'logging',
      'pubsub',
      // Cloud Run
      'run',
    ];
    servicesToEnable.forEach((service: string) => new ProjectService(
        this,
        `${service}-api`,
        {service: `${service}.googleapis.com`},
    ));
  }
}
