
// 使用单元测试框架来测试下面代码，我没有接触过测试，教详细点



/**
 * 路径树节点类，表示路径树中的一个节点
 */
export class PathNode {
    /** 子节点集合 */
    children: Map<string, PathNode>;
    /** 父节点 */
    parent: PathNode | null;
    /** 当前节点是否为某条路径的终点 */
    isEnd: boolean;
    /** 节点名称 */
    name: string;
    /** 当前节点的完整路径 */
    path: string;

    /**
     * 构造函数
     * @param parent 父节点
     * @param name 节点名称
     * @param path 完整路径
     */
    constructor(parent: PathNode | null, name: string, path: string) {
        this.children = new Map();
        this.parent = parent;
        this.isEnd = false;
        this.name = name;
        this.path = path;
    }
}

/**
 * 路径树查询系统
 */
export  class PathQuery {
    /** 根节点 */
    private readonly root: PathNode;
    /** 路径到节点的映射表 */
    private nmap: Map<string, PathNode>;

    /**
     * 构造函数
     * @param paths 初始路径数组
     */
    constructor(paths: string[]) {
        this.root = new PathNode(null, '', '/');
        this.nmap = new Map<string, PathNode>();
        this.nmap.set('/', this.root);
        paths.forEach(path => this.insert(path));
    }

    /**
     * 插入路径到路径树
     * @param path 要插入的绝对路径（格式：/a/b/c）
     */
    insert(path: string): void {
        if (path === '/' || path === '') return;

        const parts = path.split('/').filter(p => p !== '');
        let currentNode = this.root;
        let currentPath = this.root.path;

        for (const part of parts) {
            currentPath = currentPath === '/'
                ? `/${part}`
                : `${currentPath}/${part}`;

            if (!currentNode.children.has(part)) {
                const newNode = new PathNode(currentNode, part, currentPath);
                currentNode.children.set(part, newNode);
                this.nmap.set(currentPath, newNode);
            }
            currentNode = currentNode.children.get(part)!;
        }

        currentNode.isEnd = true;
        this.nmap.set(path, currentNode);
    }

    /**
     * 获取指定路径的直接子节点名称列表
     * @param base 基础路径
     * @returns 子节点名称数组
     */
    getChildren(base: string): string[] {
        const node = this.nmap.get(base);
        return node ? Array.from(node.children.keys()) : [];
    }

    /**
     * 判断指定路径是否有子节点
     * @param base 基础路径
     * @returns 是否存在子节点
     */
    hasChildren(base: string): boolean {
        const node = this.nmap.get(base);
        return node ? node.children.size > 0 : false;
    }

    /**
     * 获取指定路径的父节点路径
     * @param base 基础路径
     * @returns 父节点路径或null
     */
    getParent(base: string): string | null {
        const node = this.nmap.get(base);
        return node?.parent?.path ?? null;
    }

    /**
     * 获取输入路径的最后一个节点名称
     * @param path 输入路径
     * @returns 最后一个节点名称
     */
    getLastNodeName(path: string): string {
        const parts = path.split('/').filter(p => p !== '');
        return parts[parts.length - 1] || '';
    }

    /**
     * 修剪路径开头部分（返回完整路径对应的节点）
     * @param path 输入路径
     * @returns 对应的节点或undefined
     */
    trimStart(path: string): PathNode | undefined {
        return this.nmap.get(path);
    }

    /**
     * 修剪路径末尾部分（返回父节点）
     * @param path 输入路径
     * @returns 父节点或undefined
     */
    trimEnd(path: string): PathNode | undefined {
        const parts = path.split('/').filter(p => p !== '');
        if (parts.length === 0) return undefined;

        parts.pop();
        const parentPath = parts.length === 0
            ? '/'
            : `/${parts.join('/')}`;

        return this.nmap.get(parentPath);
    }

    /**
     * 计算两个路径之间的相对路径
     * @param fromPath 起始路径
     * @param toPath 目标路径
     * @returns 相对路径字符串
     */
    getRelativePath(fromPath: string, toPath: string): string {
        const fromParts = fromPath.split('/').filter(p => p !== '');
        const toParts = toPath.split('/').filter(p => p !== '');

        let commonDepth = 0;
        while (
            commonDepth < fromParts.length &&
            commonDepth < toParts.length &&
            fromParts[commonDepth] === toParts[commonDepth]
            ) {
            commonDepth++;
        }

        const upLevels = fromParts.length - commonDepth;
        const relativeParts: string[] = [];

        for (let i = 0; i < upLevels; i++) {
            relativeParts.push('..');
        }

        relativeParts.push(...toParts.slice(commonDepth));
        return relativeParts.join('/') || '.';
    }
}

