/**
 * 全局变量
 * @author suo
 */
class GlobeVars {
	/**
	 * 是否滑动中 
	 */
	public static isDraging: boolean = false;

	/**
	 * 金色浪退潮
	 */
	public static isGoldEbb: boolean = false;
	/**
	 * 金色浪影片剪辑
	 */
	public static ebbTideMov: egret.MovieClip;
	/**
	 * 是否冰冻
	 */
	public static isFreeze: boolean = false;
	/**
	 * 是否延迟退潮（冰冻期间）
	 */
	public static isDelayEbb: boolean = false;
	/**
	 * 延迟退潮句柄
	 */
	public static delayEbbHandler: Handler;

	public constructor() {
	}

	public static get FreezeTime(): number {
		return RES.getRes("TablePropConfig_json")[3].useTime;
	}
	/**
	 * 创建捕鱼通用金币
	 */
	public static creatCommonCoin(): egret.MovieClip {
		let mov = FishingJoy.UIUtil.creatMovieClip("by_newJinBi");
		mov.scaleX = mov.scaleY = 0.6;
		mov.frameRate = 8;
		return mov;
	}

	/**
	 * 创建捕鱼通用金币
	 */
	public static creatCommonGrayCoin(): egret.MovieClip {
		let mov = FishingJoy.UIUtil.creatMovieClip("by_newYingBi");
		mov.scaleX = mov.scaleY = 0.6;
		mov.frameRate = 8;
		return mov;
	}
}