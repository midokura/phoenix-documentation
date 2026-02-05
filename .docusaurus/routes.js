import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/ja/__docusaurus/debug',
    component: ComponentCreator('/ja/__docusaurus/debug', 'e57'),
    exact: true
  },
  {
    path: '/ja/__docusaurus/debug/config',
    component: ComponentCreator('/ja/__docusaurus/debug/config', 'a39'),
    exact: true
  },
  {
    path: '/ja/__docusaurus/debug/content',
    component: ComponentCreator('/ja/__docusaurus/debug/content', 'cfe'),
    exact: true
  },
  {
    path: '/ja/__docusaurus/debug/globalData',
    component: ComponentCreator('/ja/__docusaurus/debug/globalData', '989'),
    exact: true
  },
  {
    path: '/ja/__docusaurus/debug/metadata',
    component: ComponentCreator('/ja/__docusaurus/debug/metadata', 'e32'),
    exact: true
  },
  {
    path: '/ja/__docusaurus/debug/registry',
    component: ComponentCreator('/ja/__docusaurus/debug/registry', 'b2c'),
    exact: true
  },
  {
    path: '/ja/__docusaurus/debug/routes',
    component: ComponentCreator('/ja/__docusaurus/debug/routes', 'c47'),
    exact: true
  },
  {
    path: '/ja/blog',
    component: ComponentCreator('/ja/blog', 'bde'),
    exact: true
  },
  {
    path: '/ja/blog/archive',
    component: ComponentCreator('/ja/blog/archive', 'a57'),
    exact: true
  },
  {
    path: '/ja/blog/authors',
    component: ComponentCreator('/ja/blog/authors', '31a'),
    exact: true
  },
  {
    path: '/ja/blog/authors/alexanderfandos',
    component: ComponentCreator('/ja/blog/authors/alexanderfandos', '2cb'),
    exact: true
  },
  {
    path: '/ja/blog/authors/alexandervera',
    component: ComponentCreator('/ja/blog/authors/alexandervera', '403'),
    exact: true
  },
  {
    path: '/ja/blog/authors/galonavarro',
    component: ComponentCreator('/ja/blog/authors/galonavarro', '773'),
    exact: true
  },
  {
    path: '/ja/blog/authors/jimkennedy',
    component: ComponentCreator('/ja/blog/authors/jimkennedy', 'c16'),
    exact: true
  },
  {
    path: '/ja/blog/authors/sergimiralles',
    component: ComponentCreator('/ja/blog/authors/sergimiralles', 'ce6'),
    exact: true
  },
  {
    path: '/ja/blog/tags',
    component: ComponentCreator('/ja/blog/tags', 'e5d'),
    exact: true
  },
  {
    path: '/ja/blog/tags/phoenix',
    component: ComponentCreator('/ja/blog/tags/phoenix', '5d4'),
    exact: true
  },
  {
    path: '/ja/blog/v1.0',
    component: ComponentCreator('/ja/blog/v1.0', '393'),
    exact: true
  },
  {
    path: '/ja/blog/v1.1',
    component: ComponentCreator('/ja/blog/v1.1', '826'),
    exact: true
  },
  {
    path: '/ja/blog/v1.2',
    component: ComponentCreator('/ja/blog/v1.2', '2d6'),
    exact: true
  },
  {
    path: '/ja/blog/v1.3',
    component: ComponentCreator('/ja/blog/v1.3', 'd5b'),
    exact: true
  },
  {
    path: '/ja/blog/v1.4',
    component: ComponentCreator('/ja/blog/v1.4', 'ab8'),
    exact: true
  },
  {
    path: '/ja/blog/v1.5',
    component: ComponentCreator('/ja/blog/v1.5', '58e'),
    exact: true
  },
  {
    path: '/ja/blog/v1.6',
    component: ComponentCreator('/ja/blog/v1.6', '7f7'),
    exact: true
  },
  {
    path: '/ja/blog/v1.7',
    component: ComponentCreator('/ja/blog/v1.7', '27b'),
    exact: true
  },
  {
    path: '/ja/search',
    component: ComponentCreator('/ja/search', 'a50'),
    exact: true
  },
  {
    path: '/ja/docs',
    component: ComponentCreator('/ja/docs', '879'),
    routes: [
      {
        path: '/ja/docs/next',
        component: ComponentCreator('/ja/docs/next', '618'),
        routes: [
          {
            path: '/ja/docs/next',
            component: ComponentCreator('/ja/docs/next', '0b3'),
            routes: [
              {
                path: '/ja/docs/next/category/service-operator',
                component: ComponentCreator('/ja/docs/next/category/service-operator', '4fe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/next/OPERATOR_REFERENCE',
                component: ComponentCreator('/ja/docs/next/OPERATOR_REFERENCE', '061'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/next/service-operator/CEPH_SETUP',
                component: ComponentCreator('/ja/docs/next/service-operator/CEPH_SETUP', '1a8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/next/service-operator/DEPLOYMENT',
                component: ComponentCreator('/ja/docs/next/service-operator/DEPLOYMENT', '3ba'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/next/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/ja/docs/next/service-operator/GHCR_AUTHENTICATION', '2fd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/next/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/ja/docs/next/service-operator/GOOGLE_SSO_SETUP', '4a4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/next/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/ja/docs/next/service-operator/IAAS_CONSOLE_CONFIGURATION', '4d4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/next/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/ja/docs/next/service-operator/INSTALL_BAREMETAL_NODE', 'dd4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/next/service-operator/intro',
                component: ComponentCreator('/ja/docs/next/service-operator/intro', '31b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/next/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/ja/docs/next/service-operator/NETWORK_CONTROL_NODE_SETUP', '0e0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/next/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/ja/docs/next/service-operator/OBSERVABILITY_ALERTS', '693'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/next/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/ja/docs/next/service-operator/OBSERVABILITY_DASHBOARDS', 'ecf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/next/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/ja/docs/next/service-operator/OPERATOR_API_GUIDE', '809'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/next/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/ja/docs/next/service-operator/OS_REQUIREMENTS', 'ae6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/next/service-operator/ROUTER_BOX_SETUP',
                component: ComponentCreator('/ja/docs/next/service-operator/ROUTER_BOX_SETUP', 'da2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/next/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/ja/docs/next/service-operator/VPN_CONFIGURATION', '4bb'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/ja/docs/v1.0',
        component: ComponentCreator('/ja/docs/v1.0', '6ba'),
        routes: [
          {
            path: '/ja/docs/v1.0',
            component: ComponentCreator('/ja/docs/v1.0', '9a2'),
            routes: [
              {
                path: '/ja/docs/v1.0/category/service-operator',
                component: ComponentCreator('/ja/docs/v1.0/category/service-operator', 'bfd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.0/service-operator/CEPH_SETUP',
                component: ComponentCreator('/ja/docs/v1.0/service-operator/CEPH_SETUP', 'bbf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.0/service-operator/DEPLOYMENT',
                component: ComponentCreator('/ja/docs/v1.0/service-operator/DEPLOYMENT', '6bc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.0/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/ja/docs/v1.0/service-operator/GHCR_AUTHENTICATION', 'e75'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.0/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/ja/docs/v1.0/service-operator/GOOGLE_SSO_SETUP', '7cd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.0/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/ja/docs/v1.0/service-operator/IAAS_CONSOLE_CONFIGURATION', '40e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.0/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/ja/docs/v1.0/service-operator/INSTALL_BAREMETAL_NODE', '8b4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.0/service-operator/intro',
                component: ComponentCreator('/ja/docs/v1.0/service-operator/intro', '30c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.0/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/ja/docs/v1.0/service-operator/NETWORK_CONTROL_NODE_SETUP', 'eb2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.0/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/ja/docs/v1.0/service-operator/OBSERVABILITY_ALERTS', '3fe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.0/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/ja/docs/v1.0/service-operator/OBSERVABILITY_DASHBOARDS', '7f0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.0/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/ja/docs/v1.0/service-operator/OPERATOR_API_GUIDE', '513'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.0/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/ja/docs/v1.0/service-operator/OS_REQUIREMENTS', 'c2d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.0/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/ja/docs/v1.0/service-operator/VPN_CONFIGURATION', 'cf4'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/ja/docs/v1.1',
        component: ComponentCreator('/ja/docs/v1.1', 'b00'),
        routes: [
          {
            path: '/ja/docs/v1.1',
            component: ComponentCreator('/ja/docs/v1.1', '538'),
            routes: [
              {
                path: '/ja/docs/v1.1/category/service-operator',
                component: ComponentCreator('/ja/docs/v1.1/category/service-operator', '204'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.1/service-operator/CEPH_SETUP',
                component: ComponentCreator('/ja/docs/v1.1/service-operator/CEPH_SETUP', 'b26'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.1/service-operator/DEPLOYMENT',
                component: ComponentCreator('/ja/docs/v1.1/service-operator/DEPLOYMENT', '387'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.1/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/ja/docs/v1.1/service-operator/GHCR_AUTHENTICATION', '057'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.1/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/ja/docs/v1.1/service-operator/GOOGLE_SSO_SETUP', 'dde'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.1/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/ja/docs/v1.1/service-operator/IAAS_CONSOLE_CONFIGURATION', '099'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.1/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/ja/docs/v1.1/service-operator/INSTALL_BAREMETAL_NODE', '99c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.1/service-operator/intro',
                component: ComponentCreator('/ja/docs/v1.1/service-operator/intro', '3cf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.1/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/ja/docs/v1.1/service-operator/NETWORK_CONTROL_NODE_SETUP', '974'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.1/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/ja/docs/v1.1/service-operator/OBSERVABILITY_ALERTS', '4db'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.1/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/ja/docs/v1.1/service-operator/OBSERVABILITY_DASHBOARDS', 'ad9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.1/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/ja/docs/v1.1/service-operator/OPERATOR_API_GUIDE', '51b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.1/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/ja/docs/v1.1/service-operator/OS_REQUIREMENTS', '17f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.1/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/ja/docs/v1.1/service-operator/VPN_CONFIGURATION', '5a8'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/ja/docs/v1.2',
        component: ComponentCreator('/ja/docs/v1.2', '1a5'),
        routes: [
          {
            path: '/ja/docs/v1.2',
            component: ComponentCreator('/ja/docs/v1.2', 'bcd'),
            routes: [
              {
                path: '/ja/docs/v1.2/category/service-operator',
                component: ComponentCreator('/ja/docs/v1.2/category/service-operator', '216'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.2/service-operator/CEPH_SETUP',
                component: ComponentCreator('/ja/docs/v1.2/service-operator/CEPH_SETUP', 'b5b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.2/service-operator/DEPLOYMENT',
                component: ComponentCreator('/ja/docs/v1.2/service-operator/DEPLOYMENT', '82d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.2/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/ja/docs/v1.2/service-operator/GHCR_AUTHENTICATION', '620'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.2/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/ja/docs/v1.2/service-operator/GOOGLE_SSO_SETUP', 'f19'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.2/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/ja/docs/v1.2/service-operator/IAAS_CONSOLE_CONFIGURATION', '606'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.2/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/ja/docs/v1.2/service-operator/INSTALL_BAREMETAL_NODE', '4e1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.2/service-operator/intro',
                component: ComponentCreator('/ja/docs/v1.2/service-operator/intro', '632'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.2/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/ja/docs/v1.2/service-operator/NETWORK_CONTROL_NODE_SETUP', '303'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.2/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/ja/docs/v1.2/service-operator/OBSERVABILITY_ALERTS', '837'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.2/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/ja/docs/v1.2/service-operator/OBSERVABILITY_DASHBOARDS', '653'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.2/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/ja/docs/v1.2/service-operator/OPERATOR_API_GUIDE', '222'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.2/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/ja/docs/v1.2/service-operator/OS_REQUIREMENTS', '8fc'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.2/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/ja/docs/v1.2/service-operator/VPN_CONFIGURATION', '1a5'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/ja/docs/v1.3',
        component: ComponentCreator('/ja/docs/v1.3', '729'),
        routes: [
          {
            path: '/ja/docs/v1.3',
            component: ComponentCreator('/ja/docs/v1.3', '4cf'),
            routes: [
              {
                path: '/ja/docs/v1.3/category/service-operator',
                component: ComponentCreator('/ja/docs/v1.3/category/service-operator', 'b15'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.3/service-operator/CEPH_SETUP',
                component: ComponentCreator('/ja/docs/v1.3/service-operator/CEPH_SETUP', '286'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.3/service-operator/DEPLOYMENT',
                component: ComponentCreator('/ja/docs/v1.3/service-operator/DEPLOYMENT', '388'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.3/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/ja/docs/v1.3/service-operator/GHCR_AUTHENTICATION', 'db9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.3/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/ja/docs/v1.3/service-operator/GOOGLE_SSO_SETUP', 'c8a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.3/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/ja/docs/v1.3/service-operator/IAAS_CONSOLE_CONFIGURATION', 'd89'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.3/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/ja/docs/v1.3/service-operator/INSTALL_BAREMETAL_NODE', '7a7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.3/service-operator/intro',
                component: ComponentCreator('/ja/docs/v1.3/service-operator/intro', 'c7d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.3/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/ja/docs/v1.3/service-operator/NETWORK_CONTROL_NODE_SETUP', 'eed'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.3/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/ja/docs/v1.3/service-operator/OBSERVABILITY_ALERTS', 'a52'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.3/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/ja/docs/v1.3/service-operator/OBSERVABILITY_DASHBOARDS', '476'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.3/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/ja/docs/v1.3/service-operator/OPERATOR_API_GUIDE', '03e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.3/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/ja/docs/v1.3/service-operator/OS_REQUIREMENTS', '47f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.3/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/ja/docs/v1.3/service-operator/VPN_CONFIGURATION', '110'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/ja/docs/v1.4',
        component: ComponentCreator('/ja/docs/v1.4', 'db6'),
        routes: [
          {
            path: '/ja/docs/v1.4',
            component: ComponentCreator('/ja/docs/v1.4', '8e3'),
            routes: [
              {
                path: '/ja/docs/v1.4/category/service-operator',
                component: ComponentCreator('/ja/docs/v1.4/category/service-operator', '75a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.4/service-operator/CEPH_SETUP',
                component: ComponentCreator('/ja/docs/v1.4/service-operator/CEPH_SETUP', '7b3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.4/service-operator/DEPLOYMENT',
                component: ComponentCreator('/ja/docs/v1.4/service-operator/DEPLOYMENT', 'd01'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.4/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/ja/docs/v1.4/service-operator/GHCR_AUTHENTICATION', '553'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.4/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/ja/docs/v1.4/service-operator/GOOGLE_SSO_SETUP', '1f4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.4/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/ja/docs/v1.4/service-operator/IAAS_CONSOLE_CONFIGURATION', '5db'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.4/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/ja/docs/v1.4/service-operator/INSTALL_BAREMETAL_NODE', '912'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.4/service-operator/intro',
                component: ComponentCreator('/ja/docs/v1.4/service-operator/intro', '8f2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.4/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/ja/docs/v1.4/service-operator/NETWORK_CONTROL_NODE_SETUP', 'f87'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.4/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/ja/docs/v1.4/service-operator/OBSERVABILITY_ALERTS', '3eb'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.4/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/ja/docs/v1.4/service-operator/OBSERVABILITY_DASHBOARDS', '72f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.4/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/ja/docs/v1.4/service-operator/OPERATOR_API_GUIDE', '113'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.4/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/ja/docs/v1.4/service-operator/OS_REQUIREMENTS', 'd98'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.4/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/ja/docs/v1.4/service-operator/VPN_CONFIGURATION', '4d1'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/ja/docs/v1.5',
        component: ComponentCreator('/ja/docs/v1.5', '2b4'),
        routes: [
          {
            path: '/ja/docs/v1.5',
            component: ComponentCreator('/ja/docs/v1.5', 'd6e'),
            routes: [
              {
                path: '/ja/docs/v1.5/category/service-operator',
                component: ComponentCreator('/ja/docs/v1.5/category/service-operator', '16a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.5/service-operator/CEPH_SETUP',
                component: ComponentCreator('/ja/docs/v1.5/service-operator/CEPH_SETUP', '81b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.5/service-operator/DEPLOYMENT',
                component: ComponentCreator('/ja/docs/v1.5/service-operator/DEPLOYMENT', 'a1f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.5/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/ja/docs/v1.5/service-operator/GHCR_AUTHENTICATION', 'b1c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.5/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/ja/docs/v1.5/service-operator/GOOGLE_SSO_SETUP', '57e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.5/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/ja/docs/v1.5/service-operator/IAAS_CONSOLE_CONFIGURATION', '36e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.5/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/ja/docs/v1.5/service-operator/INSTALL_BAREMETAL_NODE', 'c59'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.5/service-operator/intro',
                component: ComponentCreator('/ja/docs/v1.5/service-operator/intro', 'f90'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.5/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/ja/docs/v1.5/service-operator/NETWORK_CONTROL_NODE_SETUP', '7b2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.5/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/ja/docs/v1.5/service-operator/OBSERVABILITY_ALERTS', '4a9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.5/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/ja/docs/v1.5/service-operator/OBSERVABILITY_DASHBOARDS', 'bd6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.5/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/ja/docs/v1.5/service-operator/OPERATOR_API_GUIDE', 'a57'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.5/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/ja/docs/v1.5/service-operator/OS_REQUIREMENTS', '4ca'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.5/service-operator/ROUTER_BOX_SETUP',
                component: ComponentCreator('/ja/docs/v1.5/service-operator/ROUTER_BOX_SETUP', 'ef2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.5/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/ja/docs/v1.5/service-operator/VPN_CONFIGURATION', 'bf7'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/ja/docs/v1.6',
        component: ComponentCreator('/ja/docs/v1.6', '8d5'),
        routes: [
          {
            path: '/ja/docs/v1.6',
            component: ComponentCreator('/ja/docs/v1.6', '53e'),
            routes: [
              {
                path: '/ja/docs/v1.6/category/service-operator',
                component: ComponentCreator('/ja/docs/v1.6/category/service-operator', 'c6f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.6/service-operator/CEPH_SETUP',
                component: ComponentCreator('/ja/docs/v1.6/service-operator/CEPH_SETUP', 'c3a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.6/service-operator/DEPLOYMENT',
                component: ComponentCreator('/ja/docs/v1.6/service-operator/DEPLOYMENT', 'def'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.6/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/ja/docs/v1.6/service-operator/GHCR_AUTHENTICATION', '5c2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.6/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/ja/docs/v1.6/service-operator/GOOGLE_SSO_SETUP', '1e5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.6/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/ja/docs/v1.6/service-operator/IAAS_CONSOLE_CONFIGURATION', 'edd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.6/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/ja/docs/v1.6/service-operator/INSTALL_BAREMETAL_NODE', 'b05'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.6/service-operator/intro',
                component: ComponentCreator('/ja/docs/v1.6/service-operator/intro', 'bb1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.6/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/ja/docs/v1.6/service-operator/NETWORK_CONTROL_NODE_SETUP', 'f9c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.6/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/ja/docs/v1.6/service-operator/OBSERVABILITY_ALERTS', '0e2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.6/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/ja/docs/v1.6/service-operator/OBSERVABILITY_DASHBOARDS', '774'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.6/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/ja/docs/v1.6/service-operator/OPERATOR_API_GUIDE', '7b7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.6/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/ja/docs/v1.6/service-operator/OS_REQUIREMENTS', 'e0b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.6/service-operator/ROUTER_BOX_SETUP',
                component: ComponentCreator('/ja/docs/v1.6/service-operator/ROUTER_BOX_SETUP', '4ef'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/v1.6/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/ja/docs/v1.6/service-operator/VPN_CONFIGURATION', '0c6'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      },
      {
        path: '/ja/docs',
        component: ComponentCreator('/ja/docs', '901'),
        routes: [
          {
            path: '/ja/docs',
            component: ComponentCreator('/ja/docs', '912'),
            routes: [
              {
                path: '/ja/docs/category/service-operator',
                component: ComponentCreator('/ja/docs/category/service-operator', 'e42'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/OPERATOR_REFERENCE',
                component: ComponentCreator('/ja/docs/OPERATOR_REFERENCE', '2a4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/service-operator/CEPH_SETUP',
                component: ComponentCreator('/ja/docs/service-operator/CEPH_SETUP', '225'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/service-operator/DEPLOYMENT',
                component: ComponentCreator('/ja/docs/service-operator/DEPLOYMENT', 'c17'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/service-operator/GHCR_AUTHENTICATION',
                component: ComponentCreator('/ja/docs/service-operator/GHCR_AUTHENTICATION', '47c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/service-operator/GOOGLE_SSO_SETUP',
                component: ComponentCreator('/ja/docs/service-operator/GOOGLE_SSO_SETUP', 'f8e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/service-operator/IAAS_CONSOLE_CONFIGURATION',
                component: ComponentCreator('/ja/docs/service-operator/IAAS_CONSOLE_CONFIGURATION', 'e81'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/service-operator/INSTALL_BAREMETAL_NODE',
                component: ComponentCreator('/ja/docs/service-operator/INSTALL_BAREMETAL_NODE', 'ec2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/service-operator/intro',
                component: ComponentCreator('/ja/docs/service-operator/intro', '50b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/service-operator/NETWORK_CONTROL_NODE_SETUP',
                component: ComponentCreator('/ja/docs/service-operator/NETWORK_CONTROL_NODE_SETUP', 'f00'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/service-operator/OBSERVABILITY_ALERTS',
                component: ComponentCreator('/ja/docs/service-operator/OBSERVABILITY_ALERTS', '974'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/service-operator/OBSERVABILITY_DASHBOARDS',
                component: ComponentCreator('/ja/docs/service-operator/OBSERVABILITY_DASHBOARDS', 'e73'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/service-operator/OPERATOR_API_GUIDE',
                component: ComponentCreator('/ja/docs/service-operator/OPERATOR_API_GUIDE', 'a88'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/service-operator/OS_REQUIREMENTS',
                component: ComponentCreator('/ja/docs/service-operator/OS_REQUIREMENTS', '554'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/service-operator/ROUTER_BOX_SETUP',
                component: ComponentCreator('/ja/docs/service-operator/ROUTER_BOX_SETUP', 'efe'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/ja/docs/service-operator/VPN_CONFIGURATION',
                component: ComponentCreator('/ja/docs/service-operator/VPN_CONFIGURATION', 'a75'),
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
    path: '/ja/',
    component: ComponentCreator('/ja/', '2d1'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
