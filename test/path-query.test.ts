import {PathQuery} from '../src/path_query'; // 注意路径是否正确

describe('PathQuery', () => {
    let pathQuery: PathQuery;

    beforeEach(() => {
        // 在每个测试用例前初始化
        pathQuery = new PathQuery(['/a/b/c', '/a/d/e', '/x/y']);
    });

    describe('基础功能', () => {
        test('正确初始化根节点', () => {
            expect(pathQuery.getChildren('/')).toEqual(expect.arrayContaining(['a', 'x']));
        });

        test('插入新路径', () => {
            pathQuery.insert('/m/n');
            expect(pathQuery.getChildren('/m')).toEqual(['n']);
        });
    });

    describe('getChildren()', () => {
        test('存在子节点', () => {
            expect(pathQuery.getChildren('/a')).toEqual(['b', 'd']);
        });

        test('不存在子节点', () => {
            expect(pathQuery.getChildren('/x/y')).toEqual([]);
        });

        test('无效路径返回空数组', () => {
            expect(pathQuery.getChildren('/invalid')).toEqual([]);
        });
    });

    describe('hasChildren()', () => {
        test('有子节点返回 true', () => {
            expect(pathQuery.hasChildren('/a')).toBe(true);
        });

        test('无子节点返回 false', () => {
            expect(pathQuery.hasChildren('/x/y')).toBe(false);
        });
    });

    describe('getParent()', () => {
        test('获取父路径', () => {
            expect(pathQuery.getParent('/a/b/c')).toBe('/a/b');
            expect(pathQuery.getParent('/')).toBeNull();
        });
    });

    describe('getLastNodeName()', () => {
        test('获取最后节点名称', () => {
            expect(pathQuery.getLastNodeName('/a/b/c')).toBe('c');
            expect(pathQuery.getLastNodeName('/')).toBe('');
        });
    });

    describe('trimEnd()', () => {
        test('修剪末尾节点', () => {
            const node = pathQuery.trimEnd('/a/b/c');
            expect(node?.path).toBe('/a/b');
        });
    });

    describe('getRelativePath()', () => {
        test('同级路径', () => {
            expect(pathQuery.getRelativePath('/a/b', '/a/d')).toBe('../d');
        });

        test('子路径', () => {
            expect(pathQuery.getRelativePath('/a', '/a/b/c')).toBe('b/c');
        });

        test('跨根路径', () => {
            expect(pathQuery.getRelativePath('/x', '/a')).toBe('../a');
        });

        test('相同路径', () => {
            expect(pathQuery.getRelativePath('/a', '/a')).toBe('.');
        });
    });
});