// Cache locations
const CACHE_NAME = "my-site-cache-v1";
const DATA_CACHE_NAME = "data-cache-v1";

//urls the PWA will chache
const urlsToCache = [
  "/",
  "/db.js",
  "/index.js",
  "/manifest.json",
  "/styles.css",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

// This code starts when the application is installed.

self.addEventListener("install", function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// This code tells the service worker to listen for any events where a fetch (api call) is being made. This is when, normally, the browser would send a request to the server. 
self.addEventListener("fetch", function(event) {
  
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then(cache => {

        // First we attempt to perform the fetch normally. If there is still an Internet connection, everything will work normally.
        return fetch(event.request)
          .then(response => {
            // If the response is good, the cache name will be stored in the route to be accessed, and the data will sent back.
            // If the same route is accessed later without an Internet connection, we can substitute the saved data.
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }

            return response;
          })

          // This code runs if the fetch fails; ie: there is no Internet connection. In this case it pulls the correct saved data from the cache and sends it back instead.
          .catch(err => {
            // Network request failed, try to get it from the cache.
            return cache.match(event.request);
          });
      }).catch(err => console.log(err))
    );

    return;
  }

  // This code block handles all home page calls. Again, it can be used as-is.
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request).then(function(response) {
        if (response) {
          return response;
        } else if (event.request.headers.get("accept").includes("text/html")) {
          // return the cached home page for all requests for html pages
          return caches.match("/");
        }
      });
    })
  );
});
