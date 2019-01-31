/**
 * 金蟾
 * @author suo
 */
module gameObject {
	export class GoldToad extends Fish {

		public constructor() {
			super();
		}

		public loadConfigData(data: IFishConfigData): void {+
			super.loadConfigData(data)
			let eff: egret.MovieClip = this.moviePlayer.getMovieClipByKey("effect");
			eff.parent.addChildAt(eff, 0);
			eff.scaleX = eff.scaleY = 0.9;
		}

		/**
		 * 被冻住了
		 */
		public isFreeze(): void {
			super.isFreeze();
			let eff: egret.MovieClip = this.moviePlayer.getMovieClipByKey("effect");
			eff.stop();
			egret.Tween.pauseTweens(eff);
		}

		/**
		 * 恢复正常状态
		 */
		public isResetNormal(): void {
			super.isResetNormal();
			let eff: egret.MovieClip = this.moviePlayer.getMovieClipByKey("effect");
			eff.play(-1);
			egret.Tween.resumeTweens(eff);
		}

		/**
         * 初始化
         */
		public initialize(): void {
			super.initialize();
			// this.touchEnabled = true;
			this._moviePlayer.alpha = 1;
			this.moviePlayer.scaleX = 0.75;
			this.moviePlayer.scaleY = 0.75;
			let eff: egret.MovieClip = this.moviePlayer.getMovieClipByKey("effect");
			eff.gotoAndPlay(1, -1);
			eff.visible = true;
			egret.Tween.get(eff, { loop: true }).to({ rotation: 360 }, 10000);
		}

		/**
		 * 反初始化
		 */
		public uninitialize(): void {
			let eff: egret.MovieClip = this.moviePlayer.getMovieClipByKey("effect");
			eff.visible = false;
			eff.stop();
			egret.Tween.removeTweens(eff);
			super.uninitialize();
		}

		/**
	 	 * 播放死亡动画并回收到资源池
	 	 */
		public playDieMov(cb: Handler): void {
			egret.Tween.get(this._moviePlayer).to({ scaleX: 4, scaleY: 4, alpha: 0, rotation: 720 }, 1500, egret.Ease.quadInOut).call(() => {
				if (cb) {
					cb.run();
				}
			}, this)
		}
	}
}