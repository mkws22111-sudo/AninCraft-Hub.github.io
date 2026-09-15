/*
================================================================
ANINCRAFT
Основной JavaScript
================================================================
*/


/* ================================================================
   1. ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА RU / EN
   ================================================================ */

const languageButtons = {
    ru: document.getElementById("lang-ru"),
    en: document.getElementById("lang-en")
};

let currentLanguage = "ru";


/**
 * Переключает интерфейс между русским и английским.
 *
 * Все языковые элементы должны иметь:
 *
 * data-lang="ru"
 * или
 * data-lang="en"
 *
 * При каждом переключении функция заново обрабатывает ВСЕ
 * элементы data-lang. Поэтому она также работает с элементами,
 * которые были добавлены JavaScript после загрузки страницы.
 */
function setLanguage(language) {
    currentLanguage =
        language === "en"
            ? "en"
            : "ru";

    document.documentElement.lang =
        currentLanguage;


    /*
     * Показываем элементы выбранного языка
     * и скрываем элементы другого языка.
     *
     * Используем одновременно hidden и CSS-класс.
     * Это защищает от конфликтов со старым состоянием hidden.
     */
    document
        .querySelectorAll("[data-lang]")
        .forEach(element => {

            const isCurrentLanguage =
                element.dataset.lang === currentLanguage;

            element.hidden =
                !isCurrentLanguage;

            element.classList.toggle(
                "lang-hidden",
                !isCurrentLanguage
            );
        });


    /*
     * Обновляем состояние кнопок RU / EN.
     */
    languageButtons.ru.classList.toggle(
        "active",
        currentLanguage === "ru"
    );

    languageButtons.en.classList.toggle(
        "active",
        currentLanguage === "en"
    );


    /*
     * Обновляем placeholder'ы форм.
     */
    document
        .querySelectorAll(
            "[data-placeholder-ru], [data-placeholder-en]"
        )
        .forEach(element => {

            const placeholder =
                currentLanguage === "en"
                    ? element.dataset.placeholderEn
                    : element.dataset.placeholderRu;

            if (placeholder !== undefined) {
                element.placeholder =
                    placeholder;
            }
        });


    /*
     * При смене языка очищаем сообщение
     * об ошибке комментария.
     */
    clearCommentError();


    /*
     * Сохраняем выбранный язык.
     */
    localStorage.setItem(
        "anincraft_language",
        currentLanguage
    );
}


/*
 * Кнопка RU.
 */
languageButtons.ru.addEventListener(
    "click",
    () => setLanguage("ru")
);


/*
 * Кнопка EN.
 */
languageButtons.en.addEventListener(
    "click",
    () => setLanguage("en")
);


/*
 * Восстанавливаем язык после перезагрузки.
 */
const savedLanguage =
    localStorage.getItem(
        "anincraft_language"
    );

setLanguage(
    savedLanguage === "en"
        ? "en"
        : "ru"
);


/* ================================================================
   2. ТАЙМЕР
   ================================================================

   Дата открытия:
   1 октября 2026 года.

   Если нужно изменить дату, поменяй только эту строку.

   ================================================================ */

const openingDate =
    new Date(
        "2026-10-01T00:00:00"
    ).getTime();


const countdown =
    document.getElementById(
        "countdown"
    );

const daysElement =
    document.getElementById(
        "days"
    );

const hoursElement =
    document.getElementById(
        "hours"
    );

const minutesElement =
    document.getElementById(
        "minutes"
    );

const secondsElement =
    document.getElementById(
        "seconds"
    );


function updateCountdown() {

    const currentTime =
        Date.now();

    const difference =
        openingDate - currentTime;


    /*
     * Если дата уже наступила,
     * заменяем таймер сообщением.
     */
    if (difference <= 0) {

        countdown.innerHTML = `
            <div
                class="time-box"
                style="grid-column: 1 / -1;"
            >
                <span
                    class="time-number"
                    style="font-size: 34px;"
                >
                    🚀
                </span>

                <span
                    class="time-label"
                    data-lang="ru"
                >
                    AninCraft уже открывается!
                </span>

                <span
                    class="time-label lang-hidden"
                    data-lang="en"
                >
                    AninCraft is launching!
                </span>
            </div>
        `;


        /*
         * ВАЖНО:
         *
         * Эти элементы созданы после первоначальной
         * загрузки страницы.
         *
         * Поэтому снова запускаем общий механизм
         * переключения языка.
         */
        setLanguage(
            currentLanguage
        );

        return;
    }


    /*
     * Расчёт оставшегося времени.
     */

    const days =
        Math.floor(
            difference /
            (1000 * 60 * 60 * 24)
        );

    const hours =
        Math.floor(
            (difference /
                (1000 * 60 * 60)) % 24
        );

    const minutes =
        Math.floor(
            (difference /
                (1000 * 60)) % 60
        );

    const seconds =
        Math.floor(
            (difference / 1000) % 60
        );


    /*
     * Выводим числа с ведущим нулём.
     */

    daysElement.textContent =
        String(days).padStart(2, "0");

    hoursElement.textContent =
        String(hours).padStart(2, "0");

    minutesElement.textContent =
        String(minutes).padStart(2, "0");

    secondsElement.textContent =
        String(seconds).padStart(2, "0");
}


updateCountdown();


setInterval(
    updateCountdown,
    1000
);


/* ================================================================
   3. АНОНИМНЫЕ КОММЕНТАРИИ
   ================================================================ */

const COMMENTS_STORAGE_KEY =
    "anincraft_comments_v1";


const commentForm =
    document.getElementById(
        "comment-form"
    );

const commentName =
    document.getElementById(
        "comment-name"
    );

const commentText =
    document.getElementById(
        "comment-text"
    );

const commentError =
    document.getElementById(
        "comment-error"
    );

const commentsList =
    document.getElementById(
        "comments-list"
    );

const commentsEmpty =
    document.getElementById(
        "comments-empty"
    );


/**
 * Загружает комментарии из localStorage.
 *
 * Если localStorage содержит повреждённые данные,
 * сайт не ломается — возвращается пустой массив.
 */
function getComments() {

    try {

        const stored =
            localStorage.getItem(
                COMMENTS_STORAGE_KEY
            );

        if (!stored) {
            return [];
        }

        const comments =
            JSON.parse(stored);

        return Array.isArray(comments)
            ? comments
            : [];

    } catch (error) {

        console.warn(
            "Не удалось прочитать комментарии:",
            error
        );

        return [];
    }
}


/**
 * Сохраняет комментарии в localStorage.
 */
function saveComments(comments) {

    try {

        localStorage.setItem(
            COMMENTS_STORAGE_KEY,
            JSON.stringify(comments)
        );

        return true;

    } catch (error) {

        console.warn(
            "Не удалось сохранить комментарий:",
            error
        );

        return false;
    }
}


/**
 * Очищает ошибку формы.
 */
function clearCommentError() {

    if (commentError) {
        commentError.textContent = "";
    }
}


/**
 * Показывает сообщение о пустом комментарии
 * на текущем языке.
 */
function showCommentError() {

    commentError.textContent =
        currentLanguage === "en"
            ? "Please enter a comment."
            : "Введите комментарий.";
}


/**
 * Форматирует дату комментария.
 */
function formatCommentDate(timestamp) {

    const locale =
        currentLanguage === "en"
            ? "en-US"
            : "ru-RU";

    const date =
        new Date(timestamp);


    if (Number.isNaN(date.getTime())) {
        return "";
    }


    return new Intl.DateTimeFormat(
        locale,
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(date);
}


/**
 * Отрисовывает список комментариев.
 *
 * Важно:
 * пользовательский текст вставляется через textContent,
 * а НЕ через innerHTML.
 *
 * Поэтому HTML/JavaScript внутри комментария
 * не будет выполняться браузером.
 */
function renderComments() {

    const comments =
        getComments();


    /*
     * Полностью очищаем старый список.
     */
    commentsList.replaceChildren();


    /*
     * Показываем сообщение "комментариев нет",
     * если список пустой.
     */
    commentsEmpty.hidden =
        comments.length > 0;


    comments.forEach(comment => {

        const article =
            document.createElement(
                "article"
            );

        article.className =
            "comment";


        const header =
            document.createElement(
                "div"
            );

        header.className =
            "comment-header";


        const author =
            document.createElement(
                "span"
            );

        author.className =
            "comment-author";

        author.textContent =
            comment.name?.trim() ||
            (
                currentLanguage === "en"
                    ? "Anonymous"
                    : "Аноним"
            );


        const date =
            document.createElement(
                "time"
            );

        date.className =
            "comment-date";


        const commentDate =
            new Date(
                comment.createdAt
            );


        if (!Number.isNaN(
            commentDate.getTime()
        )) {
            date.dateTime =
                commentDate.toISOString();
        }


        date.textContent =
            formatCommentDate(
                comment.createdAt
            );


        const body =
            document.createElement(
                "p"
            );

        body.className =
            "comment-text";

        body.textContent =
            comment.text || "";


        header.append(
            author,
            date
        );

        article.append(
            header,
            body
        );

        commentsList.append(
            article
        );
    });
}


/*
 * Обработка отправки комментария.
 */
commentForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        clearCommentError();


        const name =
            commentName.value.trim() ||
            (
                currentLanguage === "en"
                    ? "Anonymous"
                    : "Аноним"
            );


        const text =
            commentText.value.trim();


        /*
         * Пустой комментарий запрещён.
         */
        if (!text) {

            showCommentError();

            commentText.focus();

            return;
        }


        const comments =
            getComments();


        comments.unshift({

            name:
                name.slice(0, 60),

            text:
                text.slice(0, 1000),

            createdAt:
                Date.now()

        });


        /*
         * Если localStorage недоступен,
         * сообщаем пользователю об ошибке.
         */
        if (!saveComments(comments)) {

            commentError.textContent =
                currentLanguage === "en"
                    ? "The comment could not be saved in this browser."
                    : "Не удалось сохранить комментарий в этом браузере.";

            return;
        }


        /*
         * Очищаем форму.
         */
        commentForm.reset();


        /*
         * Сразу показываем новый комментарий.
         */
        renderComments();
    }
);


/*
 * Загружаем комментарии при открытии страницы.
 */
renderComments();


/* ================================================================
   4. АНИМАЦИЯ ПРИ СКРОЛЛЕ
   ================================================================ */

const revealElements =
    document.querySelectorAll(
        ".reveal"
    );


/*
 * Если браузер поддерживает IntersectionObserver,
 * используем его для появления элементов.
 */
if ("IntersectionObserver" in window) {

    const observer =
        new IntersectionObserver(
            (entries, observerInstance) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "visible"
                        );

                        observerInstance.unobserve(
                            entry.target
                        );
                    }
                });
            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(element => {

        observer.observe(
            element
        );

    });

} else {

    /*
     * Запасной вариант для старых браузеров.
     */
    revealElements.forEach(element => {

        element.classList.add(
            "visible"
        );

    });
}


/* ================================================================
   5. ПЛАВНАЯ ПРОКРУТКА К ЯКОРЯМ
   ================================================================ */

document
    .querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(link => {

        link.addEventListener(
            "click",
            function(event) {

                const targetId =
                    this.getAttribute(
                        "href"
                    );


                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (target) {

                    event.preventDefault();

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    });


/* ================================================================
   6. НАСТРОЙКА ССЫЛКИ НА БУДУЩИЙ САЙТ МОДОВ
   ================================================================

   Сейчас используется:

   https://example.com

   Когда появится настоящий сайт модов,
   можно просто изменить href у элемента:

   id="mods-link"

   Например:

   modsLink.href = "https://твой-настоящий-сайт.ru";

   ================================================================ */

const modsLink =
    document.getElementById(
        "mods-link"
    );


/*
 * Сейчас ссылка уже находится в HTML.
 *
 * Переменная оставлена для удобного изменения
 * адреса будущего сайта из JavaScript.
 */
if (modsLink) {

    /*
     * Здесь ничего менять не нужно,
     * пока настоящий сайт модов не создан.
     */

}


/* ================================================================
   ГОТОВО
   ================================================================ */
