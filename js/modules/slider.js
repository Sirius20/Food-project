function slider({container, slide, nextArrow, prevArrow, totalCounter, currentCounter, wrapper, field}) {
    const slider = document.querySelector(container),
        prev = slider.querySelector(prevArrow),
        next = slider.querySelector(nextArrow),
        sliderCurrent = slider.querySelector(currentCounter),
        sliderTotal = slider.querySelector(totalCounter),
        slides = slider.querySelectorAll(slide),
        slidesWrapper = slider.querySelector(wrapper),
        slidesField = slidesWrapper.querySelector(field),
        width = window.getComputedStyle(slidesWrapper).width,
        dotsWrap = document.createElement('ol');

    slider.style.position = 'relative';
    dotsWrap.classList.add('carousel-indicators');
    slider.append(dotsWrap);

    for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement('li');
        dot.classList.add('dot');
        dot.setAttribute('data-id', i + 1);

        if (i == 0) {
            dot.style.opacity = 1;
        }

        dotsWrap.append(dot);
    }

    let slideIndex = 1;
    let offset = 0;

    function renderTotal() {
        if (slides.length < 10) {
            sliderTotal.textContent = `0${slides.length}`;
            sliderCurrent.textContent = `0${slideIndex}`;
        } else {
            sliderTotal.textContent = slides.length;
            sliderCurrent.textContent = `0${slideIndex}`;
        }
    }

    function renderCurrent() {
        if (slideIndex < 10) {
            sliderCurrent.textContent = `0${slideIndex}`;
        } else {
            sliderCurrent.textContent = slideIndex;
        }
    }

    function dotActivision() {
        dots.forEach(dot => dot.style.opacity = '0.5');
        dots[slideIndex - 1].style.opacity = 1;
    }

    function delNotDig(par) {
        return +par.replace(/\D/g, '');
    }

    slidesField.style.width = 100 * slides.length + '%';
    slides.forEach(slide => {
        slide.style.width = width;
    });

    prev.addEventListener('click', () => {
        if (offset == 0) {
            offset = delNotDig(width) * (slides.length - 1);
        } else {
            offset -= delNotDig(width);
        }
        slidesField.style.transform = `translateX(-${offset}px)`;

        if (slideIndex == 1) {
            slideIndex = slides.length;
        } else {
            slideIndex--;
        }
        renderCurrent();
        dotActivision();
    });

    next.addEventListener('click', () => {
        if (offset == delNotDig(width) * (slides.length - 1)) {
            offset = 0;
        } else {
            offset += delNotDig(width);
        }
        slidesField.style.transform = `translateX(-${offset}px)`;

        if (slideIndex == slides.length) {
            slideIndex = 1;
        } else {
            slideIndex++;
        }
        renderCurrent();
        dotActivision();
    });
    renderTotal();

    const dots = slider.querySelectorAll('.dot');
    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const slideTo = e.target.getAttribute('data-id');
            slideIndex = slideTo;
            offset = delNotDig(width) * (slideTo - 1);

            slidesField.style.transform = `translateX(-${offset}px)`;

            renderCurrent();
            dotActivision();
        });
    });
}

export default slider;