# Website

This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

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

## Deployment

TBD

## Add a Version

When you want to create a new version of the docs do:

```bash
yarn docusaurus docs:version v9.9
```

where `v9.9` should be replaced with the version you require.

This command will:

- Copy the full docs/ folder contents into a new `versioned_docs/version-[v9.9]/ folder`.
- Create a versioned sidebars file `versioned_sidebars/version-[versionName]-sidebars.json`.
- Add the new version number to `versions.json`.

## Remove a Version

If we need to remove a no-longer-supported version of the docs from the website, remove the reference to the version in `versions.json`. Note that this doesn't delete the version source files, but just unpublishes them from the website.

# To Do

## Right Now

At the moment the repo is public (under Jim's name) and the website is public (on github pages), therefore we can only use Lorem Ipsum content.

- Recall that we are working now in the phoenix-documentation repo
- Recall that it is only on my laptop not the online repo
- First job is to move work to the phoenix-documentation repo on the online repo
- Check with Aaron on status of:

https://aitrios.atlassian.net/browse/CTRL-4921

https://aitrios.atlassian.net/browse/CTRL-4920

https://aitrios.atlassian.net/browse/CTRL-4917

- Check if the phoenix svg is legal to use
- Check how it looks on mobile
- Use Midokura colours

## Next Up

Once the repo is private (under the Midokura name) and the website is password-protected (on docs.midokura.com), we can start adding the real content.

- Install Docusaurus on the phoenix-documentation repo
- Update /draft/_authors.yml for all authors
- Update blog/authors.yml from /draft/_authors.yml
- Add password protection
- Add password to bitwarden
- Add some marketing text content for the front page
- In the navbar should we remove direct link to Github repo, if clients cannot access it?
- Rewrite the README above to explain how to do a docs release 

## Done

- Switch Lorem Ipsum content for real content
- Updated main and all other versioned docs folders.
- Update the three '/docs/intro' links in the config file to proper locations
- In the navbar, rename Tutorial to Docs
- In the navbar, rename Blog to Release Notes
- - Add placeholders for various releases
- Tidy up the phrasing of the copyright notice, currently Copyright © 2026 Midokura
- Replace footer logo with Midokura text logo
- Remove 'Next' from releases list, so that the website only updates on version releases, not on pushes to main. This was set by 'includeCurrentVersion: false,'
- Make background  hero image color gradient in Midokura colors
