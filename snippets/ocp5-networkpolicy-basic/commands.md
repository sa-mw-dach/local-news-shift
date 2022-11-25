# NetworkPolicies
This tutorial describes how to deploy the local news application with network policies restricting traffic flows. This has been tested on OCP 4.10.

## Prerequisites 
The tutorial expects that you have already created a project, e.g. 'localnews' in OpenShift. Make sure to set the OCP_PROJECT and OCP_DOMAIN variables because they will be used throughout the following commands.

    OCP_PROJECT=localnews
    oc project $OCP_PROJECT
    OCP_DOMAIN=$(oc whoami --show-server=true | sed -E 's/https:\/\/api\.|:6443//g')
 
## Deploy the NetworkPolicies 
 
You can deploy the application with NetworkPolcicies that restricts communication to the minimum that is necessary to function correctly.
    
    helm upgrade -i localnews k8s/helm-chart -f k8s/helm-chart/values-openshift.yaml \
    --set localnews.domain=$OCP_DOMAIN \
    --set localnews.networkpolicysecurity="on"
    
## Verify the restricted access between components
You can, for example, try to access the news-backend from the new-frontend before and after deploying the NetworkPolicies. Note, that it is NOT necessary to have access from news-frontend to news-backend because both are accessed via your browser (JavaScript).

    oc exec deployment/news-frontend -- curl news-backend:8080 


## ACS Installation
oc apply -f snippets/ocp5-networkpolicy-basic/subscription.yaml
oc apply -f snippets/ocp5-networkpolicy-basic/clusterserviceversion.yaml
oc apply -f snippets/ocp5-networkpolicy-basic/namespace.yaml
oc apply -f snippets/ocp5-networkpolicy-basic/central.yaml

## get password with username admin 
oc -n stackrox get secret central-htpasswd -o go-template='{{index .data "password" | base64decode}}'

## login at https url with admin user
oc -n stackrox get route central -o jsonpath="{.status.ingress[0].host}"

## install roxctl (on macOS - https://docs.openshift.com/acs/3.72/cli/getting-started-cli.html)
curl -O https://mirror.openshift.com/pub/rhacs/assets/3.72.1/bin/Darwin/roxctl
xattr -c roxctl
chmod +x roxctl
cp roxctl /usr/local/bin

## authenticate roxctl
# get it at https://<stackrox-domain>/main/integrations/authProviders/apitoken/create
export ROX_API_TOKEN=**************
export ROX_CENTRAL_ADDRESS=$(oc -n stackrox get route central -o jsonpath="{.status.ingress[0].host}")

## generate an init bundle
roxctl -e "https://($ROX_CENTRAL_ADDRESS):443" central init-bundles generate max-init-bundle --output-secrets cluster_init_bundle.yaml
oc create -f cluster_init_bundle.yaml -n stackrox

## register the acs hub cluster also as secured cluster
oc apply -f securedcluster.yaml




