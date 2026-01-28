class LottoGenerator extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const wrapper = document.createElement('div');
        wrapper.setAttribute('class', 'lotto-generator');

        const title = document.createElement('h1');
        title.textContent = 'Lotto Number Generator';

        const numbersContainer = document.createElement('div');
        numbersContainer.setAttribute('class', 'numbers');

        const button = document.createElement('button');
        button.textContent = 'Generate Numbers';
        button.addEventListener('click', () => {
            this.generateNumbers(numbersContainer);
        });

        const style = document.createElement('style');
        style.textContent = `
            .lotto-generator {
                text-align: center;
            }
            .numbers {
                display: flex;
                justify-content: center;
                margin-top: 20px;
            }
            .number {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background-color: #f0f0f0;
                margin: 0 5px;
                font-size: 20px;
                font-weight: bold;
                color: #333;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            }
        `;

        shadow.appendChild(style);
        shadow.appendChild(wrapper);
        wrapper.appendChild(title);
        wrapper.appendChild(numbersContainer);
        wrapper.appendChild(button);
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
