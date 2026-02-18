# Midokura AI Factory Documentation Website

These are the source files for the Midokura AI Factory Documentation [website](https://docs.midokura.com). It is build in [Docusaurus](https://docusaurus.io/).

## Installation

```bash
yarn
```

## Local Development

```bash
yarn run start
```

This command starts a local development server and opens up a browser window at: [http://localhost:3000/](http://localhost:3000/). Most changes are reflected live without having to restart the server.

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

## Add a Release Note

Each version of the docs requires a version release note.

- Follow the commented-out instructions in the [release notes template](blog/.YYYY-MM-DD-aifactory-vX.X.md)

## Remove a Version

If we need to remove a no-longer-supported version of the docs from the website, remove the reference to the version in `versions.json`. Note that this doesn't delete the version source files, but just unpublishes them from the website.

## Deployment

- Pushes to main result in build to website

# To Do

- Remove extra github workflows (there are some duplicates)
- Check tickets under https://midokura.atlassian.net/browse/GPD-596
  - https://midokura.atlassian.net/browse/GPD-597
  - https://midokura.atlassian.net/browse/GPD-598
  - https://midokura.atlassian.net/browse/GPD-600
- Turn off 'Next' (main) once /ja is populated https://midokura.atlassian.net/browse/GPD-601
- Translate to Japanese (Mari is on it)
  - Roll out for v2.x
  - Devise methodology for translating release notes ahead of release day
  - Write up howto for translation
  - Uncomment the translation nav
- Customise the 404 page
  
## Done

- Customise popup banner page <- won't do, as the banner is great already
- Add 'Back to Top' button at the bottom, especially for mobile
- Use Midokura colours
- Update the README above to explain how to do a docs release
- Find a logo or image for the new name <- logo is ok as is
- Translate to Japanese
  - Ping Mari with instructions
- Review all content to remove any internal Midokura references
- Create new release notes template on GitHub
- Translate to Japanese - Do the relevant parts of <<https://docusaurus.io/docs/i18n/>
- Set DNS nameservers to redirect to docs.midokura.com
- Find out how to translate the index.js page (front page) <- covered in the docusaurus docs
- Should we use the phoenix svg if we are not using Phoenix as the name? <- in the absence of a different logo, we will keep it
- Check if the phoenix svg is legal to use <- free license
- Reduce size of white logo in footer <- No, won't do: it looks great
- In the navbar should we remove direct link to Github repo? <- No, won't do
- Make splash page two-panel section (documentation / release notes) responsive for mobile
- Replace 'Phoenix' with the new name throughout
- Add v1.7 release notes
- We need to change the name because 'Phoenix' is internal only <-- AI Factory
- Add v1.7 docs
- Change to Montserrat font
- Switch footer logo to white version from Clàudia
- Add some marketing text content for the front page. JF and Clàudia will help with the text
- Make repo public
- Publish to Github Pages
- Change 'Blog' to 'Release Notes' in the tab
- Move Operator Reference out of RNs and into Docs
- All plaintext references in RNs and Docs should be hyperlinked
- All references to 'foo.md' should be changed to 'foo'
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
