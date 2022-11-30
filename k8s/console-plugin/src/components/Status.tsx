import { Card, CardBody, CardFooter, CardHeader, CardHeaderMain, CardTitle, FlexItem, Flex, DataList, DataListCell, DataListItem, DataListItemCells, DataListItemRow } from '@patternfly/react-core';
import * as React from 'react';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/cube-icon';
import {useK8sWatchResource} from '@openshift-console/dynamic-plugin-sdk';
//import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

export default function AcsView() {
  

    const [localNewsAppCrd] = useK8sWatchResource<any>({
        groupVersionKind: {
          version: 'v1',
          group: 'apiextensions.k8s.io',
          kind: 'CustomResourceDefinition',
        },
        name: 'localnewsapps.kubdev.apress.com',
        isList: false,
        namespaced: false,
      });
      
      let localNewsApps = useK8sWatchResource<any[]>({
        groupVersionKind: {
          version: 'v1alpha1',
          group: 'kubdev.apress.com',
          kind: 'LocalNewsApp',
        },
        isList: true,
        namespaced: true,
      });
      
      let crdStatusOk = localNewsAppCrd != null ? 'ok' : 'not installed';
    

    return (
	
        <React.Fragment>
        <Card>
            <CardHeader>
            <CardHeaderMain>
                <Flex>
                    <FlexItem><PlusCircleIcon/></FlexItem>
                    <FlexItem><CardTitle>LocalNewsAppCrd: </CardTitle><p color="green">{ crdStatusOk }</p></FlexItem>
                </Flex>
            </CardHeaderMain>
            </CardHeader>
            
            <CardBody>
            

            </CardBody>
            <CardFooter>
                <DataList aria-label="Simple data list example">
                <DataListItem aria-labelledby="simple-item1">
                            <DataListItemRow>
                              <DataListItemCells
                                dataListCells={[
                                  <DataListCell>
                                    <span id="simple-item1"><b>NewsApp name</b></span>
                                  </DataListCell>,
                                  <DataListCell>
                                    <span id="simple-item1"><b>Project</b></span>
                                  </DataListCell>,
                                  <DataListCell key="secondary content"><b>Status</b></DataListCell>,
                                  <DataListCell key="secondary content"><b>Feeds</b></DataListCell>
                                ]}
                              />
                            </DataListItemRow>
                          </DataListItem>

                { localNewsApps[0].map(function (comp, index) {
                    if (localNewsApps[0].length > 0 ) {

                        return (
                            <DataListItem aria-labelledby="simple-item1">
                            <DataListItemRow>
                              <DataListItemCells
                                dataListCells={[
                                  <DataListCell key={index}>
                                    <span id="simple-item1">{comp.metadata.name}</span>
                                  </DataListCell>,
                                  <DataListCell key={index}>
                                    <span id="simple-item1"><a href={comp.metadata.namespace}>{comp.metadata.namespace}</a></span>
                                  </DataListCell>,
                                  <DataListCell key="secondary content">{comp.status.conditions.filter(t => t.status == 'True').map(t => t.type).join(", ")}</DataListCell>,
                                  <DataListCell key="secondary content">unknown</DataListCell>
                                ]}
                              />
                            </DataListItemRow>
                          </DataListItem>
                        )    
                    }
                    else {
                        return (
                            <></>
                        )
                    }
                })}
                </DataList>
                
            </CardFooter>
        </Card>


        </React.Fragment>
    );
}

