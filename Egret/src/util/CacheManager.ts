/**
 * @private
 * 对象缓存统一管理类
 * @author suo
 */
class CacheManager {
	/**
	 * 单次清理检测允许执行的时间，单位ms。
	 */
	public static loopTimeLimit:number = 2;
	/**
	 * @private
	 */
	private static _cacheList:any[] = [];
	/**
	 * @private
	 * 当前检测的索引
	 */
	private static  _index:number = 0;
	
	public constructor() {
	
	}
	
	/**
	 * 注册cache管理函数
	 * @param disposeFunction 释放函数 fun(force:Boolean)
	 * @param getCacheListFunction 获取cache列表函数fun():Array
	 *
	 */
	public static regCacheByFunction(disposeFunction:Function, getCacheListFunction:Function):void {
		this.unRegCacheByFunction(disposeFunction, getCacheListFunction);
		var cache:Object;
		cache = {tryDispose: disposeFunction, getCacheList: getCacheListFunction};
		this._cacheList.push(cache);
	}
	
	/**
	 * 移除cache管理函数
	 * @param disposeFunction 释放函数 fun(force:Boolean)
	 * @param getCacheListFunction 获取cache列表函数fun():Array
	 *
	 */
	public static unRegCacheByFunction(disposeFunction:Function, getCacheListFunction:Function):void {
		var i:number, len:number;
		len = this._cacheList.length;
		for (i = 0; i < len; i++) {
			if (this._cacheList[i].tryDispose == disposeFunction && this._cacheList[i].getCacheList == getCacheListFunction) {
				this._cacheList.splice(i, 1);
				return;
			}
		}
	}
	
	/**
	 * 强制清理所有管理器
	 *
	 */
	public static forceDispose():void {
		var i:number, len:number = this._cacheList.length;
		for (i = 0; i < len; i++) {
			this._cacheList[i].tryDispose(true);
		}
	}
	
	/**
	 * 开始检测循环
	 * @param waitTime 检测间隔时间
	 *
	 */
	public static beginCheck(waitTime:number = 15000):void {
		// FishingJoy.Laya.timer.loop(waitTime, null, _checkLoop);
	}
	
	/**
	 * 停止检测循环
	 *
	 */
	public static stopCheck():void {
		// FishingJoy.Laya.timer.clear(null, _checkLoop);
	}
	
	/**
	 * @private
	 * 检测函数
	 */
	private static _checkLoop():void {
		var cacheList:any[] = this._cacheList;
		if (cacheList.length < 1) return;
		var tTime:number = Date.now();
		var count:number;
		var len:number;
		len = count = cacheList.length;
		while (count > 0) {
			this._index++;
			this._index = this._index % len;
			cacheList[this._index].tryDispose(false);
			if (Date.now() - tTime > this.loopTimeLimit) break;
			count--;
		}
	}
}