const myPrefix = "% hey ! :) I'm the amazing prefix of piche index %";
const pathWorker = 'src/lib/pdf.worker.js';

// ----------- HTTP REQUEST ----------- //


function loadHTML (url) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.onload = function () {
            if (request.status == 200){
                resolve(request.responseText);
            } else {
                reject(new Error(request.statusText));
            }
        };
        request.onerror = function () {
            reject(new Error("erreur !"));
        }
        request.open('GET', url, true);
        request.send();
  });
}

// the request returns an array buffer
function loadPDF (url) {
    return new Promise (function(resolve, reject) {
      var request = new XMLHttpRequest();
      request.open("GET", url, true);
      request.responseType = "arraybuffer";
      request.onload = function (oEvent) {
          var arrayBuffer = request.response; // Note: not request.responseText
          if (arrayBuffer) {
              resolve(arrayBuffer);
          }
      };
      request.send(null);
    });
}

// ----------- HTML TO TEXT ----------- //


function eraseContentOfUnrelevantTags (htmlElement, tagName) {
    var arrayToDelete = htmlElement.getElementsByTagName(tagName);
    for (let i = 0; i < arrayToDelete.length; i++) {
        arrayToDelete[i].innerText = "";
    }
}

// erasing content of script and style tags, deleting remaining tags
function htmlToText (htmlElement) {
    eraseContentOfUnrelevantTags(htmlElement, "script");
    eraseContentOfUnrelevantTags(htmlElement, "style");
    return htmlElement.textContent.replace(new RegExp("<[^<]+</[^>]+>","g"),"");
}


// ----------- PDF ARRAYBUFFER TO TEXT AND SAVE BOOKMARK ----------- //


function getTextFromArrayBufferAndSaveBookmark (data) {
    PDFJS.workerSrc = pathWorker;
    return PDFJS.getDocument(data).then(function(pdf) {
        var pages = [];
        for (var i = 0; i < pdf.numPages; i++) {
            pages.push(i);
        }
        return Promise.all(pages.map(function(pageNumber) {
            return pdf.getPage(pageNumber + 1).then(function(page) {
                return page.getTextContent().then(function(textContent) {
                    return textContent.items.map(function(item) {
                        return item.str;
                    }).join(' ');
                });
            });
        })).then(function(pages) {
            saveNewBookmark (pages.join("\r\n"));
            window.close();
        });
    });
}


// ----------- SAVE DATA IN LOCALSTORAGE ----------- //


function addToIndex (officialName) {
    if (localStorage.getItem("meta-index") !== null) {
        localStorage.setItem("meta-index", localStorage.getItem("meta-index") + myPrefix + officialName);
    } else {
        localStorage.setItem("meta-index", myPrefix + officialName);
    }
}


function saveNewBookmark (content) {
    var officialName = localStorage.getItem("meta-currentTitle");
    var title = document.querySelector('#title').value;
    var comment = document.querySelector('#comment').value;
    var theme = document.querySelector('#select').value;
    var url = localStorage.getItem("meta-currentUrl");
    // add new bookmark to localstorage
    var stringNewEntry = myPrefix + title + myPrefix + url + myPrefix + theme + myPrefix + comment + myPrefix + content;
    localStorage.setItem(officialName, stringNewEntry);
    // add this bookmark to the index
    addToIndex(officialName);
}

// ----------- MISCELLANEOUS FUNCTIONS ----------- //


function isPDF (url) {
    return (url.indexOf (".pdf") === url.length - 4);
}


function getAllThemes () {
    var array = localStorage.getItem("meta-themes").split(myPrefix);
    return array.splice(1, array.length-1);
}


/*
function closeCurrentPanel () {
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
        var tabId = tabs[0].id;
        chrome.tabs.remove(tabId);
    });
}
*/

// ----------- EVENT LISTENER ----------- //


function confirm () {
    var url = localStorage.getItem("meta-currentUrl");
    if (!title) {
        alert("Veuillez indiquer un titre");
        return;
    }
    if (isPDF (url)) {
        loadPDF (url)
            .then(getTextFromArrayBufferAndSaveBookmark);
    } else {
        loadHTML(url)
            .then(function (dataText) {
                var htmlElement = document.createElement('html');
                htmlElement.innerHTML = dataText;
                var content = htmlToText(htmlElement);
                saveNewBookmark(content);
                window.close();
            });
    }
}


// ----------- MAIN ----------- //


document.addEventListener('DOMContentLoaded', function () {

    document.querySelector('#title').value = localStorage.getItem("meta-currentTitle");
    var select = document.querySelector('#select');
    var array = getAllThemes();
    for (let i = 0; i < array.length; i++) {
        select.options[select.options.length] = new Option(array[i], array[i]);
    }
    document.querySelector('#confirm').addEventListener("click", confirm);
});
