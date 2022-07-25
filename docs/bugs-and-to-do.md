# Known Bugs and To-Do List

## Miscellaneous

* Dynamically load JavaScript dependencies (markdown–HTML engines) to load faster + save bandwidth:
  * https://www.kirupa.com/html5/loading_script_files_dynamically.htm
* Whatever else that's missing...

## New (2021/12/31)

### Consecutive lists bug

TinyMCE HTML handling of consecutive lists (correct/acceptable):

```
<ul>
<li>asdfasdfasdf</li>
<li>asdfasdfasdfasdf</li>
</ul>
<p></p>
<ul>
<li>asdfasdfasdf</li>
<li>sadfasdfasdfasdf</li>
</ul>
```

micromark (markdown to HTML) handling of consecutive lists (puts line between every list item):

```
<ul>
<li>asdfasdfasdf</li>
<li>asdfasdfasdfasdf</li>
</ul>
<!-- -->

<ul>
<li>asdfasdfasdf</li>
<li>sadfasdfasdfasdf</li>
</ul>
```

kramorcim (HTML to markdown) handling of consecutive lists:

- Handles the above original TinyMCE HTML perfectly (as well as variations like no `<p></p>` and replacing `<p></p>` with `<br />`) -> it's micromark that's the problem apparently


ipcRenderer.on('action', (event, arg) => {
  switch (arg) {
    case 'exiting':
      if (EditingMode) {
        quit();
      }

      break;
    default:
      break;
  }
});

