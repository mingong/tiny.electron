/*
const { ipcRenderer, remote } = require('electron');
*/
const { ipcRenderer } = require('electron');
const { pathToFileURL } = require('url');

/*
const { app } = remote;

*/
const path = require('path');



/*
** "persistentFilename"
*/
let persistFilename = "untitled.md";

let fullscreenToggleState = false;

let disableRightClick = false;

let reverseShiftEnterBehavior = false;
/*
let NotoSansMonoCJKtcAsDefaultFont = true;
let AbsoluteFileURL = false;
*/

// Which markdown-to-HTML engine to use?
let markdownToHTMLEngine = 'micromark';
// Which HTML-to-markdown engine to use?
let HTMLtoMarkdownEngine = 'kramorcim';

// Save front matter here while editing
var frontMatter = '';

var EditingMode = true;

var markdown = new Markdown();

// Change current working directory
function change_cwd(newPath) {
  var pathURL = pathToFileURL(newPath);
  
  var pathHref = pathURL.href;
  
  if (tinymce.activeEditor) {
    var doc = tinymce.activeEditor.getDoc(),
      head = doc.head,
      base;
    
    if (head.getElementsByTagName("base").length == 0) {
      base = document.createElement("base");
      
      head.appendChild(base);
    } else {
      base = head.getElementsByTagName("base")[0];
    }
    
    base.setAttribute("href", pathHref + "/");
    
    tinymce.activeEditor.documentBaseURI.setPath(pathURL.pathname + "/");
  }
  
  var headx = document.head,
    basex;
  
  if (headx.getElementsByTagName("base").length == 0) {
    basex = document.createElement("base");
    
    headx.appendChild(basex);
  } else {
    basex = headx.getElementsByTagName("base")[0];
  }
  
  basex.setAttribute("href", pathHref + "/");
}

function set() {
  var path = ipcRenderer.sendSync('call-set');
  
  if (path.length > 0) {
    change_cwd(path);
  }
  
  tinymce.activeEditor.focus();
}

/*
function tes() {
  var path = ipcRenderer.sendSync('call-eso');
  
  if (path.length > 0) {
    change_cwd(path);
  }
  
  tinymce.activeEditor.focus();
}

*/
// Create new file
function newFile() {
  // 
  if (tinymce.editors[0].isDirty()) {
    tinymce.activeEditor.windowManager.open({
      title: 'Warning', // The dialog's title - displayed in the dialog header
      body: {
        type: 'panel', // The root body type - a Panel or TabPanel
        items: [ // A list of panel components
          {
            type: 'htmlpanel', // A HTML panel component
            html: 'Unsaved changes. Continue without saving?'
          }
        ]
      },
      onSubmit: function (api) {
        ipcRenderer.send('call-new');
        
        api.close();
      },
      buttons: [ // A list of footer buttons
        {
          type: 'cancel',
          /*
          name: 'closeButton',
          */
          text: 'Cancel'
        },
        {
          type: 'submit',
          text: 'OK'
        }
      ]
    });
    
    // Are we sure we want to exit out of the current file?
  } else {
    tinymce.activeEditor.windowManager.open({
      title: 'Warning', // The dialog's title - displayed in the dialog header
      body: {
        type: 'panel', // The root body type - a Panel or TabPanel
        items: [ // A list of panel components
          {
            type: 'htmlpanel', // A HTML panel component
            html: 'Close the current file and create a new one?'
          }
        ]
      },
      onSubmit: function (api) {
        ipcRenderer.send('call-new');
        
        api.close();
      },
      buttons: [ // A list of footer buttons
        {
          type: 'cancel',
          /*
          name: 'closeButton',
          */
          text: 'Cancel'
        },
        {
          type: 'submit',
          text: 'OK'
        }
      ]
    });
  }
  /*
  
  return;
  */
}

// Open file
function openFile(tofocus) {
  // 
  if (tinymce.editors[0].isDirty()) {
    tinymce.activeEditor.windowManager.open({
      title: 'Warning', // The dialog's title - displayed in the dialog header
      body: {
        type: 'panel', // The root body type - a Panel or TabPanel
        items: [ // A list of panel components
          {
            type: 'htmlpanel', // A HTML panel component
            html: 'Unsaved changes. Continue without saving?'
          }
        ]
      },
      onSubmit: function (api) {
        ipcRenderer.send('call-open');
        
        api.close();
      },
      buttons: [ // A list of footer buttons
        {
          type: 'cancel',
          /*
          name: 'closeButton',
          */
          text: 'Cancel'
        },
        {
          type: 'submit',
          text: 'OK'
        }
      ]
    });
  } else {
    ipcRenderer.send('call-open');
    
    if (tofocus) {
      tinymce.activeEditor.focus();
    }
  }
  /*
  
  return;
  */
}

// Save file
function saveFile(tofocus) {
  ipcRenderer.send('call-save');
  
  if (tofocus) {
    tinymce.activeEditor.focus();
  }
}

// Save file as
function saveFileAs(tofocus) {
  ipcRenderer.send('call-saveAs');
  
  if (tofocus) {
    tinymce.activeEditor.focus();
  }
}

// Quit
function quit() {
  if (tinymce.editors[0].isDirty()) {
    tinymce.activeEditor.windowManager.open({
      title: 'Warning', // The dialog's title - displayed in the dialog header
      body: {
        type: 'panel', // The root body type - a Panel or TabPanel
        items: [ // A list of panel components
          {
            type: 'htmlpanel', // A HTML panel component
            html: 'Unsaved changes. Continue without saving?'
          }
        ]
      },
      onSubmit: function () {
        ipcRenderer.send('call-quit');
      },
      buttons: [ // A list of footer buttons
        {
          type: 'cancel',
          /*
          name: 'closeButton',
          */
          text: 'Cancel'
        },
        {
          type: 'submit',
          text: 'OK'
        }
      ]
    });
  } else {
    ipcRenderer.send('call-quit');
  }
}

// Toggle full screen
function toggleFullscreen() {
  ipcRenderer.send('call-fullscreen');
}

// Upon opening new file
ipcRenderer.on('newly-made-file', function (event, path) {
  change_cwd(path);
  
  tinymce.activeEditor.resetContent();
  tinymce.activeEditor.undoManager.reset();
  
  tinymce.editors[0].setDirty(false);
  
  persistFilename = "untitled.md";
  
  ipcRenderer.send('call-updateTitle', persistFilename);
});

// Upon opening existed file
ipcRenderer.on('opened-file', function (event, path, filename, data) {
  change_cwd(path);
  
  // Replace newlines with HTML so read correctly by TinyMCE
  /*
  data = data.replace(/(\n)/g, '<' + 'br' + ' ' + '/>');
  data = data.replace(/\n.*\n/g, function (match) {
    return '<p>' + match + '</p>';
  });
  */
  // Replace tabs with em spaces (otherwise will be dropped)
  /*
  data = data.replace(/\t/g, function (match) {
    return '&emsp;';
  });
  
  */
  tinymce.editors[0].setContent(data, { format: 'html' });
  
  
  tinymce.activeEditor.undoManager.reset();
  
  tinymce.editors[0].setDirty(false);
  
  ipcRenderer.send('call-updateTitle', filename);
  
  persistFilename = filename;
});

// Upon saving file
ipcRenderer.on('saved-file', function (event, pathname, filename) {
  change_cwd(pathname);
  
  tinymce.editors[0].setDirty(false);
  
  ipcRenderer.send('call-save-', tinymce.editors[0].getContent({ source_view: true }));
  
  ipcRenderer.send('call-updateTitle', filename);
  
  persistFilename = filename;
});

// Upon exporting Html
ipcRenderer.on("exported-file", function (event, /*pathname, filename, */withcss) {
  /*
  change_cwd(pathname);
  
  tinymce.editors[0].setDirty(false);
  
  */
  var content;
  
  if (withcss) {
    content = `<!DOCTYPE html>
<html lang="en">
<head>
<title> </title>

<meta charset="utf-8">
<style type="text/css">
/*
*/
html { font-size: 100%; overflow-y: scroll; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }

body {
    color: #444;
    /*
    
    font-size: 13px;
    */
    font-family: 'Noto Sans Mono CJK TC', Palatino, 'Palatino Linotype', Times, 'Times New Roman', serif;
    font-size: 16px;
    line-height: 1.5em;
    padding: 1em;
    margin: auto;
    max-width: 42em;
    background: #fefefe;
}

h1, h2, h3, h4, h5, h6 {
    font-weight: bold;
}

h1 {
    color: #000000;
    font-size: 28px;
}

h2 {
    border-bottom: 2px solid #CCCCCC;
    color: #000000;
    font-size: 24px;
}

h3 {
    border-bottom: 2px solid #CCCCCC;
    font-size: 18px;
}

h4 {
    font-size: 16px;
}

h5 {
    font-size: 14px;
}

h6 {
    color: #777777;
    background-color: inherit;
    font-size: 14px;
}

hr {
    height: 0.2em;
    border: 0;
    color: #CCCCCC;
    background-color: #CCCCCC;
}

p, blockquote, ul, ol, dl, li, table, pre {
    margin: 15px 0;
}

p {
    margin: 1em 0;
}

pre {
    background-color: #F8F8F8;
    border: 1px solid #CCCCCC;
    border-radius: 3px;
    overflow: auto;
    padding: 5px;
}

pre code {
    background-color: #F8F8F8;
    border: none;
    padding: 0;
}

code {
    /*
    
    */
    font-family: Noto Sans Mono CJK TC, Monaco, Andale Mono, monospace;
    background-color: #F8F8F8;
    border: 1px solid #CCCCCC;
    border-radius: 3px;
    padding: 0 0.2em;
    line-height: 1;
}

pre > code {
    border: 0;
    margin: 0;
    padding: 0;
}


a { color: #0645ad; text-decoration: none; }
a:visited { color: #0b0080; }
a:hover { color: #06e; }
a:active { color: #faa700; }
a:focus { outline: thin dotted; }
a:hover, a:active { outline: 0; }

::-moz-selection { background: rgba(255, 255, 0, 0.3); color: #000 }
::selection { background: rgba(255, 255, 0, 0.3); color: #000 }

a::-moz-selection { background: rgba(255, 255,0, 0.3); color: #0645ad }
a::selection { background: rgba(255, 255, 0, 0.3); color: #0645ad }

blockquote {
    color: #666666;
    margin: 0;
    padding-left: 3em;
    border-left: 0.5em #EEE solid;
}

ul, ol { margin: 1em 0; padding: 0 0 0 2em; }
li p:last-child { margin: 0 }
dd { margin: 0 0 0 2em; }

img { border: 0; -ms-interpolation-mode: bicubic; vertical-align: middle; max-width: 100%; }

table { border-collapse: collapse; border-spacing: 0; }
td { vertical-align: top; }

@media only screen and (min-width: 480px) {
    body { font-size: 14px; }
}

@media only screen and (min-width: 768px) {
    body { font-size: 16px; }
}
</style>
</head>
<body style="font-family: 'Noto Sans Mono CJK TC', NSimSun, Serif; font-size: 18px;">
`;
  } else {
    content = `<!DOCTYPE html>
<html lang="en">
<head>
<title> </title>
<!--
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
-->
<meta charset="utf-8">
<!--
-->
</head>
<body style="font-family: 'Noto Sans Mono CJK TC', 'Noto Sans Mono CJK TC', Serif; font-size: 18px;">
`;
  }
  
  content += tinymce.editors[0].getContent({ format: 'html' })/* + "\r\n"*/;
  content += `
</body>
</html>`;
  
  ipcRenderer.send("call-export-", content);
  /*
  
  ipcRenderer.send('call-updateTitle', filename);
  
  persistFilename = filename;
  */
});

// Upon fullscreen on/off
ipcRenderer.on('fullscreen-change', function () {
  if (fullscreenToggleState == false) {
    fullscreenToggleState = true;
  } else {
    fullscreenToggleState = false;
  }
  /*
  
  tinymce.activeEditor.focus();
  */
});

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

tinymce.baseURL = pathToFileURL(__dirname).href + "/" + "libs/tinymce";

tinymce.IconManager.add('custom', {
  icons: {
    newdoc: `<svg width="24" height="24"><path fill-rule="nonzero" d="M7 4a1 1 0 00-1 1v14c0 .6.4 1 1 1h10c.6 0 1-.4 1-1V9l-5-5H7zm6 5V5l4 4h-4z"></path></svg>`,
    undo: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M12.5 8c-2.7 0-5 1-6.9 2.6L2 7v9h9l-3.6-3.6A8 8 0 0120 16l2.4-.8a10.5 10.5 0 00-10-7.2z"></path></svg>`,
    redo: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M18.4 10.6a10.5 10.5 0 00-16.9 4.6L4 16a8 8 0 0112.7-3.6L13 16h9V7l-3.6 3.6z"></path></svg>`,
    heading: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="20"><polygon points="6.57 3 6.57 5.57 10.73 5.57 10.73 17 13.82 17 13.82 5.57 18 5.57 18 3 6.57 3"></polygon><polygon points="2 9.65 4.68 9.65 4.68 17 6.66 17 6.66 9.65 9.35 9.65 9.35 8 2 8 2 9.65"></polygon></svg>`,
    bold: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M14.6 11.8c.9-.6 1.4-1.4 1.4-2.3 0-2-1.6-3.5-3.5-3.5H7v12h6.3c1.7 0 3.2-1.5 3.2-3.3 0-1.3-.8-2.4-1.9-2.9zM9.5 8h2.8a1.5 1.5 0 110 3H9.4V8zm3.3 8H9.4v-3h3.3a1.5 1.5 0 110 3z"></path></svg>`,
    italic: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M10 6v2h2.6l-3.7 8H6v2h8v-2h-2.6l3.7-8H18V6z"></path></svg>`,
    link: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M4.9 12c0-1.2 1-2.1 2.1-2.1h4V8H7a4 4 0 100 8h4v-1.9H7c-1.2 0-2.1-1-2.1-2.1zM17 8h-4v1.9h4a2.1 2.1 0 110 4.2h-4V16h4a4 4 0 100-8zm-8 5h6v-2H9v2z"></path></svg>`,
    image: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M19 4H5a1 1 0 00-1 1v14c0 .6.5 1 1 1h14c.6 0 1-.4 1-1V5c0-.5-.4-1-1-1zM6.5 16l2.8-3.5 2 2.3 2.7-3.5 3.5 4.7h-11z"></path></svg>`,
    "code-sample": `<svg width="18" height="18" viewBox="0 0 1000 1000"><path fill-rule="nonzero" d="M10,599.7l307.5,197.7V654.7L134.4,541.7l183.1-113.1V284.9L10,483.6V599.7L10,599.7z M382.6,867.5h105.8l155.1-735H537L382.6,867.5z M682.5,284.9v143.7l183,113.1l-183,113v142.7L990,599.7V483.6L682.5,284.9z"></path></svg>`,
    bullist: `<?xml version="1.0" encoding="UTF-8"?><path fill-rule="nonzero" d="M10 13h9v-2h-9v2zm0-7v2h9V6h-9zm0 12h9v-2h-9v2zm-4-5h2v-2H6v2zm0-7v2h2V6H6zm0 12h2v-2H6v2z"></path>`,
    numlist: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24"><path fill-rule="nonzero" d="M5 16h2v.5H6v1h1v.5H5v1h3v-4H5v1zm0-5h1.8L5 13.1v.9h3v-1H6.2L8 10.9V10H5v1zm1-2h1V5H5v1h1v3zm4-3v2h9V6h-9zm0 12h9v-2h-9v2zm0-5h9v-2h-9v2z"></path></svg>`,
    table: `<svg width="24" height="24"><path fill-rule="nonzero" d="M5 5v14h14V5H5zm6 12H7v-4h4v4zm0-6H7V7h4v4zm6 6h-4v-4h4v4zm0-6h-4V7h4v4z"></path></svg>`,
    hr: `<svg width="24" height="24"><path d="M4 11h16v2H4z" fill-rule="evenodd"></path></svg>`,
    blockquote: `<svg width="24" height="24"><path fill-rule="nonzero" d="M13 8v5h2.8L14 16h2.3l1.7-3V8h-5zm-7 5h2.8L7 16h2.3l1.7-3V8H6v5z"></path></svg>`,
    /*
    sourcecode: `<svg width="38" height="40" viewBox="-6 0 38 24"><path transform="scale (-1, -1)" transform-origin="center" d="M0.3 12.14L17.22 12.14L17.22 7.2L20.16 7.2L20.16 12.14L23.1 12.14L18.69 16.8L14.27 12.14Z"></path><path d="M9.01 7.2L12.01 7.2L12.01 16.8L9.01 16.8L9.01 7.2Z"></path><path d="M2.8 7.2L5.8 7.2L5.8 16.8L2.8 16.8L2.8 7.2Z"></path><path d="M12.01 10.5L12.01 13.5L2.8 13.5L2.8 10.5L12.01 10.5Z"></path></svg>`,
    */
    htmlcode: `<svg width="38" height="40" viewBox="-6 0 38 24"><path transform="scale (-1, -1)" transform-origin="center" d="M0.3 12.14L17.22 12.14L17.22 7.2L20.16 7.2L20.16 12.14L23.1 12.14L18.69 16.8L14.27 12.14Z"></path><path d="M9.01 7.2L12.01 7.2L12.01 16.8L9.01 16.8L9.01 7.2Z"></path><path d="M2.8 7.2L5.8 7.2L5.8 16.8L2.8 16.8L2.8 7.2Z"></path><path d="M12.01 10.5L12.01 13.5L2.8 13.5L2.8 10.5L12.01 10.5Z"></path></svg>`,
    /*
    markdown: `<svg width="24" height="24" viewBox="0 -4 40 24"><path d="M0.5,16 L0.5,0 L5.40322581,0 L10.3064516,5.88235294 L15.2096774,0 L20.1129032,0 L20.1129032,16 L15.2096774,16 L15.2096774,6.82352941 L10.3064516,12.7058824 L5.40322581,6.82352941 L5.40322581,16 L0.5,16 Z M31.1451613,16 L23.7903226,8.23529412 L28.6935484,8.23529412 L28.6935484,0 L33.5967742,0 L33.5967742,8.23529412 L38.5,8.23529412 L31.1451613,16 Z"></path></svg>`,
    */
    github: `<svg width="18" height="18" viewBox="0 0 16 16" version="1.1"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path></svg>`
  }
});

tinymce.init({
  selector: '#textEditor',
  /*
  language: 'tooltips', // Use translations to make custom tooltips for buttons
  language_url: 'tooltips.js',
  */
  language: 'zh_CN',
  language_url: 'langs/zh_CN.js',
  height: "99%",
  theme: 'silver',
  content_css: 'css/editor-area-styles.css',
  content_style: "body { font-family: 'Noto Sans Mono CJK TC', 'Noto Sans Mono CJK TC', sans-serif; font-size: 18px; }",
  toolbar: 'file undo redo styleselect bold italic strikethrough bullist numlist link blockquote codesample hr table image preview searchreplace code fullscreen charmap emoticons', // 
  toolbar_mode: 'floating',
  /*
  plugins: 'code codesample, link image table lists paste autolink hr quickbars', // More: preview, searchreplace
  */
  plugins: 'code codesample, link image table lists paste autolink hr quickbars preview searchreplace charmap emoticons', // More: checklist
  contextmenu_never_use_native: true,
  contextmenu: 'undo redo | cut copy paste selectall',
  icons: 'custom',
  elementpath: false, // Disable e.g. "table > tbody > tr > td > p" in status bar when status bar enabled
  branding: false, // Disable TinyMCE branding in status bar
  menubar: false, // Hide menu bar
  forced_root_block: !reverseShiftEnterBehavior, // Reverse Shift+Enter behavior ('<' + 'br' + ' ' + '/>' for Enter and <p> for Shift+Enter)
  paste_block_drop: true,
  paste_data_images: true,
  paste_remove_styles_if_webkit: true,
  smart_paste: false,
  link_context_toolbar: true,
  link_title: false,
  link_quicklink: true,
  target_list: false,
  convert_urls: false,
  codesample_global_prismjs: true,
  codesample_languages: [
    { text: 'Markdown', value: 'markdown' },
    { text: 'HTML/XML', value: 'markup' },
    { text: 'JavaScript', value: 'javascript' },
    { text: 'CSS', value: 'css' },
    { text: 'PHP', value: 'php' },
    { text: 'Ruby', value: 'ruby' },
    { text: 'Python', value: 'python' },
    { text: 'Java', value: 'java' },
    { text: 'C', value: 'c' },
    { text: 'C#', value: 'csharp' },
    { text: 'C++', value: 'cpp' }
  ],
  table_toolbar: 'tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | tabledelete',
  table_appearance_options: false,
  table_tab_navigation: true,
  table_advtab: false,
  table_cell_advtab: false,
  table_row_advtab: false,
  table_resize_bars: false,
  table_default_attributes: {},
  table_default_styles: {},
  visual: false,
  image_caption: false,
  image_dimensions: false,
  object_resizing: false,
  resize_img_proportional: true, // Disabled due to resizing off
  toolbar_sticky: true,
  resize: false,
  statusbar: false,

  /*
  // Protect certain kinds of text
  protect: [
    /^(---(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)---(?:\r\n|\n))$/gm, // YAML front matter
    /^(\+\+\+(?:\r\n|\n))(.|(?:\r\n|\n))*((?:\r\n|\n)\+\+\+(?:\r\n|\n))$/gm, // TOML front matter
    /\{%\-? .+ \-?%\}/, // Liquid (works but hides text and probably not advisable)
    /\{\{ .+ \}\}/ // Liquid (works but hides text and probably not advisable)
  ],
  */
  quickbars_insert_toolbar: false,
  quickbars_selection_toolbar: false,
  quickbars_image_toolbar: false,
  fullpage_hide_in_source_view: false,
  // All HTML elements (attributes) except for these will be filtered:
  valid_elements:
    'html,head,title,body,meta[name|content|charset],' +
    'p,a[href],br,strong,b,i,em,u,ins,strike,s,del,sup,sub,small,' +
    'h1,h2,h3,h4,h5,h6,' +
    'ul,ol,li,dl,dt,dd,' +
    'figure,figcaption,img[src|alt|width|height],video[*],source[*],audio[*],' +
    'blockquote,code,pre[class],samp,var,tt,kbd,dfn,cite,mark,q,' +
    'table[colspan|rowspan],thead[colspan|rowspan],tbody[colspan|rowspan],tfoot[colspan|rowspan],th[colspan|rowspan],tr[colspan|rowspan],td[colspan|rowspan],colgroup[span],col[span],caption,' +
    'hr,math[*]',
  // 
  /*
  valid_styles: {
    'p': 'text-decoration,text-decoration-line',
    'span': 'text-decoration,text-decoration-line'
  },
  */
  custom_elements: 'htmlprotect',

  style_formats_merge: false,
  style_formats_autohide: true,
  // For style formats toolbar
  style_formats: [
    { title: 'Paragraph',  block: 'p' },
    { title: 'H1', block: 'h1' },
    { title: 'H2', block: 'h2' },
    { title: 'H3', block: 'h3' },
    { title: 'H4', block: 'h4' },
    { title: 'H5', block: 'h5' },
    { title: 'H6', block: 'h6' }
  ],

  // Modify TinyMCE's default internal formats
  // https://www.tiny.cloud/docs/configure/content-formatting/
  // https://www.tiny.cloud/docs/demo/format-custom/
  formats: {
    bold: {
      inline: 'b'
    },
    italic: {
      inline: 'i'
    },
    underline: {
      inline: 'ins'
    },
    strikethrough: {
      inline: 'del'
    },
    // 
    removeformat: [
      {
        selector: 'b,strong,em,i,font,ins,u,s,strike,del,sub,sup,dfn,blockquote,code,samp,kbd,var,cite,mark,q',
        remove: 'all',
        split: true,
        block_expand: true,
        expand: false,
        deep: true
      },
      { selector: 'span', attributes: ['style', 'class'], remove: 'empty', split: true, expand: false, deep: true },
      { selector: '*', attributes: ['style', 'class'], split: false, expand: false, deep: true }
    ]
  },

  mobile: {
    menubar: false,
    toolbar_mode: 'floating'
  },

  deprecation_warnings: false,

  // https://www.tiny.cloud/docs/demo/custom-toolbar-button/
  setup: function (editor) {
    // Set up files menu button
    editor.ui.registry.addMenuButton('file', {
      tooltip: 'File',
      icon: 'edit-block',
      fetch: function (callback) {
        var items = [
          {
            type: 'menuitem',
            icon: 'home',
            text: 'Set Working Directory (Shift+Ctrl+O)',
            onAction: () => set()
          },
          /*
          {
            type: 'menuitem',
            icon: 'home',
            text: 'Tes Working Directory (Shift+Ctrl+O)',
            onAction: () => tes()
          },
          */
          {
            type: 'menuitem',
            icon: 'new-document',
            text: 'New (Ctrl+N)',
            onAction: function () {
              newFile();
            }
          },
          {
            type: 'menuitem',
            icon: 'browse',
            text: 'Open (Ctrl+O)',
            onAction: function () {
              openFile(true);
              
            }
          },
          {
            type: 'menuitem',
            icon: 'save',
            text: 'Save (Ctrl+S)',
            onAction: function () {
              saveFile(true);
            }
          },
          {
            type: 'menuitem',
            /*
            icon: 'save',
            */
            icon: 'user',
            text: 'Save as (Shift+Ctrl+S)',
            onAction: function () {
              saveFileAs(true);
            }
          },
          {
            type: 'nestedmenuitem',
            text: 'Export',
            icon: 'export',
            getSubmenuItems: function () {
              return [
                {
                  type: 'menuitem',
                  text: 'Plain Html',
                  /*
                  icon: 'unlock',
                  */
                  icon: 'paste-text',
                  onAction: function () {
                    if (tinymce.editors[0].isDirty()) {
                      ipcRenderer.send("call-electronAlert", "Unsaved changes.");
                    } else {
                      ipcRenderer.send('export-plainHtml');
                    }
                    
                    tinymce.activeEditor.focus();
                  }
                },
                {
                  type: 'menuitem',
                  text: 'Html',
                  /*
                  icon: 'lock',
                  */
                  icon: 'htmlcode',
                  onAction: function () {
                    if (tinymce.editors[0].isDirty()) {
                      ipcRenderer.send("call-electronAlert", "Unsaved changes.");
                    } else {
                      ipcRenderer.send('export-html');
                    }
                    
                    tinymce.activeEditor.focus();
                  }
                }
              ];
            }
          },
          {
            type: 'menuitem',
            icon: 'close',
            text: 'Quit (Ctrl+W)',
            onAction: function () {
              quit();
            }
          }
        ];
        
        callback(items);
      }
    });

    // Set up headings formatting button
    /*
    editor.ui.registry.addMenuButton('heading', {
      tooltip: 'Heading',
      icon: 'heading',
      fetch: function (callback) {
        var items = [
          {
            type: 'menuitem',
            text: 'H1',
            tooltip: 'H1 (Ctrl+Alt+1)', // Doesn't work
            onAction: function () {
              tinyMCE.execCommand('mceToggleFormat', false, 'h1');
            }
          },
          {
            type: 'menuitem',
            text: 'H2',
            tooltip: 'H2 (Ctrl+Alt+2)', // Doesn't work
            onAction: function () {
              tinyMCE.execCommand('mceToggleFormat', false, 'h2');
            }
          },
          {
            type: 'menuitem',
            text: 'H3',
            tooltip: 'H3 (Ctrl+Alt+3)', // Doesn't work
            onAction: function () {
              tinyMCE.execCommand('mceToggleFormat', false, 'h3');
            }
          },
          {
            type: 'menuitem',
            text: 'H4',
            tooltip: 'H4 (Ctrl+Alt+4)', // Doesn't work
            onAction: function () {
              tinyMCE.execCommand('mceToggleFormat', false, 'h4');
            }
          },
          {
            type: 'menuitem',
            text: 'H5',
            tooltip: 'H5 (Ctrl+Alt+5)', // Doesn't work
            onAction: function () {
              tinyMCE.execCommand('mceToggleFormat', false, 'h5');
            }
          },
          {
            type: 'menuitem',
            text: 'H6',
            tooltip: 'H6 (Ctrl+Alt+6)', // Doesn't work
            onAction: function () {
              tinyMCE.execCommand('mceToggleFormat', false, 'h6');
            }
          }
        ];
        
        callback(items);
      }
    });
    */
    editor.ui.registry.addToggleButton('H1', {
      text: 'H1',
      onAction: function (api) {
        editor.execCommand('mceToggleFormat', false, 'h1');
        
        api.setActive(!api.isActive());
      },
      onSetup: function (api) {
        editor.formatter.formatChanged('h1', function (state) {
          api.setActive(state);
        });
      }
    });

    editor.ui.registry.addToggleButton('H2', {
      text: 'H2',
      onAction: function (api) {
        editor.execCommand('mceToggleFormat', false, 'h2');
        
        api.setActive(!api.isActive());
      },
      onSetup: function (api) {
        editor.formatter.formatChanged('h2', function (state) {
          api.setActive(state);
        });
      }
    });

    editor.ui.registry.addToggleButton('H3', {
      text: 'H3',
      onAction: function (api) {
        editor.execCommand('mceToggleFormat', false, 'h3');
        
        api.setActive(!api.isActive());
      },
      onSetup: function (api) {
        editor.formatter.formatChanged('h3', function (state) {
          api.setActive(state);
        });
      }
    });

    editor.ui.registry.addToggleButton('H4', {
      text: 'H4',
      onAction: function (api) {
        editor.execCommand('mceToggleFormat', false, 'h4');
        
        api.setActive(!api.isActive());
      },
      onSetup: function (api) {
        editor.formatter.formatChanged('h4', function (state) {
          api.setActive(state);
        });
      }
    });

    editor.ui.registry.addToggleButton('H5', {
      text: 'H5',
      onAction: function (api) {
        editor.execCommand('mceToggleFormat', false, 'h5');
        
        api.setActive(!api.isActive());
      },
      onSetup: function (api) {
        editor.formatter.formatChanged('h5', function (state) {
          api.setActive(state);
        });
      }
    });

    editor.ui.registry.addToggleButton('H6', {
      text: 'H6',
      onAction: function (api) {
        editor.execCommand('mceToggleFormat', false, 'h6');
        
        api.setActive(!api.isActive());
      },
      onSetup: function (api) {
        editor.formatter.formatChanged('h6', function (state) {
          api.setActive(state);
        });
      }
    });

    // Add heading group toolbar button
    editor.ui.registry.addGroupToolbarButton('heading', {
      icon: 'heading',
      tooltip: 'Heading',
      items: 'h1 h2 h3 h4 h5 h6'
    });

    // Set up fullscreen toolbar button
    editor.ui.registry.addButton('fullscreen', {
      /*
      tooltip: 'Fullscreen (Ctrl+Shift+F or F11)',
      */
      tooltip: 'FullScreen',
      icon: 'fullscreen',
      onAction: function () {
        toggleFullscreen();
        
        // Give focus back to editor area
        tinyMCE.get('textEditor').getBody().focus();
      }
    });

    // Set up preferences dialog menu
    /*
    var prefsConfig = {
      title: 'Preferences',
      size: 'large',
      body: {
        type: 'panel',
        items: [
          {
            type: 'checkbox',
            name: 'reverseShiftEnterBehavior',
            label: 'Swap Enter and Shift+Enter behavior (new line (' + '&lt;' + 'br' + ' ' + '/' + '&gt;' + ') on Enter, new paragraph (&lt;p&gt;) on Shift+Enter) (may cause problems)'
          },
          {
            type: 'checkbox',
            name: 'NotoSansMonoCJKtcAsDefaultFont',
            label: 'NotoSansMonoCJKtc As Default Font? (note: <a href="https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Sans/Mono/NotoSansMonoCJKtc-Regular.otf" target="_blank">NotoSansMonoCJKtc</a> is default font)'
          },
          {
            type: 'checkbox',
            name: 'AbsoluteFileURL',
            label: 'Use Absolute FileURL when images or links are inserted? (note: relative FileURL is default)'
          }
        ]
      },
      buttons: [
        {
          type: 'submit',
          name: 'submitButton',
          
          text: 'Save and reload',
          
          text: 'Save',
          primary: true
        },
        {
          type: 'cancel',
          name: 'closeButton',
          text: 'Cancel'
        }
      ],
      initialData: {
        AbsoluteFileURL: AbsoluteFileURL,
        reverseShiftEnterBehavior: reverseShiftEnterBehavior,
        NotoSansMonoCJKtcAsDefaultFont: NotoSansMonoCJKtcAsDefaultFont
      },
      onSubmit: function (api) {
        var data = api.getData();

        // Change relative vs. Absolute FileURL depending on preferences
        AbsoluteFileURL = data.AbsoluteFileURL;

        // Change Shift+Enter behavior depending on preferences
        reverseShiftEnterBehavior = data.reverseShiftEnterBehavior;

        // Toggle off NotoSansMonoCJKtc as default font depending on preferences
        NotoSansMonoCJKtcAsDefaultFont = data.NotoSansMonoCJKtcAsDefaultFont;

        // Needed as preferences menu otherwise won't have updated initial values for settings if reopened
        
        location.reload();
        
        
        api.close();
      }
    };

    */
    // Add preferences toolbar button and dialogue menu
    /*
    editor.ui.registry.addButton('preferences', {
      name: 'Preferences',
      tooltip: 'Preferences',
      icon: 'preferences',
      onAction: function () {
        editor.windowManager.open(prefsConfig);
      }
    });

    */
    // Set up GitHub home page/repository toolbar button
    /*
    editor.ui.registry.addButton('github', {
      name: 'GitHub',
      tooltip: 'GitHub',
      icon: 'github',
      onAction: function () {
        tinymce.activeEditor.windowManager.open({
          title: 'Warning', // The dialog's title - displayed in the dialog header
          body: {
            type: 'panel', // The root body type - a Panel or TabPanel
            items: [ // A list of panel components
              {
                type: 'htmlpanel', // A HTML panel component
                html: 'This will open the GitHub home page/repository in a new tab. Continue?'
              }
            ]
          },
          onSubmit: function (api) {
            window.open('https://github.com/mingong/tiny.electron/', '_blank');
            
            api.close();
          },
          buttons: [ // A list of footer buttons
            {
              type: 'cancel',
              
              name: 'closeButton',
              
              text: 'Cancel'
            },
            {
              type: 'submit',
              text: 'OK'
            }
          ]
        });
      }
    });

    */
    // 
    // ADD CUSTOM SHORCUTS -> https://www.tiny.cloud/docs/advanced/keyboard-shortcuts/
    // 

    editor.addShortcut('Meta+N', 'New', function () {
      newFile();
    });

    editor.addShortcut('Meta+O', 'Open', function () {
      openFile(false);
    });

    editor.addShortcut('Meta+S', 'Save', function () {
      saveFile(false);
    });

    editor.addShortcut('Shift+Meta+S', 'Save as', function () {
      saveFileAs(false);
    });

    // 
    // Ctrl+F also triggers find and replace
    /*
    editor.addShortcut('Meta+H', 'Find and replace', function () {
      tinymce.activeEditor.execCommand('SearchReplace');
    });

    */
    editor.addShortcut('Meta+W', 'Quit', function () {
      quit();
    });

    editor.addShortcut('Meta+Q', 'Quit', function () {
      quit();
    });

    /*
    editor.addShortcut('Shift+Meta+Z', 'Redo', function () {
      tinyMCE.execCommand('Redo');
    });

    */
    editor.addShortcut('Meta+1', 'Heading 1', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h1');
    });

    editor.addShortcut('Meta+2', 'Heading 2', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h2');
    });

    editor.addShortcut('Meta+3', 'Heading 3', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h3');
    });

    editor.addShortcut('Meta+4', 'Heading 4', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h4');
    });

    editor.addShortcut('Meta+5', 'Heading 5', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h5');
    });

    editor.addShortcut('Meta+6', 'Heading 6', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h6');
    });

    editor.addShortcut('Meta+Alt+1', 'Heading 1', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h1');
    });

    editor.addShortcut('Meta+Alt+2', 'Heading 2', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h2');
    });

    editor.addShortcut('Meta+Alt+3', 'Heading 3', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h3');
    });

    editor.addShortcut('Meta+Alt+4', 'Heading 4', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h4');
    });

    editor.addShortcut('Meta+Alt+5', 'Heading 5', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h5');
    });

    editor.addShortcut('Meta+Alt+6', 'Heading 6', function () {
      tinyMCE.execCommand('mceToggleFormat', false, 'h6');
    });

    editor.addShortcut('Meta+D', 'Strikethrough', function () {
      tinyMCE.execCommand('Strikethrough');
    });

    editor.addShortcut('Alt+Shift+5', 'Strikethrough', function () {
      tinyMCE.execCommand('Strikethrough');
    });

    editor.addShortcut('Ctrl+L', 'Link', function () {
      tinyMCE.execCommand('mceLink');
    });

    editor.addShortcut('Meta+Shift+7', 'Numbered List', function () {
      tinyMCE.execCommand('InsertOrderedList');
    });

    editor.addShortcut('Meta+Shift+8', 'Bullet List', function () {
      tinyMCE.execCommand('InsertUnorderedList');
    });

    editor.addShortcut('Ctrl+Shift+T', 'Table', function () {
      tinyMCE.execCommand('mceInsertTable');
    });

    editor.addShortcut('Ctrl+Shift+I', 'Image', function () {
      tinyMCE.execCommand('mceImage');
    });

    /*
    editor.addShortcut('Meta+Shift+F', 'Fullscreen', function () {
      toggleFullscreen();
    });

    */
    // "Handle individual keyboard keys"
    editor.on('keydown', function (event) {
      // F11 key: toggle fullscreen (need to test)
      /*
      if (event.key == 'F11') {
        toggleFullscreen();
        
        return;
      }
      
      */
      // Escape key: exit fullscreen
      if (event.key == 'Escape' && fullscreenToggleState == true) {
        toggleFullscreen();
        
        return;
      }

      // Tab key: insert an em dash-sized space and disable normal tab key handling
      // Make sure no modifier keys (Ctrl, Shift, Meta)
      // https://www.tiny.cloud/docs/plugins/opensource/nonbreaking/#nonbreaking_force_tab
      if (event.key === 'Tab' && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        // 
        if (tinymce.activeEditor.queryCommandValue('mceTableRowType') ||
            tinymce.activeEditor.queryCommandState('InsertDefinitionList') ||
            tinymce.activeEditor.queryCommandState('InsertOrderedList') ||
            tinymce.activeEditor.queryCommandState('InsertUnorderedList')) {
          return;
        }

        editor.insertContent('&emsp;');
        
        event.preventDefault();
        
        return;
      }

      // TinyMCE doesn't like to handle these for some reason
      /*
      if ((event.ctrlKey || event.metaKey) && event.key === '.') {
        tinyMCE.execCommand('Superscript');
        
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === ',') {
        tinyMCE.execCommand('Subscript');
        
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === ']') {
        tinyMCE.execCommand('mceBlockQuote');
        
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === '\\') {
        tinyMCE.execCommand('RemoveFormat');
        
        event.preventDefault();
        
        return;
      }

      */
      // Ctrl/Cmd + + -> Zoom in
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.code === 'Equal') {
        event.preventDefault();
        
        return;
      }

      // Ctrl/Cmd + - -> Zoom out
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.code === 'Minus') {
        event.preventDefault();
        
        return;
      }

      return;
    });

    // Update to unsaved changes filename if editor becomes dirty
    editor.on('Dirty', function (event) {
      ipcRenderer.send('call-updateTitle', persistFilename + " " + "*");
    });


    editor.on('init', function (event) {
      setupMarkdown(/*api*/);
      
      // Give edit area focus at start up
      tinyMCE.get('textEditor').getBody().focus();
      
      ipcRenderer.send('call-updateTitle', persistFilename);
      
      ipcRenderer.send( "call-try-open" );
    });
  },
  file_picker_types: 'file image',
  // "and here's our custom image picker"
  file_picker_callback: function (callback, value, meta) {
    var filetypex = meta.filetype;
    
    var msgObject = ipcRenderer.sendSync('call-get', filetypex);
    var filepath = msgObject.filePath;
    var pathname = msgObject.pathName;
    
    if (filepath.length > 0 && pathname.length > 0) {
      var filename = path.basename(pathname);
      var fileURL = pathToFileURL(pathname).href;
      var pathURL = pathToFileURL(filepath).href;
      
      var result;
      
      fileURL = fileURL.substring((pathURL + "/").length);
      
      // "Provide file and text for the link dialog"
      if (filetypex == 'file') {
        callback(fileURL, { text: filename });
        
        result = ipcRenderer.sendSync('call-should-set');
        
        if (result) {
          ipcRenderer.send('call-tes', filepath);
          
          change_cwd(filepath);
        }
      }
      
      // "Provide image and alt text for the image dialog"
      if (filetypex == 'image') {
        result = ipcRenderer.sendSync('call-should-set');
        
        if (result) {
          ipcRenderer.send('call-tes', filepath);
          
          change_cwd(filepath);
        }
        
        callback(fileURL, { alt: filename });
      }
    }
  },
  images_dataimg_filter: function (img) {
    return img.hasAttribute('internal-blob'); // Note: The images_dataimg_filter option can also be used to specify a filter predicate function for disabling the logic that converts base64 images into blobs while within the editor. Tiny discourages using images_dataimg_filter for this purpose.
  }
});

/* Markdown */

function convertEditorHTMLWithMarkdown(markdownToConvert, force) {
  var HTMLfromMarkdown = "";
  
  // Don't convert unless opening or saving a file
  if (force != true) {
    return HTMLfromMarkdown;
  }
  
  // Don't convert the editor if we're currently editing within it (unless opening or saving a file)
  /*
  if (tinymce.activeEditor.hasFocus() == true && force != true) {
    return HTMLfromMarkdown;
  }
  
  */
  // Remove front matter
  
  // Get and save front matter
  /*
  frontMatter = getFrontMatter(markdownToConvert, 'markdown');
  
  */
  // Remove front matter from markdown while editing so that it doesn't get parsed and altered
  /*
  markdownToConvert = removeFrontMatter(markdownToConvert, 'markdown');
  
  */
  // Convert markdown to HTML
  if (markdownToHTMLEngine == 'micromark') {
    HTMLfromMarkdown = markdown.processor.toView(markdownToConvert);
  }
  
  return HTMLfromMarkdown;
}

function convertMarkdownWithEditorHTML(HTMLtoConvert, force) {
  var MarkdownFromHTML = "";
  
  // Don't convert unless opening or saving a file
  /*
  if (force != true) {
    return MarkdownFromHTML;
  }
  
  */
  // Don't convert the editor if we aren't currently editing within it (unless opening or saving a file)
  if (tinymce.activeEditor.hasFocus() == false && force != true) {
    return MarkdownFromHTML;
  }
  
  // Convert HTML to markdown
  if (HTMLtoMarkdownEngine == 'kramorcim') {
    MarkdownFromHTML = markdown.processor.toData(HTMLtoConvert);
  }
  
  // Add/restore front matter to file
  MarkdownFromHTML = addFrontMatter(MarkdownFromHTML, frontMatter, 'markdown');
  
  return MarkdownFromHTML;
}

// Set up the markdown editor
function setupMarkdown(/*api*/) {
  tinymce.activeEditor.on('OpenWindow', function (event) {
    EditingMode = false;
  });

  tinymce.activeEditor.on('CloseWindow', function (event) {
    EditingMode = true;
  });

  // tinymce.getContent() format handler for 'markdown'
  tinymce.activeEditor.on("GetContent", function (event) {
    if (event.source_view) {
      event.content = convertMarkdownWithEditorHTML(event.content, true);
    }
    
    return event.content;
  });
  
  // tinymce.setContent() format handler for 'markdown'
  tinymce.activeEditor.on("BeforeSetContent", function (event) {
    /*
    if (event.format === "markdown") {
      event.content = convertEditorHTMLWithMarkdown(event.content, true);
    }
    
    */
    event.content = convertEditorHTMLWithMarkdown(event.content, true);
    
    return event.content;
  });

  return;
}

// Disable right-click
if (disableRightClick == true) {
  window.addEventListener('contextmenu', function (event) {
    event.preventDefault();
  }, false);
}

/*
// Keyboard shortcuts for when focus is not in main TinyMCE editor
window.addEventListener('keydown', function (event) {
  // Ctrl/Cmd + N -> New file
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.code === 'KeyN') {
    event.preventDefault();
    
    newFile();
    
    return;
  }

  // Ctrl/Cmd + O -> Open file
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.code === 'KeyO') {
    event.preventDefault();
    
    // 
    openFile(false);
    
    return;
  }

  // Ctrl/Cmd + S -> Save file
  if (!event.shiftKey && (event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
    event.preventDefault();
    
    // 
    saveFile(false);
    
    return;
  }

  // Shift + Ctrl/Cmd + S -> Save file as
  if (event.shiftKey && (event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
    event.preventDefault();
    
    // Note: To replace the <img> tag’s src attribute with the rem
    saveFileAs(false);
    
    return;
  }

  // Ctrl/Cmd + W -> Quit
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.code === 'KeyW') {
    event.preventDefault();
    
    quit();
    
    return;
  }

  // Ctrl/Cmd + Q -> Quit
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.code === 'KeyQ') {
    event.preventDefault();
    
    quit();
    
    return;
  }

  // Shift + Ctrl/Cmd + F -> Fullscreen toggle
  if (event.shiftKey && (event.ctrlKey || event.metaKey) && event.code === 'KeyF') {
    event.preventDefault();
    
    toggleFullscreen();
    
    return;
  }

  // F11 -> Fullscreen toggle
  if (event.key == 'F11') {
    event.preventDefault();
    
    toggleFullscreen();
    
    return;
  }

  // Esc -> Exit fullscreen if it's open
  if (event.key == 'Escape' && !event.shiftKey && fullscreenToggleState == true) {
    event.preventDefault();
    
    toggleFullscreen();
    
    return;
  }

  // Ctrl/Cmd + + -> Zoom in
  if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.code === 'Equal') {
    event.preventDefault();
    
    return;
  }

  // Ctrl/Cmd + - -> Zoom out
  if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.code === 'Minus') {
    event.preventDefault();
    
    return;
  }

  return;
});

*/
document.body.addEventListener('click', function (e) {
    var target = e.target || e.srcElement;
    
    // 判断是否匹配目标元素
    if (target.nodeName.toLocaleLowerCase() === 'a') {
        /*
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            window.event.returnValue = true;
        }
        
        */
        var url = target.getAttribute("href");
        
        if (target.getAttribute("target") === '_blank') {
            /*
            window.open(url);
            
            */
            tinymce.activeEditor.focus();
        } else {
            /*
            window.location.href = url;
            */
        }
    }
});
