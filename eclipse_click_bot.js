// ==UserScript==
// @name         Canvas Debugger + Play Integration
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Автокликер с интеграцией вызова метода play() для повышения качества кликов
// @author       You
// @match        https://tap.eclipse.xyz/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    console.log("[Canvas Debugger] Tampermonkey script started at document-start");

    let canvasFound = false;
    let retryCount = 0;

    function tryInitCanvasClicks() {
        const canvas = document.querySelector('canvas');
        if (!canvas) {
            retryCount++;
            console.log(`[Canvas Debugger] Canvas не найден. Попытка ${retryCount} из 3.`);

            if (retryCount >= 3) {
                console.warn("[Canvas Debugger] Canvas не найден после 3 попыток. Перезагрузка страницы...");
                location.reload();
            }
            return;
        }

        canvasFound = true;
        console.log("[Canvas Debugger] Найдён <canvas>:", canvas);

        // ----------------------------------------------------------------------------
        // Логика автоклика с вызовом метода play() при каждом клике
        // ----------------------------------------------------------------------------
        const rect = canvas.getBoundingClientRect();

        function simulateMouseEvent(eventType, x, y) {
            const event = new MouseEvent(eventType, {
                bubbles: true,
                cancelable: true,
                clientX: rect.left + x,
                clientY: rect.top + y,
            });
            canvas.dispatchEvent(event);
            console.log(`[Canvas Debugger] ${eventType} @ (${x.toFixed(1)}, ${y.toFixed(1)})`);
        }

        function simulateRealisticClick(x, y) {
            // Нажатие
            simulateMouseEvent('mousedown', x, y);
            setTimeout(() => {
                // Отпускание
                simulateMouseEvent('mouseup', x, y);
            }, Math.random() * 100 + 50);
            setTimeout(() => {
                // Сам клик
                simulateMouseEvent('click', x, y);

                // Попытка вызова метода play() после клика
                try {
                    const targetElement = document.querySelector('селектор_элемента_где_ожидается_play');
                    if (targetElement && typeof targetElement.play === 'function') {
                        targetElement.play().then(() => {
                            console.log('[Canvas Debugger] Метод play() вызван успешно.');
                        }).catch(err => {
                            console.error('[Canvas Debugger] Ошибка вызова play():', err);
                        });
                    } else {
                        console.warn('[Canvas Debugger] Элемент для вызова play() не найден или метод play() недоступен.');
                    }
                } catch (err) {
                    console.error('[Canvas Debugger] Ошибка при вызове play():', err);
                }

            }, Math.random() * 200 + 100);
        }

        function startClicking(durationInMinutes) {
            const durationMs = durationInMinutes * 60 * 1000;
            const clickInterval = setInterval(() => {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                simulateRealisticClick(x, y);
            }, Math.random() * 700 + 900);

            setTimeout(() => {
                clearInterval(clickInterval);
                console.log('[Canvas Debugger] Клики остановлены.');
            }, durationMs);
        }

        function startCycle(clickDuration, breakDuration) {
            function cycle() {
                console.log(`[Canvas Debugger] Клики начинаются на ${clickDuration} минут...`);
                startClicking(clickDuration);
                setTimeout(() => {
                    console.log(`[Canvas Debugger] Перерыв на ${breakDuration} минут...`);
                    setTimeout(cycle, breakDuration * 60 * 1000);
                }, clickDuration * 60 * 1000);
            }
            cycle();
        }

        // Запускаем: 15 мин кликов, 1 мин перерыва
        startCycle(15, 2);
    }

    // Попробуем найти canvas с тремя попытками каждые 10 секунд
    const waitCanvasInterval = setInterval(() => {
        if (!canvasFound) {
            tryInitCanvasClicks();
        } else {
            clearInterval(waitCanvasInterval);
        }
    }, 10000);

})();