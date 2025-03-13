import type { AnyEntryMap, z } from "astro:content";
import { max } from "date-fns";

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

// export interface  MagicEntry extends AnyEntryMap {
//     id: string;
//     data: MagicData;
//     body?: string;
//     filePath: string;
//     digest: string;
//     rendered?: MagicRendered;
//     collection: string;
//     // [key: string]: any;
// }

// {
//     id: string;
//     body?: string | undefined;
//     collection: "dogs";
//     data: {
//         id: string;
//         breed: string;
//         temperament: string[];
//     };
//     rendered?: RenderedContent | undefined;
//     filePath?: string | undefined;
// }[]
export type MagicEntry = {
    id: string;
    data: MagicData | any;
    body?: string;
    filePath: string;
    digest?: string;
    rendered?: MagicRendered;
    collection: string;
} & AnyEntryMap;

// export type  MagicEntry  = AnyEntryMap

// export interface  MagicEntry extends AnyEntryMap {
//     id: string;
//     data: MagicData;
//     body?: string;
//     filePath: string;
//     digest: string;
//     rendered?: MagicRendered;
//     collection: string;
//     [key: string]: any;
// }

/**
 * 路径树查询系统 对下面的系统加入一个功能
 * PathNode 加入一个字段 stat = {ctime, mtime, total_size, total_childrens}
 * 并在 insert 时添加节点中（由参数参数输入(ctime:Date=new Date(0), mtime:Date=new Date(0), size=0)），
 * (父节点自动计算 total_childrens  自动累加，total_siz ,也要同步ctime和 mtime)
 * 代码只需要写出stat的类型声明、初始化和insert函数部分，保持原来的逻辑不要动，并详细讲解实现思路；
 */

/**
 * 路径树节点类，表示路径树中的一个节点
 */

export type MagicStat = {
    ctime: Date;
    mtime: Date;
    total_size: number;
    total_childrens: number;
}

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

    stat: MagicStat;

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
        this.stat = {
            ctime: new Date(0),
            mtime: new Date(0),
            total_size: 0, // 初始化为0，由父节点累加
            total_childrens: 0,
        };
    }


    /**
     * 判断是否有子节点
     * @returns 是否存在子节点
     */
    hasChildren(): boolean {
        return this.children.size > 0
    }
    /**
     * 获取分组后的子节点
     * @returns 分组后的子节点数组 [[有子节点],[无子节点]]
     */
    grouped(): PathNode[][] {
        let children_grouped: PathNode[][] = [[], []]
        this.children.forEach((cn: PathNode) => {
            if (cn.hasChildren()) {
                children_grouped[0].push(cn)
            } else {
                children_grouped[1].push(cn)
            }
        })

        return children_grouped
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
        const leaf_stat:MagicStat = {
            ctime: new Date(leaf_data?.date||0),
            mtime: new Date(leaf_data?.updated_at||0),
            total_childrens:0,
            total_size:6, // NOTE: 临时值
        }
        const parts = path.split('/').filter(p => p !== '');
        let currentNode = this.root;
        let currentPath = this.root.path;

        for (const part of parts) {
            currentPath = currentPath === ''
                ? `${part}`
                : `${currentPath}/${part}`;

            if (!currentNode.children.has(part)) {
                const newNode = new PathNode(currentNode, part, currentPath);
                newNode.stat = leaf_stat
                currentNode.children.set(part, newNode);
                this.nmap.set(currentPath, newNode);
            }

            currentNode.stat.ctime = max([currentNode.stat.ctime,leaf_stat.ctime])
            currentNode.stat.mtime = max([currentNode.stat.mtime,leaf_stat.mtime])
            currentNode.stat.total_size += leaf_stat.total_size
            currentNode.stat.total_childrens += 1

            currentNode = currentNode.children.get(part)!;
        }

        currentNode.props = props;
        // currentNode.isEnd = true;
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

    // autoIndex(filter: (abs_path_name: string) => boolean = (x)=>true): MagicTrie {
    //     const apt = new MagicTrie();
    //
    //     for(const [path, node] of this.nmap){
    //         if (filter(path)){
    //
    //         }
    //     }
    //
    //     return apt
    // }
}


interface Route {
    params: Record<string, any>,
    props: Record<string, any>,
}

function autoIndex(routes: Array<Route>) {
    interface Tree {
        abs_path: string,
        rel_path: string,
        children: Array<Tree> | null,
    }

    let tree: Array<Tree> = []

    let auto_index_routes: Array<Route> = []
    for (let route of routes) {
        let path: string = route?.params?.path
        if (path) {
            // ...
            // 部分逻辑大概是这样
            // 原始index路由标记为'originalIndex'的同时，也要在输出 route.props 输出 children
            //
            // /a/index
            // /a/b
            // /a/c
            // /a/d
            // route.props.children = [
            //     // /a/b
            //     // /a/c
            //     // /a/d
            // ]
            if (path.endsWith('/index')) {
                route.props.type = 'originalIndex';
                route.props.children = [
                    //...
                ] as Array<Tree>
            } else if ('children' !== null) {
                auto_index_routes.push({
                    params: { path: { abs_path: "" }?.abs_path + '/index' },
                    props: {
                        type: 'autoIndex',
                        children: [
                            // ...
                        ] as Array<Tree>
                    },
                })
            }
            // ...
        }

    }

    return [...routes, ...auto_index_routes]
}