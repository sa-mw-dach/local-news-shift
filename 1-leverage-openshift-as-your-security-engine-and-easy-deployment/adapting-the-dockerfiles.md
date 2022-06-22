# Adapting the Dockerfiles

## News-Frontend component: Angular with NGINX&#x20;

In the Helm Chart we see that the Image quay.io/k8snativedev/news-frontend:latest causes the trouble.&#x20;

If we look at the Dockerfile we see that the Image runs a standard nginx from docker.io, exposes port 80 - the standard for nginx - and finally starts nginx. In the CMD we can see that a "settings.template.json" file replaces the standard "settings.json". This allows for setting environment variables at each startup of the container.&#x20;

```
# Stage 1: build the app
FROM registry.access.redhat.com/ubi7/nodejs-12 AS builder
WORKDIR /opt/app-root/src
COPY package.json /opt/app-root/src
RUN npm install
COPY . /opt/app-root/src
RUN ng build --configuration production

# Stage 2: serve it with nginx
FROM nginx AS deploy
LABEL maintainer="Max Dargatz"
COPY --from=builder /opt/app-root/src/dist/news-frontend /usr/share/nginx/html
EXPOSE 80
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/settings.template.json > /usr/share/nginx/html/assets/settings.json && exec nginx -g 'daemon off;'"]

```

While Stage 1, the build stage, already works with a Red Hat Universal Base Image (UBI) that per default runs with a non-root user, that can only access a predefined directory, Stage 2, the serving stage, has a few security issues here to solve.&#x20;

1.  **Non-Root User**

    Nginx from DockerHub runs per default with a root user - OpenShift doesn't accept this security risk
2. **Priviledged Ports**\
   If we switch to a non-priviledged user we can't use a priviledged port between 80 - 1024
3. **Specifically grant access to directories**\
   In OpenShift each Namespace/Project has a pool of user IDs to draw from. It then starts your Container with one of them, overriding whatever user ID the image itself may specify. The problem here is that this "random" user will not have access to _/usr/share/nginx/html/assets/._ But as you can see in our CMD instruction we substitute the values of some environment variables. We put some code into our Angular App to be able to set Environment Variables at startup and stream them in via the _settings.template.json_ file.

Now the third part is exactly the reason why two of our components failed to start. They want to start as root, but get assigned a different UID and, hence, are not able to run, because root was expected.

Now what are options to make our Container more secure?

1. **Run NGINX unpriviledged**
2. **Rewrite the nginx.conf to Listen on Port 8080**
3. **Grant our "random" user access to the **_**assets**_** folder**



\--> news-frontend

\--> location-extractor, multi stage,&#x20;

\--> certified images



Ok all Images run, but... does it work now? Ofc course not - Ports are wrong, cluster domain has to be adapted
