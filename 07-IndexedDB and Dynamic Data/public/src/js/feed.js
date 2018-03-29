var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
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
  createPostArea.style.display = 'none';
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

//function createCard() {
function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
//cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
//url is https://pwass-118e7.firebaseio.com/posts ,all contens
//are saved as json format.
// - add dynamic piece to the string
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  //cardTitleTextElement.textContent = 'San Francisco Trip';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  //cardSupportingText.textContent = 'In San Francisco';
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
// data is element of posts(not Array)which is
//id:(jscript obj).
//such as first-post(object: key,val pari)
function updateUI(data) {
  clearCards(); //2
  for(var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

//var url = 'https://httpbin.org/post';
//add .json
var url = 'https://pwass-118e7.firebaseio.com/posts.json';
var networkDataReceived = false;

/*since We use GET request instead of POST */
// fetch(url, {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json'
//   },
//   body: JSON.stringify({
//     message: 'Some message'
//   })
// })
fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log('From web', data);
//convert jscript obj to Array  //1
/* *** jscript obj represented by json ***
posts
 first-post
 - id:"first-post"
 - image: "https://firabasestorage.googleapis.com/v0/b..."
 - locatioin: "In San F..."
 - title: "Awesome ..."
 */
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    //clearCards();  //2
//used be dummy card, need more than one created
    //createCard();
//javascript object not array(key,value pair)
//passing data won't work //1 above conversion need!!
    //updateUI(data);  //2
    updateUI(dataArray);
  });  //end of .then(function(data)

if ('caches' in window) { //updata UI from caches
  caches.match(url)
    .then(function(response) {
      if (response) {
        return response.json();
      }
    })
    .then(function(data) {
      console.log('From cache', data);
      if (!networkDataReceived) {
        var dataArray = [];    //4
        for (var key in data) {
          dataArray.push(data[key]);
        }
        // clearCards();  //3
        // createCard();
        updateUI(dataArray);
// then in sw.js, update caches caches.open(CACHE_DYNAMIC_NAME)
      }
    });
}
