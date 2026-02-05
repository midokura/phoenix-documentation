import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/phoenix-documentation/ja/__docusaurus/debug',
    component: ComponentCreator('/phoenix-documentation/ja/__docusaurus/debug', '71d'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/__docusaurus/debug/config',
    component: ComponentCreator('/phoenix-documentation/ja/__docusaurus/debug/config', '67e'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/__docusaurus/debug/content',
    component: ComponentCreator('/phoenix-documentation/ja/__docusaurus/debug/content', '3b1'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/__docusaurus/debug/globalData',
    component: ComponentCreator('/phoenix-documentation/ja/__docusaurus/debug/globalData', '712'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/__docusaurus/debug/metadata',
    component: ComponentCreator('/phoenix-documentation/ja/__docusaurus/debug/metadata', 'a27'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/__docusaurus/debug/registry',
    component: ComponentCreator('/phoenix-documentation/ja/__docusaurus/debug/registry', '3d8'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/__docusaurus/debug/routes',
    component: ComponentCreator('/phoenix-documentation/ja/__docusaurus/debug/routes', 'c61'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog',
    component: ComponentCreator('/phoenix-documentation/ja/blog', '100'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/archive',
    component: ComponentCreator('/phoenix-documentation/ja/blog/archive', 'bbe'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/authors',
    component: ComponentCreator('/phoenix-documentation/ja/blog/authors', 'ca2'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/authors/alexanderfandos',
    component: ComponentCreator('/phoenix-documentation/ja/blog/authors/alexanderfandos', '236'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/authors/alexandervera',
    component: ComponentCreator('/phoenix-documentation/ja/blog/authors/alexandervera', 'be1'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/authors/galonavarro',
    component: ComponentCreator('/phoenix-documentation/ja/blog/authors/galonavarro', '2aa'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/authors/jimkennedy',
    component: ComponentCreator('/phoenix-documentation/ja/blog/authors/jimkennedy', '9e2'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/authors/sergimiralles',
    component: ComponentCreator('/phoenix-documentation/ja/blog/authors/sergimiralles', '822'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/tags',
    component: ComponentCreator('/phoenix-documentation/ja/blog/tags', 'a0a'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/tags/phoenix',
    component: ComponentCreator('/phoenix-documentation/ja/blog/tags/phoenix', '09b'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/v1.0',
    component: ComponentCreator('/phoenix-documentation/ja/blog/v1.0', '46e'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/v1.1',
    component: ComponentCreator('/phoenix-documentation/ja/blog/v1.1', '06e'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/v1.2',
    component: ComponentCreator('/phoenix-documentation/ja/blog/v1.2', 'e3a'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/v1.3',
    component: ComponentCreator('/phoenix-documentation/ja/blog/v1.3', 'c8a'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/v1.4',
    component: ComponentCreator('/phoenix-documentation/ja/blog/v1.4', '3a3'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/v1.5',
    component: ComponentCreator('/phoenix-documentation/ja/blog/v1.5', '6ce'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/v1.6',
    component: ComponentCreator('/phoenix-documentation/ja/blog/v1.6', 'bda'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/blog/v1.7',
    component: ComponentCreator('/phoenix-documentation/ja/blog/v1.7', '64e'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/search',
    component: ComponentCreator('/phoenix-documentation/ja/search', '14b'),
    exact: true
  },
  {
    path: '/phoenix-documentation/ja/docs',
    component: ComponentCreator('/phoenix-documentation/ja/docs', '7d6'),
    routes: [
      {
        path: '/phoenix-documentation/ja/docs/next',
        component: ComponentCreator('/phoenix-documentation/ja/docs/next', '65f'),
        routes: [
          {
            path: '/phoenix-documentation/ja/docs/next',
            component: ComponentCreator('/phoenix-documentation/ja/docs/next', 'cd3'),
            routes: [
              {
                path: '/phoenix-documentation/ja/docs/next/category/service-operator',
                component: ComponentCreator('/phoenix-documentation/ja/docs/next/category/service-operator', '2ea'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/next/OPERATOR_REFERENCE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/next/OPERATOR_REFERENCE', '0a1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/next/service-operator/CEPH_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/next/service-operator/CEPH_SETUP', '31a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/next/service-operator/DEPLOYMENT',
                component: ComponentCreator('/phoenix-documentation/ja/docs/next/service-operator/DEPLOYMENT', '497'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/next/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/next/service-operator/GHCR_AUTHENTICATION', '9a2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/next/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/next/service-operator/GOOGLE_SSO_SETUP', '7cc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/next/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/next/service-operator/IAAS_CONSOLE_CONFIGURATION', 'f4b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/next/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/next/service-operator/INSTALL_BAREMETAL_NODE', 'f4c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/next/service-operator/intro',
                component: ComponentCreator('/phoenix-documentation/ja/docs/next/service-operator/intro', '974'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/next/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/next/service-operator/NETWORK_CONTROL_NODE_SETUP', '5cb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/next/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/next/service-operator/OBSERVABILITY_ALERTS', 'ca2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/next/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/next/service-operator/OBSERVABILITY_DASHBOARDS', '87e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/next/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/next/service-operator/OPERATOR_API_GUIDE', '745'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/next/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/next/service-operator/OS_REQUIREMENTS', '84f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/next/service-operator/ROUTER_BOX_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/next/service-operator/ROUTER_BOX_SETUP', '3b0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/next/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/next/service-operator/VPN_CONFIGURATION', 'ae1'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/phoenix-documentation/ja/docs/v1.0',
        component: ComponentCreator('/phoenix-documentation/ja/docs/v1.0', '0bc'),
        routes: [
          {
            path: '/phoenix-documentation/ja/docs/v1.0',
            component: ComponentCreator('/phoenix-documentation/ja/docs/v1.0', '4ad'),
            routes: [
              {
                path: '/phoenix-documentation/ja/docs/v1.0/category/service-operator',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.0/category/service-operator', 'fab'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.0/service-operator/CEPH_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.0/service-operator/CEPH_SETUP', '8f5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.0/service-operator/DEPLOYMENT',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.0/service-operator/DEPLOYMENT', '86b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.0/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.0/service-operator/GHCR_AUTHENTICATION', '47a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.0/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.0/service-operator/GOOGLE_SSO_SETUP', 'cda'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.0/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.0/service-operator/IAAS_CONSOLE_CONFIGURATION', '53e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.0/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.0/service-operator/INSTALL_BAREMETAL_NODE', '6a0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.0/service-operator/intro',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.0/service-operator/intro', '2d7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.0/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.0/service-operator/NETWORK_CONTROL_NODE_SETUP', '6fd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.0/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.0/service-operator/OBSERVABILITY_ALERTS', '878'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.0/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.0/service-operator/OBSERVABILITY_DASHBOARDS', '556'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.0/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.0/service-operator/OPERATOR_API_GUIDE', 'bbe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.0/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.0/service-operator/OS_REQUIREMENTS', '46f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.0/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.0/service-operator/VPN_CONFIGURATION', 'ffa'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/phoenix-documentation/ja/docs/v1.1',
        component: ComponentCreator('/phoenix-documentation/ja/docs/v1.1', 'ed0'),
        routes: [
          {
            path: '/phoenix-documentation/ja/docs/v1.1',
            component: ComponentCreator('/phoenix-documentation/ja/docs/v1.1', 'b6a'),
            routes: [
              {
                path: '/phoenix-documentation/ja/docs/v1.1/category/service-operator',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.1/category/service-operator', '860'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.1/service-operator/CEPH_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.1/service-operator/CEPH_SETUP', '6a1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.1/service-operator/DEPLOYMENT',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.1/service-operator/DEPLOYMENT', '0dc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.1/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.1/service-operator/GHCR_AUTHENTICATION', '4df'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.1/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.1/service-operator/GOOGLE_SSO_SETUP', '6dd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.1/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.1/service-operator/IAAS_CONSOLE_CONFIGURATION', '949'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.1/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.1/service-operator/INSTALL_BAREMETAL_NODE', 'a08'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.1/service-operator/intro',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.1/service-operator/intro', 'b8b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.1/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.1/service-operator/NETWORK_CONTROL_NODE_SETUP', 'b01'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.1/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.1/service-operator/OBSERVABILITY_ALERTS', 'f3a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.1/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.1/service-operator/OBSERVABILITY_DASHBOARDS', 'c66'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.1/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.1/service-operator/OPERATOR_API_GUIDE', '092'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.1/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.1/service-operator/OS_REQUIREMENTS', '348'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.1/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.1/service-operator/VPN_CONFIGURATION', 'ec0'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/phoenix-documentation/ja/docs/v1.2',
        component: ComponentCreator('/phoenix-documentation/ja/docs/v1.2', 'caf'),
        routes: [
          {
            path: '/phoenix-documentation/ja/docs/v1.2',
            component: ComponentCreator('/phoenix-documentation/ja/docs/v1.2', '0f8'),
            routes: [
              {
                path: '/phoenix-documentation/ja/docs/v1.2/category/service-operator',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.2/category/service-operator', 'ec2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.2/service-operator/CEPH_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.2/service-operator/CEPH_SETUP', 'd12'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.2/service-operator/DEPLOYMENT',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.2/service-operator/DEPLOYMENT', '9da'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.2/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.2/service-operator/GHCR_AUTHENTICATION', '573'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.2/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.2/service-operator/GOOGLE_SSO_SETUP', 'ece'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.2/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.2/service-operator/IAAS_CONSOLE_CONFIGURATION', 'a50'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.2/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.2/service-operator/INSTALL_BAREMETAL_NODE', '18b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.2/service-operator/intro',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.2/service-operator/intro', '8ed'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.2/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.2/service-operator/NETWORK_CONTROL_NODE_SETUP', '9df'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.2/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.2/service-operator/OBSERVABILITY_ALERTS', '99c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.2/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.2/service-operator/OBSERVABILITY_DASHBOARDS', '0de'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.2/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.2/service-operator/OPERATOR_API_GUIDE', '2b1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.2/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.2/service-operator/OS_REQUIREMENTS', '3d7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.2/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.2/service-operator/VPN_CONFIGURATION', '107'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/phoenix-documentation/ja/docs/v1.3',
        component: ComponentCreator('/phoenix-documentation/ja/docs/v1.3', '63a'),
        routes: [
          {
            path: '/phoenix-documentation/ja/docs/v1.3',
            component: ComponentCreator('/phoenix-documentation/ja/docs/v1.3', 'f26'),
            routes: [
              {
                path: '/phoenix-documentation/ja/docs/v1.3/category/service-operator',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.3/category/service-operator', '99a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.3/service-operator/CEPH_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.3/service-operator/CEPH_SETUP', '704'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.3/service-operator/DEPLOYMENT',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.3/service-operator/DEPLOYMENT', '7c0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.3/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.3/service-operator/GHCR_AUTHENTICATION', '610'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.3/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.3/service-operator/GOOGLE_SSO_SETUP', '5cb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.3/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.3/service-operator/IAAS_CONSOLE_CONFIGURATION', '959'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.3/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.3/service-operator/INSTALL_BAREMETAL_NODE', '643'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.3/service-operator/intro',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.3/service-operator/intro', '139'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.3/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.3/service-operator/NETWORK_CONTROL_NODE_SETUP', 'ce2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.3/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.3/service-operator/OBSERVABILITY_ALERTS', 'd4f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.3/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.3/service-operator/OBSERVABILITY_DASHBOARDS', '8c3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.3/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.3/service-operator/OPERATOR_API_GUIDE', 'cef'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.3/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.3/service-operator/OS_REQUIREMENTS', 'e89'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.3/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.3/service-operator/VPN_CONFIGURATION', '323'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/phoenix-documentation/ja/docs/v1.4',
        component: ComponentCreator('/phoenix-documentation/ja/docs/v1.4', '157'),
        routes: [
          {
            path: '/phoenix-documentation/ja/docs/v1.4',
            component: ComponentCreator('/phoenix-documentation/ja/docs/v1.4', 'c33'),
            routes: [
              {
                path: '/phoenix-documentation/ja/docs/v1.4/category/service-operator',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.4/category/service-operator', 'b6a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.4/service-operator/CEPH_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.4/service-operator/CEPH_SETUP', 'ab9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.4/service-operator/DEPLOYMENT',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.4/service-operator/DEPLOYMENT', 'c9b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.4/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.4/service-operator/GHCR_AUTHENTICATION', 'bac'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.4/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.4/service-operator/GOOGLE_SSO_SETUP', 'a64'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.4/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.4/service-operator/IAAS_CONSOLE_CONFIGURATION', 'c6a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.4/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.4/service-operator/INSTALL_BAREMETAL_NODE', '269'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.4/service-operator/intro',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.4/service-operator/intro', '726'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.4/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.4/service-operator/NETWORK_CONTROL_NODE_SETUP', '19b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.4/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.4/service-operator/OBSERVABILITY_ALERTS', 'f97'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.4/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.4/service-operator/OBSERVABILITY_DASHBOARDS', '10b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.4/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.4/service-operator/OPERATOR_API_GUIDE', 'b0f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.4/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.4/service-operator/OS_REQUIREMENTS', '291'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.4/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.4/service-operator/VPN_CONFIGURATION', '7d6'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/phoenix-documentation/ja/docs/v1.5',
        component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5', 'cbd'),
        routes: [
          {
            path: '/phoenix-documentation/ja/docs/v1.5',
            component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5', 'beb'),
            routes: [
              {
                path: '/phoenix-documentation/ja/docs/v1.5/category/service-operator',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5/category/service-operator', 'e1c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.5/service-operator/CEPH_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5/service-operator/CEPH_SETUP', '35e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.5/service-operator/DEPLOYMENT',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5/service-operator/DEPLOYMENT', 'ac2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.5/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5/service-operator/GHCR_AUTHENTICATION', '2f4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.5/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5/service-operator/GOOGLE_SSO_SETUP', '25a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.5/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5/service-operator/IAAS_CONSOLE_CONFIGURATION', 'ffa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.5/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5/service-operator/INSTALL_BAREMETAL_NODE', 'da1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.5/service-operator/intro',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5/service-operator/intro', '59a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.5/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5/service-operator/NETWORK_CONTROL_NODE_SETUP', 'b3a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.5/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5/service-operator/OBSERVABILITY_ALERTS', '6c3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.5/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5/service-operator/OBSERVABILITY_DASHBOARDS', 'f5e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.5/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5/service-operator/OPERATOR_API_GUIDE', 'd15'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.5/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5/service-operator/OS_REQUIREMENTS', '600'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.5/service-operator/ROUTER_BOX_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5/service-operator/ROUTER_BOX_SETUP', 'e4e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.5/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.5/service-operator/VPN_CONFIGURATION', 'c9c'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/phoenix-documentation/ja/docs/v1.6',
        component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6', 'bef'),
        routes: [
          {
            path: '/phoenix-documentation/ja/docs/v1.6',
            component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6', '1ac'),
            routes: [
              {
                path: '/phoenix-documentation/ja/docs/v1.6/category/service-operator',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6/category/service-operator', '4a6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.6/service-operator/CEPH_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6/service-operator/CEPH_SETUP', '406'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.6/service-operator/DEPLOYMENT',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6/service-operator/DEPLOYMENT', '3f5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.6/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6/service-operator/GHCR_AUTHENTICATION', 'f59'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.6/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6/service-operator/GOOGLE_SSO_SETUP', '088'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.6/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6/service-operator/IAAS_CONSOLE_CONFIGURATION', '172'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.6/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6/service-operator/INSTALL_BAREMETAL_NODE', '886'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.6/service-operator/intro',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6/service-operator/intro', 'c0f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.6/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6/service-operator/NETWORK_CONTROL_NODE_SETUP', '0c6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.6/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6/service-operator/OBSERVABILITY_ALERTS', '529'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.6/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6/service-operator/OBSERVABILITY_DASHBOARDS', '7bc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.6/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6/service-operator/OPERATOR_API_GUIDE', '6ef'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.6/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6/service-operator/OS_REQUIREMENTS', '0a5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.6/service-operator/ROUTER_BOX_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6/service-operator/ROUTER_BOX_SETUP', '95f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/v1.6/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/v1.6/service-operator/VPN_CONFIGURATION', '6e5'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/phoenix-documentation/ja/docs',
        component: ComponentCreator('/phoenix-documentation/ja/docs', '89b'),
        routes: [
          {
            path: '/phoenix-documentation/ja/docs',
            component: ComponentCreator('/phoenix-documentation/ja/docs', '8e5'),
            routes: [
              {
                path: '/phoenix-documentation/ja/docs/category/service-operator',
                component: ComponentCreator('/phoenix-documentation/ja/docs/category/service-operator', 'da9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/OPERATOR_REFERENCE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/OPERATOR_REFERENCE', '338'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/service-operator/CEPH_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/service-operator/CEPH_SETUP', 'd93'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/service-operator/DEPLOYMENT',
                component: ComponentCreator('/phoenix-documentation/ja/docs/service-operator/DEPLOYMENT', 'd4e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/service-operator/GHCR_AUTHENTICATION', 'd08'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/service-operator/GOOGLE_SSO_SETUP', 'ecf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/service-operator/IAAS_CONSOLE_CONFIGURATION', '0cd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/service-operator/INSTALL_BAREMETAL_NODE', 'b6c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/service-operator/intro',
                component: ComponentCreator('/phoenix-documentation/ja/docs/service-operator/intro', '525'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/service-operator/NETWORK_CONTROL_NODE_SETUP', 'f9d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/service-operator/OBSERVABILITY_ALERTS', '20a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/service-operator/OBSERVABILITY_DASHBOARDS', 'e59'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/phoenix-documentation/ja/docs/service-operator/OPERATOR_API_GUIDE', 'e4d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/phoenix-documentation/ja/docs/service-operator/OS_REQUIREMENTS', 'bc8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/service-operator/ROUTER_BOX_SETUP',
                component: ComponentCreator('/phoenix-documentation/ja/docs/service-operator/ROUTER_BOX_SETUP', 'cfb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/phoenix-documentation/ja/docs/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/phoenix-documentation/ja/docs/service-operator/VPN_CONFIGURATION', '66b'),
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
    path: '/phoenix-documentation/ja/',
    component: ComponentCreator('/phoenix-documentation/ja/', '36f'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
