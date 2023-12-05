var swiper = new Swiper(".mySwiper", {
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    loop: true,
});

const seeMore = document.getElementById('seeMore')
const seeLess = document.getElementById('seeLess')
const moreText = document.getElementById('moreText')
moreText.style.display = 'none'

seeMore.addEventListener('click', (e) => {
    moreText.style.display = 'block'
    e.target.style.display = 'none'
})
seeLess.addEventListener('click', (e) => {
    moreText.style.display = 'none'
    seeMore.style.display = 'block'
})