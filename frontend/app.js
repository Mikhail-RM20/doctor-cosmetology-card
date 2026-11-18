const API_BASE = '/api/v1';

// Список твоих 15 реальных фотографий из папки images/works/ с подписями
const WORKS_GALLERY = [
    { file: 'botox_face.jpg', title: 'Ботулинотерапия лба и межбровья (До / После)' },
    { file: 'clear_face.jpg', title: 'Эстетический уход и улучшение качества кожи' },
    { file: 'cosm_1.jpg', title: 'Контурная пластика губ (До / После)' },
    { file: 'cosm_2.jpg', title: 'Увеличение и коррекция формы губ' },
    { file: 'cosm_3.jpg', title: 'Естественный объём и увлажнение губ' },
    { file: 'cosm_4.jpg', title: 'Коррекция носослезной борозды (До / После)' },
    { file: 'cosm_5.jpg', title: 'Ботулинотерапия «Гусиные лапки» (До / После)' },
    { file: 'cosm_6.jpg', title: 'Омоложение и лифтинг средней трети лица' },
    { file: 'eyebrow_piercing.jpg', title: 'Пирсинг брови' },
    { file: 'indastrial_piercing.jpg', title: 'Пирсинг «Индастриал»' },
    { file: 'nose_wing_piercing.jpg', title: 'Пирсинг крыла носа' },
    { file: 'piercing_coanch.jpg', title: 'Пирсинг «Конч»' },
    { file: 'piercing_indastrial.jpg', title: 'Художественный пирсинг хряща уха' },
    { file: 'piercing_monro.jpg', title: 'Пирсинг «Монро»' },
    { file: 'septum.jpg', title: 'Пирсинг «Септум»' }
];

// Карты для 3 городов приёма
const CITY_MAPS = {
    tula: 'https://yandex.ru',
    bogoroditsk: 'https://yandex.ru',
    efremov: 'https://yandex.ru'
};

let catalogData = [];

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCatalogMenu();
    initLocationsMap();
    initFaqAccordion();
    renderWorksGallery();
    initLightbox();
    handleInitialRoute();
});

// --- 1. SPA-НАВИГАЦИЯ И МОБИЛЬНОЕ МЕНЮ ---
function initNavigation() {
    const burgerBtn = document.getElementById('burgerBtn');
    const mainNav = document.getElementById('mainNav');

    burgerBtn.addEventListener('click', () => {
        mainNav.classList.toggle('open');
    });

    document.querySelectorAll('[data-route]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = link.getAttribute('data-route');
            navigateTo(route);
            mainNav.classList.remove('open');
        });
    });

    document.getElementById('backFromProcedure').addEventListener('click', () => {
        navigateTo('/');
    });

    window.addEventListener('popstate', () => {
        handleInitialRoute();
    });
}

function navigateTo(path, push = true) {
    if (push) {
        window.history.pushState({}, '', path);
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav__link').forEach(l => l.classList.remove('active'));

    if (path.startsWith('/procedure/')) {
        const procId = path.split('/procedure/')[1];
        document.getElementById('page-procedure').classList.add('active');
        loadProcedureDetail(procId);
    } else if (path === '/about') {
        document.getElementById('page-about').classList.add('active');
        setActiveNav('/about');
    } else if (path === '/faq') {
        document.getElementById('page-faq').classList.add('active');
        setActiveNav('/faq');
    } else if (path === '/works') {
        document.getElementById('page-works').classList.add('active');
        setActiveNav('/works');
    } else {
        document.getElementById('page-home').classList.add('active');
        setActiveNav('/');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setActiveNav(route) {
    document.querySelectorAll(`.nav__link[data-route="${route}"]`).forEach(el => {
        el.classList.add('active');
    });
}

function handleInitialRoute() {
    const path = window.location.pathname;
    navigateTo(path, false);
}

// --- 2. ВЫПАДАЮЩЕЕ МЕНЮ КАТЕГОРИЙ И ПРОЦЕДУР ---
async function initCatalogMenu() {
    const dropdown = document.getElementById('servicesDropdown');
    const toggleBtn = document.getElementById('servicesToggle');

    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('open');
        }
    });

    try {
        const response = await fetch(`${API_BASE}/catalog`);
        if (!response.ok) throw new Error('Ошибка загрузки каталога');
        catalogData = await response.json();
        renderCategories(catalogData);
    } catch (err) {
        document.getElementById('catalogCategories').innerHTML =
            '<div class="catalog-loading">Не удалось загрузить прайс-лист</div>';
    }
}

function renderCategories(categories) {
    const catContainer = document.getElementById('catalogCategories');
    catContainer.innerHTML = '';

    categories.forEach((cat, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `cat-btn ${index === 0 ? 'active' : ''}`;
        btn.innerHTML = `<span>${cat.title}</span> <span>›</span>`;

        btn.addEventListener('mouseenter', () => {
            if (window.innerWidth > 900) {
                selectCategory(cat, btn);
            }
        });

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectCategory(cat, btn);
        });

        catContainer.appendChild(btn);
    });

    if (categories.length > 0) {
        renderProceduresList(categories[0].procedures);
    }
}

function selectCategory(category, activeBtn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    activeBtn.classList.add('active');
    renderProceduresList(category.procedures);
}

function renderProceduresList(procedures) {
    const procContainer = document.getElementById('catalogProcedures');
    procContainer.innerHTML = '';

    if (!procedures || procedures.length === 0) {
        procContainer.innerHTML = '<div class="catalog-placeholder">В этой категории пока нет услуг</div>';
        return;
    }

    procedures.forEach(proc => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'proc-item-btn';
        item.innerHTML = `
            <span class="proc-item-btn__title">${proc.title}</span>
            <span class="proc-item-btn__price">${proc.price}</span>
        `;

        item.addEventListener('click', () => {
            document.getElementById('servicesDropdown').classList.remove('open');
            document.getElementById('mainNav').classList.remove('open');
            navigateTo(`/procedure/${proc.id}`);
        });

        procContainer.appendChild(item);
    });
}

// --- 3. ЗАГРУЗКА СТРАНИЦЫ КОНКРЕТНОЙ ПРОЦЕДУРЫ ---
async function loadProcedureDetail(procedureId) {
    const container = document.getElementById('procedureDetailContainer');
    container.innerHTML = '<div class="catalog-loading">Загрузка информации о процедуре...</div>';

    try {
        const response = await fetch(`${API_BASE}/procedures/${procedureId}`);
        if (!response.ok) {
            container.innerHTML = '<h2>Процедура не найдена</h2><p>Возможно, она была перемещена или удалена.</p>';
            return;
        }

        const proc = await response.json();

        container.innerHTML = `
            <div class="gold-eyebrow">${proc.category_title}</div>
            <div class="procedure-detail__header">
                <h1 class="procedure-detail__title">${proc.title}</h1>
                <div class="procedure-detail__price">${proc.price}</div>
            </div>
            <div class="procedure-detail__desc">${proc.description}</div>
            <div class="procedure-detail__cta">
                <h4>Связаться со специалистом</h4>
                <p>г. Тула • г. Богородицк • г. Ефремов</p>
                <div class="hero__buttons" style="margin-bottom: 0;">
                    <a href="tel:+79029081296" class="btn btn--gold">
                        <svg class="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        <span>+7 (902) 908-12-96</span>
                    </a>
                    <a href="https://@Ivan_Igorevich71" target="_blank" rel="noopener" class="btn btn--social btn--tg">
                        <svg class="icon-svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                        <span>Telegram</span>
                    </a>
                    <a href="https://vk.ru" target="_blank" rel="noopener" class="btn btn--social btn--vk">
                        <svg class="icon-svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.08 14.27h-1.46c-.55 0-.72-.44-1.71-1.44-.86-.83-1.24-.94-1.46-.94-.3 0-.38.08-.38.49v1.32c0 .36-.11.57-1.04.57-1.54 0-3.25-.93-4.45-2.67-1.81-2.54-2.3-4.45-2.3-4.84 0-.22.08-.42.49-.42h1.46c.37 0 .51.17.65.56.71 2.06 1.91 3.86 2.4 3.86.18 0 .27-.08.27-.55v-2.14c-.06-.99-.58-1.07-.58-1.42 0-.17.14-.34.37-.34h2.29c.31 0 .42.17.42.53v2.89c0 .31.14.42.23.42.18 0 .34-.11.68-.45 1.05-1.18 1.8-3 1.8-3 .1-.21.27-.42.64-.42h1.46c.44 0 .53.22.44.53-.18.85-1.95 3.34-1.95 3.34-.15.25-.21.36 0 .64.15.21.66.65 1 1.04.62.71 1.1 1.3 1.23 1.71.13.42-.07.63-.49.63z"/>
                        </svg>
                        <span>Личный ВК</span>
                    </a>
                    <a href="https://vk.ru" target="_blank" rel="noopener" class="btn btn--social btn--vk">
                        <svg class="icon-svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14c5.6 0 6.93-1.33 6.93-6.93V8.93C22 3.33 20.67 2 15.07 2zm3.08 14.27h-1.46c-.55 0-.72-.44-1.71-1.44-.86-.83-1.24-.94-1.46-.94-.3 0-.38.08-.38.49v1.32c0 .36-.11.57-1.04.57-1.54 0-3.25-.93-4.45-2.67-1.81-2.54-2.3-4.45-2.3-4.84 0-.22.08-.42.49-.42h1.46c.37 0 .51.17.65.56.71 2.06 1.91 3.86 2.4 3.86.18 0 .27-.08.27-.55v-2.14c-.06-.99-.58-1.07-.58-1.42 0-.17.14-.34.37-.34h2.29c.31 0 .42.17.42.53v2.89c0 .31.14.42.23.42.18 0 .34-.11.68-.45 1.05-1.18 1.8-3 1.8-3 .1-.21.27-.42.64-.42h1.46c.44 0 .53.22.44.53-.18.85-1.95 3.34-1.95 3.34-.15.25-.21.36 0 .64.15.21.66.65 1 1.04.62.71 1.1 1.3 1.23 1.71.13.42-.07.63-.49.63z"/>
                        </svg>
                        <span>Группа ВК</span>
                    </a>
                </div>
            </div>
        `;
    } catch (err) {
        container.innerHTML = 'Ошибка загрузки данных. Попробуйте обновить страницу.';
    }
}

// --- 4. ПЕРЕКЛЮЧЕНИЕ ГОРОДОВ НА ЯНДЕКС.КАРТЕ ---
function initLocationsMap() {
    const cards = document.querySelectorAll('.location-card');
    const mapFrame = document.getElementById('yandexMapFrame');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            const city = card.getAttribute('data-city');

            if (CITY_MAPS[city] && mapFrame) {
                mapFrame.src = CITY_MAPS[city];
            }
        });
    });
}

// --- 5. АККОРДЕОН ЧАСТЫХ ВОПРОСОВ ---
function initFaqAccordion() {
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            item.classList.toggle('open');
        });
    });
}

// --- 6. ГАЛЕРЕЯ РАБОТ И ЛАЙТБОКС ---
function renderWorksGallery() {
    const grid = document.getElementById('worksGrid');
    grid.innerHTML = '';

    WORKS_GALLERY.forEach(work => {
        const card = document.createElement('div');
        card.className = 'work-card';

        card.innerHTML = `
            <img src="/images/works/${work.file}" alt="${work.title}" class="work-card__img" loading="lazy">
            <div class="work-card__caption">${work.title}</div>
        `;

        card.addEventListener('click', () => {
            openLightbox(`/images/works/${work.file}`, work.title);
        });

        grid.appendChild(card);
    });
}

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const closeBtn = document.getElementById('lightboxClose');

    closeBtn.addEventListener('click', () => lightbox.classList.remove('open'));

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) lightbox.classList.remove('open');
    });
}

function openLightbox(src, caption) {
    const lightbox = document.getElementById('lightbox');
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightboxCaption').textContent = caption;
    lightbox.classList.add('open');
}