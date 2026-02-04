import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
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
      description="High-end GPU servers for HPC and AI workloads delivered to your doorstep"
    >
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <img
            className={clsx('no-auto-height', styles.heroImage)}
            src={useBaseUrl('img/phoenix.svg')}
            alt="Phoenix Docs"
          />
          <div className={styles.buttons}>
            <Link
            className="button button--secondary button--lg"
            to="/docs/category/service-operator">
            Service Operator
          </Link>
          </div>
        </div>
      </header>

      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">   
              <h3 className="text--center">Clear, practical guidance to using and customizing your cutting-edge GPUs as dedicated resources</h3>
              <p className="text--center">This is your home for rolling out your private AI factory as a software service.</p>
              <p className="text--center">In these pages you will learn to use your Midokura GPU solution to develop your proprietary environments.</p>
            </div>
          </section>
        )}
      </main>

      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <section className={styles.features}>
          <div className="container">
              <h3 className="text--center">Documentation organised by version and backed up with concise Release Notes</h3>
            <div class="panel">

              <div class="panel">
                <div>
                  <h3 className="text--center">Documentation</h3>
                  <p className="text--left">Our documentation is focussed around managing your AI Factory IaaS platform. Here you will learn how to start simple and move progressively through all aspects of your Midokura AI GPU tech stack, from setting up and configuring your storage cluster right through to more complex tasks, such as setting up router boxes to host bootstrap VMs.</p>
                </div>
              </div>

              <div class="panel">
                <div>
                  <h3 className="text--center">Release Notes</h3>
                  <p className="text--left">Every new release of our system will be signalled to you by the arrival of a version-specific set of release notes in your inbox. These release notes, hosted here on this website, will, in clear and brief language, outline the important aspects of new and improved features, as well as flag up any changes or improvements to functional behaviour.</p>
                </div>
              </div>
            </div>
                <h2 className="text--center">Advanced</h2>                   
                <p className="text--center">Once you are comfortable with your configuration and have your system up and running, we will also teach you how to set alerts on your system, build observability dashboards, even how to manage users and tenants with the Operator API and give your users VPN access.</p>

        </div>
        </section>
      </header>

      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">   
              <div><h3 className="text--center">Contribute</h3>
              <h4 className="text--center">Help us improve the AI Factory docs</h4>
              <p className="text--center">If you have something to add to our documentation, feel free to send us a pull request.</p>
              <p className="text--center">The source code for our documentation website can be found in the GitHub link in the navbar at the top of every page.</p>  
            </div>

            </div>
          </section>
        )}
      </main>

    </Layout>
  );
}

export default Home;
