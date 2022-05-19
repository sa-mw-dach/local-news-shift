# OpenShift Pipelines (Tekton)

## Installation

Let us start with the basics. How do you install Tekton into your cluster? While Tekton comes with a community Operator or you can install it via Helm, in OpenShift you do it via the integrated OperatorHub which can be accessed via the UI or a simple YAML file. This installs you the fully supported OpenShift Pipelines Operator. The beauty of it is, that while Tekton only has a very basic Dashboard, OpenShift Pipelines fully integrates into the UI.

```
oc apply -f snippets/chapter5/openshift/operators-subs/pipelines-operator-sub.yaml
```

## Tekton Tasks

The next thing are your Tasks. If you are not familiar with Tekton Tasks so far - they are the pieces that you use to stitch together your Pipeline. Below Image shows 4 typical tasks, each resembling one distinct container image that can be used to execute several "steps" such as 1) building and 2) pushing a container image. You would usually get them from [https://hub.tekton.dev/](https://hub.tekton.dev/). While you find a wealth of Tasks still quite a few of them come with flaw. Many of them run as root. And that shouldn't comply with your security measures and it also doesn't comply with OpenShifts security measures.\
\
Now there are two options:

1. Build your own Base Images for the Task. As an example we could look at the maven task ([https://hub.tekton.dev/tekton/task/maven](https://hub.tekton.dev/tekton/task/maven)). The community version uses gcr.io/cloud-builders/mvn. One could just replace it with another image, adhering to the security guidelines.
2. But there is a much easier way. OpenShift ships with a lot of so-called ClusterTasks and basically all of the steps you see below are well covered by them. And if the included tasks don't fit your needs, you can create your own and share them with everyone in this, or even across clusters. A good starting point is to use the built-in "create" function that shows some samples which are being built on top of the UBI (universal base image) fully supported by Red Hat.

![](<../.gitbook/assets/image (2).png>)

## The Pipeline

For now OpenShift gives us all the Tasks we need for the Pipeline below.&#x20;

{% hint style="info" %}
Later, when we move to GitOps, we will integrate this with our Pipeline and do a little bit of custom work on Tasks. One we will get from the community hub and the other one we will just create.
{% endhint %}

![](<../.gitbook/assets/image (3).png>)

As you've already crafted your Pipeline for upstream Tekton you come with a YAML file. And you would want it to work! And it actually it does almost out of the Box. The only thing to do is to replace in your 4 task references, that the integrated ClusterTasks should be used like so:

```
  tasks:
    - name: clone-sources
      taskRef:
        name: git-clone
        kind: ClusterTask
      params:
        - name: url
          value: $(params.gitrepositoryurl)
```

And then you are all set to deploy your Pipeline!

```
kubectl apply -n localnews-pipelines -f snippets/chapter5/openshift/pipeline-resources/java-backend-simple-pipeline.yaml
```

{% hint style="info" %}
A pretty cool feature of OpenShift is that it actually saves you a lot of YAML-work with a Graphical Pipeline Builder, completely integrated into the OpenShift UI. ![](<../.gitbook/assets/image (4).png>)\
\
Moreover, you might even just deploy an application with "oc new-app" or via the UI and OpenShift generates an appropriate build and deploy Pipeline for you. Afterwards, just fetch the YAML and bring into version control for further reuse!
{% endhint %}

## **RBAC**

Now here you would probably expect some significant effort. But actually you will have created a Service Account for you Pipeline already that is associated to a certain Role via a RoleBinding. That Service Account has a Registry Secret and a Secret with an SSH key for your Git Repo to access your code and be able to push the resulting Container Image. All set? Almost!\
Instruct this Service Account to specifically run everything in a nonroot context. If you built your Pipeline via OpenShift this being done automatically. But since we move from upstream, we shouldn't forget! To dig deeper go here: [https://cloud.redhat.com/blog/managing-sccs-in-openshift](https://cloud.redhat.com/blog/managing-sccs-in-openshift) \
Now just append the following to your role:

```
- verbs:
    - use
  apiGroups:
    - security.openshift.io
  resources:
    - securitycontextconstraints
  resourceNames:
    - nonroot
```

Then create all of the Resources mentioned beforehand in your OpenShift Cluster like so:

```
kubectl apply -n localnews-pipelines -f snippets/chapter5/openshift/rbac
```

## Running the Pipeline

Running the Pipeline is again something you could easily trigger via the OpenShift UI. If you rather used the tkn CLI tool that does still work. In this example we will stick to YAML and create a PipelineRun, which is starting the Pipeline we've created earlier and tells it which parameters to use (e.g. which values.yaml file in the helm task or which container registry to use ..), which Service Account (obviously the one created before) and also which workspaces to take.&#x20;

{% hint style="info" %}
What is a Workspace? Actually it is a folder where all the files required/created by the pipeline are stored. And if we want this to be persistent we need a PV, claimed by the Pipeline Tasks via a PVC. In this example just a "volumeClaimTemplate" (in YAML format, included in the PipelineRun) is provided which creates a new PV for each PipelineRun to make all artifacts, such as the maven output, available afterwards.&#x20;
{% endhint %}

Now the PipelineRun can be created, which should now make our Pipeline actually. Since this Pipeline also deploys the application and it is the newsbackend service we are building let's call this Namespace "newsbackend-integration", because we deploy the new version of the newsbackend along with all the other components.

```
oc new-project newsbackend-integration
## Start your Pipeline, thereby creating a PipelineRun
kubectl create -f snippets/chapter5/openshift/pipeline-resources/java-backend-simple-pipeline-run.yaml
```

## Trigger the Pipeline with a Webhook

Last but not least let's simulate how we could trigger this Pipeline automatically with a Webhook, e.g. from Github.

The UI gives us already some support to create those Triggers (v4.9) but there is more to come! Anyway, we have our trigger ready. At first glance triggers are a little complicated to wrap their head around because they consist of several Custom Resources.&#x20;

1. EventListener - creates a listener and endpoint for the Webhook to connect to, authorizes the incoming requests (via a Kubernetes Secret), can filter the incoming POST requests based on their Payload (e.g. only listen to specific git branches and types of actions, such as a git push); the EventListener again runs with a specific ServiceAccount that limits its privileges to only certain actions.&#x20;
2. TriggerBinding - serves to map the incoming (json) payload to parameters that can be used in the pipeline
3. TriggerTemplate - takes the parameters and initiates a PipelineRun (in our case, it could actually create any YAML formatted Kubernetes Resource)

Let's create all of these resources including a new Service Account, Rolebinding & Role and also the Kubernetes Secret that contains a key e.g. from our Github Webhook to authorize requests.

```
kubectl apply -f snippets/chapter5/openshift/github_push_listener -n localnews-pipelines
```

Since we don't want to make things too complicated for you to reproduce things, we will not create an actual Webhook on Github. Also we will not expose our Event Listener running in OpenShift. Therefore, let's just port-forward the Event Listener and simulate an incoming Webhook request via curl like so:

```
kubectl port-forward -n localnews-pipelines service/el-github-new-push-listener 9998:8080
```

```
curl -v \
    -H 'X-GitHub-Event: push' \
    -H 'X-Hub-Signature: sha1=d9340af41aff9ff9a63990bd42a316f304e6679a' \
    -H 'Content-Type: application/json' \
    -d '{"ref": "refs/heads/main", "head_commit":{"id": "a99d19668565f80e0a911b9cb22ec5ef48a7e4e8"}, "repository":{"clone_url":"git@github.com:sa-mw-dach/local-news-shift.git"}, "image_repo": "docker.io/maxisses"}' \
    http://localhost:9998
```

{% hint style="info" %}
That cryptic sha1 value is actually the HMAC generated signature of the JSON payload. If it doesn't match the JSON the Event Listener will reject it. On Unix you can just generate it like so:
{% endhint %}

```
echo -n '{"ref": "refs/heads/main", "head_commit":{"id": "a99d19668565f80e0a911b9cb22ec5ef48a7e4e8"}, "repository":{"clone_url":"git@github.com:sa-mw-dach/local-news-shift.git"}, "image_repo": "docker.io/maxisses"}' | openssl sha1 -hmac "would_come_from_your_github"
```

We should immediatly see a new PipelineRun in our OpenShift Cluster and can follow its progress and the logs via the UI. And pretty soon we should again see the entire Local News application deployed in the newsbackend-integration Namespace. And if you would look closer into the YAML files in the repo you would see that in that last step the commit ID from git serves as the Image Tag. So we know that everything went as expected once we see the ID ("a99d19668565f80e0a911b9cb22ec5ef48a7e4e8").&#x20;

```
oc get deployments -n newsbackend-integration-gitops news-backend -o jsonpath="{.spec.template.spec.containers[:1].image}
```
