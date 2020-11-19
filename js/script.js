'use strict';

window.addEventListener('DOMContentLoaded', () => {
    //tabs
    const tabs = document.querySelectorAll('.tabheader__item'),
          tabsContent = document.querySelectorAll('.tabcontent'),
          tabsParent = document.querySelector('.tabheader__items');
    
    function hideTabContent() {
        tabsContent.forEach(item => {
            item.classList.add('hide');
            item.classList.remove('show', 'fade');
        });

        tabs.forEach(item => {
            item.classList.remove('tabheader__item_active');
        });
    }

    function showTabContent(i = 0) {
        tabsContent[i].classList.add('show', 'fade');
        tabsContent[i].classList.remove('hide');
        tabs[i].classList.add('tabheader__item_active');
    }

    hideTabContent();
    showTabContent();

    tabsParent.addEventListener('click', (evt) => {
        const target = evt.target;

        if (target && target.classList.contains('tabheader__item')) {
            tabs.forEach((item, i) => {
                if (target == item) {
                    hideTabContent();
                    showTabContent(i); 
                }
            });
        }
    });

    //Timer

    const deadLine = '2020-12-11';

    function getTimeRemaining(endtime) {
        const t = Date.parse(endtime) - Date.parse(new Date()),
              days = Math.floor(t / (1000 * 60 * 60 * 24)),
              hours = Math.floor((t / (1000 * 60 * 60)) %  24),
              minutes  = Math.floor((t / 1000 / 60) % 60),
              seconds = Math.floor((t / 1000) % 60);
        
        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds,
        };
    }

    function getZero(num) {
        if (num >= 0 && num < 10) {
            return `0${num}`;
        } else {
            return num;
        }
    }

    function setClock(selector, endtime) {
        const timer = document.querySelector(selector),
              days = timer.querySelector('#days'),
              hours = timer.querySelector('#hours'),
              minutes = timer.querySelector('#minutes'),
              seconds = timer.querySelector('#seconds'),
              timeInterval = setInterval(updateClock, 1000);
        
        updateClock();
        
        function updateClock() {
            const t = getTimeRemaining(endtime);
            
            days.innerHTML = getZero(t.days);
            hours.innerHTML = getZero(t.hours);
            minutes.innerHTML = getZero(t.minutes);
            seconds.innerHTML = getZero(t.seconds);

            if (t.total <= 0) {
                clearInterval(timeInterval);
            }
        }
    }

    setClock('.timer', deadLine);

    //Modal

    const modalButton = document.querySelectorAll('[data-modal]'),
          modal = document.querySelector('.modal'),
          modalTimerId = setTimeout(openModal, 50000);

    function openModal() {
        modal.classList.add('show');
        modal.classList.remove('hide');
        document.body.style.overflow = 'hidden';
        clearInterval(modalTimerId);
    }

    function closeModal() {
        modal.classList.add('hide');
        modal.classList.remove('show');
        document.body.style.overflow = ''; 
    }

    function showModalByScroll() {
        if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
            openModal();
            window.removeEventListener('scroll', showModalByScroll);
        }
    }

    modalButton.forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    modal.addEventListener('click', (evt) => {
        if (evt.target === modal || evt.target.getAttribute('data-close') == "") {
            closeModal();
        }
    });

    document.addEventListener('keydown', (evt) => {
        if (evt.code === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });

    window.addEventListener('scroll', showModalByScroll);

    // menu cards

    class MenuCard {
        constructor(src, alt, title, description, price, parentSelector, ...classes) {
            this.src = src;
            this.alt = alt;
            this.title = title;
            this.description = description;
            this.price = price;
            this.classes = classes,
            this.parent = document.querySelector(parentSelector);
            this.transfer = 27;
            this.changeToCurrency();
        }

        changeToCurrency() {
            this.price = this.price * this.transfer;
        }

        render() {
            const element = document.createElement('div');

            if (this.classes.length === 0) {
                this.element = 'menu__item';
                element.classList.add(this.element);
            } else {
                this.classes.forEach(className => element.classList.add(className));
            }
        
            element.innerHTML = `
                    <img src=${this.src} alt=${this.alt}>
                    <h3 class="menu__item-subtitle">${this.title}</h3>
                    <div class="menu__item-descr">${this.description}</div>
                    <div class="menu__item-divider"></div>
                    <div class="menu__item-price">
                        <div class="menu__item-cost">Цена:</div>
                        <div class="menu__item-total"><span>${this.price}</span> руб/день</div>
                    </div>`;
            this.parent.append(element);
        }
    }

    const getResource = async (url) => {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Could not fetch ${url}, status: ${res.status}`);
        }

        return await res.json();
    };

    axios.get('http://localhost:3000/menu')
        .then(data => {
            data.data.forEach(({img, altimg, title, descr, price}) => {
                new MenuCard(img, altimg, title, descr, price, '.menu .container').render();
            });
        });

    // Forms

    const forms = document.querySelectorAll('form');
    
    const messages = {
        loading: 'img/form/spinner.svg',
        success: 'Спасибо! Скоро мы с Вами свяжемся',
        failure: 'Ошибка! Что-то пошло не так',
    };

    forms.forEach(item => {
        bindPostData(item);
    });

    const postData = async (url, data) => {
        const res = await fetch(url, {
            method: "POST",
            body: data,
            headers: {'Content-type': 'application/json'},
        });

        return await res.json();
    };

    function bindPostData(form) {
        form.addEventListener('submit', (evt) => {
            evt.preventDefault();

            const statusMessage = document.createElement('img');
            statusMessage.src = messages.loading;
            statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
            `;

            form.insertAdjacentElement('afterend', statusMessage);

            const formData = new FormData(form);

            const json = JSON.stringify(Object.fromEntries(formData.entries())); // Получаем данные из формы, превращаем их в массив с массивами, потом - в обычный объект - потом в json

    
            postData('http://localhost:3000/requests', json)
            .then(data => {
                console.log(data);
                showThanksModal(messages.success);
                
                statusMessage.remove();
            }).catch(() => {
                showThanksModal(messages.failure);
            }).finally(() => {
                form.reset();
            });
        });
    }

    function showThanksModal(message) {
        const prevModalDilog = document.querySelector('.modal__dialog');

        prevModalDilog.classList.add('hide');
        openModal();

        const thanksModal = document.createElement('div');
        thanksModal.classList.add('modal__dialog');
        thanksModal.innerHTML = `
            <div class="modal__content">
                <div class="modal__close" data-close>&times;</div>
                <div class="modal__title">${message}</div>
            </div>
        `;

        document.querySelector('.modal').append(thanksModal);

        setTimeout(() => {
            thanksModal.remove();
            prevModalDilog.classList.add('show');
            prevModalDilog.classList.remove('hide');
            closeModal();
        }, 4000);
    }

    //slider

    const slider = document.querySelector('.offer__slider'),
        backArrow = slider.querySelector('.offer__slider-prev'),
        nextArrow = slider.querySelector('.offer__slider-next'),
        sliderCurrent = slider.querySelector('#current'),
        sliderTotal = slider.querySelector('#total'),
        slides = slider.querySelectorAll('.offer__slide'),
        slidesWrapper = slider.querySelector('.offer__slider-wrapper'),
        slidesField = slidesWrapper.querySelector('.offer__slider-inner'),
        width = window.getComputedStyle(slidesWrapper).width;

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

    slidesField.style.width = 100 * slides.length + '%';
    slides.forEach(slide => {
        slide.style.width = width;
    });

    backArrow.addEventListener('click', () => {
        if (offset == 0) {
            offset = +width.slice(0, -2) * (slides.length - 1);
        } else {
            offset -= +width.slice(0, -2);
        }
        slidesField.style.transform = `translateX(-${offset}px)`;

        if (slideIndex == 1) {
            slideIndex = slides.length;
        } else {
            slideIndex--;
        }
        renderCurrent();
    });

    nextArrow.addEventListener('click', () => {
        if (offset == +width.slice(0, -2) * (slides.length - 1)) {
            offset = 0;
        } else {
            offset += +width.slice(0, -2);
        }
        slidesField.style.transform = `translateX(-${offset}px)`;

        if (slideIndex == slides.length) {
            slideIndex = 1;
        } else {
            slideIndex++;
        }

        renderCurrent();
    });
    // function renderTotal() {
    //     if (slides.length < 10) {
    //         sliderTotal.textContent = `0${slides.length}`;
    //     } else {
    //         sliderTotal.textContent = slides.length;
    //     }
    // }

    // function showSlides(n) {
    //     if (n > slides.length) {
    //         slideIndex = 1;
    //     } else if (n < 1) {
    //         slideIndex = slides.length;
    //     }

    //     slides.forEach(item => item.classList.add('hide'));
    //     slides[slideIndex - 1].classList.remove('hide');

        // if (slideIndex < 10) {
        //     sliderCurrent.textContent = `0${slideIndex}`;
        // } else {
        //     sliderCurrent.textContent = slideIndex;
        // }

    // }

    // function plusSlides(n) {
    //     showSlides(slideIndex += n);
    // }

    // backArrow.addEventListener('click', () => {
    //     plusSlides(-1);
    // });

    // nextArrow.addEventListener('click', () => {
    //     plusSlides(1);
    // });

    renderTotal();
    // showSlides(slideIndex);
});
