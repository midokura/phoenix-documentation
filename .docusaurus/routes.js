import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/phoenix-documentation/__docusaurus/debug',
    component: ComponentCreator('/phoenix-documentation/__docusaurus/debug', 'ea0'),
    exact: true
  },
  {
    path: '/phoenix-documentation/__docusaurus/debug/config',
    component: ComponentCreator('/phoenix-documentation/__docusaurus/debug/config', '853'),
    exact: true
  },
  {
    path: '/phoenix-documentation/__docusaurus/debug/content',
    component: ComponentCreator('/phoenix-documentation/__docusaurus/debug/content', '5cf'),
    exact: true
  },
  {
    path: '/phoenix-documentation/__docusaurus/debug/globalData',
    component: ComponentCreator('/phoenix-documentation/__docusaurus/debug/globalData', '885'),
    exact: true
  },
  {
    path: '/phoenix-documentation/__docusaurus/debug/metadata',
    component: ComponentCreator('/phoenix-documentation/__docusaurus/debug/metadata', '7f5'),
    exact: true
  },
  {
    path: '/phoenix-documentation/__docusaurus/debug/registry',
    component: ComponentCreator('/phoenix-documentation/__docusaurus/debug/registry', '802'),
    exact: true
  },
  {
    path: '/phoenix-documentation/__docusaurus/debug/routes',
    component: ComponentCreator('/phoenix-documentation/__docusaurus/debug/routes', '40f'),
    exact: true
  },
  {
    path: '/phoenix-documentation/blog',
    component: ComponentCreator('/phoenix-documentation/blog', '1c3'),
    exact: true
  },
  {
    path: '/phoenix-documentation/blog/archive',
    component: ComponentCreator('/phoenix-documentation/blog/archive', 'f0e'),
    exact: true
  },
  {
    path: '/phoenix-documentation/blog/authors',
    component: ComponentCreator('/phoenix-documentation/blog/authors', 'e72'),
    exact: true
  },
  {
    path: '/phoenix-documentation/blog/authors/alexanderfandos',
    component: ComponentCreator('/phoenix-documentation/blog/authors/alexanderfandos', 'a90'),
    exact: true
  },
  {
    path: '/phoenix-documentation/blog/authors/alexandervera',
    component: ComponentCreator('/phoenix-documentation/blog/authors/alexandervera', '064'),
    exact: true
  },
  {
    path: '/phoenix-documentation/blog/authors/galonavarro',
    component: ComponentCreator('/phoenix-documentation/blog/authors/galonavarro', '141'),
    exact: true
  },
  {
    path: '/phoenix-documentation/blog/authors/jimkennedy',
    component: ComponentCreator('/phoenix-documentation/blog/authors/jimkennedy', '276'),
    exact: true
  },
  {
    path: '/phoenix-documentation/blog/authors/sergimiralles',
    component: ComponentCreator('/phoenix-documentation/blog/authors/sergimiralles', '019'),
    exact: true
  },
  {
    path: '/phoenix-documentation/blog/tags',
    component: ComponentCreator('/phoenix-documentation/blog/tags', '87f'),
    exact: true
  },
  {
    path: '/phoenix-documentation/blog/tags/phoenix',
    component: ComponentCreator('/phoenix-documentation/blog/tags/phoenix', '7fc'),
    exact: true
  },
  {
    path: '/phoenix-documentation/blog/v1.0',
    component: ComponentCreator('/phoenix-documentation/blog/v1.0', 'de8'),
    exact: true
  },
  {
    path: '/phoenix-documentation/blog/v1.1',
    component: ComponentCreator('/phoenix-documentation/blog/v1.1', '98b'),
    exact: true
  },
  {
    path: '/phoenix-documentation/blog/v1.2',
    component: ComponentCreator('/phoenix-documentation/blog/v1.2', '705'),
    exact: true
  },
  {
    path: '/phoenix-documentation/blog/v1.3',
    component: ComponentCreator('/phoenix-documentation/blog/v1.3', 'cc3'),
    exact: true
  },
  {
    path: '/phoenix-documentation/blog/v1.4',
    component: ComponentCreator('/phoenix-documentation/blog/v1.4', 'bc2'),
    exact: true
  },
  {
    path: '/phoenix-documentation/blog/v1.5',
    component: ComponentCreator('/phoenix-documentation/blog/v1.5', 'c96'),
    exact: true
  },
  {
    path: '/phoenix-documentation/markdown-page',
    component: ComponentCreator('/phoenix-documentation/markdown-page', '83d'),
    exact: true
  },
  {
    path: '/phoenix-documentation/search',
    component: ComponentCreator('/phoenix-documentation/search', 'fd8'),
    exact: true
  },
  {
    path: '/phoenix-documentation/docs',
    component: ComponentCreator('/phoenix-documentation/docs', 'f31'),
    routes: [
      {
        path: '/phoenix-documentation/docs/v1.0',
        component: ComponentCreator('/phoenix-documentation/docs/v1.0', '7d5'),
        routes: [
          {
            path: '/phoenix-documentation/docs/v1.0',
            component: ComponentCreator('/phoenix-documentation/docs/v1.0', 'b0b'),
            routes: [
              {
                path: '/phoenix-documentation/docs/v1.0/category/service-operator',
                component: ComponentCreator('/phoenix-documentation/docs/v1.0/category/service-operator', '656'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.0/service-operator/CEPH_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/v1.0/service-operator/CEPH_SETUP', '8bd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.0/service-operator/DEPLOYMENT',
                component: ComponentCreator('/phoenix-documentation/docs/v1.0/service-operator/DEPLOYMENT', '2ed'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.0/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/phoenix-documentation/docs/v1.0/service-operator/GHCR_AUTHENTICATION', 'ae0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.0/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/v1.0/service-operator/GOOGLE_SSO_SETUP', '607'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.0/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/docs/v1.0/service-operator/IAAS_CONSOLE_CONFIGURATION', 'e46'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.0/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/phoenix-documentation/docs/v1.0/service-operator/INSTALL_BAREMETAL_NODE', '74e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.0/service-operator/intro',
                component: ComponentCreator('/phoenix-documentation/docs/v1.0/service-operator/intro', '33f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.0/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/v1.0/service-operator/NETWORK_CONTROL_NODE_SETUP', 'bc5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.0/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/phoenix-documentation/docs/v1.0/service-operator/OBSERVABILITY_ALERTS', '192'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.0/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/phoenix-documentation/docs/v1.0/service-operator/OBSERVABILITY_DASHBOARDS', 'cb4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.0/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/phoenix-documentation/docs/v1.0/service-operator/OPERATOR_API_GUIDE', '738'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.0/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/phoenix-documentation/docs/v1.0/service-operator/OS_REQUIREMENTS', 'c07'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.0/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/docs/v1.0/service-operator/VPN_CONFIGURATION', '318'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/phoenix-documentation/docs/v1.1',
        component: ComponentCreator('/phoenix-documentation/docs/v1.1', 'fb1'),
        routes: [
          {
            path: '/phoenix-documentation/docs/v1.1',
            component: ComponentCreator('/phoenix-documentation/docs/v1.1', '8cb'),
            routes: [
              {
                path: '/phoenix-documentation/docs/v1.1/category/service-operator',
                component: ComponentCreator('/phoenix-documentation/docs/v1.1/category/service-operator', '4e3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.1/service-operator/CEPH_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/v1.1/service-operator/CEPH_SETUP', 'f87'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.1/service-operator/DEPLOYMENT',
                component: ComponentCreator('/phoenix-documentation/docs/v1.1/service-operator/DEPLOYMENT', 'e7d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.1/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/phoenix-documentation/docs/v1.1/service-operator/GHCR_AUTHENTICATION', '2e3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.1/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/v1.1/service-operator/GOOGLE_SSO_SETUP', '6a8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.1/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/docs/v1.1/service-operator/IAAS_CONSOLE_CONFIGURATION', 'a22'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.1/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/phoenix-documentation/docs/v1.1/service-operator/INSTALL_BAREMETAL_NODE', '1d2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.1/service-operator/intro',
                component: ComponentCreator('/phoenix-documentation/docs/v1.1/service-operator/intro', '48a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.1/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/v1.1/service-operator/NETWORK_CONTROL_NODE_SETUP', '631'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.1/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/phoenix-documentation/docs/v1.1/service-operator/OBSERVABILITY_ALERTS', '318'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.1/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/phoenix-documentation/docs/v1.1/service-operator/OBSERVABILITY_DASHBOARDS', '2b4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.1/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/phoenix-documentation/docs/v1.1/service-operator/OPERATOR_API_GUIDE', '9a5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.1/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/phoenix-documentation/docs/v1.1/service-operator/OS_REQUIREMENTS', '839'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.1/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/docs/v1.1/service-operator/VPN_CONFIGURATION', '527'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/phoenix-documentation/docs/v1.2',
        component: ComponentCreator('/phoenix-documentation/docs/v1.2', 'a7f'),
        routes: [
          {
            path: '/phoenix-documentation/docs/v1.2',
            component: ComponentCreator('/phoenix-documentation/docs/v1.2', 'bcc'),
            routes: [
              {
                path: '/phoenix-documentation/docs/v1.2/category/service-operator',
                component: ComponentCreator('/phoenix-documentation/docs/v1.2/category/service-operator', '068'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.2/service-operator/CEPH_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/v1.2/service-operator/CEPH_SETUP', '474'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.2/service-operator/DEPLOYMENT',
                component: ComponentCreator('/phoenix-documentation/docs/v1.2/service-operator/DEPLOYMENT', '08a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.2/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/phoenix-documentation/docs/v1.2/service-operator/GHCR_AUTHENTICATION', 'bc1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.2/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/v1.2/service-operator/GOOGLE_SSO_SETUP', 'e80'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.2/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/docs/v1.2/service-operator/IAAS_CONSOLE_CONFIGURATION', 'cef'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.2/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/phoenix-documentation/docs/v1.2/service-operator/INSTALL_BAREMETAL_NODE', 'c32'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.2/service-operator/intro',
                component: ComponentCreator('/phoenix-documentation/docs/v1.2/service-operator/intro', '000'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.2/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/v1.2/service-operator/NETWORK_CONTROL_NODE_SETUP', '4b4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.2/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/phoenix-documentation/docs/v1.2/service-operator/OBSERVABILITY_ALERTS', '641'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.2/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/phoenix-documentation/docs/v1.2/service-operator/OBSERVABILITY_DASHBOARDS', 'de4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.2/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/phoenix-documentation/docs/v1.2/service-operator/OPERATOR_API_GUIDE', '379'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.2/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/phoenix-documentation/docs/v1.2/service-operator/OS_REQUIREMENTS', '2e8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.2/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/docs/v1.2/service-operator/VPN_CONFIGURATION', 'e02'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/phoenix-documentation/docs/v1.3',
        component: ComponentCreator('/phoenix-documentation/docs/v1.3', '4ad'),
        routes: [
          {
            path: '/phoenix-documentation/docs/v1.3',
            component: ComponentCreator('/phoenix-documentation/docs/v1.3', '40d'),
            routes: [
              {
                path: '/phoenix-documentation/docs/v1.3/category/service-operator',
                component: ComponentCreator('/phoenix-documentation/docs/v1.3/category/service-operator', 'e78'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.3/service-operator/CEPH_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/v1.3/service-operator/CEPH_SETUP', 'bb8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.3/service-operator/DEPLOYMENT',
                component: ComponentCreator('/phoenix-documentation/docs/v1.3/service-operator/DEPLOYMENT', 'c49'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.3/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/phoenix-documentation/docs/v1.3/service-operator/GHCR_AUTHENTICATION', 'bc6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.3/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/v1.3/service-operator/GOOGLE_SSO_SETUP', '660'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.3/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/docs/v1.3/service-operator/IAAS_CONSOLE_CONFIGURATION', '976'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.3/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/phoenix-documentation/docs/v1.3/service-operator/INSTALL_BAREMETAL_NODE', '535'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.3/service-operator/intro',
                component: ComponentCreator('/phoenix-documentation/docs/v1.3/service-operator/intro', '354'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.3/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/v1.3/service-operator/NETWORK_CONTROL_NODE_SETUP', '2b6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.3/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/phoenix-documentation/docs/v1.3/service-operator/OBSERVABILITY_ALERTS', '202'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.3/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/phoenix-documentation/docs/v1.3/service-operator/OBSERVABILITY_DASHBOARDS', 'fd8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.3/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/phoenix-documentation/docs/v1.3/service-operator/OPERATOR_API_GUIDE', '3bd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.3/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/phoenix-documentation/docs/v1.3/service-operator/OS_REQUIREMENTS', '36b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.3/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/docs/v1.3/service-operator/VPN_CONFIGURATION', '981'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/phoenix-documentation/docs/v1.4',
        component: ComponentCreator('/phoenix-documentation/docs/v1.4', '5eb'),
        routes: [
          {
            path: '/phoenix-documentation/docs/v1.4',
            component: ComponentCreator('/phoenix-documentation/docs/v1.4', 'ca7'),
            routes: [
              {
                path: '/phoenix-documentation/docs/v1.4/category/service-operator',
                component: ComponentCreator('/phoenix-documentation/docs/v1.4/category/service-operator', '03b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.4/service-operator/CEPH_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/v1.4/service-operator/CEPH_SETUP', '008'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.4/service-operator/DEPLOYMENT',
                component: ComponentCreator('/phoenix-documentation/docs/v1.4/service-operator/DEPLOYMENT', '651'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.4/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/phoenix-documentation/docs/v1.4/service-operator/GHCR_AUTHENTICATION', '703'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.4/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/v1.4/service-operator/GOOGLE_SSO_SETUP', 'b8e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.4/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/docs/v1.4/service-operator/IAAS_CONSOLE_CONFIGURATION', '9d3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.4/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/phoenix-documentation/docs/v1.4/service-operator/INSTALL_BAREMETAL_NODE', '964'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.4/service-operator/intro',
                component: ComponentCreator('/phoenix-documentation/docs/v1.4/service-operator/intro', '85f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.4/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/v1.4/service-operator/NETWORK_CONTROL_NODE_SETUP', '5c8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.4/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/phoenix-documentation/docs/v1.4/service-operator/OBSERVABILITY_ALERTS', 'f69'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.4/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/phoenix-documentation/docs/v1.4/service-operator/OBSERVABILITY_DASHBOARDS', 'fc5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.4/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/phoenix-documentation/docs/v1.4/service-operator/OPERATOR_API_GUIDE', 'db6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.4/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/phoenix-documentation/docs/v1.4/service-operator/OS_REQUIREMENTS', '058'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/v1.4/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/docs/v1.4/service-operator/VPN_CONFIGURATION', '900'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/phoenix-documentation/docs',
        component: ComponentCreator('/phoenix-documentation/docs', '916'),
        routes: [
          {
            path: '/phoenix-documentation/docs',
            component: ComponentCreator('/phoenix-documentation/docs', 'c92'),
            routes: [
              {
                path: '/phoenix-documentation/docs/category/service-operator',
                component: ComponentCreator('/phoenix-documentation/docs/category/service-operator', 'a6e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/service-operator/CEPH_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/service-operator/CEPH_SETUP', 'c11'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/service-operator/DEPLOYMENT',
                component: ComponentCreator('/phoenix-documentation/docs/service-operator/DEPLOYMENT', 'b39'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/phoenix-documentation/docs/service-operator/GHCR_AUTHENTICATION', '4bb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/service-operator/GOOGLE_SSO_SETUP', '8bf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/docs/service-operator/IAAS_CONSOLE_CONFIGURATION', '81e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/phoenix-documentation/docs/service-operator/INSTALL_BAREMETAL_NODE', '500'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/service-operator/intro',
                component: ComponentCreator('/phoenix-documentation/docs/service-operator/intro', '53f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/service-operator/NETWORK_CONTROL_NODE_SETUP', 'fa0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/phoenix-documentation/docs/service-operator/OBSERVABILITY_ALERTS', '1b7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/phoenix-documentation/docs/service-operator/OBSERVABILITY_DASHBOARDS', '0b1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/phoenix-documentation/docs/service-operator/OPERATOR_API_GUIDE', 'f27'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/phoenix-documentation/docs/service-operator/OS_REQUIREMENTS', '894'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/service-operator/ROUTER_BOX_SETUP',
                component: ComponentCreator('/phoenix-documentation/docs/service-operator/ROUTER_BOX_SETUP', 'd07'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/docs/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/docs/service-operator/VPN_CONFIGURATION', '414'),
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
    path: '/phoenix-documentation/',
    component: ComponentCreator('/phoenix-documentation/', '73b'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
