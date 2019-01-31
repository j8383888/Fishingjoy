/**
 * 河豚
 * @author suo
 */
module gameObject {
	export class GlobeFish extends Fish {

		/**
		 * 生命值
		 */
		public life: number;
		/**
		 * 上一次特效
		 */
		private _lastEff: eui.Image;
		/**
		 * 状态阶段
		 */
		public state: number;
		/**
		 * 是否处于击中状态
		 */
		private _isHitEff: boolean = false;
		/**
		 * 字体
		 */
		private _font: eui.BitmapLabel = new eui.BitmapLabel();


		public constructor() {
			super();
		}

		/**
         * 初始化一次
         */
		public loadConfigData(data: IFishConfigData): void {
			super.loadConfigData(data);
			this._imagePlayer.hideAll();
			let effect3: eui.Image = this._imagePlayer.get("effec3");
			effect3.scaleX = effect3.scaleY = 1.2
			this._font.font = "hetun_font_fnt";
			this._font.text = "+150";
			this._font.once(egret.Event.RENDER, () => {
				this._font.anchorOffsetX = this._font.width / 2;
				this._font.anchorOffsetY = this._font.height / 2;
			}, null)

			this._font.y = 100;
			this._font.alpha = 0;
			this.addChild(this._font);


			let mov: egret.MovieClip = this._moviePlayer.getMovieClipByKey("effect");
			mov.scaleX = mov.scaleY = 2;
		}

		/**
		 * 被冻住了
		 */
		public isFreeze(): void {
			super.isFreeze();
			if (this._lastEff) {
				egret.Tween.pauseTweens(this._lastEff);
			}
		}

		/**
		 * 获得鱼游动时的Mov
		 */
		public get IdleMov(): egret.MovieClip {
			if (this.state == 1) {
				return this._moviePlayer.getMovieClipByKey("hit");
			}
			else if (this.state == 2) {
				return this._moviePlayer.getMovieClipByKey("hit2");
			}
			else if (this.state == 3) {
				return this._moviePlayer.getMovieClipByKey("hit3");
			}
		}

		/**
		 * 设置倍率
		 */
		private _setOddsFont(odds: number): void {
			this._font.alpha = 1;
			if (this.scaleY < 0) {
				this._font.scaleX = -0.1;
				this._font.scaleY = 0.1
				this._font.rotation = 10
				this._font.x = -40;
				egret.Tween.get(this._font).to({ scaleX: -1, scaleY: 1 }, 500, function (t) {
					return (--t * t * ((2.5 + 1) * t + 2.5) + 1);
				});
			}
			else {
				this._font.scaleX = 0.1;
				this._font.scaleY = 0.1
				this._font.rotation = 10
				this._font.x = 0;
				egret.Tween.get(this._font).to({ scaleX: 1, scaleY: 1 }, 500, function (t) {
					return (--t * t * ((2.5 + 1) * t + 2.5) + 1);
				});
			}

			this._font.text = "x" + odds;
			FishingJoy.Laya.timer.once(3000, this, this._fontFade);
		}

		/**
		 * 字体淡出
		 */
		private _fontFade(): void {
			egret.Tween.get(this._font, null, null, true).to({ alpha: 0 }, 500)
		}


		/**
		 * 播放击中效果
		 */
		protected _playCustomHitEff(): void {
			if (this._isHitEff) {
				return;
			}
			this._isHitEff = true;

			if (this.state == 1) {
				FishingJoy.Laya.timer.once(1000, this, this._resetHitMov);
				this._moviePlayer.switchAni("hit", -1);
			}
			else if (this.state == 2) {
				FishingJoy.Laya.timer.once(1000, this, this._resetHitMov);
				this._moviePlayer.switchAni("hit2", -1);
			}
			else if (this.state == 3) {
				FishingJoy.Laya.timer.once(1000, this, this._resetHitMov);
				this._moviePlayer.switchAni("hit3", -1);
			}
		}

		/**
		 * 重置击中Mov
		 */
		private _resetHitMov(): void {
			if (this.state == 1) {
				this._isHitEff = false;
				this._moviePlayer.switchAni("idle", -1);
			}
			else if (this.state == 2) {
				this._isHitEff = false;
				this._moviePlayer.switchAni("idle2", -1);
			}
			else if (this.state == 3) {
				this._isHitEff = false;
				this._moviePlayer.switchAni("idle3", -1);
			}
		}

		/**
		 * 恢复正常状态
		 */
		public isResetNormal(): void {
			super.isResetNormal();
			if (this._lastEff) {
				egret.Tween.resumeTweens(this._lastEff);
			}
		}

		/**
         * 初始化
         */
		public initialize(): void {
			super.initialize();
			this.updateState(1);
		}

		/**
		 * 更新河豚状态
		 */
		public updateState(state: number, odds: number = 50): void {
			if (this._lastEff) {
				this._lastEff.visible = false;
				egret.Tween.removeTweens(this._lastEff);
			}
			this.state = state;
			if (this._isHitEff) {
				FishingJoy.Laya.timer.clear(this, this._resetHitMov);
			}

			if (state == 1) {
				this._moviePlayer.switchAni("idle", -1);
				let effect1: eui.Image = this._imagePlayer.get("effec1");
				effect1.visible = true;
				egret.Tween.get(effect1, { loop: true }).to({ rotation: 360 }, 10000);
				this.colliderAry[0].setTo(-30, 0, 80);
				this._lastEff = effect1;
			}
			else if (state == 2) {
				this._moviePlayer.play("effect", 1);
				FishingJoy.Laya.timer.once(400, this, this._changeState, [odds, state]);
			}
			else if (state == 3) {
				this._moviePlayer.play("effect", 1);
				FishingJoy.Laya.timer.once(400, this, this._changeState, [odds, state]);
			}
		}

		/**
		 * 改变状态
		 */
		private _changeState(odds: number, state: number): void {
			if (state == 3) {
				this._setOddsFont(odds);
				this._moviePlayer.switchAni("idle3", -1);
				let effect3: eui.Image = this._imagePlayer.get("effec3");
				effect3.visible = true;
				egret.Tween.get(effect3, { loop: true }).to({ rotation: 360 }, 10000);
				this.colliderAry[0].setTo(-30, 0, 150);
				this._lastEff = effect3;
			}
			else if (state == 2) {
				this._setOddsFont(odds);
				this._moviePlayer.switchAni("idle2", -1);
				let effect2: eui.Image = this._imagePlayer.get("effec2");
				effect2.visible = true;
				egret.Tween.get(effect2, { loop: true }).to({ rotation: 360 }, 10000);
				this.colliderAry[0].setTo(-30, 0, 125);
				this._lastEff = effect2;
			}
		}

		/**
		 * 反初始化
		 */
		public uninitialize(): void {
			if (this._lastEff) {
				this._lastEff.visible = false;
				egret.Tween.removeTweens(this._lastEff);
			}
			if (this._isHitEff) {
				FishingJoy.Laya.timer.clear(this, this._resetHitMov);
			}
			FishingJoy.Laya.timer.clear(this, this._changeState);
			super.uninitialize();
		}


		/**
		 * 释放
		 */
		public dispose(): void {
			this._lastEff = null;
			super.dispose();
		}

		/**
		 * 播放死亡动画并回收到资源池
		 */
		public playDieMov(cb: Handler): void {
			egret.Tween.get(this.moviePlayer).to({ rotation: 1080 }, 1500);
			/*img2是烟圈*/
			let [img1, img2, img3]: CustomImage[] = Pool.getItemByCreateFun(Pool.HighOddsDieEff, Handler.create(this, this._createHighOddFishDieEff));
			// console.error("鱼的sign:" + this.sign + "dieMov.width：" + dieMov.width)
			let targetScale: number;
			targetScale = img1.scaleX = img1.scaleY = 1.1

			this.addChildAt(img1, 0);
			egret.Tween.get(img1).to({ rotation: 360 }, 1500)
			FishingJoy.Laya.timer.once(1500, null, () => {
				this.removeChild(img1);
				this.removeChild(img2);
				Pool.recover(Pool.HighOddsDieEff, [img1, img2, img3])
				cb.run();
			})


			img2.scaleX = img2.scaleY = targetScale;
			img2.alpha = 1;
			this.addChildAt(img2, 2);
			egret.Tween.get(img2).to({ scaleX: 2 * targetScale, scaleY: 2 * targetScale }, 1000, egret.Ease.cubicIn).to({ alpha: 0 }, 500);
		}
	}
}