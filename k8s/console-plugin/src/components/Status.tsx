import { Card, CardBody, CardFooter, CardHeader, CardHeaderMain, CardTitle, FlexItem, Flex, DataList, DataListCell, DataListItem, DataListItemCells, DataListItemRow, DataListToggle, DataListContent } from '@patternfly/react-core';
import { ChartDonut } from '@patternfly/react-charts';
import { TableComposable, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import * as React from 'react';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/cube-icon';
import {useK8sWatchResource} from '@openshift-console/dynamic-plugin-sdk';
//import { useK8sModel } from '@openshift-console/dynamic-plugin-sdk';

export default function AcsView() {
  const [expanded, setExpanded] = React.useState(['ex2-toggle4']);
  let [metrics] = React.useState(new Array<Map<string, number>>());
  
  const toggle = id => {
    const index = expanded.indexOf(id);
    const newExpanded: string[] =
      index >= 0 ? [...expanded.slice(0, index), ...expanded.slice(index + 1, expanded.length)] : [...expanded, id];
    setExpanded(newExpanded);
  };
  
  const fetchMetrics = (index: number, url: string) => {
    fetch("http://" + url + "/q/metrics", {
    
    })
    .then((response) => response.text())
    .then((data) => {
       metrics[index] = new Map<string, number>();
       data.split('\n')
         .filter(line => !line.startsWith("#"))
         .forEach(line => metrics[index].set(line.split(" ")[0], parseInt(line.split(" ")[1])));
       //console.log(url);
       //console.log(metrics[index]);
       //console.log(metrics[index]?.get("application_feedsAnalyzed"));
    })
    
  };
  
  const computeBackendUrl = (comp: any) => {
    return comp.spec.newsbackend.name+"-" + comp.metadata.namespace +".apps." + comp.spec.localnews.domain
  };

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
    
    const [feedAnalysisCrd] = useK8sWatchResource<any>({
      groupVersionKind: {
        version: 'v1',
        group: 'apiextensions.k8s.io',
        kind: 'CustomResourceDefinition',
      },
      name: 'feedanalysis.kubdev.apress.com',
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
    
    let feedscrapers = useK8sWatchResource<any[]>({
      groupVersionKind: {
        version: 'v1alpha1',
        group: 'kubdev.apress.com',
        kind: 'FeedAnalysis',
      },
      isList: true,
      namespaced: true,
    });
    
    
    let crdNewsAppStatusOk = localNewsAppCrd != null ? localNewsAppCrd?.spec?.versions.map(t => t.name).join(", ") : 'not installed';
    let crdfeedAnalysisStatusOk = feedAnalysisCrd != null ? feedAnalysisCrd?.spec?.versions.map(t => t.name).join(", ") : 'not installed';

    return (
	       console.log(localNewsAppCrd),
        <React.Fragment>
        <Card>
            <CardHeader>
            <CardHeaderMain>
                <Flex>
                    <FlexItem><PlusCircleIcon/></FlexItem>
                    <FlexItem><CardTitle>LocalNewsApp CRD: </CardTitle><p color="green">{ crdNewsAppStatusOk }</p></FlexItem>
                </Flex>
                <Flex>
                    <FlexItem><PlusCircleIcon/></FlexItem>
                    <FlexItem><CardTitle>FeedAnalysis CRD: </CardTitle><p color="green">{ crdfeedAnalysisStatusOk }</p></FlexItem>
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
                              <DataListToggle
                                onClick={() => toggle('ex-toggle' + index)}
                                isExpanded={expanded.includes('ex-toggle' + index)}
                                id="ex-toggle1"
                                aria-controls={"ex-expand" + index}
                              />
                              <DataListItemCells
                                dataListCells={[
                                  <DataListCell key={index}>
                                    <span id="simple-item1">{comp.metadata.name}</span>
                                  </DataListCell>,
                                  <DataListCell key={index}>
                                    <span id="simple-item1"><a href={"/k8s/cluster/projects/" + comp.metadata.namespace}>{comp.metadata.namespace}</a></span>
                                  </DataListCell>,
                                  <DataListCell key="secondary content">{comp.status?.conditions.filter(t => t.status == 'True').map(t => t.type).join(", ")}</DataListCell>,
                                  <DataListCell key="secondary content">{metrics[index]?.get("application_feedsAnalyzed")}</DataListCell>
                                ]}
                              />
                            </DataListItemRow>
                            <DataListContent
                              aria-label="First expandable content details"
                              id={"ex-expand" + index}
                              isHidden={!expanded.includes('ex-toggle' + index)}
                            >
                              <p>
                                <div style={{ height: '300px', width: '350px' }}>
                                <ChartDonut
                                  ariaDesc="Average number of pets"
                                  ariaTitle="Donut chart example"
                                  constrainToVisibleArea
                                  data={[{ x: 'FeedsAnalyzed ', y: metrics[index]?.get("application_feedsAnalyzed") }, { x: 'Duplicates', y: metrics[index]?.get("application_duplicateFeeds") }, { x: 'Other', y: 0 }]}
                                  labels={({ datum }) => `${datum.x}: ${datum.y}%`}
                                  legendData={[{ name: 'Analyzed: ' + metrics[index]?.get("application_feedsAnalyzed")}, { name: 'Duplicates: ' + metrics[index]?.get("application_duplicateFeeds") }, { name: 'Other: 0' }]}
                                  legendOrientation="vertical"
                                  legendPosition="right"
                                  name="chart2"
                                  padding={{
                                    bottom: 20,
                                    left: 20,
                                    right: 140, // Adjusted to accommodate legend
                                    top: 20
                                  }}
                                  subTitle="News Scraped"
                                  title={'' + metrics[index]?.get("application_createFeedsRequest_total")}
                                  height={300}
                                  width={300}
                                />
                                </div>
                               <TableComposable aria-label="Sortable table">
                                  <Thead>
                                    <Tr>
                                      <Th width={50}>Scraper</Th>
                                      <Th>URLs</Th>    
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                      <Tr key="0">
                                        <Td>Default</Td>
                                        <Td modifier="wrap">{comp.spec.feedscraper.envVars.feeds.value}</Td>                                 
                                      </Tr>
                                    {feedscrapers[0].filter(s => s.metadata.namespace == comp.metadata.namespace).map((scraper, rowIndex) => (
                                      <Tr key={rowIndex + 1}>
                                        <Td>{scraper.metadata.name}</Td>
                                        <Td>{scraper?.spec.feedscraper.envVars.feeds.value}</Td>                                 
                                      </Tr>
                                    ))}
                                  </Tbody>
                                </TableComposable>
                               {fetchMetrics(index, computeBackendUrl(comp))}
                              </p>
                            </DataListContent>
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

