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
A pretty cool feature of OpenShift is that it actually saves you a lot of YAML-work with a Graphical Pipeline Builder, completely integrated into the OpenShift UI. ![](<../.gitbook/assets/image (4).png>)And you might even just deploy an application with "oc new-app" and directly&#x20;
{% endhint %}

## **RBAC**

Now here you would probably expect some sign
