# Scaling App Deployment with ACM

Hopefully, the added value from GitOps is obvious now. In real life, we might have multiple instances of our application. Either for different tenants or because we have different stages.

And here OpenShift GitOps has an especially powerful concept that builds on ArgoCD ApplicationSets and Red Hat Advanced Cluster Management (ACM). ACM can be used&#x20;

```
oc apply -f snippets/chapter5/openshift/ACM-AppSets/acm-operator.yaml
oc apply -f snippets/chapter5/openshift/ACM-AppSets/multiclusterhub.yaml
```

```
oc apply -f snippets/chapter5/openshift/ACM-AppSets/acm-gitops-connection.yaml
```

```
oc apply -f snippets/chapter5/openshift/ACM-AppSets/appset.yaml
```
