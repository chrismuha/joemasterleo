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
const seeNextBullets = document.querySelector('#seeNextBullets');
const seeLessBullets = document.querySelector('#seeLessBullets');
const nextBullets = document.querySelector('.next-bullets');
const seeNextBullets2 = document.querySelector('#seeNextBullets2');
const seeLessBullets2 = document.querySelector('#seeLessBullets2');
const beforeBullets2 = document.querySelector('.beforeNextBullets2');
const nextBullets2 = document.querySelector('.next-bullets-2');
const seeNextBullets3 = document.querySelector('#seeNextBullets3');
const seeLessBullets3 = document.querySelector('#seeLessBullets3');
const nextBullets3 = document.querySelector('.next-bullets-3');

moreText.forEach(e => {
    e.style.display = 'none';
});

seeMore.forEach(e => {
    e.addEventListener('click', (e) => {
        const parent = e.target.closest('.has-read-more-feature');
        const moreText = parent.querySelector('.moreText');
        moreText.style.display = 'block';
        e.target.style.display = 'none';
        seeLessBullets.style.display = 'none';
    });
});

seeLess.forEach(e => {
    e.addEventListener('click', (e) => {
        const parent = e.target.closest('.has-read-more-feature'); 
        const moreText = parent.querySelector('.moreText');
        moreText.style.display = 'none';
        const seeMore = parent.querySelector('.seeMore');
        seeMore.style.display = 'block';
        seeLessBullets.style.display = 'block';
    });
});

nextBullets.style.display = 'none';
seeNextBullets.addEventListener('click', () => {
    nextBullets.style.display = 'block';
    seeNextBullets.style.display = 'none';
    seeLessBullets.style.display = 'block';
})

seeLessBullets.addEventListener('click', () => {
    nextBullets.style.display = 'none';
    seeNextBullets.style.display = 'block';
    seeLessBullets.style.display = 'none';
})

nextBullets2.style.display = 'none';
seeNextBullets2.addEventListener('click', () => {
    nextBullets2.style.display = 'block';
    seeNextBullets2.style.display = 'none';
    seeLessBullets2.style.display = 'block';
    beforeBullets2.style.display = 'none';
})

seeLessBullets2.addEventListener('click', () => {
    nextBullets2.style.display = 'none';
    seeNextBullets2.style.display = 'block';
    seeLessBullets2.style.display = 'none';
    beforeBullets2.style.display = 'block';
})

nextBullets3.style.display = 'none';
seeNextBullets3.addEventListener('click', () => {
    nextBullets3.style.display = 'block';
    seeNextBullets3.style.display = 'none';
    seeLessBullets3.style.display = 'block';
    seeLessBullets2.style.display = 'none';
})

seeLessBullets3.addEventListener('click', () => {
    nextBullets3.style.display = 'none';
    seeNextBullets3.style.display = 'block';
    seeLessBullets3.style.display = 'none';
    seeLessBullets2.style.display = 'block';
})

let simpleBar = document.querySelectorAll('.simple-bar');

simpleBar.forEach(function (e) {
    new SimpleBar(e, { autoHide: false });
});