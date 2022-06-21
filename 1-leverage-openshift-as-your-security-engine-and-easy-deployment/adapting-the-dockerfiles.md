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

1. Nginx runs per default with a root user
2. Port 80 should be avoided
3.



\--> news-frontend

\--> location-extractor, multi stage,&#x20;

\--> certified images



Ok all Images run, but... does it work now? Ofc course not - Ports are wrong, cluster domain has to be adapted
