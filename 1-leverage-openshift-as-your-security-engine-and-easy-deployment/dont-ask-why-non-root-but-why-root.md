# Don't ask why non-root but why root!

The [`OpenShift documentation`](https://docs.openshift.com/container-platform/4.10/security/container\_security/security-hosts-vms.html) says:

> To further protect RHCOS systems in OpenShift Container Platform clusters, most containers, except those managing or monitoring the host system itself, should run as a non-root user. Dropping the privilege level or creating containers with the least amount of privileges possible is recommended best practice for protecting your own OpenShift Container Platform clusters.

So one may ask why is it necessary? But actually it is the wrong question! Because if something does not need root access, it shouldn't have it to make the attack surface minimal.

Let's see if we took care of it in our sample application. There is a Helm Chart ready to deploy the Local News application, but it has not been tested on OpenShift.

```
git clone repo
cd repo
oc login
oc new-project localnews
helm install localnews k8s/helm-chart
```

That should deliver the result in the image.

![Helm Release in OCP v4.10](<../.gitbook/assets/image (4).png>)

Two components of our application are in a degraded state. Let's have a look with

```
oc get pods
```

Two of our Pods are in "CrashLoopBackOff" state and if we look into the logs of these Pods we see a permission denied. They are running as root!

![](<../.gitbook/assets/image (5) (1).png>)

Let's fix it by having a look at the Dockerfile.
