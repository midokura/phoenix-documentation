# phoenix-documentation GitHub repository stylesheet

At the moment we do not require adherence to any particular style guide, but we do have a small number of guidelines about Markdown and some other points.

Our [Docs website](https://docs.midokura.com) is build in Docusaurus and so uses commonmark Markdown - we broadly follow this [markdown cheatsheet](https://commonmark.org/help/).

There are a couple of style points that pop up frequently in our writing, so I'm going to address those here.

## Line 3 of every file (index card preview)

Each file should have the following format at the start:

```
# Tenant service termination

Removing tenant data upon service termination

This runbook defines the procedure for terminating a tenant's service and ensuring all associated data is fully removed. The primary mechanism is the `DELETE /api/tenants/{tenant_id}` API endpoint, which orchestrates deletion of all tenant resources in the correct order.
````

Line 3 should:

- be a very short sentence fragment
- begin with an action word
- end with no full stop

The purpose of this line is to appear in the index card preview of the folder, like this:
![Index Card](/static/img/styleguide/index-card.png)

If it's too long, it doesn't fit onscreen and so doesn't work.

The paragraph after Line 3 is the more traditional introductory paragraph. There's a bit of overlap/redundancy here, but the two things serve different purposes.

## For Example

Please don't use e.g., etc. Instead write:

```
For example,
````

Or

```
Lorem, ipsum, and so on.
```

## Admonitions

If you want to put a Note, Warning, Info box, etc., we use the following Admonitions syntax:

```
:::note

Some **content** with _Markdown_ `syntax`.

:::
```

Key points:

- The blank line after :::note and the one before the closing ::: are needed for prettier code formatter
- Without these blank lines, the admonition might render as regular text

More reading (about options beyond Note) [here](https://docusaurus.io/docs/markdown-features/admonitions).

## No em dashes

- They're too long, particularly in page titles
- Replace them with colons or just leave them out entirely

## Final line of the file must be blank

![Penultimate](/static/img/styleguide/penultimate.jpg)

- The very last line of any file should be a blank line
- This is because text lines are terminated with newlines. So omitting the last newline technically makes the last line an incomplete text line
- More importantly, David Lopez's OCD is triggered if it is missing

## Oxford comma

If you have a text list of three or more items, you should use the Oxford Comma.

![Oxford Comma](/static/img/styleguide/oxford-comma.png)

- there must be a comma before the ‘and’ or ‘or’ before the final item

## ALL CAPS

DON’T USE ALL CAPS FOR EMPHASIS! All caps is shouting at the customer. If you need to add emphasis, try adding an admonition block or even bolding the phrase instead.
