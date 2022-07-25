const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');

const url = require('url');
const path = require('path');
const fs = require('fs');



const isDev = process.mainModule.filename.indexOf('app.asar') < 0;

let mainWindow = null;
let filename = null;
let exportname = null;

let working_directory = "";
let export_directory = "";
let prePathFile = "";

if (isDev) {
  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
}

/*
app.allowRendererProcessReuse = true;

*/
function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

function createWindow() {
  /*
  if (isDev)
    var devTools = true;
  else {
    var devTools = false;
  }

  */
  // Find screen height so we can resize to 90% of screen height-wise
  let { width, height } = require('electron').screen.getPrimaryDisplay().size;
  
  height = Math.round(height * 0.90);

  if (process.platform === "win32" && process.argv.length >= 2) {
    let preFilePath = process.argv[1];
    
    let preNormalizedPath;
    
    if (path.isAbsolute(preFilePath)) {
      preNormalizedPath = path.normalize(preFilePath);
    } else {
      /*
      preNormalizedPath = path.join(__dirname, preFilePath);
      */
      preNormalizedPath = path.join(process.cwd(), preFilePath);
    }
    
    if (fileExists(preNormalizedPath)) {
      prePathFile = preNormalizedPath;
    }
  }
  
  mainWindow = new BrowserWindow({
    width: 880,
    height: height,
    webPreferences: {
      nodeIntegration: true,
      devTools: true,
      enableRemoteModule: true,
      webSecurity: false,
      contextIsolation: false
    },

    spellcheck: false
  });
  
  /*
  if (!isDev) {
    mainWindow.setMenuBarVisibility(false);
  }
  
  */
  mainWindow.setMenuBarVisibility(false);
  
  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    /*
    slashes: true,
    */
    slashes: true
  }));

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.setTitle("Tiny Electron");
  });
  
  if (isDev) {
    // Open the DevTools.
    /*
    BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    
    */
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
  
  //
  mainWindow.on('close', (e) => {
    e.preventDefault();
    mainWindow.webContents.send('action', 'exiting');
  });
  
  //
  mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('call-set', (event, arg) => choose_working_directory(event));
/*
ipcMain.on('call-eso', (event, arg) => esoohc_working_directory(event));
*/
ipcMain.on('call-should-set', (event, arg) => should_change_working_directory(event));
ipcMain.on('call-tes', (event, arg) => change_working_directory(arg));
ipcMain.on('call-new', (event, arg) => newfile());
ipcMain.on('call-try-open', (event, arg) => try_open());
ipcMain.on('call-open', (event, arg) => open());
ipcMain.on('call-save', (event, arg) => save());
ipcMain.on('call-save-', (event, arg) => save_(arg));
ipcMain.on('call-saveAs', (event, arg) => saveas());
ipcMain.on('export-plainHtml', (event, arg) => export_plain_html());
ipcMain.on('call-export-', (event, arg) => export_(arg));
ipcMain.on('export-html', (event, arg) => export_html());

ipcMain.on('call-quit', (event, arg) => app.exit());

ipcMain.on('call-fullscreen', (event, arg) => fullscreentoggle());
ipcMain.on('call-get', (event, arg) => get(event, arg));
ipcMain.on('call-updateTitle', (event, arg) => update_title(arg));
ipcMain.on('call-electronAlert', (event, arg) => electron_alert(arg));
ipcMain.on('call-electronConfirm', (event, arg) => electron_confirm(event, arg));

function choose_working_directory(event) {
  if (filename) {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      detail: 'Can Not Choose Working Directory.'
    });
    
    event.returnValue = "";
  } else {
    dialog.showOpenDialog(mainWindow, { properties: ["openDirectory"], defaultPath: working_directory }).then((fn) => {
      if (fn.canceled) {
        event.returnValue = "";
      } else {
        var pathName = fn.filePaths[0];
        
        change_working_directory(pathName);
        
        event.returnValue = pathName;
      }
    });
  }
}

/*
function esoohc_working_directory(event) {
  if (filename) {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      detail: 'Can Not Esoohc Working Directory.'
    });
    
    event.returnValue = "";
  } else {
    if (working_directory.length > 0) {
      working_directory = "";
      
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        detail: 'Esoohc Working Directory.'
      });
      
      event.returnValue = __dirname;
    } else {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        detail: 'Do Not Need To Esoohc Working Directory.'
      });
      
      event.returnValue = "";
    }
  }
}

*/
function should_change_working_directory(event) {
  var return_value;
  
  if (working_directory.length > 0) {
    return_value = false;
  } else {
    return_value = true;
  }
  
  event.returnValue = return_value;
}

function newfile() {
  filename = null;
  exportname = null;
  
  working_directory = "";
  export_directory = "";
  
  mainWindow.webContents.send('newly-made-file', __dirname);
  
}

function try_open() {
  // Open prePathFile
  if (prePathFile.length > 0) {
    fs.readFile(prePathFile, "utf8", (err, data) => {
      if (err) throw err;
      
      var pathName = path.dirname(prePathFile);
      
      change_working_directory(pathName);
      
      export_directory = "";
      
      filename = path.basename(prePathFile);
      
      exportname = null;
      
      mainWindow.webContents.send("opened-file", pathName, filename, data);
    });
  }
}

function open() {
  dialog.showOpenDialog(mainWindow, { properties: ["openFile"], defaultPath: working_directory }).then((fn) => {
    // Prevent error message if click cancel
    if (fn.canceled) {
      return;
    }

    var filePath = fn.filePaths[0];

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) throw err;
      
      var pathName = path.dirname(filePath);
      
      change_working_directory(pathName);
      
      export_directory = "";

      filename = path.basename(filePath);
      
      exportname = null;
      
      mainWindow.webContents.send('opened-file', pathName, filename, data);
    });
    
    return;
  });
}

function save() {
  if (filename) {
    mainWindow.webContents.send('saved-file', working_directory, filename);
    
    return;
  } else {
    var fullPath = working_directory;

    var options = {
      filters: [
        { name: 'Markdown Files', extensions: ['md', 'markdown'] },
        { name: 'All Files', extensions: ['*'] }
      ],

      defaultPath: fullPath
    };

    dialog.showSaveDialog(mainWindow, options).then((n) => {
      if (n.canceled) {
        return; // canceled
      } else {
        var filepath = n.filePath;
        
        var pathname = path.dirname(filepath);
        
        change_working_directory(pathname);
        
        if (path.extname(filepath) == "") {
          filepath += ".md";
        }
        
        filename = path.basename(filepath);
        
        mainWindow.webContents.send('saved-file', pathname, filename);
        
        return;
      }
    });
  }
}

function save_(result) {
  var fullpath;
  
  fullpath = path.join(working_directory, filename);
  
  fs.writeFile(fullpath, result, (err) => {
    if (err) throw err;
    
  });
}

function saveas() {
  var fullPath;

  if (filename) {
    fullPath = path.join(working_directory, filename);
  } else {
    fullPath = working_directory;
  }
  
  var options = {
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown'] },
      { name: 'All Files', extensions: ['*'] }
    ],

    defaultPath: fullPath
  };

  dialog.showSaveDialog(mainWindow, options).then((n) => {
    if (n.canceled) {
      return; // canceled
    } else {
      var filepath = n.filePath;
      
      var pathname = path.dirname(filepath);
      
      change_working_directory(pathname);
      
      if (path.extname(filepath) == "") {
        filepath += ".md";
      }
      
      filename = path.basename(filepath);
      
      mainWindow.webContents.send('saved-file', pathname, filename);
      
      return;
    }
  });
}

function export_plain_html() {
  if (filename) {
    if (exportname) {
      mainWindow.webContents.send("exported-file"/*, export_directory, exportname*/, false);
      
      return;
    } else {
      var extname = path.extname(filename);
      
      var fullPath;
      
      if (extname === "") {
        fullPath = path.join(working_directory, path.basename(filename));
      } else {
        fullPath = path.join(working_directory, path.basename(filename, extname));
      }
      
      fullPath += ".html";

      var options = {
        filters: [
          { name: "HTML Files", extensions: ["htm", "html"] },
          { name: "All Files", extensions: ["*"] }
        ],

        defaultPath: fullPath
      };

      dialog.showSaveDialog(mainWindow, options).then((n) => {
        if (n.canceled) {
          return;
        } else {
          var filepath = n.filePath;
          
          var pathname = path.dirname(filepath);
          
          export_directory = pathname;
          
          if (path.extname(filepath) === "") {
            filepath += ".html";
          }
          
          exportname = path.basename(filepath);
          
          mainWindow.webContents.send("exported-file"/*, pathname, exportname*/, false);
          
          return;
        }
      });
    }
  } else {
    return;
  }
}

function export_(content) {
  var fullpath;
  
  fullpath = path.join(export_directory, exportname);
  
  fs.writeFile(fullpath, content, (err) => {
    if (err) throw err;
    
    const options = {
      type: "info",
      buttons: ["OK", "Cancel"],
      defaultId: 0,
      title: "Completed",
      message: "Successfully Exported\n\n" + fullpath + "\n\nOpen Right Now?",
      noLink: true
    };

    var result = dialog.showMessageBoxSync(mainWindow, options);
    
    if (result === 0) {
      openExternal(fullpath);
    }
  });
}

async function openExternal(urlstr) {
  const { shell } = require("electron");
  
  await shell.openExternal(urlstr);
}

function export_html() {
  if (filename) {
    var pathName, fullPath;

    if (export_directory.length > 0) {
      pathName = export_directory;
    } else {
      pathName = working_directory;
    }

    if (exportname) {
      fullPath = path.join(pathName, exportname);
    } else {
      var extname = path.extname(filename);
      
      if (extname === "") {
        fullPath = path.join(pathName, path.basename(filename));
      } else {
        fullPath = path.join(pathName, path.basename(filename, extname));
      }
      
      fullPath += ".html";
    }
    
    var options = {
      filters: [
        { name: "HTML Files", extensions: ["htm", "html"] },
        { name: 'All Files', extensions: ['*'] }
      ],

      defaultPath: fullPath
    };

    dialog.showSaveDialog(mainWindow, options).then((n) => {
      if (n.canceled) {
        return;
      } else {
        var filepath = n.filePath;
        
        var pathname = path.dirname(filepath);
        
        export_directory = pathname;
        
        if (path.extname(filepath) === "") {
          filepath += ".html";
        }
        
        exportname = path.basename(filepath);
        
        mainWindow.webContents.send("exported-file"/*, pathname, exportname*/, true);
        
        return;
      }
    });
  } else {
    return;
  }
}

function change_working_directory(new_path) {
  working_directory = new_path;
}

function fullscreentoggle() {
  if (mainWindow.isFullScreen() == false) {
    mainWindow.setFullScreen(true);
  } else {
    mainWindow.setFullScreen(false);
    mainWindow.setMenuBarVisibility(false);
  }
  
  mainWindow.webContents.send('fullscreen-change');
}

/*
** Prevent error message if click cancel
*/
function get(event, arg) {
  var options;
  
  if (arg == "file") {
    options = {
      properties: ["openFile"],
      defaultPath: working_directory
    };
  }
  
  if (arg == "image") {
    options = {
      properties: ["openFile"],
      filters: [
        { name: "images", extensions: ["jpg", "png", "gif", "svg"] }
      ],
      defaultPath: working_directory
    };
  }
  
  dialog.showOpenDialog(mainWindow, options).then((fn) => {
    var return_value;
    
    // Prevent error message if click cancel
    if (fn.canceled) {
      return_value = {
        filePath: "",
        pathName: ""
      };
    } else {
      var path_name = fn.filePaths[0];
      
      if (working_directory.length > 0) {
        if (path_name.toUpperCase().startsWith((working_directory + "\\").toUpperCase())) {
          return_value = {
            filePath: working_directory,
            pathName: path_name
          };
        } else {
          return_value = {
            filePath: "",
            pathName: ""
          };
          
          dialog.showMessageBox(mainWindow, {
            type: "info",
            detail: "file should in" + " " + "\"" + working_directory + "\"" + " " + "or its sub Directory" + "."
          });
        }
      } else {
        return_value = {
          filePath: path.dirname(path_name),
          pathName: path_name
        };
      }
    }
    
    event.returnValue = return_value;
  });
}

function update_title(new_title) {
  mainWindow.setTitle(new_title);
}

function electron_alert(arg) {
  dialog.showMessageBox(mainWindow, {
    type: "info",
    detail: arg
  });
}

function electron_confirm(event, arg) {
  const options = {
    type: "info",
    buttons: ["OK", "Cancel"],
    defaultId: 0,
    title: "TinyMCE Electron",
    message: arg,
    noLink: true
  };
  
  var result = dialog.showMessageBoxSync(mainWindow, options);
  
  event.returnValue = result;
}
