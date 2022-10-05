const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    mode: 'production',
    resolve: {
      extensions: ['*', '.mjs', '.js', '.json']
    },
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto'
        }
      ]
    }
  },
  pluginOptions: {
    electronBuilder: {
      customFileProtocol: './',
      externals: ['tesseract.js'],
      preload: 'src/preload.js',
      builderOptions: {
        appId: 'com.electron.Tegownitsa',
        asarUnpack: [
          '**/node_modules/sharp/**',
          '**/node_modules/@tensorflow/**'
        ],
        extraFiles: [
          ...['./libs/autotagger/.gitkeep'],
          ...(process.platform == 'win32' ? ['./libs/sqlite/fuzzy.dll'] : []),
          ...(process.platform == 'darwin' ? ['./libs/sqlite/fuzzy.dylib'] : [])
        ],
        win: {
          icon: './build/icon.png'
        },
        nsis: {
          allowToChangeInstallationDirectory: true,
          oneClick: false
        },
        mac: {
          category: 'public.app-category.social-networking',
          darkModeSupport: true
        },
        dmg: {
          iconSize: 160,
          contents: [
            {
              x: 180,
              y: 170
            },
            {
              x: 480,
              y: 170,
              type: 'link',
              path: '/Applications'
            }
          ]
        },
        linux: {
          target: ['AppImage', 'deb'],
          icon: './build/icon.png',
          category: 'Images;Network;Tags'
        }
      }
    },
    vuetify: {
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    },
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableLegacy: false,
      runtimeOnly: false,
      compositionOnly: false,
      fullInstall: true
    }
  }
});
