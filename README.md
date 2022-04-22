# Introduction

Red Hat OpenShift is one of the most sought after Enterprise Kubernetes Platforms, is 100 % Open Source and fully builds on Kubernetes. But it is much more than Kubernetes! It integrates hundreds of upstream OpenSource projects, enforces security for the enterprise and does not only support the run and operate but also the develop and build phases, hence, the entire software lifecycle.

To deliver on its promise of Security and Integration of the different Open Source upstream projects - which are not only used, but also strongly backed by Red Hat - you might need to make some tweaks to an application that you now operate with docker, docker-compose or a Kubernetes Service from one of the Cloud Providers whatsoever.

Coincidentally, we built application in line with the book [Kubernetes Native Development](https://www.amazon.de/Kubernetes-Native-Development-Develop-Applications/dp/1484279417) that we ran on minikube and a cloud-based Kubernetes Service. And we didn't just write code and put them into containers, but we also used several Open Source projects to develop directly on and with Kubernetes, to enhance the application, to provide CI/CD pipelines and GitOps and we even built an operator to make sharing, installation and Day-2 operations simple. Some of these Open Source projects are integrated into OpenShift, some are not.

In this article we will examine what works out of the box and what needs tweaking when we move our application to OpenShift!\
\


