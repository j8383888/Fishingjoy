/**
 * 超级炸弹鱼
 * @author suo
 */
module gameObject {
	export class BoomFishEx extends Fish {

		public constructor() {
			super();
		}
		/**
         * 初始化一次
         */
		public loadConfigData(data: IFishConfigData): void {
			super.loadConfigData(data);
			let eff: CustomImage = this._imagePlayer.get("BoomFishEx_eff2");
			eff.blendMode = egret.BlendMode.ADD;


		}

		/**
		 * 被冻住了
		 */
		public isFreeze(): void {
			super.isFreeze();
			let eff: CustomImage = this._imagePlayer.get("BoomFishEx_eff2");
			egret.Tween.pauseTweens(eff);
			egret.Tween.pauseTweens(this._moviePlayer);
			egret.Tween.pauseTweens(this.colliderAry[0]);
			let idle: egret.MovieClip = this._moviePlayer.getMovieClipByKey("idle");
			egret.Tween.pauseTweens(idle);
		}

		/**
		 * 恢复正常状态
		 */
		public isResetNormal(): void {
			super.isResetNormal();
			let eff: CustomImage = this._imagePlayer.get("BoomFishEx_eff2");
			egret.Tween.resumeTweens(eff);
			egret.Tween.resumeTweens(this._moviePlayer);
			egret.Tween.resumeTweens(this.colliderAry[0]);
			let idle: egret.MovieClip = this._moviePlayer.getMovieClipByKey("idle");
			egret.Tween.resumeTweens(idle);
		}

		/**
         * 初始化
         */
		public initialize(): void {
			super.initialize();
			this.moviePlayer.x = - 50;
			let eff: CustomImage = this._imagePlayer.get("BoomFishEx_eff2");
			FishingJoy.UIUtil.setBreatheTween(eff, 1000);
			this.setJumpTween(this.moviePlayer, 70, -70);
			this.setJumpTween(this.colliderAry[0], 70, -70);
			let idle: egret.MovieClip = this._moviePlayer.getMovieClipByKey("idle");
			egret.Tween.get(idle, { loop: true }).to({ scaleY: 0.95 }, 250).to({ scaleY: 1.05 }, 250).to({ scaleY: 1 }, 125)
		}

		/**
		 * 设置对象跳跃动画
		 */
		public setJumpTween(target: egret.DisplayObject, JumpMaxX: number, JumpMinX: number, durationTime: number = 800, waitTime: number = 500): void {
			egret.Tween.get(target, {
				onChange: () => {
					let x: number = target.x
					target.y = x * x / 70 - 100;
				}
			}).to({ x: JumpMaxX }, durationTime).wait(waitTime).to({ x: JumpMinX }, durationTime).wait(waitTime).call(this.setJumpTween, this, [target, JumpMaxX, JumpMinX]);
		}

		/**
		 * 反初始化
		 */
		public uninitialize(): void {
			let eff: CustomImage = this._imagePlayer.get("BoomFishEx_eff2");
			egret.Tween.removeTweens(eff);
			egret.Tween.removeTweens(this._moviePlayer);
			egret.Tween.removeTweens(this.colliderAry[0]);
			let idle: egret.MovieClip = this._moviePlayer.getMovieClipByKey("idle");
			egret.Tween.removeTweens(idle);
			super.uninitialize();
		}

		/**
	 	 * 播放死亡动画并回收到资源池
	 	 */
		public playDieMov(cb: Handler): void {
			egret.Tween.removeTweens(this._moviePlayer);
			egret.Tween.removeTweens(this.colliderAry[0]);
			let idle: egret.MovieClip = this._moviePlayer.getMovieClipByKey("idle");
			egret.Tween.removeTweens(idle);

			/*爆炸鱼爆炸*/
			let burstMov: egret.MovieClip = Pool.getItemByCreateFun(Pool.BoomExSelf, Handler.create(this, this._creatEff, null, true))
			burstMov.x = this.x;
			burstMov.y = this.y;
			FishingJoy.LayerManager.instance.addToLayer(burstMov, LAYER.EFFECT_ROTATION);
			FishingJoy.UIUtil.playAndAutoRemove(burstMov, 1, Handler.create(null, () => {
				Pool.recover(Pool.BoomExSelf, burstMov);
				cb.run();
			}, null, true));
		}

		/**
		 * 创建特效
		 */
		private _creatEff(): egret.MovieClip {
			let mov = FishingJoy.UIUtil.creatMovieClip("BoomEx_dieEff");
			mov.frameRate = 8;
			return mov;
		}
	}
}