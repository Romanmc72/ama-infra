import {Construct} from 'constructs';
import {
  ArtifactRegistryRepository,
} from '@cdktf/provider-google/lib/artifact-registry-repository';
import {
  BaseGCPStack,
  BaseGCPStackProps,
} from '../constructs';

/**
 * The list of available formats, the Terraform and GCP Providers do not give
 * a properly formatted Enum of valid values to choose from, and you get a
 * 400 error every time you try to create the object without one of these
 * formats exactly as specified.
 */
export enum RegistryFormat {
  DOCKER = 'DOCKER',
  MAVEN = 'MAVEN',
  NPM = 'NPM',
  PYTHON = 'PYTHON',
  APT = 'APT',
  YUM = 'YUM',
  KUBEFLOW = 'KFP',
  GO = 'GO',
}

/**
 * The settings for a given registry to be created
 */
interface RegistrySettings {
  /**
   * A text description for the registry that will appear in GCP
   */
  description: string;
  /**
   * The format for the registry
   *
   * @default RegistryFormat.DOCKER
   */
  format?: RegistryFormat;
}

/**
 * The list of registry names that should exist.
 * If adding new registries do so here.
 */
export const REGISTRIES: {[name: string]: RegistrySettings} = {
  'crappy-server': {description: 'A crappy nginx server'},
};

export const REGISTRY_NAMES = Object.keys(REGISTRIES);

/**
 * The mapping of registry names to registries
 */
export interface RegistryMapping {
  [name: string]: ArtifactRegistryRepository;
}

/**
 * This stack contains resources related specifically to the Firestore
 * database in GCP that we will use as the backend for our application.
 */
export class ContainerRegistryStack extends BaseGCPStack {
  /**
   * The Artifact Container registries to use for container storage
   */
  private registries: RegistryMapping = {};

  /**
   * The constructor that initializes this stack
   * @param {Construct} scope - The App within which this stack lives
   * @param {string} id - The identifier for this database stack
   * @param {BaseGCPStackProps} props - The properties specifically for this
   * database stack
   */
  constructor(scope: Construct, id: string, props: BaseGCPStackProps) {
    super(scope, id, props);
    REGISTRY_NAMES.forEach((registryName: string) =>
      this.registryFactory(registryName, REGISTRIES[registryName]),
    );
  }

  /**
   * Creates an Artifact Registry Repo using streamlined inputs and assigns it
   * to the internal registry mapping
   * @param {string} name - The name of the registry
   * @param {RegistrySettings} settings - The registry settings object
   * @return {void}
   */
  private registryFactory(name: string, settings: RegistrySettings): void {
    this.registries[name] = new ArtifactRegistryRepository(
        this,
        `${name}-registry`,
        {
          description: settings.description,
          format: settings.format ?? RegistryFormat.DOCKER,
          location: this.provider.region,
          project: this.provider.project,
          repositoryId: name,
        },
    );
  }

  /**
   * Method for fetching a given registry by name
   * @param {string} name - The name of the registry to get
   * @return {string}- The registry path
   */
  public getRegistryPath(name: string): string {
    const registry = this.registries[name];
    if (registry) {
      return `${registry.location}-docker.pkg.dev/` +
        `${this.provider.project}/${registry.name}`;
    }
    throw new Error(
        `No registry found by the name of ${name} in this stack ${this}`,
    );
  }
}
