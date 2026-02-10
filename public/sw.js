/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-fedb67b4'], (function (workbox) { 'use strict';

  importScripts("/fallback-ce627215c0e4a9af.js");
  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "/_next/static/Rpy6LF1Atx_1OQaBQtooR/_buildManifest.js",
    "revision": "facdd75b6f22d441a0ebe4f21aef2331"
  }, {
    "url": "/_next/static/Rpy6LF1Atx_1OQaBQtooR/_ssgManifest.js",
    "revision": "b6652df95db52feb4daf4eca35380933"
  }, {
    "url": "/_next/static/chunks/100-817f199ea16e4c8e.js",
    "revision": "817f199ea16e4c8e"
  }, {
    "url": "/_next/static/chunks/113-e0cb19f02e1054e1.js",
    "revision": "e0cb19f02e1054e1"
  }, {
    "url": "/_next/static/chunks/114-49fc1983e4f73447.js",
    "revision": "49fc1983e4f73447"
  }, {
    "url": "/_next/static/chunks/134-4972ea38d1e60ef3.js",
    "revision": "4972ea38d1e60ef3"
  }, {
    "url": "/_next/static/chunks/176-0b6e8f09127683e1.js",
    "revision": "0b6e8f09127683e1"
  }, {
    "url": "/_next/static/chunks/186-47e8dcf0d250550e.js",
    "revision": "47e8dcf0d250550e"
  }, {
    "url": "/_next/static/chunks/211-feb29acb1fa1c053.js",
    "revision": "feb29acb1fa1c053"
  }, {
    "url": "/_next/static/chunks/224-6ab2b75fe97c263b.js",
    "revision": "6ab2b75fe97c263b"
  }, {
    "url": "/_next/static/chunks/241.802e5574d9a31661.js",
    "revision": "802e5574d9a31661"
  }, {
    "url": "/_next/static/chunks/242-5c4e8123b4d5d9c8.js",
    "revision": "5c4e8123b4d5d9c8"
  }, {
    "url": "/_next/static/chunks/438-0ac5ef219cdb326f.js",
    "revision": "0ac5ef219cdb326f"
  }, {
    "url": "/_next/static/chunks/4bd1b696-096d35a2bd1da3af.js",
    "revision": "096d35a2bd1da3af"
  }, {
    "url": "/_next/static/chunks/532.49951f09b45499c2.js",
    "revision": "49951f09b45499c2"
  }, {
    "url": "/_next/static/chunks/53c0104b-6801ec8a152917a8.js",
    "revision": "6801ec8a152917a8"
  }, {
    "url": "/_next/static/chunks/5b86099a-9ccbc78208e3d43b.js",
    "revision": "9ccbc78208e3d43b"
  }, {
    "url": "/_next/static/chunks/70-009cf318da5bd877.js",
    "revision": "009cf318da5bd877"
  }, {
    "url": "/_next/static/chunks/928-2f9cb4ecff5e67b2.js",
    "revision": "2f9cb4ecff5e67b2"
  }, {
    "url": "/_next/static/chunks/942-813500cea50c35e7.js",
    "revision": "813500cea50c35e7"
  }, {
    "url": "/_next/static/chunks/998-002f4b75f90c8b25.js",
    "revision": "002f4b75f90c8b25"
  }, {
    "url": "/_next/static/chunks/app/(dashboard)/countdowns/page-57b91f7f8e19056d.js",
    "revision": "57b91f7f8e19056d"
  }, {
    "url": "/_next/static/chunks/app/(dashboard)/layout-49ee2b7e2ebba181.js",
    "revision": "49ee2b7e2ebba181"
  }, {
    "url": "/_next/static/chunks/app/(dashboard)/milestones/page-36e13c0b584bfa45.js",
    "revision": "36e13c0b584bfa45"
  }, {
    "url": "/_next/static/chunks/app/(dashboard)/page-e0f7eddf3c3b3864.js",
    "revision": "e0f7eddf3c3b3864"
  }, {
    "url": "/_next/static/chunks/app/(dashboard)/reminders/page-8ccd97e8fe0ab414.js",
    "revision": "8ccd97e8fe0ab414"
  }, {
    "url": "/_next/static/chunks/app/(dashboard)/settings/page-fac1cb4ecd8ce8ea.js",
    "revision": "fac1cb4ecd8ce8ea"
  }, {
    "url": "/_next/static/chunks/app/(dashboard)/trackers/%5Bid%5D/page-fe0b45ab52f52b0a.js",
    "revision": "fe0b45ab52f52b0a"
  }, {
    "url": "/_next/static/chunks/app/_global-error/page-9be14022a1e4e6c8.js",
    "revision": "9be14022a1e4e6c8"
  }, {
    "url": "/_next/static/chunks/app/_not-found/page-6e4bad45ee9e782f.js",
    "revision": "6e4bad45ee9e782f"
  }, {
    "url": "/_next/static/chunks/app/auth/layout-9be14022a1e4e6c8.js",
    "revision": "9be14022a1e4e6c8"
  }, {
    "url": "/_next/static/chunks/app/auth/page-9600003dbce7407d.js",
    "revision": "9600003dbce7407d"
  }, {
    "url": "/_next/static/chunks/app/layout-9b120f74e3411271.js",
    "revision": "9b120f74e3411271"
  }, {
    "url": "/_next/static/chunks/app/manifest.webmanifest/route-9be14022a1e4e6c8.js",
    "revision": "9be14022a1e4e6c8"
  }, {
    "url": "/_next/static/chunks/app/offline/page-c66b670096673d6f.js",
    "revision": "c66b670096673d6f"
  }, {
    "url": "/_next/static/chunks/app/pwa-debug/page-6b5781426cd06ab9.js",
    "revision": "6b5781426cd06ab9"
  }, {
    "url": "/_next/static/chunks/e99863e0-79b86b9b00bf4482.js",
    "revision": "79b86b9b00bf4482"
  }, {
    "url": "/_next/static/chunks/framework-75892d61b920805f.js",
    "revision": "75892d61b920805f"
  }, {
    "url": "/_next/static/chunks/main-a6a33696a2f89e64.js",
    "revision": "a6a33696a2f89e64"
  }, {
    "url": "/_next/static/chunks/main-app-dcb5e601105abe8b.js",
    "revision": "dcb5e601105abe8b"
  }, {
    "url": "/_next/static/chunks/next/dist/client/components/builtin/app-error-9be14022a1e4e6c8.js",
    "revision": "9be14022a1e4e6c8"
  }, {
    "url": "/_next/static/chunks/next/dist/client/components/builtin/forbidden-9be14022a1e4e6c8.js",
    "revision": "9be14022a1e4e6c8"
  }, {
    "url": "/_next/static/chunks/next/dist/client/components/builtin/global-error-faa500c6383ccb10.js",
    "revision": "faa500c6383ccb10"
  }, {
    "url": "/_next/static/chunks/next/dist/client/components/builtin/not-found-9be14022a1e4e6c8.js",
    "revision": "9be14022a1e4e6c8"
  }, {
    "url": "/_next/static/chunks/next/dist/client/components/builtin/unauthorized-9be14022a1e4e6c8.js",
    "revision": "9be14022a1e4e6c8"
  }, {
    "url": "/_next/static/chunks/polyfills-42372ed130431b0a.js",
    "revision": "846118c33b2c0e922d7b3a7676f81f6f"
  }, {
    "url": "/_next/static/chunks/webpack-85d51842bc2776d0.js",
    "revision": "85d51842bc2776d0"
  }, {
    "url": "/_next/static/css/7dfbe52fc3a9595f.css",
    "revision": "7dfbe52fc3a9595f"
  }, {
    "url": "/fallback-ce627215c0e4a9af.js",
    "revision": "8d821085767c55683247c66ad6871da9"
  }, {
    "url": "/file.svg",
    "revision": "d09f95206c3fa0bb9bd9fefabfd0ea71"
  }, {
    "url": "/globe.svg",
    "revision": "2aaafa6a49b6563925fe440891e32717"
  }, {
    "url": "/icons/apple-touch-icon.png",
    "revision": "2fc9eb003db43faeac42b7ebabee7053"
  }, {
    "url": "/icons/icon-192x192.png",
    "revision": "05fde42861de297f28f73fbb56925d6b"
  }, {
    "url": "/icons/icon-512x512.png",
    "revision": "a5ce1dd9430ab7711d34cbfbb3f0f5a7"
  }, {
    "url": "/next.svg",
    "revision": "8e061864f388b47f33a1c3780831193e"
  }, {
    "url": "/offline",
    "revision": "Rpy6LF1Atx_1OQaBQtooR"
  }, {
    "url": "/sw-custom.js",
    "revision": "d37bb155dff40673142f4511e53c27e5"
  }, {
    "url": "/vercel.svg",
    "revision": "c0af2f507b369b085b35ef4bbe3bcf1e"
  }, {
    "url": "/window.svg",
    "revision": "a2760511c65806022ad20adf74370ff3"
  }], {
    "ignoreURLParametersMatching": [/^utm_/, /^fbclid$/]
  });
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-webfonts",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 4,
      maxAgeSeconds: 31536000
    }), {
      handlerDidError: async ({
        request: e
      }) => "undefined" != typeof self ? self.fallback(e) : Response.error()
    }]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i, new workbox.StaleWhileRevalidate({
    "cacheName": "google-fonts-stylesheets",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 4,
      maxAgeSeconds: 604800
    }), {
      handlerDidError: async ({
        request: e
      }) => "undefined" != typeof self ? self.fallback(e) : Response.error()
    }]
  }), 'GET');
  self.__WB_DISABLE_DEV_LOGS = true;

}));
