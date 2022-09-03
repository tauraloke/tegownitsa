/* eslint-disable no-undef */
'use strict';
import path from 'path';
import { app, Menu, shell } from 'electron';
import {
  is,
  appMenu,
  openUrlMenuItem,
  openNewGitHubIssue,
  debugInfo,
  showAboutWindow
} from 'electron-util';
import config from './config/store.js';

function getTemplate(i18n) {
  const showPreferences = (_menuItem, browserWindow, _event) => {
    // Show the app's preferences here
    browserWindow.webContents.send('execute', 'openPreferencesDialog');
  };

  const helpSubmenu = [
    openUrlMenuItem({
      label: i18n.t('main_menu.website'),
      icon: path.join(__static, 'menu', 'website.png'),
      url: 'https://github.com/tauraloke/tegownitsa'
    }),
    openUrlMenuItem({
      label: i18n.t('main_menu.source_code'),
      icon: path.join(__static, 'menu', 'source.png'),
      url: 'https://github.com/tauraloke/tegownitsa'
    }),
    {
      icon: path.join(__static, 'menu', 'issue.png'),
      label: i18n.t('main_menu.report'),
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
        label: i18n.t('main_menu.about'),
        icon: path.join(__static, 'menu', 'about.png'),
        click(_menuItem, _browserWindow, _event) {
          showAboutWindow({
            icon: path.join(__static, 'icon.png'),
            copyright: i18n.t('about.copyright'),
            website: 'https://github.com/tauraloke/tegownitsa',
            text: i18n.t('about.text')
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
        label: i18n.t('main_menu.preferences'),
        accelerator: 'Command+,',
        click(...args) {
          showPreferences(...args);
        }
      }
    ]),
    {
      label: i18n.t('main_menu.file'),
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
      label: i18n.t('main_menu.file'),
      role: 'fileMenu',
      submenu: [
        {
          label: i18n.t('main_menu.import_image_from_file'),
          accelerator: 'CmdOrCtrl+I',
          icon: path.join(__static, 'menu', 'file.png'),
          click(_menuItem, browserWindow, _event) {
            browserWindow.webContents.send('execute', 'openFile');
          }
        },
        {
          label: i18n.t('main_menu.import_image_from_folder'),
          accelerator: 'CmdOrCtrl+F',
          icon: path.join(__static, 'menu', 'folder.png'),
          click(_menuItem, browserWindow, _event) {
            browserWindow.webContents.send('execute', 'openFolder');
          }
        },
        {
          label: i18n.t('main_menu.import_image_from_url'),
          accelerator: 'CmdOrCtrl+U',
          icon: path.join(__static, 'menu', 'url.png'),
          click(_menuItem, browserWindow, _event) {
            browserWindow.webContents.send('execute', 'importFileFromUrl');
          }
        },
        {
          label: i18n.t('main_menu.import_image_from_clipboard'),
          icon: path.join(__static, 'menu', 'clipboard.png'),
          click(_menuItem, browserWindow, _event) {
            browserWindow.webContents.send('execute', 'importFromClipboard');
          }
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('main_menu.quit'),
          role: 'quit',
          icon: path.join(__static, 'menu', 'exit.png')
        }
      ]
    },
    {
      label: i18n.t('main_menu.edit'),
      role: 'editMenu',
      submenu: [
        {
          label: i18n.t('main_menu.settings'),
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
          label: i18n.t('main_menu.scan_files'),
          accelerator: 'CmdOrCtrl+H',
          icon: path.join(__static, 'menu', 'scan.png'),
          click(_menuItem, browserWindow, _event) {
            browserWindow.webContents.send('execute', 'scanSelectedFiles');
          }
        },
        {
          label: i18n.t('main_menu.find_dups'),
          accelerator: 'CmdOrCtrl+D',
          icon: path.join(__static, 'menu', 'dups.png'),
          click(_menuItem, browserWindow, _event) {
            browserWindow.webContents.send('execute', 'lookUpDups');
          }
        },
        {
          label: i18n.t('main_menu.load_tags_from_iqbd'),
          accelerator: 'CmdOrCtrl+T',
          icon: path.join(__static, 'menu', 'iqdb.png'),
          click(_menuItem, browserWindow, _event) {
            browserWindow.webContents.send('execute', 'loadTagsFromIQDB');
          }
        }
      ]
    },
    {
      label: i18n.t('main_menu.view'),
      role: 'viewMenu',
      submenu: [
        {
          label: i18n.t('main_menu.reload'),
          icon: path.join(__static, 'menu', 'reload.png'),
          role: 'reload'
        },
        {
          label: i18n.t('main_menu.force_reload'),
          icon: path.join(__static, 'menu', 'force_reload.png'),
          role: 'forceReload'
        },
        {
          label: i18n.t('main_menu.toggle_developer_tools'),
          icon: path.join(__static, 'menu', 'developer_tools.png'),
          role: 'toggleDevTools'
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('main_menu.actual_size'),
          icon: path.join(__static, 'menu', 'actual_size.png'),
          role: 'resetZoom'
        },
        {
          label: i18n.t('main_menu.zoom_in'),
          icon: path.join(__static, 'menu', 'zoom_in.png'),
          role: 'zoomIn'
        },
        {
          label: i18n.t('main_menu.zoom_out'),
          icon: path.join(__static, 'menu', 'zoom_out.png'),
          role: 'zoomOut'
        },
        {
          type: 'separator'
        },
        {
          label: i18n.t('main_menu.toggle_full_screen'),
          icon: path.join(__static, 'menu', 'full_screen.png'),
          role: 'toggleFullScreen'
        }
      ]
    },
    {
      label: i18n.t('main_menu.help'),
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

  return template;
}

export default function (i18n) {
  return Menu.buildFromTemplate(getTemplate(i18n));
}
