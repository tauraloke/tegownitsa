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
          test: /\.m?js$/,
          include: /node_modules/,
          type: 'javascript/auto'
        }
      ]
    }
  },
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        appId: 'com.electron.Tegownitsa',
        asarUnpack: ['**/node_modules/sharp/**'],
        extraFiles:
          process.platform == 'win32' ? ['./libs/sqlite/fuzzy.dll'] : null,
        win: {
          icon: './build/icon.png'
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
          category: 'Images;Network;Tags'
        }
      }
    }
  }
});
