import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '5ff'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', '5ba'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'a2b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', 'c3c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', '156'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', '88c'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', '000'),
    exact: true
  },
  {
    path: '/blog',
    component: ComponentCreator('/blog', 'e4e'),
    exact: true
  },
  {
    path: '/blog/archive',
    component: ComponentCreator('/blog/archive', '182'),
    exact: true
  },
  {
    path: '/blog/authors',
    component: ComponentCreator('/blog/authors', '0b7'),
    exact: true
  },
  {
    path: '/blog/authors/alexanderfandos',
    component: ComponentCreator('/blog/authors/alexanderfandos', '8a2'),
    exact: true
  },
  {
    path: '/blog/authors/alexandervera',
    component: ComponentCreator('/blog/authors/alexandervera', 'c48'),
    exact: true
  },
  {
    path: '/blog/authors/galonavarro',
    component: ComponentCreator('/blog/authors/galonavarro', '94f'),
    exact: true
  },
  {
    path: '/blog/authors/jimkennedy',
    component: ComponentCreator('/blog/authors/jimkennedy', '083'),
    exact: true
  },
  {
    path: '/blog/authors/sergimiralles',
    component: ComponentCreator('/blog/authors/sergimiralles', 'e0f'),
    exact: true
  },
  {
    path: '/blog/tags',
    component: ComponentCreator('/blog/tags', '287'),
    exact: true
  },
  {
    path: '/blog/tags/phoenix',
    component: ComponentCreator('/blog/tags/phoenix', '4dc'),
    exact: true
  },
  {
    path: '/blog/v1.0',
    component: ComponentCreator('/blog/v1.0', '406'),
    exact: true
  },
  {
    path: '/blog/v1.1',
    component: ComponentCreator('/blog/v1.1', 'e32'),
    exact: true
  },
  {
    path: '/blog/v1.2',
    component: ComponentCreator('/blog/v1.2', '19b'),
    exact: true
  },
  {
    path: '/blog/v1.3',
    component: ComponentCreator('/blog/v1.3', '749'),
    exact: true
  },
  {
    path: '/blog/v1.4',
    component: ComponentCreator('/blog/v1.4', 'e34'),
    exact: true
  },
  {
    path: '/blog/v1.5',
    component: ComponentCreator('/blog/v1.5', 'b34'),
    exact: true
  },
  {
    path: '/blog/v1.6',
    component: ComponentCreator('/blog/v1.6', 'ee4'),
    exact: true
  },
  {
    path: '/blog/v1.7',
    component: ComponentCreator('/blog/v1.7', '13c'),
    exact: true
  },
  {
    path: '/search',
    component: ComponentCreator('/search', '822'),
    exact: true
  },
  {
    path: '/docs',
    component: ComponentCreator('/docs', '81e'),
    routes: [
      {
        path: '/docs/next',
        component: ComponentCreator('/docs/next', '0d1'),
        routes: [
          {
            path: '/docs/next',
            component: ComponentCreator('/docs/next', '18f'),
            routes: [
              {
                path: '/docs/next/category/service-operator',
                component: ComponentCreator('/docs/next/category/service-operator', '00d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/next/OPERATOR_REFERENCE',
                component: ComponentCreator('/docs/next/OPERATOR_REFERENCE', '80d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/next/service-operator/CEPH_SETUP',
                component: ComponentCreator('/docs/next/service-operator/CEPH_SETUP', 'e9c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/next/service-operator/DEPLOYMENT',
                component: ComponentCreator('/docs/next/service-operator/DEPLOYMENT', '54f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/next/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/docs/next/service-operator/GHCR_AUTHENTICATION', '602'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/next/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/docs/next/service-operator/GOOGLE_SSO_SETUP', '231'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/next/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/docs/next/service-operator/IAAS_CONSOLE_CONFIGURATION', 'e90'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/next/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/docs/next/service-operator/INSTALL_BAREMETAL_NODE', '9a0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/next/service-operator/intro',
                component: ComponentCreator('/docs/next/service-operator/intro', 'cae'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/next/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/docs/next/service-operator/NETWORK_CONTROL_NODE_SETUP', 'b11'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/next/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/docs/next/service-operator/OBSERVABILITY_ALERTS', '4d4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/next/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/docs/next/service-operator/OBSERVABILITY_DASHBOARDS', 'f88'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/next/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/docs/next/service-operator/OPERATOR_API_GUIDE', '077'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/next/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/docs/next/service-operator/OS_REQUIREMENTS', 'd5c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/next/service-operator/ROUTER_BOX_SETUP',
                component: ComponentCreator('/docs/next/service-operator/ROUTER_BOX_SETUP', 'f0d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/next/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/docs/next/service-operator/VPN_CONFIGURATION', 'dcc'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/docs/v1.0',
        component: ComponentCreator('/docs/v1.0', '1f9'),
        routes: [
          {
            path: '/docs/v1.0',
            component: ComponentCreator('/docs/v1.0', 'e59'),
            routes: [
              {
                path: '/docs/v1.0/category/service-operator',
                component: ComponentCreator('/docs/v1.0/category/service-operator', 'ce8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.0/service-operator/CEPH_SETUP',
                component: ComponentCreator('/docs/v1.0/service-operator/CEPH_SETUP', '450'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.0/service-operator/DEPLOYMENT',
                component: ComponentCreator('/docs/v1.0/service-operator/DEPLOYMENT', 'e2a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.0/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/docs/v1.0/service-operator/GHCR_AUTHENTICATION', 'b2c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.0/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/docs/v1.0/service-operator/GOOGLE_SSO_SETUP', 'a86'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.0/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/docs/v1.0/service-operator/IAAS_CONSOLE_CONFIGURATION', '721'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.0/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/docs/v1.0/service-operator/INSTALL_BAREMETAL_NODE', 'cb4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.0/service-operator/intro',
                component: ComponentCreator('/docs/v1.0/service-operator/intro', '810'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.0/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/docs/v1.0/service-operator/NETWORK_CONTROL_NODE_SETUP', '5c9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.0/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/docs/v1.0/service-operator/OBSERVABILITY_ALERTS', '430'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.0/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/docs/v1.0/service-operator/OBSERVABILITY_DASHBOARDS', '243'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.0/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/docs/v1.0/service-operator/OPERATOR_API_GUIDE', '0af'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.0/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/docs/v1.0/service-operator/OS_REQUIREMENTS', '285'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.0/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/docs/v1.0/service-operator/VPN_CONFIGURATION', 'b80'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/docs/v1.1',
        component: ComponentCreator('/docs/v1.1', '7b5'),
        routes: [
          {
            path: '/docs/v1.1',
            component: ComponentCreator('/docs/v1.1', 'fed'),
            routes: [
              {
                path: '/docs/v1.1/category/service-operator',
                component: ComponentCreator('/docs/v1.1/category/service-operator', 'e52'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.1/service-operator/CEPH_SETUP',
                component: ComponentCreator('/docs/v1.1/service-operator/CEPH_SETUP', 'eea'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.1/service-operator/DEPLOYMENT',
                component: ComponentCreator('/docs/v1.1/service-operator/DEPLOYMENT', 'c0f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.1/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/docs/v1.1/service-operator/GHCR_AUTHENTICATION', '04b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.1/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/docs/v1.1/service-operator/GOOGLE_SSO_SETUP', 'a62'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.1/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/docs/v1.1/service-operator/IAAS_CONSOLE_CONFIGURATION', 'f2e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.1/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/docs/v1.1/service-operator/INSTALL_BAREMETAL_NODE', 'c39'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.1/service-operator/intro',
                component: ComponentCreator('/docs/v1.1/service-operator/intro', 'ebd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.1/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/docs/v1.1/service-operator/NETWORK_CONTROL_NODE_SETUP', 'ccc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.1/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/docs/v1.1/service-operator/OBSERVABILITY_ALERTS', 'e63'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.1/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/docs/v1.1/service-operator/OBSERVABILITY_DASHBOARDS', 'ce0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.1/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/docs/v1.1/service-operator/OPERATOR_API_GUIDE', 'bb5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.1/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/docs/v1.1/service-operator/OS_REQUIREMENTS', 'd1f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.1/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/docs/v1.1/service-operator/VPN_CONFIGURATION', '664'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/docs/v1.2',
        component: ComponentCreator('/docs/v1.2', '782'),
        routes: [
          {
            path: '/docs/v1.2',
            component: ComponentCreator('/docs/v1.2', '046'),
            routes: [
              {
                path: '/docs/v1.2/category/service-operator',
                component: ComponentCreator('/docs/v1.2/category/service-operator', 'ea2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.2/service-operator/CEPH_SETUP',
                component: ComponentCreator('/docs/v1.2/service-operator/CEPH_SETUP', '491'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.2/service-operator/DEPLOYMENT',
                component: ComponentCreator('/docs/v1.2/service-operator/DEPLOYMENT', 'a84'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.2/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/docs/v1.2/service-operator/GHCR_AUTHENTICATION', '3fe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.2/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/docs/v1.2/service-operator/GOOGLE_SSO_SETUP', '082'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.2/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/docs/v1.2/service-operator/IAAS_CONSOLE_CONFIGURATION', 'b40'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.2/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/docs/v1.2/service-operator/INSTALL_BAREMETAL_NODE', '0e5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.2/service-operator/intro',
                component: ComponentCreator('/docs/v1.2/service-operator/intro', '372'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.2/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/docs/v1.2/service-operator/NETWORK_CONTROL_NODE_SETUP', '070'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.2/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/docs/v1.2/service-operator/OBSERVABILITY_ALERTS', '25e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.2/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/docs/v1.2/service-operator/OBSERVABILITY_DASHBOARDS', 'ad6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.2/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/docs/v1.2/service-operator/OPERATOR_API_GUIDE', '390'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.2/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/docs/v1.2/service-operator/OS_REQUIREMENTS', '472'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.2/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/docs/v1.2/service-operator/VPN_CONFIGURATION', '7d4'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/docs/v1.3',
        component: ComponentCreator('/docs/v1.3', '151'),
        routes: [
          {
            path: '/docs/v1.3',
            component: ComponentCreator('/docs/v1.3', '2c9'),
            routes: [
              {
                path: '/docs/v1.3/category/service-operator',
                component: ComponentCreator('/docs/v1.3/category/service-operator', '5f4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.3/service-operator/CEPH_SETUP',
                component: ComponentCreator('/docs/v1.3/service-operator/CEPH_SETUP', '413'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.3/service-operator/DEPLOYMENT',
                component: ComponentCreator('/docs/v1.3/service-operator/DEPLOYMENT', '836'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.3/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/docs/v1.3/service-operator/GHCR_AUTHENTICATION', 'ad4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.3/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/docs/v1.3/service-operator/GOOGLE_SSO_SETUP', 'c98'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.3/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/docs/v1.3/service-operator/IAAS_CONSOLE_CONFIGURATION', 'ab2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.3/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/docs/v1.3/service-operator/INSTALL_BAREMETAL_NODE', 'e3d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.3/service-operator/intro',
                component: ComponentCreator('/docs/v1.3/service-operator/intro', '8fb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.3/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/docs/v1.3/service-operator/NETWORK_CONTROL_NODE_SETUP', '66b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.3/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/docs/v1.3/service-operator/OBSERVABILITY_ALERTS', '906'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.3/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/docs/v1.3/service-operator/OBSERVABILITY_DASHBOARDS', '5e4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.3/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/docs/v1.3/service-operator/OPERATOR_API_GUIDE', '752'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.3/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/docs/v1.3/service-operator/OS_REQUIREMENTS', 'c06'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.3/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/docs/v1.3/service-operator/VPN_CONFIGURATION', '9fd'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/docs/v1.4',
        component: ComponentCreator('/docs/v1.4', 'ff1'),
        routes: [
          {
            path: '/docs/v1.4',
            component: ComponentCreator('/docs/v1.4', '081'),
            routes: [
              {
                path: '/docs/v1.4/category/service-operator',
                component: ComponentCreator('/docs/v1.4/category/service-operator', '29b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.4/service-operator/CEPH_SETUP',
                component: ComponentCreator('/docs/v1.4/service-operator/CEPH_SETUP', '42b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.4/service-operator/DEPLOYMENT',
                component: ComponentCreator('/docs/v1.4/service-operator/DEPLOYMENT', '820'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.4/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/docs/v1.4/service-operator/GHCR_AUTHENTICATION', 'cb5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.4/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/docs/v1.4/service-operator/GOOGLE_SSO_SETUP', 'd25'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.4/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/docs/v1.4/service-operator/IAAS_CONSOLE_CONFIGURATION', '5a2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.4/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/docs/v1.4/service-operator/INSTALL_BAREMETAL_NODE', 'b6b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.4/service-operator/intro',
                component: ComponentCreator('/docs/v1.4/service-operator/intro', '58d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.4/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/docs/v1.4/service-operator/NETWORK_CONTROL_NODE_SETUP', 'f83'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.4/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/docs/v1.4/service-operator/OBSERVABILITY_ALERTS', '136'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.4/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/docs/v1.4/service-operator/OBSERVABILITY_DASHBOARDS', '4a6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.4/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/docs/v1.4/service-operator/OPERATOR_API_GUIDE', '409'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.4/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/docs/v1.4/service-operator/OS_REQUIREMENTS', 'a7c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.4/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/docs/v1.4/service-operator/VPN_CONFIGURATION', 'df4'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/docs/v1.5',
        component: ComponentCreator('/docs/v1.5', 'a7c'),
        routes: [
          {
            path: '/docs/v1.5',
            component: ComponentCreator('/docs/v1.5', '5be'),
            routes: [
              {
                path: '/docs/v1.5/category/service-operator',
                component: ComponentCreator('/docs/v1.5/category/service-operator', '9d8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.5/service-operator/CEPH_SETUP',
                component: ComponentCreator('/docs/v1.5/service-operator/CEPH_SETUP', '2ea'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.5/service-operator/DEPLOYMENT',
                component: ComponentCreator('/docs/v1.5/service-operator/DEPLOYMENT', 'e5c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.5/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/docs/v1.5/service-operator/GHCR_AUTHENTICATION', '915'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.5/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/docs/v1.5/service-operator/GOOGLE_SSO_SETUP', '414'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.5/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/docs/v1.5/service-operator/IAAS_CONSOLE_CONFIGURATION', '269'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.5/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/docs/v1.5/service-operator/INSTALL_BAREMETAL_NODE', 'ff2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.5/service-operator/intro',
                component: ComponentCreator('/docs/v1.5/service-operator/intro', '995'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.5/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/docs/v1.5/service-operator/NETWORK_CONTROL_NODE_SETUP', '7ba'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.5/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/docs/v1.5/service-operator/OBSERVABILITY_ALERTS', '44f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.5/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/docs/v1.5/service-operator/OBSERVABILITY_DASHBOARDS', '102'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.5/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/docs/v1.5/service-operator/OPERATOR_API_GUIDE', '519'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.5/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/docs/v1.5/service-operator/OS_REQUIREMENTS', 'ad5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.5/service-operator/ROUTER_BOX_SETUP',
                component: ComponentCreator('/docs/v1.5/service-operator/ROUTER_BOX_SETUP', 'e0b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.5/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/docs/v1.5/service-operator/VPN_CONFIGURATION', '817'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/docs/v1.6',
        component: ComponentCreator('/docs/v1.6', 'cc8'),
        routes: [
          {
            path: '/docs/v1.6',
            component: ComponentCreator('/docs/v1.6', '574'),
            routes: [
              {
                path: '/docs/v1.6/category/service-operator',
                component: ComponentCreator('/docs/v1.6/category/service-operator', '7e3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.6/service-operator/CEPH_SETUP',
                component: ComponentCreator('/docs/v1.6/service-operator/CEPH_SETUP', '2b2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.6/service-operator/DEPLOYMENT',
                component: ComponentCreator('/docs/v1.6/service-operator/DEPLOYMENT', '800'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.6/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/docs/v1.6/service-operator/GHCR_AUTHENTICATION', '5e5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.6/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/docs/v1.6/service-operator/GOOGLE_SSO_SETUP', '4c5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.6/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/docs/v1.6/service-operator/IAAS_CONSOLE_CONFIGURATION', 'a9b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.6/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/docs/v1.6/service-operator/INSTALL_BAREMETAL_NODE', '1d2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.6/service-operator/intro',
                component: ComponentCreator('/docs/v1.6/service-operator/intro', '51a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.6/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/docs/v1.6/service-operator/NETWORK_CONTROL_NODE_SETUP', '969'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.6/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/docs/v1.6/service-operator/OBSERVABILITY_ALERTS', '954'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.6/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/docs/v1.6/service-operator/OBSERVABILITY_DASHBOARDS', '446'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.6/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/docs/v1.6/service-operator/OPERATOR_API_GUIDE', '9ee'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.6/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/docs/v1.6/service-operator/OS_REQUIREMENTS', '7a0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.6/service-operator/ROUTER_BOX_SETUP',
                component: ComponentCreator('/docs/v1.6/service-operator/ROUTER_BOX_SETUP', 'b24'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/v1.6/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/docs/v1.6/service-operator/VPN_CONFIGURATION', '41c'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/docs',
        component: ComponentCreator('/docs', '0f1'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '1ba'),
            routes: [
              {
                path: '/docs/category/service-operator',
                component: ComponentCreator('/docs/category/service-operator', '01b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/OPERATOR_REFERENCE',
                component: ComponentCreator('/docs/OPERATOR_REFERENCE', '9bb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/service-operator/CEPH_SETUP',
                component: ComponentCreator('/docs/service-operator/CEPH_SETUP', '13e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/service-operator/DEPLOYMENT',
                component: ComponentCreator('/docs/service-operator/DEPLOYMENT', '80a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/docs/service-operator/GHCR_AUTHENTICATION', '1b6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/docs/service-operator/GOOGLE_SSO_SETUP', 'c48'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/docs/service-operator/IAAS_CONSOLE_CONFIGURATION', '524'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/docs/service-operator/INSTALL_BAREMETAL_NODE', '50d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/service-operator/intro',
                component: ComponentCreator('/docs/service-operator/intro', '1b0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/docs/service-operator/NETWORK_CONTROL_NODE_SETUP', 'b34'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/docs/service-operator/OBSERVABILITY_ALERTS', '93e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/docs/service-operator/OBSERVABILITY_DASHBOARDS', 'd8e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/docs/service-operator/OPERATOR_API_GUIDE', '7aa'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/docs/service-operator/OS_REQUIREMENTS', 'd46'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/service-operator/ROUTER_BOX_SETUP',
                component: ComponentCreator('/docs/service-operator/ROUTER_BOX_SETUP', '27c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/docs/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/docs/service-operator/VPN_CONFIGURATION', '36a'),
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
    path: '/',
    component: ComponentCreator('/', '2e1'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
