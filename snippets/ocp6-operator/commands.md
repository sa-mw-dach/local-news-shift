# Deploy the Local News Operator to OpenShift
This tutorial describes how to deploy the local news operator to OpenShift. This has been tested on OCP 4.10.

## Clone the repository
    git clone https://github.com/Apress/Kubernetes-Native-Development

## Create a new project to generate your operator
If you want to create your own operator follow theses steps. If you want to stick with the existing one you can skip this

    mkdir k8s/operator/my-own-operator
    cd k8s/operator/my-own-operator
    operator-sdk init --plugins helm --helm-chart ../../helm-chart
    
## RBAC considerations for non-cluster-admins
Create the necessary roles to manage the CRDs. This step requires the permission to create ClusterRoles. You can skip this when you are going to use a user with cluster admin permissions.

    oc login <admin>
    OCP_USER=$(oc whoami)
    oc apply -f snippets/ocp6-operator/crd-role.yaml
    cd k8s/operator/news-operator-helm
    oc apply -f config/rbac/role.yaml
    oc adm policy add-cluster-role-to-user manager-role $OCP_USER
    oc adm policy add-cluster-role-to-user crd-role $OCP_USER
    
## Running the operator locally
Run the operator locally with the make command and create a new local news CR.
      
    oc login 
    oc new-project localnews-operator 
    make -C k8s/operator/news-operator-helm install run
    
In another tab create the CR of type LocalNewsApp to trigger the operator. Determine your cluster base domain and add it to snippets/ocp6-operator/localnews.yaml. Then create the CR.

    #In another terminal tab from the git root folder
    #Determine the cluster base domain
    oc whoami --show-server=true | sed -E 's/https:\/\/api\.|:6443//g'
    # Create the CR after adding the domain to the snippets/ocp6-operator/localnews.yaml
    oc apply -f snippets/ocp6-operator/localnews.yaml 
    
### Test config drift
You can demonstrate that the Helm operator prohibits config drift by scaling down one of the components or even deleting the whole deployment.

    oc delete deployment news-backend
    oc get deployments

    NAME                  READY   UP-TO-DATE   AVAILABLE      AGE
    feed-scraper           1/1        1            1             3h51m
    location-extractor     1/1        1            1             3h51m
    news-backend           0/1        1            0             3s
    news-frontend          1/1        1            1             3h51m
    postgis                1/1        1            1             3h51m

### Clean up
Clean up the cluster for the next steps.

    oc delete -f snippets/ocp6-operator/localnews.yaml
    oc delete project localnews-operator 

## Deploying the Operator to OpenShift
Instead of running it locally you can deploy the operator to OpenShift. Before that you must build an image and push it to a registry accessible from OpenShift.

    # Build the image and push it to the registry
    make -C k8s/operator/news-operator-helm docker-build docker-push IMG=<Your Image URL>
    # Deploy the operator and create the CR
    make -C k8s/operator/news-operator-helm deploy IMG=<Your Image URL>
    oc new-project localnews-operator 
    oc apply -f snippets/ocp6-operator/localnews.yaml 
    
### Clean up
Clean up the cluster for the next steps.

    oc delete -f snippets/ocp6-operator/localnews.yaml
    oc delete project localnews-operator
    make -C k8s/operator/news-operator-helm undeploy IMG=quay.io/k8snativedev/news-operator:0.0.1-openshift

## Making our Operator available for OLM
Create a bundle, build an image of the bundle and push it. Then build and push the catalog.

    make -C k8s/operator/news-operator-helm bundle IMG=<Your Image URL>
    make -C k8s/operator/news-operator-helm bundle-build bundle-push BUNDLE_IMG=<Your Bundle Image URL>
    make -C k8s/operator/news-operator-helm catalog-build catalog-push CATALOG_IMG=<Your Catalog Image URL> BUNDLE_IMGS=<Your Image URL>
    
To add the catalog to OpenShift create the CatalogSource:

    oc apply -f snippets/ocp6-operator/localnews-catalogsource.yaml
    
You can now pick it up from the OperatorHub page.
    

   