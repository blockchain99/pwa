var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
/*when n/w reestablished, send new post to serverwith "+" button in form tag  */
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');
/* "+" tag in main page */
function openCreatePostModal() {
//1 coupled with feed.css /* 1 */
    //createPostArea.style.display = 'block';
/*make above line and setTimeout() don't happen at the same time.
but first time, we see the slide up animation, after that, no slide up
since we never implemente state back mocule-> closeCreatePostModal() */
  //setTimeout(function() {
/* the position that we want ending */
      createPostArea.style.transform = 'translateY(0)';
 //}, 1);

  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then(function(registrations) {
  //       for (var i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister();
  //       }
  //     })
  // }
}

function closeCreatePostModal() {
//need to reverse the feature
  createPostArea.style.transform = 'translateY(100vh)';
  //createPostArea.style.display = 'none'; //disable it
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// Currently not in use, allows to save assets in cache on demand otherwise
function onSaveButtonClicked(event) {
  console.log('clicked');
  if ('caches' in window) {
    caches.open('user-requested')
      .then(function(cache) {
        cache.add('https://httpbin.org/get');
        cache.add('/src/images/sf-boat.jpg');
      });
  }
}

function clearCards() {
  while(sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  /*Change the position of the image to see more of the images */
  cardTitle.style.backgroundPosition = 'bottom'; // Or try 'center'
  /* cardTitle.style.height = 180px */ //goto feed.css
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

//var url = 'https://pwagram-99adf.firebaseio.com/posts.json';
var url = 'https://pwass-118e7.firebaseio.com/posts.json';
var networkDataReceived = false;

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log('From web', data);
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

if ('indexedDB' in window) {
  readAllData('posts')
    .then(function(data) {
      if (!networkDataReceived) {
        console.log('From cache', data);
        updateUI(data);
      }
    });
}
/* send data to my backend */
function sendData() {
  fetch('https://pwass-118e7.firebaseio.com/posts.json', {
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image: 'https://firebasestorage.googleapis.com/v0/b/pwass-118e7.appspot.com/o/sf-boat.jpg?alt=media&token=151c4f27-359f-45b9-aaf0-1a51170ceb0c'
    })
  })
    .then(function(res) {
      console.log('Sent data', res);
      updateUI();
    })
}
form.addEventListener('submit', function(event){
  event.preventDefault();
  /*index.html, check id(title, location) exit?   */
  if(titleInput.value.trim() ==='' || locationInput.value.trim() ==='') {
    alert('Please enter valid data!');
    return;
  }
  closeCreatePostModal();
  /* SyncManager assumes background synchronization
  - store post(data) in our indexedDB */
  if('serviceWorker' in navigator  && 'SyncManager' in window) {
    navigator.serviceWorker.ready
     .then(function(sw) {
       var post = {
         id: new Date().toISOString(),
         title: titleInput.value,
         location: locationInput.value
       };
/*objectStore Name(indexedDB) in utility.js, above data to store
-promise(writeData(..)) which finised successfully, then return register()
.return-since all the returns are promise*/
       writeData('sync-posts',post)
        .then(function() {
/*register 'sync-new-post'(snychronization task) as service worker   */
          return sw.sync.register('sync-new-posts');
        })
        .then(function() {//successfully registered to synchronization task
/*in index.html,<div id="confirmation-toast" ...*/
          var snackbarContainer = document.querySelector('#confirmation-toast');
          var data = {message: 'Your Post was saved for syncing!'};
          snackbarContainer.MaterialSnackbar.showSnackbar(data);
        })
        .catch(function(err) {
          console.log(err);
        });

     });
  }else { //if we don't support SW or Sync Manager-> then we don't send anything
  //that's not we want to do.-> fallback logic for old browser.
    sendData(); //send directly send data to backend w/o synchronization event.
  }
});
