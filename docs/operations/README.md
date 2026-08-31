---
sidebar_position: 50
---

# README for Operational

This is the proposed structure for the Operations documentation. 

At the moment (August 31, 2026) files in this `/operations` folder are automatically excluded from publication. 

Think of this as a drafts folder where you can write up the upcoming Operations documentation, in a portable markdown format, regardless of how or where it eventually gets published.

SNC questions are collated in this [Google Doc](https://docs.google.com/spreadsheets/d/1-lSBu21aGSEUG5RHiS_0wa08n2q3YpV-Dqye9DJjknY/edit?gid=643483805#gid=643483805).

Once these questions are answered we could refined it into the Operation Guide or an FAQ, as appropriate.

## Publishing cycle

It is likely that the eventual published Operation Guide will be updated and released on a different release cycle to the regular documentation and the upgrade guides. This is easily achieved in the current docuemntation package Docusaurus and doesn't need to concern us here.

## How to publish this folder

When/If it becomes appropriate to publish the /operations folder and its contents you will need to edit the `/docusaurus.config.js` file to remove this line:

```
exclude: ['**/operations/**'], // Exclude this folder
```
