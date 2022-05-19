# OpenShift GitOps

## Installation

Again Let us start with the basics. How do you install ArgoCD into your cluster? Also ArgoCD comes with a community Operator or you can install it via Helm. But just as Tekton in OpenShift you do it via the integrated OperatorHub which can be accessed via the UI or a simple YAML file. This installs you the fully supported OpenShift GitOps Operator. While the Pipelines UI integrated into OpenShift is already pretty powerful, the first significant steps towards this for GitOps have been made with OpenShift v4.10.

```
oc apply -f snippets/chapter5/openshift/operators-subs/pipelines-operator-sub.yaml
```

