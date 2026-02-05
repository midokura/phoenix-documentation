import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const features = [
  {
    title: '',
    description: <></>,
    links: [
    ],
  },

];

function Feature({ imageUrl, title, description, links }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={clsx('col col--3', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={clsx('no-auto-height', styles.featureImage)} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
      {FeatureItems(links)}
    </div>
  );
}

function FeatureItems(links) {
  return (
    <ul class="feature-list">
      {links.map(({ url, title, items }) => (
        <li>
          <Link to={useBaseUrl(url)}>{title}</Link>
          {items?.length && FeatureItems(items)}
        </li>
      ))}
    </ul>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description={siteConfig.tagline}
    >
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title"><Translate>Midokura AI Factory</Translate></h1>
          <p className="hero__subtitle"><Translate>High-end GPU servers for HPC and AI workloads delivered to your doorstep</Translate></p>
          <img
            className={clsx('no-auto-height', styles.heroImage)}
            src={useBaseUrl('img/phoenix.svg')}
            alt={
              translate({
                message: 'AI Factory Docs',
                description: 'AI Factory Docs',
              })
            }
          />
          <div className={styles.buttons}>
            <Link
            className="button button--secondary button--lg"
            to="/docs/category/service-operator"><Translate>
            Service Operator</Translate>
          </Link>
          </div>
        </div>
      </header>

      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">   
              <h3 className="text--center"><Translate>Clear, practical guidance to using and customizing your cutting-edge GPUs as dedicated resources</Translate></h3>
              <p className="text--center"><Translate>This is your home for rolling out your private AI factory as a software service.</Translate></p>
              <p className="text--center"><Translate>In these pages you will learn to use your Midokura GPU solution to develop your proprietary environments.</Translate></p>
            </div>
          </section>
        )}
      </main>

      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <section className={styles.features}>
          <div className="container">
              <h3 className="text--center"><Translate>Documentation organised by version and backed up with concise Release Notes</Translate></h3>
            <div class="panel">

              <div class="panel">
                <div>
                  <h3 className="text--center"><Translate>Documentation</Translate></h3>
                  <p className="text--left"><Translate>Our documentation is focussed around managing your AI Factory IaaS platform. Here you will learn how to start simple and move progressively through all aspects of your Midokura AI GPU tech stack, from setting up and configuring your storage cluster right through to more complex tasks, such as setting up router boxes to host bootstrap VMs.</Translate></p>
                </div>
              </div>

              <div class="panel">
                <div>
                  <h3 className="text--center"><Translate>Release Notes</Translate></h3>
                  <p className="text--left"><Translate>Every new release of our system will be signalled to you by the arrival of a version-specific set of release notes in your inbox. These release notes, hosted here on this website, will, in clear and brief language, outline the important aspects of new and improved features, as well as flag up any changes or improvements to functional behaviour.</Translate></p>
                </div>
              </div>
            </div>
                <h2 className="text--center"><Translate>Advanced</Translate></h2>                   
                <p className="text--center"><Translate>Once you are comfortable with your configuration and have your system up and running, we will also teach you how to set alerts on your system, build observability dashboards, even how to manage users and tenants with the Operator API and give your users VPN access.</Translate></p>

        </div>
        </section>
      </header>

      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">   
              <div><h3 className="text--center"><Translate>Contribute</Translate></h3>
              <h4 className="text--center"><Translate>Help us improve the AI Factory docs</Translate></h4>
              <p className="text--center"><Translate>If you have something to add to our documentation, feel free to send us a pull request.</Translate></p>
              <p className="text--center"><Translate>The source code for our documentation website can be found in the GitHub link in the navbar at the top of every page.</Translate></p>  
            </div>

            </div>
          </section>
        )}
      </main>

    </Layout>
  );
}

export default Home;
