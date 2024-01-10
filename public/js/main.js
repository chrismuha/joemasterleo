var swiper = new Swiper(".mySwiper", {
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    loop: true,
});

const seeMore = Array.from(document.querySelectorAll('.seeMore'));
const seeLess = Array.from(document.querySelectorAll('.seeLess'));
const moreText = Array.from(document.querySelectorAll('.moreText'));

moreText.forEach(e => {
    e.style.display = 'none';
});

seeMore.forEach(e => {
    e.addEventListener('click', (e) => {
        const parent = e.target.closest('.has-read-more-feature');
        const moreText = parent.querySelector('.moreText');
        moreText.style.display = 'block';
        e.target.style.display = 'none';
    });
});

seeLess.forEach(e => {
    e.addEventListener('click', (e) => {
        const parent = e.target.closest('.has-read-more-feature'); 
        const moreText = parent.querySelector('.moreText');
        moreText.style.display = 'none';
        const seeMore = parent.querySelector('.seeMore');
        seeMore.style.display = 'block';
    });
});

let simpleBar = document.querySelectorAll('.simple-bar');

simpleBar.forEach(function (e) {
    new SimpleBar(e, { autoHide: false });
});