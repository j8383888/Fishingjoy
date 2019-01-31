/**
 * <code>Dictionary</code> 是一个字典型的数据存取类。
 * 原作者 LayaBox
 * author suo(修改部分源码 添加数组常用方法)
 */
class Dictionary {
	private _values: Array<any> = [];
	private _keys: Array<any> = [];

	/**
	 * 获取所有的子元素列表。
	 */
	public get values(): Array<any> {
		return this._values;
	}

	/**
	 * 获取所有的子元素键名列表。
	 */
	public get keys(): Array<any> {
		return this._keys;
	}

	/**
	 * 设置所有的子元素列表。
	 */
	public set values(value: Array<any>) {
		this._values = value;
	}

	/**
	 * 设置所有的子元素键名列表。
	 */
	public set keys(value: Array<any>) {
		this._keys = value;
	}


	/**
	 * 给指定的键名设置值。
	 * @param	key 键名。
	 * @param	value 值。
	 */
	public set(key: any, value: any): void {
		var index: number = this.indexOf(key);
		if (index >= 0) {
			this._values[index] = value;
			return;
		}
		this._keys.push(key);
		this._values.push(value);
	}

	/**
	 * 获取指定对象的键名索引。
	 * @param	key 键名对象。
	 * @return 键名索引。
	 */
	public indexOf(key: any): number {
		return this._keys.indexOf(key);
	}

	/**
	 * 返回指定键名的值。
	 * @param	key 键名对象。
	 * @return 指定键名的值。
	 */
	public get(key: any): any {
		var index: number = this.indexOf(key);
		return index < 0 ? null : this._values[index];
	}

	/**
	 * 移除指定键名的值。
	 * @param	key 键名对象。
	 * @return 是否成功移除。
	 */
	public remove(key: any): Boolean {
		var index: number = this.indexOf(key);
		if (index >= 0) {
			this._keys.splice(index, 1);
			this._values.splice(index, 1);
			return true;
		}
		return false;
	}

	/**
	 * 清除此对象的键名列表和键值列表。
	 */
	public clear(): void {
		this._values.length = 0;
		this._keys.length = 0;
	}

	/**
	 * 获得字典长度
	 */
	public get length(): number {
		return this._values.length;
	}

	/**
	 * 拷贝字典
	 */
	public copy(start: number = 0, end: number = Number.MAX_VALUE): Dictionary {
		var dic: Dictionary = new Dictionary();
		dic.values = this._values.slice(start, end);
		dic.keys = this._keys.slice(start, end);
		return dic;
	}

	/**
	 * 根据值找键（心里有点B数再用）
	 */
	public getKeyByValue(value: any): any {
		var index: number = this._values.indexOf(value);
		return index < 0 ? null : this._keys[index];
	}

	/**
	 * 是否存在
	 */
	public isExist(key: any): boolean {
		return this.indexOf(key) != -1
	}
}