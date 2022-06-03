# Adapting the Helm Chart

```
helm upgrade -i localnews k8s/helm-chart -f k8s/helm-chart/values-openshift.yaml
```

helm upgrade -i localnews k8s/helm-chart -f k8s/helm-chart/values-openshift.yaml --set newsfrontend.envVars.backend.prefix.value="http://" --set newsfrontend.envVars.backend.nodePort.value="80" --set localnews.domain="pairs-63bfee21520d44b1a6365103e4b1c7db-0000.eu-de.containers.appdomain.cloud"
