const myPrefix = "% hey ! :) I'm the amazing prefix of piche index %";


function isAlreadySaved (officialName) {
    return localStorage.getItem(officialName) !== null;
}


// ----------- EVENT LISTENERS ----------- //


function add () {
    window.close();
    chrome.windows.create({
        "width": 250,
        "height": 350,
        "top": 300,
        "left": 400,
        "type": "panel",
        "url": "new.html"
    });
}


function clear () {
    let currentTitle = localStorage.getItem("meta-currentTitle");
    localStorage.removeItem(currentTitle);
    var cleanedIndex = localStorage.getItem("meta-index").replace(myPrefix + currentTitle, "");
    localStorage.setItem("meta-index", cleanedIndex);
    window.close();
}


function handle () {
    window.close();
    chrome.windows.create({
        "width": 440,
        "height": 620,
        "top": 100,
        "left": 200,
        "type": "panel",
        "url": "all.html"
    });
}


// ----------- MAIN ----------- //


if (localStorage.getItem("meta-themes") === null){
    localStorage.setItem("meta-themes", myPrefix + "Autres");
}
if (localStorage.getItem("meta-index") === null) {
    localStorage.setItem("meta-index", "");
}


document.addEventListener("DOMContentLoaded", function () {

    chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tabs) {
        var officialName = tabs[0].title;
        var currentUrl = tabs[0].url;
        localStorage.setItem("meta-currentTitle", officialName);
        localStorage.setItem("meta-currentUrl", currentUrl);
        document.querySelector('#title').textContent = officialName;
        if (isAlreadySaved (officialName)) {
            document.querySelector('#isAlreadySaved').textContent = "Page déjà indexée";
            document.querySelector('#add').style.display = "none";
        } else {
            document.querySelector('#delete').style.display = "none";
        }
    });

    document.querySelector('#add').addEventListener("click", add);
    document.querySelector('#delete').addEventListener("click", clear);
    document.querySelector('#handle').addEventListener("click", handle);
});
