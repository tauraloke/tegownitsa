/* eslint-disable no-undef */
'use strict';
import path from 'path';
import { app, Menu, shell, BrowserWindow } from 'electron';
import {
  is,
  appMenu,
  openUrlMenuItem,
  openNewGitHubIssue,
  debugInfo,
  showAboutWindow
} from 'electron-util';
import config from './config/store.js';

const showPreferences = (_menuItem, currentWindow, _event) => {
  // Show the app's preferences here
  let winSettings = new BrowserWindow({
    width: 700,
    height: 500,
    parent: currentWindow,
    modal: true
  });
  winSettings.setMenuBarVisibility(false);
  winSettings.on('close', function () {
    winSettings = null;
  });
  const setURL =
    process.env.NODE_ENV === 'development'
      ? `${process.env.WEBPACK_DEV_SERVER_URL}#/set`
      : `file://${__dirname}/index.html#/set`;
  winSettings.loadURL(setURL);
  winSettings.show();
};

const helpSubmenu = [
  openUrlMenuItem({
    icon: path.join(__static, 'menu', 'website.png'),
    label: 'Website',
    url: 'https://github.com/tauraloke/tegownitsa'
  }),
  openUrlMenuItem({
    icon: path.join(__static, 'menu', 'source.png'),
    label: 'Source Code',
    url: 'https://github.com/tauraloke/tegownitsa'
  }),
  {
    icon: path.join(__static, 'menu', 'issue.png'),
    label: 'Report an Issue…',
    click() {
      const body = `
<!-- Please succinctly describe your issue and steps to reproduce it. -->


---

${debugInfo()}`;

      openNewGitHubIssue({
        user: 'tauraloke',
        repo: 'tegownitsa',
        body
      });
    }
  }
];

if (!is.macos) {
  helpSubmenu.push(
    {
      type: 'separator'
    },
    {
      label: 'About Tegownitsa',
      icon: path.join(__static, 'menu', 'about.png'),
      click(_menuItem, _browserWindow, _event) {
        showAboutWindow({
          icon: path.join(__static, 'icon.png'),
          copyright: 'Created by Tauraloke Esteru and Github contributors',
          website: 'https://github.com/tauraloke/tegownitsa',
          text: 'Yet another image tag manager'
        });
      }
    }
  );
}

const debugSubmenu = [
  {
    label: 'Show Settings',
    click() {
      config.openInEditor();
    }
  },
  {
    label: 'Show App Data',
    click() {
      shell.openItem(app.getPath('userData'));
    }
  },
  {
    type: 'separator'
  },
  {
    label: 'Delete Settings',
    click() {
      config.clear();
      app.relaunch();
      app.quit();
    }
  },
  {
    label: 'Delete App Data',
    click() {
      shell.moveItemToTrash(app.getPath('userData'));
      app.relaunch();
      app.quit();
    }
  }
];

const macosTemplate = [
  appMenu([
    {
      label: 'Preferences…',
      accelerator: 'Command+,',
      click(...args) {
        showPreferences(...args);
      }
    }
  ]),
  {
    role: 'fileMenu',
    submenu: [
      {
        label: 'Custom'
      },
      {
        type: 'separator'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'editMenu'
  },
  {
    role: 'viewMenu'
  },
  {
    role: 'windowMenu'
  },
  {
    role: 'help',
    submenu: helpSubmenu
  }
];

// Linux and Windows
const otherTemplate = [
  {
    role: 'fileMenu',
    submenu: [
      {
        label: 'Import image from file',
        icon: path.join(__static, 'menu', 'file.png'),
        click(_menuItem, browserWindow, _event) {
          browserWindow.webContents.send('execute', 'openFile');
        }
      },
      {
        label: 'Import images from folder',
        icon: path.join(__static, 'menu', 'folder.png'),
        click(_menuItem, browserWindow, _event) {
          browserWindow.webContents.send('execute', 'openFolder');
        }
      },
      {
        label: 'Import image from direct URL',
        icon: path.join(__static, 'menu', 'url.png'),
        click(_menuItem, browserWindow, _event) {
          browserWindow.webContents.send('execute', 'importFileFromUrl');
        }
      },
      {
        icon: path.join(__static, 'menu', 'clipboard.png'),
        label: 'Import image from clipboard',
        click(_menuItem, browserWindow, _event) {
          browserWindow.webContents.send('execute', 'importFromClipboard');
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'quit',
        icon: path.join(__static, 'menu', 'exit.png')
      }
    ]
  },
  {
    role: 'editMenu',
    submenu: [
      {
        label: 'Settings',
        icon: path.join(__static, 'menu', 'settings.png'),
        accelerator: 'Control+,',
        click(...args) {
          showPreferences(...args);
        }
      },
      {
        type: 'separator'
      },
      {
        label: 'Scan text on current files',
        icon: path.join(__static, 'menu', 'scan.png'),
        click(_menuItem, browserWindow, _event) {
          browserWindow.webContents.send('execute', 'scanSelectedFiles');
        }
      },
      {
        label: 'Find duplicates',
        icon: path.join(__static, 'menu', 'dups.png'),
        click(_menuItem, browserWindow, _event) {
          browserWindow.webContents.send('execute', 'lookUpDups');
        }
      },
      {
        label: 'Load tags from IQDB for current files',
        icon: path.join(__static, 'menu', 'iqdb.png'),
        click(_menuItem, browserWindow, _event) {
          browserWindow.webContents.send('execute', 'loadTagsFromIQDB');
        }
      }
    ]
  },
  {
    role: 'viewMenu'
  },
  {
    role: 'help',
    submenu: helpSubmenu
  }
];

const template = is.macos ? macosTemplate : otherTemplate;

if (is.development) {
  template.push({
    label: 'Debug',
    submenu: debugSubmenu
  });
}

export default Menu.buildFromTemplate(template);
