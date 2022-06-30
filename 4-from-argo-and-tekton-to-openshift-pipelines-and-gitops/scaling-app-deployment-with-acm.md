# Scaling App Deployment with ACM

Hopefully, the added value from GitOps is obvious now. In real life, we might have multiple instances of our application. Either for different tenants or because we have different stages.

And here OpenShift GitOps has an especially powerful concept that builds on ArgoCD ApplicationSets and Red Hat Advanced Cluster Management (ACM). ACM can be used to deploy, manage and destroy clusters across on-premises and hyperscalers. And you can do a lot more of course - one thing we want to focus on is, that it can help you deploy and manage applications across cluster.

Therefore, we have to install the ACM operator and then roll it out with those two yaml-Files.&#x20;

```
oc apply -f snippets/chapter5/openshift/ACM-AppSets/acm-operator.yaml
oc apply -f snippets/chapter5/openshift/ACM-AppSets/multiclusterhub.yaml
```

Then we have to tell the ACM which GitOps installation it should use to roll out applications.

```
oc apply -f snippets/chapter5/openshift/ACM-AppSets/acm-gitops-connection.yaml
```

And, lastly, we roll out an ArgoCD Application Set, that creates an ArgoCD application per selected cluster, that we want to roll-out the application to. In this example we do it, based on a specific label, each cluster has.

```
oc apply -f snippets/chapter5/openshift/ACM-AppSets/appset.yaml
```
