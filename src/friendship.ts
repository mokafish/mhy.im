/** 
 * Magic core
 */
import type { AnyEntryMap, z } from "astro:content";
import { max } from "date-fns";
import magic, { TIME_0 } from "./magic";

interface MagicMetadata {
    headings: any[];
    localImagePaths: any[];
    remoteImagePaths: any[];
    frontmatter: Record<string, any>;
    imagePaths: any[];
    [key: string]: any;
}

interface MagicRendered {
    html?: string;
    metadata?: MagicMetadata;
    [key: string]: any;

}

interface MagicData {
    title?: string;
    description?: string;
    date?: Date;
    categories?: string[];
    tags?: string[];
    cover?: string;
    author?: string;
    draft?: boolean;
    slug?: string;
    permalink?: string;
    updated_at?: Date;
    [key: string]: any;
}


export type MagicEntry = {
    id: string;
    data: MagicData | any;
    body?: string;
    filePath: string;
    digest?: string;
    rendered?: MagicRendered;
    collection: string;
} & AnyEntryMap;

/**
 * 路径树节点类，表示路径树中的一个节点
 */
export class PathNode {
    /** 子节点集合 */
    children: Map<string, PathNode>;
    /** 父节点 */
    parent: PathNode | null;
    /** 节点名称 */
    name: string;
    /** 当前节点的完整路径 */
    path: string;

    props: Record<string, any>;

    // stat: MagicStat;
    title: string;
    desc: string;
    ctime: Date;
    mtime: Date;
    size: number;
    count: number;
    owner: string;
    permission: number;

    /**
     * 构造函数
     * @param parent 父节点
     * @param name 节点名称
     * @param path 完整路径
     */
    constructor(parent: PathNode | null, name: string, path: string) {
        this.children = new Map();
        this.parent = parent;
        // this.isEnd = false;
        this.name = name;
        this.path = path;
        this.props = {};
        this.title = this.name;
        this.desc = '';
        this.ctime = TIME_0;
        this.mtime = TIME_0;
        this.size = 0; // 初始化为0，由父节点累加
        this.count = 0;
        this.owner = '';
        this.permission = 600;
    }


    /**
     * 判断是否有子节点
     * @returns 是否存在子节点
     */
    hasChildren(): boolean {
        return this.children.size > 0
    }
    /**
     * 获取分组后的子节点，并对每个分组进行排序
     * 
     * @remarks
     * 将子节点分为两组（有子节点的目录节点 / 无子节点的文件节点），
     * 排除名为'index'的特殊文件节点，并对每个分组进行指定排序
     * 
     * @param sort_by - 排序字段，可选值：
     * - 'title'  : 按名称排序（默认，区分大小写）
     * - 'ctime' : 按创建时间排序
     * - 'mtime' : 按最后修改时间排序
     * - 'size'  : 按文件大小排序
     * @param descend - 是否降序排列，默认为`false`（升序）
     * 
     * @returns 排序后的二维数组，结构为：
     * [
     *   [有子节点的目录节点（已排序）], 
     *   [无子节点的文件节点（已排序，排除'index'）]
     * ]
     * 
     * @example
     * ```typescript
     * // 获取按修改时间降序排列的分组节点
     * const sortedGroups = node.grouped('mtime', true);
     * 
     * // 结果示例：
     * [
     *   [dirNode2, dirNode1], // 按mtime降序的目录
     *   [fileNode3, fileNode2] // 按mtime降序的文件
     * ]
     * ```
     */
    grouped(sort_by: 'title' | 'ctime' | 'mtime' | 'size' = 'title', descend = false): PathNode[][] {
        let children_grouped: PathNode[][] = [[], []]
        this.children.forEach((cn: PathNode) => {
            if (cn.hasChildren()) {
                children_grouped[0].push(cn)
            } else if (cn.name != 'index') {
                children_grouped[1].push(cn)
            }
        })

        // 对两个分组分别进行排序
        children_grouped[0].sort(this.getCompare(sort_by));
        children_grouped[1].sort(this.getCompare(sort_by));


        return children_grouped
    }

    /**
     * 获取排序比较函数（工厂函数）
     * 
     * @remarks
     * 通过预生成特定排序规则的比较函数，避免每次排序时重复条件判断，提升性能
     * 
     * @param sort_by - 排序字段，默认为'title'
     * @param descend - 是否降序，默认为`false`
     * 
     * @returns 优化后的比较函数，时间复杂度O(1)
     */
    getCompare(sort_by: 'title' | 'ctime' | 'mtime' | 'size' = 'title', descend = false): (a: PathNode, b: PathNode) => number {
        if (sort_by == 'title') {
            return descend ?
                (a, b) => b.title.localeCompare(a.title, undefined, {
                    sensitivity: 'base', // 忽略大小写和音调差异
                    numeric: true        // 智能识别数字排序
                }) :
                (a, b) => a.title.localeCompare(b.title, undefined, {
                    sensitivity: 'base', // 忽略大小写和音调差异
                    numeric: true        // 智能识别数字排序
                });
        }

        if (sort_by == 'size') {
            return descend ?
                (a, b) => b[sort_by] - a[sort_by] :
                (a, b) => a[sort_by] - b[sort_by];
        }

        return descend ?
            (a, b) => b[sort_by].getTime() - a[sort_by].getTime() :
            (a, b) => a[sort_by].getTime() - b[sort_by].getTime();
    }
}

/**
 * 路径树查询系统
 */
export class MagicTrie {
    /** 根节点 */
    private readonly root: PathNode;
    /** 路径到节点的映射表 */
    public readonly nmap: Map<string, PathNode>;

    /**
     * 构造函数
     * @param paths 初始路径数组
     */
    constructor() {
        this.root = new PathNode(null, '', '');
        this.nmap = new Map<string, PathNode>();
        this.nmap.set('', this.root);
        // paths.forEach(path => this.insert(path));
    }

    /**
     * 插入路径到路径树
     * @param path 要插入的绝对路径（格式：/a/b/c）
     * @param props 要存储的信息
     */
    insert(path: string, props: Record<string, any> = {}): void {
        if (path === '/' || path === '') return;
        const leaf_data = (props.data as MagicData)
        const _ctime = new Date(leaf_data?.date || TIME_0)
        const ctime = _ctime;
        const mtime = new Date(leaf_data?.updated_at || _ctime)
        const count = 0
        const size = 6 // NOTE: 临时值
        const owner = 'root'
        const permission = 600

        const parts = path.split('/').filter(p => p !== '');
        let currentNode = this.root;
        let currentPath = this.root.path;

        for (const part of parts) {
            currentPath = currentPath === ''
                ? `${part}`
                : `${currentPath}/${part}`;

            if (!currentNode.children.has(part)) {
                const newNode = new PathNode(currentNode, part, currentPath);
                newNode.ctime = ctime
                newNode.mtime = mtime
                newNode.size = size
                newNode.owner = owner
                newNode.permission = permission

                currentNode.children.set(part, newNode);
                this.nmap.set(currentPath, newNode);
            }

            currentNode.ctime = max([currentNode.ctime, ctime])
            currentNode.mtime = max([currentNode.mtime, mtime])
            currentNode.size += size
            currentNode.count += 1

            currentNode = currentNode.children.get(part)!;
        }

        currentNode.props = props;
        this.nmap.set(path, currentNode);
    }

    /**
     * 获取指定路径的直接子节点名称列表
     * @param base 基础路径
     * @returns 子节点名称数组
     */
    getChildren(base: string | null | undefined): string[] {
        const node = this.nmap.get(base ?? '');
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
    // getLastNodeName(path: string): string {
    //     const parts = path.split('/').filter(p => p !== '');
    //     return parts[parts.length - 1] || '';
    // }

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


interface Route {
    params: Record<string, any>,
    props: Record<string, any>,
}
