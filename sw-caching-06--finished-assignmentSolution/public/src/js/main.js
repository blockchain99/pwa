
var box = document.querySelector('.box');
var button = document.querySelector('button');

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function() {
      console.log('Registered Service Worker!');
    });
}

button.addEventListener('click', function(event) {
  if (box.classList.contains('visible')) {
    box.classList.remove('visible');
  } else {
    box.classList.add('visible');
  }
});

// 1) Register a Service Worker
// 2) Identify the AppShell (i.e. core assets your app requires to provide its basic "frame")
//Analyzing index.html(core assets your app to provide its basic
// frame)-> fonts,icons,css theme, app.css, main.css, material.min.js,
//main.js, index.html
// 3) Precache the AppShell
//Let's cache above assets in SW file, -> install event do This
//self.addEventListener('install', function(e) {
//  e.waitUntil(
//    caches.open('static')
//      .then(function(cache)) {
//         cache.addAll([...]);
//
// 4) Add Code to fetch the precached assets from cache when needed
//After installing new files in cache, clean the unused file from
//cache by activate event
//self.addEventListener('fetch', function() {
//  event.respondWith(
//    caches.match(event.request)
//      .then(function(response) {
//        if(response) {
//          return response;
//        } else {
//           return fetch(event.request)
//             .catch(function(err) { });
//          }  }) ...
//after reaload, new sw installed with sipWaiting(click this or
//close this tab(window), open new tab)/Application / Inspect Cache
//  static - left /Request column./ SW, offline checked !-> reload->
//icon missing hut app shell working.(button not working since css
//stylesheet missing.)(page not shown though)
//
// 5) Precache other assets required to make the root index.html file work
//In sw.js, cache.addAll([... '/src/css/main.css',...]);
//main.css cached, so,in browser, Though in Service wk,offline,
//checked, We can see TOGGLEBOX screen changed with color.
// 6) Change some styling in the main.css file and make sure that the new file gets loaded + cached (hint: versioning)
//in main.css changed to -> .box {...; height: 200px;...}
//but still unchange box in browser, after reload.(still
//previous sw acting-> in sw.js, change sw asf.(then reinstall activate)
//caches.open('static-v2')  //which reflected '/src/css/main.css'
//  .then(function(cache) {
//     chche.addAll([ ... ]);
//})

// 7) Make sure to clean up unused caches
//activate event : cleanup not interfering cache still running application
//-> install active run immmediately
//self.addEventListener('activate', function(e) {
//  e.waitUntil(
//    caches.keys()
//     .then(function(keyList) {
//       return Promise.all(keyList.map(function(key) {
//         if(key !== 'static-v2') {
//           return caches.delete(key); }  }));
//-> then close tab, open new tab to activate new SW, we can see changed
//box layout(height : 200px) :: offline clicked same results
// 8) Add dynamic caching (with versioning) to cache everything in your app when visited/ fetched by the user
//So, we can find it in the future.
// From bove coding lines..
//  ...else {
//       return fetch(e.response)
//         .then(functioin(res) {
//           return caches.open('dynamic-v1')
//             .then(function(cache) {
//                cache.put(event.request.url, res.clone());
//                return res;  }); ...
//
// Important: Clear your Application Storage first to get rid of the old SW & Cache from the Main Course Project!
