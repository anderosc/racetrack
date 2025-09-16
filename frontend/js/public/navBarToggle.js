const navbar = document.getElementById("navbar");
const content = document.getElementById("content");
const showNavBarBtn = document.getElementById("showNavBarBtn");

navbar.addEventListener("click", toggleNavBar);
showNavBarBtn.addEventListener("click", toggleNavBar);

function toggleNavBar() {
    if(navbar.style.display == '') {
        navbar.style.display = 'none';
        content.style.width = 'calc(100% - 10px)';
        showNavBarBtn.style.visibility = 'visible';
        if (isMobileOrTablet()) {
            showNavBarBtn.style.position = 'static';
        }
    }else {
        navbar.style.display = '';
        content.style.width = '';
        showNavBarBtn.style.visibility = 'hidden';
        //if (!isMobileOrTablet()) {
        showNavBarBtn.style.position = 'absolute';
        //}
    }
}

function isMobileOrTablet() {
    return window.innerWidth <= 1024; // Customize the threshold if needed
}