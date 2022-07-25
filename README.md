# tiny electron

Tiny electron is a simple rich-text editor written in JavaScript, HTML, and CSS([Electron](https://www.electronjs.org/) web app \<EWA\> made with [TinyMCE 5](https://github.com/tinymce/tinymce), and [CommonMark](https://commonmark.org/) which is the markdown->HTML conversion engine). Currently in a developmental stage: [use cautiously if at all!](#Notes)

## Launch

## Screenshot

There is no truth without pictures.

## Requirements

Windows 7 64-bit, or above.

## Features

* Rich-text editor. rich-text, and markdown(plain text) editing modes.
* Open and save files as markdown. File association / "open with" support in the native file manager for markdown format.
* Rich-text editing mode is restricted to the formatting options of markdown and a small amount more. The rich-text features that are supported include headings, bold, italics, strikethrough, bulleted lists, numbered lists, links, block quotes, code/code blocks, tables, images, and horizontal lines. Everything else( e.g. font size, colors, alignment, positioning, etc.) is automatically filtered as soon as it enters the editor.
* Extensive keyboard shortcuts. See [keyboard-shortcuts.md](docs/keyboard-shortcuts.md) for a list.

## Notes

The editor is still under development and has [many bugs](docs/bugs-and-to-do.md) that need to be fixed.

Due to the bidirectional conversion between rich text/HTML and markdown, the editor may alter markdown files: sometimes in undesirable ways. A number of examples are illustrative. Escapes (`\`) may be added to certain markdown syntax characters that aren't part of the markdown (e.g., `~`, `|`). YAML and TOML front matter is automatically put inside of markdown code blocks (<code>```</code>) to prevent it from being parsed by the HTML-to-markdown conversion engine. For markdown-to-HTML conversion, tiny electron doesn't handle headerless tables. Headerless tables must at least have a `| --- | --- | --- |` row.

Rich-text HTML editing with the editor is solid. But, as described, the markdown functionality may have issues here and there. Hence, you've been warned: use the markdown features at your own risk!

The editor has only been tested on [Electron](https://www.electronjs.org/)(Google Chromium) at this time.


### Future

* Lots of [bug fixes](docs/bugs-and-to-do.md) and minor features.
* Tabs for multiple files at once?
* Tabs for folder/workspace and document table of contents?
* Other things...

