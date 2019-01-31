/**
 * 配置文件解析
 * @author suo 
 */
class GM {
	/**
    * 单例
    */
	private static _instance: GM;
	/**
    * 获取单例
    */
	public static get instance(): GM {
		if (this._instance == null) {
			this._instance = new GM();
		}
		return this._instance;
	}
	public constructor() {
	}
	public openGM(type){

	}
	private gmList = [];
	/**
	 * 关闭指定GM
	 */
	public open(t: GM.Type) {
		this.gmList[t] = true;
	}
	/**
	 * 关闭指定GM
	 */
	public close(t: GM.Type) {
		this.gmList[t] = false;
	}
	/**
	 * 指定GM是否开启
	 */
	public isOpen(t: GM.Type): boolean {
		return this.gmList[t] ? true : false;
	}

	public typeToString(v: GM.Type): string {
		if (v == GM.Type.FishPath) {
			return "鱼路径";
		}
		else if (v == GM.Type.BulletPath) {
			return "子弹路径";
		}
		else if (v == GM.Type.Jackpot) {
			return "奖池";
		}
		else if (v == GM.Type.freeLogo) {
			return "免费标识";
		}
		else if (v == GM.Type.fapao) {
			return "测试发炮";
		}
	}
}
module GM {
	export enum Type {
		Min = 1,
		FishPath = 1,
		BulletPath = 2,
		Jackpot = 3,
		freeLogo = 4,
		fapao = 5,
		Max = 5,
	}
}