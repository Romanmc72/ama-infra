import {Construct} from 'constructs';
import {FirestoreDatabase} from '@cdktf/provider-google/lib/firestore-database';
import {
  BaseGCPStack,
  BaseGCPStackProps,
} from '../constructs';
import {ProjectService} from '@cdktf/provider-google/lib/project-service';
import {DeploymentEnvironment} from '../config';

/**
 * The properties to initialize the database stack
 */
export interface DatabaseStackProps extends BaseGCPStackProps {
  /**
   * Optionally the location Id for the database
   * @default 'nam5' (aka Multi-Regional North America)
   */
  locationId?: string;
}

/**
 * This stack contains resources related specifically to the Firestore
 * database in GCP that we will use as the backend for our application.
 */
export class DatabaseStack extends BaseGCPStack {
  /**
   * The Firestore database created within this stack
   */
  public readonly database: FirestoreDatabase;

  /**
   * The constructor that initializes this stack.
   * @param {Construct} scope - The App within which this stack lives.
   * @param {DeploymentEnvironment} env - The environment this stack will
   * deploy to.
   * @param {DatabaseStackProps} props - The properties specifically for this
   * database stack.
   */
  constructor(
      scope: Construct,
      env: DeploymentEnvironment,
      props: DatabaseStackProps,
  ) {
    super(scope, 'database', env.name, props);
    const firestore = new ProjectService(this, 'firestore-service', {
      project: props.projectId,
      service: 'firestore.googleapis.com',
    });

    this.database = new FirestoreDatabase(this, 'database', {
      locationId: props.locationId ?? 'nam5',
      name: '(default)',
      type: 'FIRESTORE_NATIVE',
      concurrencyMode: 'OPTIMISTIC',
      appEngineIntegrationMode: 'DISABLED',
      dependsOn: [firestore],
    });
  }
}
