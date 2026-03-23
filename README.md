# Midokura AI Factory Documentation Website

These are the publicly available source files for the Midokura AI Factory Documentation [website](https://docs.midokura.com), which is build in [Docusaurus](https://docusaurus.io/).

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

Once you merge your changes to `main`, the website will rebuild with the new version available in the navigation bar dropdown.

## Add a Release Note

Each version of the docs requires a version release note, automatically generated based on this [release notes template](blog/.YYYY-MM-DD-aifactory-vX.X.md).

## Remove a Version

If we need to remove a no-longer-supported version of the docs from the website, remove the reference to the version in `versions.json`. Note that this doesn't delete the version source files, but just unpublishes them from the website.

## Deployment

- Any push to `main` results in a build to the website.
