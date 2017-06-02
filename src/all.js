const myPrefix = "% hey ! :) I'm the amazing prefix of piche index %";
const MIN_RELEVANCE = 0;


// ----------- GET BOOKMARKS AND THEMES ----------- //


function getAllThemes () {
    var array = localStorage.getItem("meta-themes").split(myPrefix);
    return array.splice(1, array.length-1);
}


function getAllBookmarksOfficialNames () {
    var array = localStorage.getItem("meta-index").split(myPrefix);
    return array.splice(1, array.length-1);
}


function getBookmarksByTheme (theme) {
    var arrayToReturn = [];
    var bookmarksOfficialNames = getAllBookmarksOfficialNames();
    for (let i = 0; i < bookmarksOfficialNames.length; i++) {
        if (getThemeOfABookmark(bookmarksOfficialNames[i]) === theme) {
            arrayToReturn.push(bookmarksOfficialNames[i]);
        }
    }
    return arrayToReturn;
}


// ----------- GET ATTRIBUTES OF A BOOKMARK ----------- //


function getTitleOfABookmark (bookmarkOfficialName) {
    var item = localStorage.getItem(bookmarkOfficialName);
    return item.split(myPrefix)[1];
}


function getUrlOfABookmark (bookmarkOfficialName) {
    var item = localStorage.getItem(bookmarkOfficialName);
    return item.split(myPrefix)[2];
}


function getThemeOfABookmark (bookmarkOfficialName) {
    var item = localStorage.getItem(bookmarkOfficialName);
    return item.split(myPrefix)[3];
}


function getCommentOfABookmark (bookmarkOfficialName) {
    var item = localStorage.getItem(bookmarkOfficialName);
    return item.split(myPrefix)[4];
}


function getContentOfABookmark (bookmarkOfficialName) {
    var item = localStorage.getItem(bookmarkOfficialName);
    return item.split(myPrefix)[5];
}


// ----------- USEFUL FUNCTIONS ----------- //


function sortDictionnaryByValue (dict) {
    var sortable = [];
    for (let bookmark in dict) {
      sortable.push([bookmark, dict[bookmark]])
    }
    sortable.sort(function (a, b) {
          return b[1] - a[1];
    });
    var dictToReturn = {};
    for (tuple of sortable) {
        dictToReturn[tuple[0]] = tuple[1];
    }
    return dictToReturn;
}


function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}


// ----------- SEARCHING ----------- //


function getInverseFrequency (word) {
    var bookmarks = getAllBookmarksOfficialNames();
    if (bookmarks.length === 1) {
        return 1;
    }
    var counter = 0;
    for (let i = 0; i < bookmarks.length; i++) {
        var content = getContentOfABookmark(bookmarks[i]).toLowerCase();
        if (content.indexOf(word) > -1) {
            counter +=1;
        }
    } if (counter === 0) {
        return 0;
    } else {
        var inverseFrequency = bookmarks.length/counter;
        return Math.log(inverseFrequency);
    }
}


function getRelevance (bookmark, keyword, weight) {
    var content = getContentOfABookmark(bookmark).toLowerCase();
    var tfidf = 0;
    var regExp = new RegExp(keyword,"g");
    var array = content.match(regExp);
    if (array !== null) {
        tfidf += weight * array.length;
    }
    var lengthCoef = Math.log(1 + content.length);
    var relevance = Math.floor(100 * tfidf / lengthCoef);
    return relevance;
}


function getRelevanceDict () {
    var dict = {};
    var bookmarks;
    var keywords = localStorage.getItem("meta-currentKeywords").split(" ");

    if (localStorage.getItem("meta-currentTheme") === "TOUS") {
        bookmarks = getAllBookmarksOfficialNames();
    } else {
        var theme = localStorage.getItem("meta-currentTheme");
        bookmarks = getBookmarksByTheme(theme);
    }

    for (let i = 0; i < keywords.length; i++) {
        var keyword, weight = 1;
        if (keywords[i].indexOf("#") > -1) {
            var split = keywords[i].split("#");
            keyword = split[0].toLowerCase();
            weight = split[1];
        } else {
            keyword = keywords[i].toLowerCase();
        }
        weight *= getInverseFrequency(keyword);

        for (let i = 0; i < bookmarks.length; i++) {
            var bookmark = bookmarks[i];
            var relevance = getRelevance(bookmark, keyword, weight);
            if (relevance > MIN_RELEVANCE) {
                dict[bookmark] = relevance;
            }
        }
    }
    return sortDictionnaryByValue (dict);
}


function getContentExcerpt (bookmarkOfficialName) {
    return "";
}


// ----------- DISPLAY ----------- //

// DISPLAY FOR SEARCHING MODE


function showSearchedBookmarks () {

    var bookmarksDict = getRelevanceDict();

    if (isEmpty(bookmarksDict)) {
        let p = document.createElement("p");
        p.className = "classtitle";
        p.textContent = "Aucun résultat pertinent trouvé !";
        document.getElementsByTagName('body')[0].appendChild(p);
    }
    for (bookmark in bookmarksDict) {
        let dl = document.createElement("dl");
        dl.className = "classpiche";

        let dtitle = document.createElement("dt");
        dtitle.style.fontStyle = "italic";
        dtitle.textContent = getTitleOfABookmark(bookmark).toUpperCase();
        dl.appendChild(dtitle);

        let drelevance = document.createElement("dd");
        drelevance.textContent = "Pertinence : " + bookmarksDict[bookmark];
        dl.appendChild(drelevance);

        let dofficialName = document.createElement("dd");
        dofficialName.textContent = "Référence : " + bookmark;
        dl.appendChild(dofficialName);

        let dcomment = document.createElement("dd");
        dcomment.textContent = "Commentaire : " + getCommentOfABookmark(bookmark);
        dl.appendChild(dcomment);

        let a = document.createElement("a");
        let durl = document.createElement("dd");
        var url = getUrlOfABookmark(bookmark);
        a.href = url;
        a.textContent = url;
        durl.appendChild(a);
        dl.appendChild(durl);

        /*
        let dcontentExcerpt = document.createElement("dd");
        dcontentExcerpt.textContent = "Extrait : " + getContentExcerpt(bookmarks[j]);
        dl.appendChild(dcontentExcerpt);
        */

        document.getElementsByTagName('body')[0].appendChild(dl);
    }
}


// DISPLAY FOR NORMAL MODE


function showAllBookmarks  () {
    var themes = getAllThemes();
    for (let i = 0; i < themes.length; i++) {
        var li = document.createElement("li");
        li.textContent = themes[i].toUpperCase();

        var bookmarks = getBookmarksByTheme(themes[i]);

        for (let j = 0; j < bookmarks.length; j++) {
            let dl = document.createElement("dl");
            dl.className = "classpiche";

            let dtitle = document.createElement("dt");
            dtitle.style.fontStyle = "italic";
            dtitle.textContent = getTitleOfABookmark(bookmarks[j]).toUpperCase();
            dl.appendChild(dtitle);

            let dofficialName = document.createElement("dd");
            dofficialName.textContent = "Référence : " + bookmarks[j];
            dl.appendChild(dofficialName);

            let dcomment = document.createElement("dd");
            dcomment.textContent = "Commentaire : " + getCommentOfABookmark(bookmarks[j]);
            dl.appendChild(dcomment);

            let durl = document.createElement("dd");
            let a = document.createElement("a");
            var url = getUrlOfABookmark(bookmarks[j]);
            a.href = url;
            a.textContent = url;
            durl.appendChild(a);
            dl.appendChild(durl);

            li.appendChild(dl);
        }
        document.querySelector('#mainList').appendChild(li);
    }

    // create choices list for research

    let firstOption = document.createElement("option");
    firstOption.textContent = "TOUS";
    document.querySelector('#themeSelect').appendChild(firstOption);
    for (let k = 0; k < themes.length; k++) {
        let option = document.createElement("option");
        option.textContent = themes[k];
        document.querySelector('#themeSelect').appendChild(option);
    }
}


// ----------- EVENT LISTENERS ----------- //


function addTheme () {
    window.close();
    chrome.windows.create({
        "width": 300,
        "height": 250,
        "type": "panel",
        "url": "themes.html"
    });
}


function deleteAll () {
    var bookmarks = getAllBookmarksOfficialNames();
    var themes = getAllThemes();
    for (let i = 0; i < bookmarks.length; i++){
        localStorage.removeItem(bookmarks[i]);
    }
    for (let j = 0; j < themes.length; j++) {
        localStorage.removeItem(themes[j]);
    }
    localStorage.removeItem("meta-index");
    localStorage.setItem("meta-themes", myPrefix + "Autres");

    window.close();
}


function research () {
    var keywordString = document.querySelector('#keywords').value;
    var themeSelected = document.querySelector('#themeSelect').value;
    localStorage.setItem("meta-currentKeywords", keywordString);
    localStorage.setItem("meta-currentTheme", themeSelected);
    document.querySelector('#headtitle').innerText = "Recherche";
    document.querySelector('#bodytitle').innerText = "Résultats de la recherche";
    document.querySelector('#notInResearchMode').style.display = "none";
    document.querySelector('#mainList').style.display = "none";
    showSearchedBookmarks ();
}


// ----------- MAIN ----------- //


document.addEventListener('DOMContentLoaded', function () {

    document.querySelector('#deleteAll').addEventListener("click", deleteAll);
    document.querySelector('#research').addEventListener("click", research);
    document.querySelector('#addTheme').addEventListener("click", addTheme);

    showAllBookmarks ();

});
