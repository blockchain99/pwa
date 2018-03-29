
var CACHE_STATIC_NAME = 'static-v2';
var CACHE_DYNAMIC_NAME = 'dynamic-v1';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        cache.addAll([
          '/',
          '/index.html',
          '/src/css/app.css',
          '/src/css/main.css',
          '/src/js/main.js',
          '/src/js/material.min.js',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
        ]);
      })
  )
});

self.addEventListener('activate', function(event) {
  event.waitUntil( //wait until cleanup process finish
    caches.keys() //get all my keys in cashes storage
      .then(function(keyList) {
//promise to waite all the operations finish
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME) {
            return caches.delete(key);
          }
        }));
      })
  );
});
//fetch the precached assets from cachewhen needed
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {  //if response exists
          return response; // response in cache
        } else {
          return fetch(event.request)
  //get reponse from svr where you request
            .then(function(res) {
  //store in my dynamic caches
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(function(cache) {
  //put (identifier, response got back)
  //clone-> store one response here,still return
  //one for user.
                  cache.put(event.request.url, res.clone());
                  return res;
                });
            })
            .catch(function(err) {

            });
        }
      })
  );
});
