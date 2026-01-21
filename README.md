# Phoenix Documentation Website

The Phoenix Documentation website is built from this repo using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Installation

```bash
yarn
```

## Local Development

```bash
yarn run start
```

This command starts a local development server and opens up a browser window at: [http://localhost:3000/foo/](http://localhost:3000/foo/). Most changes are reflected live without having to restart the server.

Use Control + c to kill the localhost.

## Build

```bash
yarn run build
```

This command generates static content into the `build` directory. This `build` directory is not used to build the website, but this step is provided here in case you want to build a local copy.

## Add a Version

When you want to create a new version of the docs do:

```bash
yarn docusaurus docs:version v9.9
```

where `v9.9` should be replaced with the version you require.

This command will:

- Copy the full docs/ folder contents into a new `versioned_docs/version-v9.9/` folder.
- Create a versioned sidebars file `versioned_sidebars/version-v9.9-sidebars.json`.
- Add the new version number to `versions.json`.

## Remove a Version

If we need to remove a no-longer-supported version of the docs from the website, remove the reference to the version in `versions.json`. Note that this doesn't delete the version source files, but just unpublishes them from the website.

## Deployment

TBD

# To Do

The new intention (January 21, 2026) is that the website will be public. This has some impact on the work to be done (positive impact, fewer complications).

- Review all content to remove any internal Midokura references
- Add some marketing text content for the front page - JF and Clàudia will help with the text
- We need to change the name because 'Phoenix' is internal only
- Replace 'Phoenix' with the new name throughout
- Check if the phoenix svg is legal to use
- Should we use the phoenix svg if we are not using Phoenix as the name?
- Find a logo or image for the new name
- Check how website looks on mobile
- Use Midokura colours
- In the navbar should we remove direct link to Github repo?
- Update the README above to explain how to do a docs release
- Make repo public
- Publish to Github Pages
- Set DNS nameservers to redirect to docs.midokura.com

## Done

- Add password protection -> no longer required
- Add password to bitwarden -> no longer required
- Check if we want a public or private website -> the decision is that it will be a public website
- Update blog/authors.yml from /draft/_authors.yml
- Update /draft/_authors.yml for all authors
- Install Docusaurus on the phoenix-documentation repo
- Ping the company/authors to explain repo changes
- Make the repo private (under the Midokura name)
- Move work to the phoenix-documentation repo on the online repo
- Check with Aaron on status of:
    - <https://aitrios.atlassian.net/browse/CTRL-4921>
    - <https://aitrios.atlassian.net/browse/CTRL-4920>
    - <https://aitrios.atlassian.net/browse/CTRL-4917>
- Switch Lorem Ipsum content for real content
- Updated main and all other versioned docs folders.
- Update the three '/docs/intro' links in the config file to proper locations
- In the navbar, rename Tutorial to Docs
- In the navbar, rename Blog to Release Notes
- Add placeholders for various releases
- Tidy up the phrasing of the copyright notice, currently Copyright © 2026 Midokura
- Replace footer logo with Midokura text logo
- Remove 'Next' from releases list, so that the website only updates on version releases, not on pushes to main. This was set by 'includeCurrentVersion: false,'
- Make background hero image color gradient in Midokura colors
