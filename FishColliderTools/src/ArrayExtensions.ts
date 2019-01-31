interface Array<T> {
	/**
	 * 得到数组中符合谓词要求的第一个值，谓词无效时返回数组第一个元素
	 */
	first(callbackfn?: (value: T, index: number, array: T[]) => boolean): T;
	/**
	 * 得到数组中符合谓词要求的最后一个值，谓词无效时返回数组最后一个元素
	 */
	last(callbackfn?: (value: T, index: number, array: T[]) => boolean): T;
	/**
	 * 从数组中随机返回一个元素
	 */
	random(): T;
	/**
	 * 从数组中删除指定的元素
	 */
	remove(value: T, fromIndex?: number): boolean;
	/**
	 * 从数组中删除指定下标的元素
	 */
	removeAt(index: number): boolean;
	/**
	 * 从数组中删除符合条件的第一个元素
	 */
	removeFirst(predicate: (value: T, index: number) => boolean, fromIndex?: number): boolean;
	/**
	 * 从数组中删除符合条件的所有元素
	 */
	removeAll(predicate: (value: T, index: number) => boolean, fromIndex?: number): number;
    /**
    * 返回去掉重复的数组
    */
	distinct();
	/**
	 * 清空数组
	 */
	clear(): void;
	/**
	 *深拷贝数组
	 */
	clone(): T[];
	/**
	 *返回从数组中符合条件的第一个元素的索引 若未找到返回-1
	 */
	find(func?: Function): number;
	/**
	 * 数组中是否存在符合条件的元素
	 */
	seek(func?: Function): boolean;
	/**
	 *返回从数组中最后一个元素
	 */
	last(func?: Function): T;
	/**
	 * 从数组中最后一个元素返回一个随机元素
	 */
	random(): T;
	/**
	 * 从数组中最后一个元素随机返回selectnum数量元素
	 */
	randomItems(selectnum): Array<T>;
	/**
	 * 翻转数组，但不影响原数组
	*/
	reverse(): Array<T>;
}

interface ArrayConstructor {
	/**
	 * 创建一个N维数组，按顺序指定其第1,2,3...维的长度
	 */
	create(...dimensionLength: number[]): any;
}

if (!Array.prototype.first) {
	Array.prototype.first = function (callbackfn?: (value: any, index: number, array: any[]) => boolean): any {
		if (typeof callbackfn == "function") {
			for (var i = 0; i < this.length; i++) {
				var v = this[i];
				if (callbackfn(v, i, this)) {
					return v;
				}
			}
		}
		else if (this.length > 0) {
			return this[0];
		}
		return null;
	}
}

if (!Array.prototype.last) {
	Array.prototype.last = function (callbackfn?: (value: any, index: number, array: any[]) => boolean): any {
		if (typeof callbackfn == "function") {
			for (var i = this.length - 1; i >= 0; i--) {
				var v = this[i];
				if (callbackfn(v, i, this)) {
					return v;
				}
			}
		}
		else if (this.length > 0) {
			return this[this.length - 1];
		}
		return null;
	}
}
if (!Array.prototype.remove) {
	Array.prototype.remove = function (value, fromIndex?: number) {
		var index = this.indexOf(value, fromIndex);
		if (index < 0)
			return false;
		this.splice(index, 1);
		return true;
	};
}


if (!Array.prototype.removeAt) {
	Array.prototype.removeAt = function (index: number) {
		if (index < 0 || index >= this.length)
			return false;
		this.splice(index, 1);
		return true;
	};
}

if (!Array.prototype.removeFirst) {
	Array.prototype.removeFirst = function (predicate: (value: any, index: number) => boolean, fromIndex?: number): boolean {
		if (predicate == null)
			return false;
		if (fromIndex == null)
			fromIndex = 0;
		else if (fromIndex < 0 || fromIndex >= this.length)
			return false;
		for (let i = fromIndex; i < this.length; i++) {
			if (predicate(this[i], i)) {
				this.splice(i, 1);
				return true;
			}
		}
		return false;
	};
}

if (!Array.prototype.removeAll) {
	Array.prototype.removeAll = function (predicate: (value: any, index: number) => boolean, fromIndex?: number): number {
		if (fromIndex == null)
			fromIndex = 0;
		if (fromIndex < 0 || fromIndex >= this.length)
			return 0;

		if (predicate == null) {
			var length = this.length;
			this.splice(fromIndex, this.length);
			return length - this.length;
		}

		// 逆序遍历，防止下标错乱
		var count = 0;
		for (let i = this.length - 1; i >= fromIndex; i--) {
			if (predicate(this[i], i)) {
				this.splice(i, 1);
				count++;
			}
		}
		return count;
	};
}

if (!Array.prototype.clear) {
	Array.prototype.clear = function () {
		this.splice(0, this.length);
	}
}

if (!Array.prototype.clone) {
	Array.prototype.clone = function (): any {
		return this.slice(0);
	}
}

if (!Array.create) {
	function createMultiDimensionArray(dimensionLength: number[]): any {
		if (dimensionLength.length == 0)
			return null;
		let array = new Array(dimensionLength[0]);
		if (dimensionLength.length > 1) {
			let subDimension = dimensionLength.slice(1);
			for (let i = 0; i < array.length; i++) {
				array[i] = createMultiDimensionArray(subDimension);
			}
		}
		return array;
	}
	Array.create = function (...dimensionLength: number[]): any {
		return createMultiDimensionArray(dimensionLength);
	}
}


interface Array<T> {
	seek(func?: Function): boolean;
}
(<any>Array.prototype).seek = function (func?: Function) {
	if (func == null) {
		return false;
	}
	for (let item of this) {
		if (func(item)) {
			return true;
		}
	}
	return false;
}
interface Array<T> {
	first(func?: Function): T;
}
(<any>Array.prototype).first = function (func?: Function) {
	if (func == null) {
		return this[0];
	}
	for (let item of this) {
		if (func(item)) {
			return item;
		}
	}
	return null;
}
interface Array<T> {
	find(func?: Function): number;
}
(<any>Array.prototype).find = function (func?: Function) {
	if (func == null) {
		return -1;
	}
	for (let i: number = 0; i < this.length; i++) {
		if (func(this[i])) {
			return i;
		}
	}
	return -1;
}
interface Array<T> {
	deletefirst(func?: Function): number;
}
(<any>Array.prototype).deletefirst = function (func?: Function) {
	if (func == null) {
		return -1;
	}
	for (let i: number = 0; i < this.length; i++) {
		if (func(this[i])) {
			this.splice(i, 1);
			return i;
		}
	}
	return -1;
}

interface Array<T> {
	last(func?: Function): T;
}
(<any>Array.prototype).last = function (func?: Function) {
	if (!(this instanceof Array)) {
		return null;
	}
	return this[this.length - 1];
}

interface Array<T> {
	random(): T;
}

interface Array<T> {
	distinct();
}
(<any>Array.prototype).distinct = function () {
	let h = {};
	let arr = [];
	for (var i = 0; i < this.length; i++) {
		if (!h[this[i]]) {
			h[this[i]] = true;
			arr.push(this[i]);
		}
	}
	return arr;
}
interface Array<T> {
	deepcopy();
}
(<any>Array.prototype).deepcopy = function () {
	return this.slice(0);
}


if (!Array.prototype.reverse) {
	Array.prototype.reverse = function () {
		var arr = [];
		var len = this.length;
		for (var i = 0; i < len; i++) {
			arr.unshift(this[i]);
		}
		return arr;
	}
}