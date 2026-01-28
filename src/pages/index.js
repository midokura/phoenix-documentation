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
      description="High-end GPU servers for HPC and AI workloads delivered to your doorstep."
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
              <h2 className="text--center">Midokura Phoenix Documentation</h2>
              <h3 className="text--center">Clear, practical guidance to using and customizing your cutting-edge GPUs as dedicated resources</h3>
              <p className="text--center">In these pages you will learn to use your Midokura GPU solution to develop your proprietary environments.</p>
              <p className="text--center">With guidance organised by version and backed up with concise Release Notes, this is your home for rolling out your private AI factory as a software service.</p>
              <h2 className="text--center">Sections</h2>
              <p className="text--center">In the Docs section ... lorem ipsum</p>
              <p className="text--center">Each new release is accompanied by Release Notes ... lorem ipsum</p>
              <h2 className="text--center">Contribute</h2>
              <h4 className="text--center">Help us improve the Phoenix docs</h4>
              <p className="text--center">If you have something to add to our documentation, feel free to send us a pull request.</p>
              <p className="text--center">The source code for our documentation website can be found in the GitHub link in the navbar at the top of every page.</p>    
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;