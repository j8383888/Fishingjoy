/**
 * 视图模板
 * @author suo
 */
module FishingJoy {
	export class FishBtnView extends eui.Component implements BaseUIView {

		/**
		 * GM
		 */
		public gmGroup: eui.Group;
		/**
		 * GM
		 */
		public gmCheckBox: eui.CheckBox;
		/**
		 * 退出游戏按钮
		 */
		public exitGameBtn: tool.Button;
		/**
		 * 切换场景按钮
		 */
		public sceneSwitching: tool.Button;
		/**
		 * 急速射击按钮
		 */
		public fastShoot: tool.Button;
		/**
		 * 瞄准射击按钮
		 */
		public aimShoot: tool.Button;
		/**
		 * 自动射击按钮
		 */
		public autoShoot: tool.Button;
		/**
		 * 冰冻按钮
		 */
		public frozenShoot: tool.Button;
		/**
		 * 按钮容器
		 */
		public BtnGroup: eui.Group;
		/**
		 * 帮助按钮
		 */
		public helpBtn: tool.Button
		/**
		 * 冰冻选中效果
		 */
		public freezeEff: egret.MovieClip
		/**
		 * 瞄准选中效果
		 */
		public aimShootEff: egret.MovieClip;
		/**
		 * 自动射击效果
		 */
		public autoShootEff: egret.MovieClip;
		/**
		 * 冰冻次数
		 */
		public frozenQuantity: eui.Label;
		/**
		 * 自动射击次数
		 */
		public autoQuantity: eui.Label;
		/**
		 * 瞄准次数
		 */
		public aimQuantity: eui.Label;



		/**
		 * 测试用 奖池显示
		 */
		public goldPoolLabel: eui.Label;
		public constructor() {
			super();
			this.skinName = "by_BtnPanelSkin";
		}

		/**
		 * 初始化
		 */
		public onInit(): void {
			this._onResize();

			FishingJoy.LayerManager.instance.addToLayer(this, LAYER.UI);
			this.exitGameBtn = new tool.Button(this.skin["exitGameBtn"]);
			this.sceneSwitching = new tool.Button(this.skin["sceneSwitching"]);
			this.fastShoot = new tool.Button(this.skin["fastShoot"]);
			this.autoShoot = new tool.Button(this.skin["autoShoot"]);
			this.frozenShoot = new tool.Button(this.skin["frozenShoot"]);
			this.aimShoot = new tool.Button(this.skin["aimShoot"]);
			if (uniLib.Global.lobbyMode) {
				this.sceneSwitching.visible = false;
			}
			this.aimShootEff = UIUtil.creatMovieClip("by_shootTypeEff1");
			this.addChild(this.aimShootEff);
			this.aimShootEff.scaleX = 1.3;
			this.aimShootEff.scaleY = 1.3;
			this.aimShootEff.x = this.aimShoot.x + 100;
			this.aimShootEff.y = 295 - 38;
			this.aimShootEff.visible = false;
			this.aimShootEff.blendMode = egret.BlendMode.ADD;

			this.autoShootEff = UIUtil.creatMovieClip("autoShootEff");
			this.addChild(this.autoShootEff);
			this.autoShootEff.scaleX = 1.3;
			this.autoShootEff.scaleY = 1.3;
			this.autoShootEff.x = this.autoShoot.x + 100;
			this.autoShootEff.y = this.autoShoot.y + 316- 38;
			this.autoShootEff.visible = false;
			this.autoShootEff.blendMode = egret.BlendMode.ADD;

			this.freezeEff = UIUtil.creatMovieClip("aimShootEff");
			this.addChild(this.freezeEff);
			this.freezeEff.scaleX = 1.3;
			this.freezeEff.scaleY = 1.3;
			this.freezeEff.x = this.frozenShoot.x + 100;
			this.freezeEff.y = 508- 38;
			this.freezeEff.visible = false;
			this.freezeEff.blendMode = egret.BlendMode.ADD;


			for (let i: number = GM.Type.Min; i <= GM.Type.Max; i++) {
				let checkBox = new eui.CheckBox();
				checkBox.skinName = GMButtonSkin_fish;
				checkBox.name = i + "";
				checkBox.label = GM.instance.typeToString(i);
				checkBox.width = 120;
				checkBox.height = 50;
				this.gmGroup.addChild(checkBox);
			}
			this.gmCheckBox.visible = false;
			this.gmGroup.visible = false;
			this.goldPoolLabel.visible = false;
			if (!game.Config.isRelease && uniLib.BrowersUtils.GetRequest("debug")) {
				this.gmCheckBox.visible = true;
				this.goldPoolLabel.visible = true;
			}

			this.helpBtn = new tool.Button(this.skin["helpBtn"]);

		}

		private _onResize(): void {
			this.width = uniLib.Global.screenWidth;
			this.height = uniLib.Global.screenHeight;
		}

		/**
		 * 奖池更新
		 */
		public updataGoldPoolLabel(freeGoldPool: number, normalGoldPool: number) {
			this.goldPoolLabel.text = "免费奖池：" + freeGoldPool + "   普通奖池：" + normalGoldPool;
			// this.goldPoolLabel.visible = true;
		}

		/**
		 * 展示时
		 */
		public onShow(): void {

		}

		/**
		 * 清除
		 */
		public clear(): void {

		}

		/**
		 * 隐藏时
		 */
		public onHide(): void {

		}

		/**
		 * 释放时
		 */
		public dispose(): void {
			FishingJoy.LayerManager.instance.removeFromLayer(this);
			GX.GameLayerManager.removeUI(this);
			this.exitGameBtn.dispose()
			this.exitGameBtn = null;
			this.fastShoot.dispose();
			this.fastShoot = null;
			this.autoShoot.dispose();
			this.autoShoot = null;
			this.frozenShoot.dispose();
			this.frozenShoot = null;
			this.aimShoot.dispose();
			this.aimShoot = null;
		}
	}
}