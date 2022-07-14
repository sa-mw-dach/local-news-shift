# OpenShift GitOps

## Installation

Again Let us start with the basics. How do you install ArgoCD into your cluster? Also ArgoCD comes with a community Operator or you can install it via Helm. But just as Tekton in OpenShift you do it via the integrated OperatorHub which can be accessed via the UI or a simple YAML file. This installs you the fully supported OpenShift GitOps Operator. While the Pipelines UI integrated into OpenShift is already pretty powerful, the first significant steps towards this for GitOps have been made with OpenShift v4.10.

```
oc apply -f snippets/chapter5/openshift/operators-subs/gitops-operator-sub.yaml
```

If you are unfamiliar with GitOps check out this article and the picture below showing the concept:

![](<../.gitbook/assets/image (2).png>)

## Overview

Yes, before we jump right into GitOps, let's quickly think about how to integrate this with Pipelines. Because at the end of the day, we would like to use GitOps together with an automated Pipeline.

![](<../.gitbook/assets/image (3) (1).png>)

## Tekton Tasks

Therefore, we have to start with our Tekton Tasks again. Do we have them all ready in the cluster? Almost! As before, we pull the repo, build the Java Quarkus application with maven and build & push a container image.

In this example we use a Helm Chart to deploy the application. But a "helm install / helm upgrade" Task is no longer required. Rather we have to put a reference to our new Container Image into the Helm Chart, here by replacing the Image Tag with an updated value. We use yq, the YAML pendant to jq, to do the change. But there is no lightweight container image with yq available in the cluster.&#x20;

We could now build a container image with the Red Hat UBI as base image and install yq, but for this demo we will use a Task from the community Tekton catalog.

```
kubectl apply -n localnews-pipelines -f https://raw.githubusercontent.com/tektoncd/catalog/main/task/yq/0.2/yq.yaml
```

The "git cli" and "oc cli" Tasks are used to push the updated Helm Chart to our Git Repo and, afterwards, run a check for the changes to become applied to the cluster. Of course, we expect ArgoCD to catch the changes and do this by itself, but better safe than sorry :) (What if ArgoCD is down by chance?)

## The Pipeline

Both Tasks are available as OpenShift Cluster Tasks, so we can just change from the community Tasks to the OpenShift certified cluster Tasks and apply our updated pipeline.

```
oc apply -n localnews-pipelines -f snippets/chapter5/openshift/pipeline-resources/java-backend-simple-pipeline-gitops.yaml
```

Since ArgoCD is installed via the supported OpenShift GitOps functionality nothing stops us now from creating our ArgoCD application, which will in fact monitor the Helm Chart and install it in our cluster.

## ArgoCD application

```
kubectl apply -n openshift-gitops -f snippets/chapter5/openshift/gitops/argocd-application.yaml
```

But did it work? You could head over to the Dashboard now, which will tell you OutOfSync and you will see some permission errors. Guess what - Security Measures enforced by OpenShift! OpenShift GitOps needs explicit permissions to manage the Namespace "newsbackend-integration-gitops" which is used to deploy the application.

![](<../.gitbook/assets/image (7) (1) (1) (1).png>)

So, since OpenShift GitOps explicitly needs to be given access to a namespace that it is supposed to manage, just add a label to the respective namespace:

```
oc label namespace newsbackend-integration-gitops argocd.argoproj.io/managed-by=openshift-gitops
```

After the next poll OpenShift GitOps will notice that the service account associated with this operations now has sufficient permissions and will deploy the application via Helm.

Check it via the GUI or CLI with

```
kubectl describe application -n openshift-gitops localnews
```

## Triggering the Pipeline

With GitOps we want all our changes to go through Git! So, let our Pipeline make a new build of the "news-backend" component and use our Git commit ID as the image tag to make it unique. Let's check the current Image Tag:

```
kubectl get deployments -n newsbackend-integration-gitops news-backend -o yaml | grep image:
```

It should look like this:

![](<../.gitbook/assets/image (6) (1).png>)

To trigger the Pipeline from Git we need an EventListener running in the cluster. Actually, we created one already in the previous part. Let us just modify it to execute not the old, but our newly tailored Pipeline to edit and push the Helm Chart.

```
## ensure the old one is still there:
kubectl apply -f snippets/chapter5/openshift/github_push_listener -n localnews-pipelines
## modify it:
kubectl apply -f snippets/chapter5/openshift/gitops/EventListenerPushGitOps.yaml -n localnews-pipelines
```

Again, we will not do the integration with a real Git Repo, but just mock what a GitHub webhook typically looks like with curl. At first ensure the port-forwarding to your Event Listener is active.

```
kubectl port-forward -n localnews-pipelines service/el-github-new-push-listener 9998:8080curl -v \
```

```
curl -v \
    -H 'X-GitHub-Event: push' \
    -H 'X-Hub-Signature: sha1=b60860d27da67ed1753b5a262c41f35b0c20dbcd' \
    -H 'Content-Type: application/json' \
    -d '{"ref": "refs/heads/main", "head_commit":{"id": "v1.0.0-your-fake-commit-id"}, "repository":{"clone_url":"git@github.com:sa-mw-dach/local-news-shift.git"}, "image_repo": "docker.io/maxisses"}' \
    http://localhost:9998
```

{% hint style="info" %}
Remember that the JSON payload has to match the sha1 signature!
{% endhint %}

The curl should get accepted with a 202 HTTP response from the Event Listener and then you can head over to your OpenShift Cluster and view your Pipeline running.

![](<../.gitbook/assets/image (1).png>)

Once the Pipeline successfully completed the "git-push-update-helm" Task, the "check-successful-sync" waits until OpenShift GitOps picked up the changes and applied them to the Cluster. The default polling frequency is every 3 minutes, so it might take a few moments. But as soon as it is applied the Pipeline is green, the application is synched and, if we inspect the news-backend Deployment again, we see a new Image Tag with the values passed into the Pipeline via our fake Webhook!

![](<../.gitbook/assets/image (1) (1).png>)

## Wrapping it up

We've simulated a GitHub webhook that instantiated a PipelineRun with a dedicated Service Account, specific parameters and a YAML template of the Pipeline. This YAML file could have actually been anything - not necessarily a Pipeline. So this is very flexbile.

After a successful PipelineRun a new container image was deployed via OpenShift GitOps.

![](<../.gitbook/assets/image (5).png>)

### Clean Up

For the next part a clean cluster is best so do:

```
oc delete argoapp
oc delete localnews
oc delete newsbackend-integration...
```

