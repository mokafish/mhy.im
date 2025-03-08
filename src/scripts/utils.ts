export class LinearCongruentialGenerator {
    private seed: number;

    constructor(
        seed: number,
        private a: number = 1103515245,
        private c: number = 12345,
        private m: number = 2147483648 // 2^31
    ) {
        // 初始化种子并确保其在有效范围内 [0, m-1]
        this.seed = seed % m;
        if (this.seed < 0) {
            this.seed += m;
        }
    }

    /**
     * 生成下一个随机整数并更新种子
     * @returns 下一个随机整数 [0, m-1]
     */
    public _next(): number {
        this.seed = (this.a * this.seed + this.c) % this.m;
        return this.seed;
    }

    /**
     * 生成 [0, 1) 之间的随机浮点数
     */
    public nextFloat(): number {
        return this._next() / this.m;
    }



    /**
     * 生成指定范围的随机整数 [min, max]（包含两端）
     * @param min 最小值
     * @param max 最大值
     */
    public next(min: number, max: number): number {
        return Math.floor(this.nextFloat() * (max - min + 1)) + min;
    }

    /**
     * 获取当前种子值
     */
    public getSeed(): number {
        return this.seed;
    }

    /**
     * 重置种子
     * @param newSeed 新种子
     */
    public setSeed(newSeed: number): void {
        this.seed = newSeed % this.m;
        if (this.seed < 0) {
            this.seed += this.m;
        }
    }
}

// 使用示例
export const lcg = new LinearCongruentialGenerator(100);

export default { lcg, LinearCongruentialGenerator };