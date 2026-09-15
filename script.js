"use strict";


/* =========================
   LANGUAGE
========================= */

const languageButtons = {
    ru: document.getElementById("lang-ru"),
    en: document.getElementById("lang-en")
};

const LANGUAGE_STORAGE_KEY = "anincraft_language";

let currentLanguage = "ru";


function setLanguage(language) {

    currentLanguage =
        language === "en"
            ? "en"
            : "ru";


    document.documentElement.lang =
        currentLanguage;


    /*
     * Все элементы с data-lang переключаются
     * автоматически.
     *
     * Используем hidden + lang-hidden,
     * чтобы не зависеть от конкретного display.
     */
    document
        .querySelectorAll("[data-lang]")
        .forEach((element) => {

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
     * Переключение активной кнопки языка.
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
     * Локализация placeholder.
     */
    document
        .querySelectorAll(
            "[data-placeholder-ru], [data-placeholder-en]"
        )
        .forEach((element) => {

            const placeholder =
                currentLanguage === "en"
                    ? element.dataset.placeholderEn
                    : element.dataset.placeholderRu;


            if (placeholder !== undefined) {
                element.placeholder = placeholder;
            }

        });


    /*
     * Сбрасываем сообщение об ошибке
     * комментария при смене языка.
     */
    clearCommentError();


    /*
     * Сохраняем выбранный язык.
     */
    localStorage.setItem(
        LANGUAGE_STORAGE_KEY,
        currentLanguage
    );


    /*
     * После переключения языка обновляем
     * даты комментариев.
     */
    renderComments();
}


/*
 * Кнопка RU.
 */
languageButtons.ru.addEventListener(
    "click",
    () => {
        setLanguage("ru");
    }
);


/*
 * Кнопка EN.
 */
languageButtons.en.addEventListener(
    "click",
    () => {
        setLanguage("en");
    }
);


/* =========================
   COMMENTS
========================= */

const COMMENTS_STORAGE_KEY =
    "anincraft_comments_v1";


const commentForm =
    document.getElementById("comment-form");


const commentName =
    document.getElementById("comment-name");


const commentText =
    document.getElementById("comment-text");


const commentError =
    document.getElementById("comment-error");


const commentsList =
    document.getElementById("comments-list");


const commentsEmpty =
    document.getElementById("comments-empty");


/*
 * Получить комментарии из localStorage.
 */
function getComments() {

    try {

        const saved =
            localStorage.getItem(
                COMMENTS_STORAGE_KEY
            );


        if (!saved) {
            return [];
        }


        const comments =
            JSON.parse(saved);


        if (!Array.isArray(comments)) {
            return [];
        }


        return comments;

    } catch (error) {

        console.error(
            "Не удалось загрузить комментарии:",
            error
        );

        return [];
    }
}


/*
 * Сохранить комментарии.
 */
function saveComments(comments) {

    try {

        localStorage.setItem(
            COMMENTS_STORAGE_KEY,
            JSON.stringify(comments)
        );

        return true;

    } catch (error) {

        console.error(
            "Не удалось сохранить комментарии:",
            error
        );

        return false;
    }
}


/*
 * Показать ошибку комментария.
 */
function showCommentError() {

    if (currentLanguage === "en") {

        commentError.textContent =
            "Please enter a comment.";

    } else {

        commentError.textContent =
            "Введите комментарий.";

    }
}


/*
 * Очистить ошибку.
 */
function clearCommentError() {

    if (!commentError) {
        return;
    }

    commentError.textContent = "";
}


/*
 * Форматирование даты.
 */
function formatCommentDate(timestamp) {

    const date =
        new Date(timestamp);


    if (Number.isNaN(date.getTime())) {
        return "";
    }


    return new Intl.DateTimeFormat(
        currentLanguage === "en"
            ? "en-US"
            : "ru-RU",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    ).format(date);
}


/*
 * Отрисовка комментариев.
 */
function renderComments() {

    if (!commentsList || !commentsEmpty) {
        return;
    }


    const comments =
        getComments();


    commentsList.innerHTML = "";


    if (comments.length === 0) {

        commentsEmpty.hidden = false;

        commentsEmpty.classList.remove(
            "lang-hidden"
        );

        /*
         * Внутри commentsEmpty находятся
         * сразу RU/EN варианты.
         */
        commentsEmpty
            .querySelectorAll("[data-lang]")
            .forEach((element) => {

                const isCurrentLanguage =
                    element.dataset.lang === currentLanguage;

                element.hidden =
                    !isCurrentLanguage;

                element.classList.toggle(
                    "lang-hidden",
                    !isCurrentLanguage
                );

            });

        return;
    }


    commentsEmpty.hidden = true;
    commentsEmpty.classList.add(
        "lang-hidden"
    );


    /*
     * Показываем новые комментарии сверху.
     */
    comments
        .slice()
        .reverse()
        .forEach((comment) => {

            const article =
                document.createElement("article");

            article.className = "comment";


            const header =
                document.createElement("div");

            header.className =
                "comment-header";


            const author =
                document.createElement("span");

            author.className =
                "comment-author";


            const date =
                document.createElement("time");

            date.className =
                "comment-date";


            const text =
                document.createElement("p");

            text.className =
                "comment-text";


            /*
             * textContent используется специально:
             * пользовательский текст не должен
             * интерпретироваться как HTML.
             */
            author.textContent =
                comment.name || getAnonymousName();


            text.textContent =
                comment.text;


            date.textContent =
                formatCommentDate(
                    comment.createdAt
                );


            if (comment.createdAt) {

                date.dateTime =
                    new Date(
                        comment.createdAt
                    ).toISOString();

            }


            header.appendChild(author);
            header.appendChild(date);

            article.appendChild(header);
            article.appendChild(text);

            commentsList.appendChild(article);

        });
}


/*
 * Имя по умолчанию.
 */
function getAnonymousName() {

    return currentLanguage === "en"
        ? "Anonymous"
        : "Аноним";
}


/*
 * Отправка комментария.
 */
commentForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        clearCommentError();


        const name =
            commentName.value.trim();


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


        /*
         * Ограничиваем длину ещё и
         * на уровне JavaScript.
         */
        const safeName =
            name
                .slice(0, 50);


        const safeText =
            text
                .slice(0, 1000);


        const comment = {

            id:
                `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 10)}`,

            name:
                safeName || getAnonymousName(),

            text:
                safeText,

            createdAt:
                Date.now()

        };


        const comments =
            getComments();


        comments.push(comment);


        const saved =
            saveComments(comments);


        if (!saved) {

            commentError.textContent =
                currentLanguage === "en"
                    ? "The comment could not be saved."
                    : "Не удалось сохранить комментарий.";

            return;
        }


        /*
         * Очищаем форму.
         */
        commentName.value = "";
        commentText.value = "";


        /*
         * Сразу показываем новый комментарий.
         */
        renderComments();


        /*
         * Прокручиваем к последнему
         * добавленному комментарию.
         */
        const firstComment =
            commentsList.querySelector(
                ".comment"
            );


        if (firstComment) {

            firstComment.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

        }

    }
);


/* =========================
   COUNTDOWN
========================= */

const countdownTarget =
    new Date(
        "2026-10-01T00:00:00"
    ).getTime();


const daysElement =
    document.getElementById("days");


const hoursElement =
    document.getElementById("hours");


const minutesElement =
    document.getElementById("minutes");


const secondsElement =
    document.getElementById("seconds");


const countdownElement =
    document.getElementById("countdown");


function padNumber(number) {

    return String(number)
        .padStart(2, "0");
}


function updateCountdown() {

    const now =
        Date.now();


    const difference =
        countdownTarget - now;


    /*
     * Если дата уже наступила.
     */
    if (difference <= 0) {

        daysElement.textContent = "00";
        hoursElement.textContent = "00";
        minutesElement.textContent = "00";
        secondsElement.textContent = "00";


        countdownElement.innerHTML = `

            <div class="countdown-finished">

                <p
                    data-lang="ru"
                >
                    🎉 AninCraft уже должен был открыться!
                </p>

                <p
                    data-lang="en"
                    class="lang-hidden"
                >
                    🎉 AninCraft should already be live!
                </p>

            </div>

        `;


        /*
         * Важно:
         * элементы были созданы динамически,
         * поэтому повторно применяем язык.
         */
        setLanguage(currentLanguage);

        return;
    }


    const totalSeconds =
        Math.floor(
            difference / 1000
        );


    const days =
        Math.floor(
            totalSeconds / 86400
        );


    const hours =
        Math.floor(
            (totalSeconds % 86400) / 3600
        );


    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );


    const seconds =
        totalSeconds % 60;


    daysElement.textContent =
        String(days);


    hoursElement.textContent =
        padNumber(hours);


    minutesElement.textContent =
        padNumber(minutes);


    secondsElement.textContent =
        padNumber(seconds);
}


/*
 * Первый запуск.
 */
updateCountdown();


/*
 * Обновление каждую секунду.
 */
const countdownInterval =
    setInterval(
        updateCountdown,
        1000
    );


/* =========================
   CURRENT YEAR
========================= */

const currentYear =
    document.getElementById(
        "current-year"
    );


if (currentYear) {

    currentYear.textContent =
        new Date().getFullYear();

}


/* =========================
   INITIALIZATION
========================= */

function initializeSite() {

    /*
     * Восстанавливаем язык.
     */
    const savedLanguage =
        localStorage.getItem(
            LANGUAGE_STORAGE_KEY
        );


    setLanguage(
        savedLanguage === "en"
            ? "en"
            : "ru"
    );


    /*
     * Загружаем комментарии.
     */
    renderComments();

}


/*
 * Запускаем сайт.
 */
initializeSite();
