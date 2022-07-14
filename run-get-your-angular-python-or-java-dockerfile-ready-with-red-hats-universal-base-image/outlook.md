# Outlook

In this article we learned a few things about how OpenShift and the UBI helps you to build and run your Apps, on a unified, regularly updated and patched basis, more securely. And I can tell you that was I was pretty pleased with myself after fixing these issues, somewhat like the guy in the picture (yep, I like MMA :) ).

<img src="../.gitbook/assets/image (7).png" alt="" data-size="original">

But, unfortunately, ensuring an advanced level of container security takes a few more steps. And after scanning my application with Red Hat Advanced Cluster Security (ACM), my feelings were much closer to this:

![](<../.gitbook/assets/image (9).png>)

My application urgently needed:

* a rebuild with current versions of the UBI to fix some CVEs,&#x20;
* Resource Limits to ensure it makes no noisy neighbour things,&#x20;
* to run with a non-default service accountI, because that one mounts the kubeconfig,&#x20;
* the removal of package managers that were present in a few images, which makes installing malicious tools at least a possibility
* a solution for an anomalous egress from my database
* and a few more less severe things...

You probably won't require a fix for all the issue right from development all the way to production. For instance, in development you might want to have some advanced debug options. But, if you really care about container security, do the homework that OpenShift gives you and, additionally, consult a tool such as ACM to help you run securely in production. [Here](https://www.opensourcerers.org/2022/03/21/security-aspects-with-openshift-an-overview/) is a good read and a good [view](https://www.youtube.com/watch?v=-OTEweJOjDw) to dive deeper on the topic.

That concludes the first part and it focussed solely on RUNNING our application. Stay tuned for the next 3 parts about developing, then building and finally delivering your application as an Operator with GitOps.

