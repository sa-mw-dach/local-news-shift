# Adapting the Dockerfiles

## News-Frontend component: Angular with NGINX&#x20;

In the Helm Chart we see that the Image quay.io/k8snativedev/news-frontend:latest causes the trouble. For ease of use we included a multi-stage build Dockerfile. It builds the application with _ng_ and makes the resulting artifact available to the next stage.&#x20;

If we look at the second stage of the Dockerfile we see that the Image runs a standard nginx from docker.io, exposes port 80 - the standard for nginx - and finally starts nginx. In the CMD we can see that a "settings.template.json" file replaces the standard "settings.json". This allows for setting environment variables at each startup of the container.&#x20;

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

While Stage 1, the build stage, already works with a Red Hat Universal Base Image (UBI) that per default runs with a non-root user, Stage 2, the serving stage, has a few security issues here to solve.&#x20;

1.  **Non-Root User**

    Nginx from DockerHub runs per default with a root user - OpenShift doesn't accept this security risk
2. **Priviledged Ports**\
   If we switch to a non-priviledged user we can't use a priviledged port between 80 - 1024
3. **Specifically grant access to directories**\
   In OpenShift each Namespace/Project has a pool of user IDs to draw from. It then starts your Container with one of them, overriding whatever user ID the image itself may specify. The problem here is that this "random" user will not have access to _/usr/share/nginx/html/assets/._ But as you can see in our CMD instruction we substitute the values of some environment variables. We put some code into our Angular App to be able to set Environment Variables at startup and stream them in via the _settings.template.json_ file.

Now the third part is exactly the reason why two of our components failed to start. They want to start as root, but get assigned a different UID and, hence, are not able to run, because root was expected.

Now what are options to make our Container more secure?

1. **Run NGINX unpriviledged**
2. **Rewrite the nginx.conf to Listen on an unpriviledged port**
3. **Grant our "arbitrary" user access to the **_**assets**_** folder**

### Solving issue 1 & 2

While it seems like we need a customized nginx base image and have to bother with the config files - actually, we don't. We will just use the Universal Base Image (UBI) from Red Hat that runs an unpriviledged nginx listening on port 8080. This is a certified and, running on OpenShift, fully supported base image you can find [here](https://catalog.redhat.com/software/containers/ubi8/nginx-120/6156abfac739c0a4123a86fd?container-tabs=overview). So we change the base image for Stage 2 to __&#x20;

```
# Stage 2: serve it with nginx
FROM registry.access.redhat.com/ubi8/nginx-120 AS deploy
```

### Solving issue 3

If you review the Dockerfile of the UBI we use as the base image you see that it uses User 1001. So it is tempting to give the permissions to _/opt/app-root/src/assets_ to User 1001. But, remember, OpenShift is overwriting this UID. Therefore, we have to take a different approach.

For an image to support running as an arbitrary user, directories and files that may be written to by processes in the image should be owned by the root group and be read/writable by that group. Files to be executed should also have group execute permissions.

Adding the following to our Dockerfile sets the directory and file permissions to allow users in the root group to access them in the built image:

```
RUN chgrp -R 0 /opt/app-root/src/assets && \
    chmod -R g=u /opt/app-root/src/assets
```

Because the container user is always a member of the root group, the container user can read and write these files. The root group does not have any special permissions (unlike the root user) so there are no security concerns with this arrangement.

### Final result

```
# Stage 1: build the app
FROM registry.access.redhat.com/ubi8/nodejs-14 AS builder
WORKDIR /opt/app-root/src
COPY package.json /opt/app-root/src
RUN npm install
COPY . /opt/app-root/src
RUN ng build --configuration production

# Stage 2: serve it with nginx
FROM registry.access.redhat.com/ubi8/nginx-120 AS deploy
WORKDIR /opt/app-root/src
LABEL maintainer="Max Dargatz"
COPY --from=builder /opt/app-root/src/dist/news-frontend .

## customize for file permissions for rootless
RUN chgrp -R 0 /opt/app-root/src/assets && \
    chmod -R g=u /opt/app-root/src/assets

USER 1001
EXPOSE 8080
CMD ["/bin/sh",  "-c",  "envsubst < /opt/app-root/src/assets/settings.template.json > /opt/app-root/src/assets/settings.json && exec nginx -g 'daemon off;'"]

```

## The other components: Python & Java

For the other components we will not go into the same depth. But again you can leverage the UBI to solve security issues, get Red Hat's Enterprise Support and fetch your images from a vetted source.

### Python



```
# Stage 1: package the app and dependencies in a venv
FROM registry.access.redhat.com/ubi8/python-39 as build
WORKDIR /opt/app-root/src
RUN python -m venv /opt/app-root/src/venv
ENV PATH="/opt/app-root/src/venv/bin:$PATH"
COPY requirements.txt .
RUN pip3 install -r requirements.txt && python3 -m spacy download en_core_web_md

# Stage 2: start the application with gunicorn
FROM registry.access.redhat.com/ubi8/python-39
WORKDIR /opt/app-root/src
COPY --from=build /opt/app-root/src/venv ./venv
COPY ./src /opt/app-root/src/src
ENV PATH="/opt/app-root/src/venv/bin:$PATH"
USER 1001
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "src.wsgi:app" ]
```

### Java & Quarkus

