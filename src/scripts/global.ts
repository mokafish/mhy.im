import '@mdui/icons/'
import type {Button} from "mdui";

class Counter extends HTMLElement {
    // 声明类属性（关键修复）
    private count: number = 0;
    private readonly countNode!: HTMLSpanElement;

    constructor() {
        super();

        // 修复 TS2540：使用基类的 shadowRoot（无需重新声明）
        const shadowRoot: ShadowRoot = this.attachShadow({mode: 'open'});
        // const shadowRoot:ShadowRoot = this.attachShadow({ mode: 'closed' });
        // (window as any).componentRoots = {
        //     'my-counter': shadowRoot
        // };

        shadowRoot.innerHTML = `
          <style>
            .counter-number{
                padding: 0 4px;
            }
          </style>
          <mdui-button variant="elevated">
            Current count: <span class="counter-number"> 0 </span>
          </mdui-button>
        `;

        // 修复 TS2339：正确初始化类属性
        this.countNode = shadowRoot.querySelector('.counter-number') as HTMLSpanElement;

        shadowRoot.addEventListener('click', () => {
            // 使用 textContent 替代 innerText（更规范）
            this.countNode.textContent = `${++this.count}`;
        });
    }
}

customElements.define('my-counter', Counter);



// 1. 添加 null 类型并检查元素存在性
const button = document.querySelector('mdui-button') as Button | null;

function handleButtonClick(event: Event) {
    // 2. 使用 currentTarget 代替 target 确保类型安全
    const button = event.currentTarget as Button;

    // 设置属性（TS 会验证 variant 类型）
    button.variant = 'elevated';

    // 读取属性（TS 知道这是 string 类型）
    console.log(button.variant);
}

// 3. 添加前检查元素是否存在
if (button) {
    button.addEventListener('click', handleButtonClick);
}


