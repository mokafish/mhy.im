import type {Button} from "mdui";
import * as mdui from 'mdui';

console.log('load mdui.js '+ (mdui && 'ok'));
// mdui.setColorScheme('#ed97b7');
// mdui.setTheme('dark')
mdui.setColorScheme('#ca99dd');

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



