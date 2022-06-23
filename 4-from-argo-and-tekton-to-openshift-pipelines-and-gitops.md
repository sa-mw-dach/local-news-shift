# Build: From upstream Tekton and ArgoCD to OpenShift Pipelines and GitOps

Imagine you are familiar with upstream Tekton and ArgoCD and you have built a Pipeline with Tekton that clones a Repo, builds a Quarkus application with maven, builds and pushes a container Image and finally deploys a polyglot application (consisting of more than just this Quarkus Backend) via a Helm Chart to Kubernetes. And, of course, you are triggering the whole Pipeline with some sort of activity in Git (such as a git push, release, merge .. )

Now you move to OpenShift and want to leverage the same functionalities, fully supported, integrated into your OpenShift IAM and OpenShifts built-in Security.&#x20;

And that is exactly what OpenShift gives you with OpenShift Pipelines (Tekton) and OpenShift GitOps (ArgoCD).

How quick are you up and running, what is it that OpenShift brings to table on top of what you already know and, also, what do you need to tweak to adhere to security best-practises OpenShift enforces?
