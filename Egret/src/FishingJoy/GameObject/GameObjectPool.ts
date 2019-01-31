/**
 * 对象池(现在相同sign对象 可能分别存在一级二级资源池 仅根据引用计数区分所在资源池)
 * @author suo 
 */
module gameObject {
	export class GameObjectPool {

		/**
		 * 单例
		 */
		private static _instance: GameObjectPool = null;
		/**
		 * 最大缓存数量
		 */
		private readonly MAX_CAHCHE_NUM: number = 300;
		/**
		 * 当前缓存池内资源计数
		 */
		private _curCacheObjNum: number = 0;
		/**
		 * 一级缓存用于缓存只被用了一次的资源
		 */
		private _objectFirstPool: SimpleMap<gameObject.GameObject[]> = new SimpleMap<gameObject.GameObject[]>();
		/**
		 * 二级缓存用于缓存经常使用的资源，从资源池拿去先从当前资源池拿取
		 */
		private _objectSecondPool: SimpleMap<gameObject.GameObject[]> = new SimpleMap<gameObject.GameObject[]>();

		constructor() {
		}

		/**
		 * 获得单例
		 */
		public static get instance(): GameObjectPool {
			if (this._instance == null) {
				this._instance = new GameObjectPool();
			}
			return this._instance;
		}

		/**
		 * 尝试从对象池获取对象
		 */
		public tryGetGameObjInPool(sign: GAMEOBJECT_SIGN): gameObject.GameObject {
			let gameObj: GameObject = null;
			let gameObjAry: Array<GameObject> = null;

			/*先遍历二级缓存*/
			gameObjAry = this._objectSecondPool.get(sign);
			if (gameObjAry != null && gameObjAry.length > 0) {
				gameObj = gameObjAry.shift();
				this._curCacheObjNum--;
			}
			/*然后遍历一级缓存*/
			if (gameObj == null) {
				gameObjAry = this._objectFirstPool.get(sign);
				if (gameObjAry != null && gameObjAry.length > 0) {
					gameObj = gameObjAry.shift();
					this._curCacheObjNum--;
				}
			}
			return gameObj;
		}

		/**
		 * 对象回收
		 */
		public recoverGameObject(gameObj: GameObject): void {
			// this._calCacheNum();
			var gameObjFirstAry: Array<gameObject.GameObject> = null;
			var gameObjSecAry: Array<gameObject.GameObject> = null

			let sign: GAMEOBJECT_SIGN = gameObj.sign;
			//对象被多次引用 进入二级缓存
			if (gameObj.refCount >= 2) {
				gameObjSecAry = this._objectSecondPool.get(sign);
				if (gameObjSecAry == null) {
					gameObjSecAry = new Array<gameObject.GameObject>();
					this._objectSecondPool.set(sign, gameObjSecAry);
				}
				if (gameObjSecAry.indexOf(gameObj) == -1) {
					gameObjSecAry.push(gameObj);
					this._curCacheObjNum++;
				}
			}
			/*引用计数为1时 进入一级缓存*/
			else {
				gameObjFirstAry = this._objectFirstPool.get(sign);
				if (gameObjFirstAry == null) {
					gameObjFirstAry = new Array<gameObject.GameObject>();
					this._objectFirstPool.set(sign, gameObjFirstAry);
				}

				if (gameObjFirstAry.indexOf(gameObj) == -1) {
					gameObjFirstAry.push(gameObj)
					this._curCacheObjNum++;
				}
			}

			/*数量过大时 清理资源池*/
			if (this._curCacheObjNum > this.MAX_CAHCHE_NUM) {
				this._cleanFirstPool();
			}
		}

		/**
		 * 清理资源池 清理所有一级缓存
		 */
		private _cleanFirstPool(): void {
			this._clearPool(this._objectFirstPool)
			if (this._curCacheObjNum >= this.MAX_CAHCHE_NUM) {
				this._deepCleanCachePool();
			}
		}

		/**
		 * 清理二级缓存
		 */
		private _deepCleanCachePool(): void {
			this._clearPool(this._objectSecondPool)
		}

		/**
		 * 清理缓存
		 */
		private _clearPool(cacheMap: SimpleMap<GameObject[]>) {
			let len = cacheMap.length;
			let gameObjAry: Array<gameObject.GameObject> = null;
			let deleteObjNum: number = 0;
			for (var i: number = 0; i < len; i++) {
				gameObjAry = cacheMap.getByKeyIndex(i);
				let copy: gameObject.GameObject[] = gameObjAry.slice();
				let copyLen: number = copy.length;
				for (var j: number = 0; j < copyLen; j++) {
					let gameObj: gameObject.GameObject = copy[j]
					if (gameObj.canDispose) {
						deleteObjNum += 1;
						gameObjAry.remove(gameObj)
						gameObj.dispose();
						gameObj = null;
					}
				}
			}
			this._curCacheObjNum -= deleteObjNum;
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			this._clearPool(this._objectFirstPool);
			this._clearPool(this._objectSecondPool);
			this._objectFirstPool.clear();
			this._objectSecondPool.clear();
			GameObjectPool._instance = null;
		}

		/**
		 * 统计资源池内对象个数
		 */
		private _calCacheNum(): number {
			let len: number = this._objectFirstPool.length;
			let len1: number = this._objectSecondPool.length;
			let map: SimpleMap<GameObject[]> = this._objectFirstPool.copy()
			let map1: SimpleMap<GameObject[]> = this._objectSecondPool.copy();
			let gameObjAry: Array<gameObject.GameObject> = null;
			let firstCacheNum: number = 0;
			let secondCacheNum: number = 0;
			for (let i: number = 0; i < len; i++) {
				gameObjAry = map.getByKeyIndex(i);
				firstCacheNum += gameObjAry.length;
			}
			for (let j: number = 0; j < len1; j++) {
				gameObjAry = map1.getByKeyIndex(j);
				secondCacheNum += gameObjAry.length;
			}
			let sum = firstCacheNum + secondCacheNum
			egret.log("资源池内缓存对象计数：" + sum);
			return sum
		}
	}
}