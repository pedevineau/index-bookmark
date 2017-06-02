const myPrefix = "% hey ! :) I'm the amazing prefix of piche index %";


// ----------- MISCELLANEOUS ----------- //


function getAllThemes () {
    var array = localStorage.getItem("meta-themes").split(myPrefix);
    return array.splice(1, array.length-1);
}

// ----------- EVENT LISTENER ----------- //


function confirm () {
    var newTheme = document.querySelector('#name').value;
    var stringThemes = localStorage.getItem("meta-themes");
    localStorage.setItem("meta-themes", stringThemes + myPrefix + newTheme);
    window.close();
}


// ----------- MAIN ----------- //


document.addEventListener('DOMContentLoaded', function () {

    document.querySelector('#confirm').addEventListener("click", confirm);

    var themes = getAllThemes();
    for (let i = 0; i < themes.length; i++) {
        var option = document.createElement("option");
        option.textContent = themes[i];
        document.querySelector('#listThemes').appendChild(option);
    }
});
