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
    }else {
        navbar.style.display = '';
        content.style.width = '';
        showNavBarBtn.style.visibility = 'hidden';
    }
}