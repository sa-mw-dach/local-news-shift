# Build: From upstream Tekton and ArgoCD to OpenShift Pipelines and GitOps

Let us assume you are familiar with upstream Tekton and ArgoCD. If you are actually not - don't worry, you'll learn about it here. Either way, suppose you have built a Pipeline with Tekton that clones a Repo, builds a Quarkus application with maven, builds and pushes a container Image and finally deploys a polyglot application (consisting of 5 different components) via a Helm Chart to Kubernetes. And, of course, you are triggering the whole Pipeline with some sort of activity in Git (such as a git push, release, merge .. )

Now you move to OpenShift and want to leverage the same functionalities, fully supported, integrated into your OpenShift IAM and OpenShifts built-in Security.&#x20;

That is what you get with OpenShift Pipelines (Tekton) and OpenShift GitOps (ArgoCD).

How quick are you up and running, what brings OpenShift to the table on top of what you already know and, also, what do you need to tweak to implement security best-practises that OpenShift enforces?
