/**
 * 玩家大胜表现
 * @author suo
 */
module gameObject {
	export class MasterWinEff extends GameObjectRender {

		/**
		 * 文本
		 */
		private _txt: eui.BitmapLabel = new eui.BitmapLabel();



		/**
		 * 获得胜利等级
		 */
		public get winLevel(): number {
			return (<gameObject.IMasterWinEffVars>this.varsData).winLevel
		}
		/**
		 * 获得赢的钱
		 */
		public get money(): number {
			return (<gameObject.IMasterWinEffVars>this.varsData).money
		}

		public constructor() {
			super();
		}

		/**
     	 * 初始化一次
     	 */
		public loadConfigData(initOnce: IConfigData): void {
			this._txt.font = "flutters1_fnt";
			this._txt.textAlign = "middle";
			this._txt.y = 77;
			this.addChild(this._txt);

			let dibuguangyun: egret.MovieClip = this._moviePlayer.getMovieClipByKey("masterWin_dibuguangyun");
			this.addChildAt(dibuguangyun, 0);
		}

		/**
         * 初始化
         */
		public initialize(): void {
			super.initialize();
			if (this.winLevel == 2) {
				this._moviePlayer.play("masterWin_facai", 1, null, null, true)
				this._moviePlayer.play("masterWin_facaisaoguang", -1, 1000);

			}
			else if (this.winLevel == 3) {
				this._moviePlayer.play("masterWin_baofu", 1, null, null, true)
				this._moviePlayer.play("masterWin_baofu1", -1, 1000);
			}


			this._moviePlayer.play("masterWin_xinxin1", -1, 1000);
			this._moviePlayer.play("masterWin_xinxin2", -1, 2000)
			this._txt.text = GX.GoldFormat(this.money, true, true, false)
			this._txt.x = -this._txt.width / 2
			egret.Tween.get(this._txt).to({ alpha: 1 }, 500);

			FishingJoy.Laya.timer.once(3000, this, this._playComplete);
		}

		/**
		 * 文字播放完成
		 */
		private _playComplete(): void {
			egret.Tween.get(this).to({ alpha: 0 }, 1000).call(GameObjectFactory.instance.recoverGameObject, GameObjectFactory, [this])
		}


		/**
		 * 重置
		 */
		public reset(): void {
			let dibuguang: egret.MovieClip = this._moviePlayer.getMovieClipByKey("masterWin_dibuguangyun");
			dibuguang.stop();
			dibuguang.visible = false;
			this.alpha = 1;
			this._txt.alpha = 0;
			egret.Tween.removeTweens(this);
			this._moviePlayer.hideAll();
		}

		/**
         * 反初始化
         */
		public uninitialize(): void {
			this.reset();
			super.uninitialize();
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			super.dispose()
		}
	}
}