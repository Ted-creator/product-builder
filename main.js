class LottoGenerator extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'lotto-generator');

        const title = document.createElement('h1');
        title.textContent = 'Lotto Number Generator';

        const header = document.createElement('div');
        header.setAttribute('class', 'header');

        const themeToggle = document.createElement('button');
        themeToggle.setAttribute('class', 'theme-toggle');

        const numbersContainer = document.createElement('div');
        numbersContainer.setAttribute('class', 'numbers');

        const button = document.createElement('button');
        button.setAttribute('class', 'generate');
        button.textContent = 'Generate Numbers';
        button.addEventListener('click', () => {
            this.generateNumbers(numbersContainer);
        });

        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const storedTheme = localStorage.getItem('theme');
        const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
        this.applyTheme(initialTheme, themeToggle);
        themeToggle.addEventListener('click', () => {
            const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            this.applyTheme(nextTheme, themeToggle);
        });

        const style = document.createElement('style');
        style.textContent = `
            .lotto-generator {
                text-align: center;
                background: var(--card-bg);
                color: var(--text-color);
                padding: 32px 28px;
                border-radius: 16px;
                box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
                min-width: 320px;
            }
            .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
            }
            h1 {
                margin: 0;
                font-size: 24px;
            }
            .theme-toggle {
                border: 1px solid var(--border-color);
                background: var(--button-bg);
                color: var(--button-text);
                padding: 8px 12px;
                border-radius: 999px;
                cursor: pointer;
                font-weight: 600;
            }
            .numbers {
                display: flex;
                justify-content: center;
                margin-top: 24px;
                flex-wrap: wrap;
                gap: 10px;
            }
            .number {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                margin: 0 5px;
                font-size: 20px;
                font-weight: bold;
                color: #333;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
            .generate {
                margin-top: 24px;
                border: none;
                background: var(--accent);
                color: #0d1117;
                padding: 12px 18px;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 700;
                cursor: pointer;
            }
        `;

        shadow.appendChild(style);
        shadow.appendChild(wrapper);
        wrapper.appendChild(header);
        header.appendChild(title);
        header.appendChild(themeToggle);
        wrapper.appendChild(numbersContainer);
        wrapper.appendChild(button);
    }

    applyTheme(theme, button) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        button.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }

    generateNumbers(container) {
        container.innerHTML = '';
        const numbers = new Set();
        while (numbers.size < 6) {
            numbers.add(Math.floor(Math.random() * 45) + 1);
        }

        for (const number of [...numbers].sort((a, b) => a - b)) {
            const numberElement = document.createElement('div');
            numberElement.setAttribute('class', 'number');
            numberElement.textContent = number;
            this.setBallColor(numberElement, number);
            container.appendChild(numberElement);
        }
    }

    setBallColor(element, number) {
        let color;
        if (number <= 10) {
            color = '#fbc400';
        } else if (number <= 20) {
            color = '#69c8f2';
        } else if (number <= 30) {
            color = '#ff7272';
        } else if (number <= 40) {
            color = '#aaa';
        } else {
            color = '#b0d840';
        }
        element.style.backgroundColor = color;
    }
}

customElements.define('lotto-generator', LottoGenerator);
