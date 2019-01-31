
/**
 * @private
 * 基于个数的对象缓存管理器
 * 原作者 layaBox
 * @author suo
 */
class PoolCache {
		
	/**
	 * 对象在Pool中的标识
	 */
	public sign:string;
	/**
	 * 允许缓存的最大数量
	 */
	public maxCount:number = 1000;
	
	/**
	 * 获取缓存的对象列表
	 * @return
	 *
	 */
	public getCacheList():any[] {
		return Pool.getPoolBySign(this.sign);
	}
	
	/**
	 * 尝试清理缓存
	 * @param force 是否强制清理
	 *
	 */
	public tryDispose(force:Boolean):void {
		var list:any[];
		list = Pool.getPoolBySign(this.sign);
		if (list.length > this.maxCount) {
			list.splice(this.maxCount, list.length - this.maxCount);
		}
	}
	
	/**
	 * 添加对象缓存管理
	 * @param sign 对象在Pool中的标识
	 * @param maxCount 允许缓存的最大数量
	 *
	 */
	public static addPoolCacheManager(sign:string, maxCount:number = 100):void {
		var cache:PoolCache;
		cache = new PoolCache();
		cache.sign = sign;
		cache.maxCount = maxCount;
		CacheManager.regCacheByFunction(cache.tryDispose, cache.getCacheList);
	}
}