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
2. But there is a much easier way. OpenShift ships with a lot of so-called ClusterTasks and basically all of the steps you see below are well covered by them.
3. ![](<../.gitbook/assets/image (2).png>)

![](<../.gitbook/assets/image (3).png>)
