/**
 *  <code>DictionaryFast</code>是一个字典型的数据存取类。 
 * 	与Dictionary相比更为高效，但键值仅只能为string类型
 * 	由于string类型的键值已能满足大部分需求 所以单独写成一个类
 *  @author suo
 */
class SimpleMap<T>{

    public constructor() {
    }


    public get keys(): string[] {
        return Object.getOwnPropertyNames(this);
    }
	/**
	 * 给指定的键名设置值。
 	 * @param	key 键名。
	 * @param	value 值。
	 */
    public set(key: string | number, value: T): void {
        this[key] = value;
    }

    /**
	 * 返回指定键名的值。
	 * @param	key 键名对象。
	 * @return 指定键名的值。
	 */
    public get(key: string | number): T {
        if (this.isExist(key)) {
            return this[key]
        }
        else {
            return null
        }
    }

    /**
	 * 返回指定键名的值。
	 * @param	key 键索引。
	 * @return 指定键名的值。
	 */
    public getByKeyIndex(index: number): T {
        return this[this.keys[index]];
    }

    /**
     * 是否存在该键
     */
    public isExist(key: string | number): boolean {
        let result: T = this[key]
        if (result === void 0) {
            return false
        }
        else {
            return true;
        }
    }

    /**
	 * 获得字典长度
	 */
    public get length(): number {
        return this.keys.length;
    }

    /**
	 * 移除指定键名的值。
	 * @param	key 键名对象。
	 * @return 是否成功移除。
	 */
    public remove(key: string | number): boolean {
        if (this.isExist(key)) {
            delete this[key];
            return true;
        }
        else {
            return false
        }
    }

    /**
     * 清理
     */
    public clear(): void {
        let keys: string[] = this.keys.slice();
        for (let i: number = 0; i < keys.length; i++) {
            delete this[keys[i]];
        }
    }

    /**
     * 回收
     */
    public recover(): void {
        this.clear();
        Pool.recover("simple_map", this);
    }

    /**
	 * 拷贝字典
	 */
    public copy(): SimpleMap<T> {
        let map: SimpleMap<T> = Pool.getItemByClass("simple_map", SimpleMap);
        let keys: string[] = this.keys.slice();
        for (let i: number = 0; i < keys.length; i++) {
            map.set(keys[i], this[keys[i]])
        }
        return map
    }

}
