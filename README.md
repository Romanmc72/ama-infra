# Ask Me Anything Infrastructure

This is the backend infrastructure on GCP for the Ask Me Anything app. It will create and deploy all of the services required for the API, database, and compute that runs the code for the API.

## Pre-requisites

There are a few things that one needs to create

- You must be logged into the gcloud application default credentials.
    - `gcloud auth application-default login`
- The environments must exist which are created by hand via the GCP console.
- You must create a bucket at least once otherwise the default cloud storage service account will not exist.
    - This can be achieved via the CLI using `gsutil mb "gs://${PROJECT_ID}-temp" && gsutil rb "gs://${PROJECT_ID}-temp"` which will create then delete the bucket in question.

## The Cloud Run Service

The cloud run container cannot be deployed until at least one version of the container exists inside of the registry.

## Deploying

Always log in first. You will need to log into the correct email that has access to the GCP project in question. That can be accomplished with:

```
# Logs into GCP
gcloud auth application-default login
```

After which you will need to make sure that docker is pointing to the correct artifact registry region. The regions in this app are currently `us-central1` but if you use a different region feel free to swap out the region in the following command.


```
# Authorizes Docker
GCP_REGION=us-central1
gcloud auth configure-docker "${GCP_REGION}-docker.pkg.dev"
```

This can all then be deployed (at least to the dev account) via the following command:

```
cdktf deploy --auto-approve '*-dev*'
```

## Locks

If you are facing issues with the lock files from terraform that are not released because of a failed deployment, you will need to force unlock them. To find all of the locked stacks you will need to run:

```
# Switch out the project id depending on which environment is being deployed
PROJECT_ID=ama-dev-414718
gsutil ls -r "gs://${PROJECT_ID}-terraform-backend/" | grep lock
```

After that you will need to move to the directory for each locked stack and run:

```
cd cdktf.out/stacks/<STACK-NAME>
terraform apply
```

which will print out what the lock id is. (From what I understand you cannot get that lock id from the lockfile directly) After you get the lock id, you can then run this from that same directory:

```
terraform force-unlock <LOCK-ID>
```

and the stack will unlock.
