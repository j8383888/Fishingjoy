/**
 * <p> <code>Pool</code> 是对象池类，用于对象的存贮、重复使用。</p>
 * <p>合理使用对象池，可以有效减少对象创建的开销，避免频繁的垃圾回收，从而优化游戏流畅度。</p>
 * 原作者 LayaBox
 * @author suo
 */
class Pool {

	/*自己跳动几笔数值文本*/
	public static jumpCoinText: string = "jumpCoinText";
	/*别人跳动几笔数值文本*/
	public static jumpCoinTexts: string = "jumpCoinTexts";
	/*免费游戏数值文本*/
	public static jumpCoinTextsFree: string = "jumpCoinTextsFree";
	/*飞行金币*/
	public static flyCoin: string = "flyCoin"
	/*一网打进*/
	public static yiWangDaJin: string = "yiWangDaJin";
	/*炸弹鱼*/
	public static boomIMG: string = "boomIMG";
	/*转场浪花特效*/
	public static langbo: string = "langbo";
	/*转场浪花特效2*/
	public static langbo1: string = "langbo1";
	/*碰撞器*/
	public static collider: string = "collider"
	/*点击水波纹*/
	public static clickingWaterWave: string = "clickingWaterWave"

	/*灰色爆炸底光*/
	public static by_BurstGray: string = "by_BurstGray"
	/*金色爆炸底光*/
	public static by_BurstGold: string = "by_BurstGold";
	/*大金币爆炸*/
	public static by_BurstMoneyGold_S: string = "by_BurstMoneyGold_S";
	/*小金币爆炸*/
	public static by_BurstMoneyGray_S: string = "by_BurstMoneyGray_S";
	/*大金币爆炸自己*/
	public static by_BurstMoneyGold_B: string = "by_BurstMoneyGold_B";
	/*大金币爆炸别人*/
	public static by_BurstMoneyGray_B: string = "by_BurstMoneyGray_B";

	/*电效果的线*/
	public static ElectricEffLine: string = "ElectricEffLine";
	/*电效果的效果*/
	public static ElectricEffBurst: string = "ElectricEffBurst";
	/*电效果的效果*/
	public static ElectricEffBurst_Big: string = "ElectricEffBurst_Big";
	/*小爆炸*/
	public static Boom: string = "Boom";
	/*高倍率鱼效果*/
	public static HighOddsDieEff: string = "HighOddsDieEff";
	/*超级鱼爆炸特效自己*/
	public static BoomExSelf: string = "BoomExSelf";
	/*金龙宝藏金币堆1*/
	public static GoldPile1: string = "GoldPile1";
	/*金龙宝藏金币堆2*/
	public static GoldPile2: string = "GoldPile2";
	/*通用旋转金币 （禁止缩放，改变金币属性） */
	public static commonGold: string = "commonGold";

	/*通用旋转银色金币 （禁止缩放，改变金币属性） */
	public static commonGrayGold: string = "commonGrayGold";
	/*通用图片*/
	public static commonIMG: string = "commonIMG";

	/**@private  对象存放池。*/
	private static _poolDic: Object = {};
	/*标识组*/
	private static _signAry: string[] = [];

	public constructor() {
	}

	/**
	 * 根据对象类型标识字符，获取对象池。
	 * @param sign 对象类型标识字符。
	 * @return 对象池。
	 */
	public static getPoolBySign(sign: string): Array<any> {
		return this._poolDic[sign] || (this._poolDic[sign] = []);
	}

	/**
	 * 清除对象池的对象。
	 * @param sign 对象类型标识字符。
	 */
	public static clearBySign(sign: string): void {
		if (this._signAry.indexOf(sign) != -1) {
			this._signAry.remove(sign);
		}
		if (this._poolDic[sign]) this._poolDic[sign].length = 0;
	}

	/**
	 * 将对象放到对应类型标识的对象池中。
	 * @param sign 对象类型标识字符。
	 * @param item 对象。
	 */
	public static recover(sign: string, item: Object): void {
		this.getPoolBySign(sign).push(item);
	}

	/**
	 * <p>根据传入的对象类型标识字符，获取对象池中此类型标识的一个对象实例。</p>
	 * <p>当对象池中无此类型标识的对象时，则根据传入的类型，创建一个新的对象返回。</p>
	 * @param sign 对象类型标识字符。
	 * @param cls 用于创建该类型对象的类。
	 * @return 此类型标识的一个对象。
	 */
	public static getItemByClass(sign: string, cls: any): any {
		if (this._signAry.indexOf(sign) == -1) {
			this._signAry.push(sign);
		}
		var pool: any[] = this.getPoolBySign(sign);
		var rst: Object = pool.length ? pool.pop() : new cls();
		return rst;
	}

	/**
	 * <p>根据传入的对象类型标识字符，获取对象池中此类型标识的一个对象实例。</p>
	 * <p>当对象池中无此类型标识的对象时，则使用传入的创建此类型对象的函数，新建一个对象返回。</p>
	 * @param sign 对象类型标识字符。
	 * @param createFun 用于创建该类型对象的方法。
	 * @return 此类型标识的一个对象。
	 */
	public static getItemByCreateFun(sign: string, createFun: Handler): any {
		if (this._signAry.indexOf(sign) == -1) {
			this._signAry.push(sign);
		}
		var pool: any[] = this.getPoolBySign(sign);
		var rst: Object = pool.length ? pool.pop() : createFun.run();
		return rst;
	}

	/**
	 * 根据传入的对象类型标识字符，获取对象池中已存储的此类型的一个对象，如果对象池中无此类型的对象，则返回 null 。
	 * @param sign 对象类型标识字符。
	 * @return 对象池中此类型的一个对象，如果对象池中无此类型的对象，则返回 null 。
	 */
	public static getItem(sign: string): any {
		var pool: any[] = this.getPoolBySign(sign);
		var rst: Object = pool.length ? pool.pop() : null;
		return rst;
	}

	/**
	 * 释放
	 */
	public static clearAll(): void {
		for (let i: number = 0; i < this._signAry.length; i++) {
			let sign: string = this._signAry[i];
			let itemAry: any[] = this._poolDic[sign]
			for (let j: number = 0; j < itemAry.length; j++) {
				if (itemAry[j]) {
					if (itemAry[j] instanceof particle.GravityParticleSystem) {
						itemAry[j].stop();
					}
					itemAry[j] = null;
				}
			}
			itemAry.length = 0;
		}
		this._signAry.length = 0;
	}
}