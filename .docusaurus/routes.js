import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/foo/__docusaurus/debug',
    component: ComponentCreator('/foo/__docusaurus/debug', 'aab'),
    exact: true
  },
  {
    path: '/foo/__docusaurus/debug/config',
    component: ComponentCreator('/foo/__docusaurus/debug/config', '2df'),
    exact: true
  },
  {
    path: '/foo/__docusaurus/debug/content',
    component: ComponentCreator('/foo/__docusaurus/debug/content', 'd7f'),
    exact: true
  },
  {
    path: '/foo/__docusaurus/debug/globalData',
    component: ComponentCreator('/foo/__docusaurus/debug/globalData', '6cf'),
    exact: true
  },
  {
    path: '/foo/__docusaurus/debug/metadata',
    component: ComponentCreator('/foo/__docusaurus/debug/metadata', '3dd'),
    exact: true
  },
  {
    path: '/foo/__docusaurus/debug/registry',
    component: ComponentCreator('/foo/__docusaurus/debug/registry', '177'),
    exact: true
  },
  {
    path: '/foo/__docusaurus/debug/routes',
    component: ComponentCreator('/foo/__docusaurus/debug/routes', '347'),
    exact: true
  },
  {
    path: '/foo/blog',
    component: ComponentCreator('/foo/blog', 'c89'),
    exact: true
  },
  {
    path: '/foo/blog/archive',
    component: ComponentCreator('/foo/blog/archive', '475'),
    exact: true
  },
  {
    path: '/foo/blog/authors',
    component: ComponentCreator('/foo/blog/authors', '734'),
    exact: true
  },
  {
    path: '/foo/blog/authors/alexanderfandos',
    component: ComponentCreator('/foo/blog/authors/alexanderfandos', '2ce'),
    exact: true
  },
  {
    path: '/foo/blog/authors/alexandervera',
    component: ComponentCreator('/foo/blog/authors/alexandervera', '35b'),
    exact: true
  },
  {
    path: '/foo/blog/authors/galonavarro',
    component: ComponentCreator('/foo/blog/authors/galonavarro', 'e96'),
    exact: true
  },
  {
    path: '/foo/blog/authors/jimkennedy',
    component: ComponentCreator('/foo/blog/authors/jimkennedy', '782'),
    exact: true
  },
  {
    path: '/foo/blog/authors/sergimiralles',
    component: ComponentCreator('/foo/blog/authors/sergimiralles', '2da'),
    exact: true
  },
  {
    path: '/foo/blog/tags',
    component: ComponentCreator('/foo/blog/tags', 'f40'),
    exact: true
  },
  {
    path: '/foo/blog/tags/phoenix',
    component: ComponentCreator('/foo/blog/tags/phoenix', '64b'),
    exact: true
  },
  {
    path: '/foo/blog/v1.0',
    component: ComponentCreator('/foo/blog/v1.0', '77f'),
    exact: true
  },
  {
    path: '/foo/blog/v1.1',
    component: ComponentCreator('/foo/blog/v1.1', '56d'),
    exact: true
  },
  {
    path: '/foo/blog/v1.2',
    component: ComponentCreator('/foo/blog/v1.2', '112'),
    exact: true
  },
  {
    path: '/foo/blog/v1.3',
    component: ComponentCreator('/foo/blog/v1.3', '83b'),
    exact: true
  },
  {
    path: '/foo/blog/v1.4',
    component: ComponentCreator('/foo/blog/v1.4', '99a'),
    exact: true
  },
  {
    path: '/foo/blog/v1.5',
    component: ComponentCreator('/foo/blog/v1.5', 'a89'),
    exact: true
  },
  {
    path: '/foo/markdown-page',
    component: ComponentCreator('/foo/markdown-page', '70e'),
    exact: true
  },
  {
    path: '/foo/search',
    component: ComponentCreator('/foo/search', '45d'),
    exact: true
  },
  {
    path: '/foo/docs',
    component: ComponentCreator('/foo/docs', 'f3c'),
    routes: [
      {
        path: '/foo/docs/v1.0',
        component: ComponentCreator('/foo/docs/v1.0', 'e18'),
        routes: [
          {
            path: '/foo/docs/v1.0',
            component: ComponentCreator('/foo/docs/v1.0', '555'),
            routes: [
              {
                path: '/foo/docs/v1.0/category/service-operator',
                component: ComponentCreator('/foo/docs/v1.0/category/service-operator', 'b21'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.0/service-operator/CEPH_SETUP',
                component: ComponentCreator('/foo/docs/v1.0/service-operator/CEPH_SETUP', 'e80'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.0/service-operator/DEPLOYMENT',
                component: ComponentCreator('/foo/docs/v1.0/service-operator/DEPLOYMENT', '85c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.0/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/foo/docs/v1.0/service-operator/GHCR_AUTHENTICATION', '865'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.0/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/foo/docs/v1.0/service-operator/GOOGLE_SSO_SETUP', '4d8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.0/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/foo/docs/v1.0/service-operator/IAAS_CONSOLE_CONFIGURATION', '677'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.0/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/foo/docs/v1.0/service-operator/INSTALL_BAREMETAL_NODE', '3dd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.0/service-operator/intro',
                component: ComponentCreator('/foo/docs/v1.0/service-operator/intro', 'bfb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.0/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/foo/docs/v1.0/service-operator/NETWORK_CONTROL_NODE_SETUP', 'b08'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.0/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/foo/docs/v1.0/service-operator/OBSERVABILITY_ALERTS', 'c4c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.0/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/foo/docs/v1.0/service-operator/OBSERVABILITY_DASHBOARDS', 'd90'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.0/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/foo/docs/v1.0/service-operator/OPERATOR_API_GUIDE', '9aa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.0/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/foo/docs/v1.0/service-operator/OS_REQUIREMENTS', 'aeb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.0/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/foo/docs/v1.0/service-operator/VPN_CONFIGURATION', 'bef'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/foo/docs/v1.1',
        component: ComponentCreator('/foo/docs/v1.1', 'fcd'),
        routes: [
          {
            path: '/foo/docs/v1.1',
            component: ComponentCreator('/foo/docs/v1.1', '689'),
            routes: [
              {
                path: '/foo/docs/v1.1/category/service-operator',
                component: ComponentCreator('/foo/docs/v1.1/category/service-operator', 'b84'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.1/service-operator/CEPH_SETUP',
                component: ComponentCreator('/foo/docs/v1.1/service-operator/CEPH_SETUP', '9fd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.1/service-operator/DEPLOYMENT',
                component: ComponentCreator('/foo/docs/v1.1/service-operator/DEPLOYMENT', '4e4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.1/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/foo/docs/v1.1/service-operator/GHCR_AUTHENTICATION', '6ba'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.1/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/foo/docs/v1.1/service-operator/GOOGLE_SSO_SETUP', 'b07'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.1/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/foo/docs/v1.1/service-operator/IAAS_CONSOLE_CONFIGURATION', 'e2c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.1/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/foo/docs/v1.1/service-operator/INSTALL_BAREMETAL_NODE', 'dab'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.1/service-operator/intro',
                component: ComponentCreator('/foo/docs/v1.1/service-operator/intro', 'dd2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.1/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/foo/docs/v1.1/service-operator/NETWORK_CONTROL_NODE_SETUP', '203'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.1/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/foo/docs/v1.1/service-operator/OBSERVABILITY_ALERTS', 'db4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.1/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/foo/docs/v1.1/service-operator/OBSERVABILITY_DASHBOARDS', '09a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.1/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/foo/docs/v1.1/service-operator/OPERATOR_API_GUIDE', '5cc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.1/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/foo/docs/v1.1/service-operator/OS_REQUIREMENTS', '1b9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.1/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/foo/docs/v1.1/service-operator/VPN_CONFIGURATION', '017'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/foo/docs/v1.2',
        component: ComponentCreator('/foo/docs/v1.2', 'f8a'),
        routes: [
          {
            path: '/foo/docs/v1.2',
            component: ComponentCreator('/foo/docs/v1.2', 'ab3'),
            routes: [
              {
                path: '/foo/docs/v1.2/category/service-operator',
                component: ComponentCreator('/foo/docs/v1.2/category/service-operator', 'dc2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.2/service-operator/CEPH_SETUP',
                component: ComponentCreator('/foo/docs/v1.2/service-operator/CEPH_SETUP', 'b11'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.2/service-operator/DEPLOYMENT',
                component: ComponentCreator('/foo/docs/v1.2/service-operator/DEPLOYMENT', 'ff4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.2/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/foo/docs/v1.2/service-operator/GHCR_AUTHENTICATION', '969'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.2/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/foo/docs/v1.2/service-operator/GOOGLE_SSO_SETUP', '0f8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.2/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/foo/docs/v1.2/service-operator/IAAS_CONSOLE_CONFIGURATION', '421'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.2/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/foo/docs/v1.2/service-operator/INSTALL_BAREMETAL_NODE', 'cd9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.2/service-operator/intro',
                component: ComponentCreator('/foo/docs/v1.2/service-operator/intro', '1f0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.2/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/foo/docs/v1.2/service-operator/NETWORK_CONTROL_NODE_SETUP', '9b1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.2/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/foo/docs/v1.2/service-operator/OBSERVABILITY_ALERTS', '504'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.2/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/foo/docs/v1.2/service-operator/OBSERVABILITY_DASHBOARDS', '246'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.2/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/foo/docs/v1.2/service-operator/OPERATOR_API_GUIDE', 'fff'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.2/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/foo/docs/v1.2/service-operator/OS_REQUIREMENTS', 'c91'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.2/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/foo/docs/v1.2/service-operator/VPN_CONFIGURATION', '2ca'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/foo/docs/v1.3',
        component: ComponentCreator('/foo/docs/v1.3', '360'),
        routes: [
          {
            path: '/foo/docs/v1.3',
            component: ComponentCreator('/foo/docs/v1.3', '546'),
            routes: [
              {
                path: '/foo/docs/v1.3/category/service-operator',
                component: ComponentCreator('/foo/docs/v1.3/category/service-operator', 'c82'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.3/service-operator/CEPH_SETUP',
                component: ComponentCreator('/foo/docs/v1.3/service-operator/CEPH_SETUP', '13a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.3/service-operator/DEPLOYMENT',
                component: ComponentCreator('/foo/docs/v1.3/service-operator/DEPLOYMENT', '494'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.3/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/foo/docs/v1.3/service-operator/GHCR_AUTHENTICATION', '313'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.3/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/foo/docs/v1.3/service-operator/GOOGLE_SSO_SETUP', '107'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.3/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/foo/docs/v1.3/service-operator/IAAS_CONSOLE_CONFIGURATION', 'ba5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.3/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/foo/docs/v1.3/service-operator/INSTALL_BAREMETAL_NODE', '911'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.3/service-operator/intro',
                component: ComponentCreator('/foo/docs/v1.3/service-operator/intro', '8b5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.3/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/foo/docs/v1.3/service-operator/NETWORK_CONTROL_NODE_SETUP', '09c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.3/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/foo/docs/v1.3/service-operator/OBSERVABILITY_ALERTS', '11c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.3/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/foo/docs/v1.3/service-operator/OBSERVABILITY_DASHBOARDS', 'a6e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.3/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/foo/docs/v1.3/service-operator/OPERATOR_API_GUIDE', '642'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.3/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/foo/docs/v1.3/service-operator/OS_REQUIREMENTS', '5a3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.3/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/foo/docs/v1.3/service-operator/VPN_CONFIGURATION', 'f3f'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/foo/docs/v1.4',
        component: ComponentCreator('/foo/docs/v1.4', '88b'),
        routes: [
          {
            path: '/foo/docs/v1.4',
            component: ComponentCreator('/foo/docs/v1.4', 'ef4'),
            routes: [
              {
                path: '/foo/docs/v1.4/category/service-operator',
                component: ComponentCreator('/foo/docs/v1.4/category/service-operator', 'ee2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.4/service-operator/CEPH_SETUP',
                component: ComponentCreator('/foo/docs/v1.4/service-operator/CEPH_SETUP', '2a7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.4/service-operator/DEPLOYMENT',
                component: ComponentCreator('/foo/docs/v1.4/service-operator/DEPLOYMENT', '113'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.4/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/foo/docs/v1.4/service-operator/GHCR_AUTHENTICATION', '0b1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.4/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/foo/docs/v1.4/service-operator/GOOGLE_SSO_SETUP', '4e0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.4/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/foo/docs/v1.4/service-operator/IAAS_CONSOLE_CONFIGURATION', '155'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.4/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/foo/docs/v1.4/service-operator/INSTALL_BAREMETAL_NODE', 'd89'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.4/service-operator/intro',
                component: ComponentCreator('/foo/docs/v1.4/service-operator/intro', '6a7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.4/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/foo/docs/v1.4/service-operator/NETWORK_CONTROL_NODE_SETUP', 'c1b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.4/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/foo/docs/v1.4/service-operator/OBSERVABILITY_ALERTS', '2f0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.4/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/foo/docs/v1.4/service-operator/OBSERVABILITY_DASHBOARDS', '03a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.4/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/foo/docs/v1.4/service-operator/OPERATOR_API_GUIDE', '69d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.4/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/foo/docs/v1.4/service-operator/OS_REQUIREMENTS', '2f1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/v1.4/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/foo/docs/v1.4/service-operator/VPN_CONFIGURATION', '271'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/foo/docs',
        component: ComponentCreator('/foo/docs', 'ebb'),
        routes: [
          {
            path: '/foo/docs',
            component: ComponentCreator('/foo/docs', '140'),
            routes: [
              {
                path: '/foo/docs/category/service-operator',
                component: ComponentCreator('/foo/docs/category/service-operator', 'a36'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/service-operator/CEPH_SETUP',
                component: ComponentCreator('/foo/docs/service-operator/CEPH_SETUP', 'a6b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/service-operator/DEPLOYMENT',
                component: ComponentCreator('/foo/docs/service-operator/DEPLOYMENT', '8af'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/foo/docs/service-operator/GHCR_AUTHENTICATION', '87b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/foo/docs/service-operator/GOOGLE_SSO_SETUP', 'b1f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/foo/docs/service-operator/IAAS_CONSOLE_CONFIGURATION', '77d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/foo/docs/service-operator/INSTALL_BAREMETAL_NODE', 'f22'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/service-operator/intro',
                component: ComponentCreator('/foo/docs/service-operator/intro', 'b24'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/foo/docs/service-operator/NETWORK_CONTROL_NODE_SETUP', '88e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/foo/docs/service-operator/OBSERVABILITY_ALERTS', 'c16'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/foo/docs/service-operator/OBSERVABILITY_DASHBOARDS', 'd26'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/foo/docs/service-operator/OPERATOR_API_GUIDE', 'd41'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/foo/docs/service-operator/OS_REQUIREMENTS', '676'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/service-operator/ROUTER_BOX_SETUP',
                component: ComponentCreator('/foo/docs/service-operator/ROUTER_BOX_SETUP', '418'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/foo/docs/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/foo/docs/service-operator/VPN_CONFIGURATION', '137'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/foo/',
    component: ComponentCreator('/foo/', 'a9a'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
