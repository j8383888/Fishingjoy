/**
 * 金龙特效
 * @author suo 
 */
module gameObject {
	export class DragonEff extends GameObjectRender {
		/**
		 * 文本
		 */
		private _txt: egret.TextField = new egret.TextField();
		/**
		 * 淡灰色底板
		 */
		private _blackBg: eui.Rect = new eui.Rect();
		/**
		 * 动画完成计数
		 */
		private tweenCompleteIndex: number = 0;
		/**
		 * 最大属性
		 */
		private readonly MAX_NUM: number = 80;
		/**
		 * 获得玩家昵称
		 */
		public get playerNickName(): string {
			return (<gameObject.IMermaidEffVars>this.varsData).playerNickName
		}
		/**
		 * 获得目标炮台
		 */
		public get targetBattery(): gameObject.Battery {
			return (<gameObject.IMermaidEffVars>this.varsData).targetBattery
		}

		/**
		 * 获得目标炮台
		 */
		public get score(): number {
			return (<gameObject.IDragonEffVars>this.varsData).score
		}

		public constructor() {
			super();
		}

		/**
         * 初始化一次
         */
		public loadConfigData(initOnce: IConfigData): void {
			this._blackBg.fillColor = ColorUtil.COLOR_BLACK;
			this._blackBg.width = uniLib.Global.screenWidth;
			this._blackBg.height = uniLib.Global.screenHeight;
			this._blackBg.x = -uniLib.Global.screenWidth / 2;
			this._blackBg.y = -uniLib.Global.screenHeight / 2 - 50;
			this._blackBg.alpha = 0.4;
			this.addChildAt(this._blackBg, 0);

			this._txt.bold = true;
			this._txt.fontFamily = "SimHei";
			this._txt.size = 35;
			this._txt.y = -250;
			if (uniLib.Global.isH5) {
				let glowFilter = new egret.GlowFilter(0xFF7F50, 0.5, 1, 1, 10, 1, true)
				this._txt.filters = [glowFilter];
			}
			else {
				this._txt.textColor = 0xFF7F50;
			}
			this.addChild(this._txt);

			this.touchEnabled = false;
			this.touchChildren = false;
		}

		/**
         * 初始化
         */
		public initialize(): void {
			super.initialize();
			this._imagePlayer.alpha = 1;
			this._txt.alpha = 0;
			this._imagePlayer.visible = false;




			this._moviePlayer.play("TreasureBox_vanish", 1);
			this._moviePlayer.play("TreasureBox_box", 1, 1000, Handler.create(this, () => { this._imagePlayer.visible = true }));
			//喷金币
			this._moviePlayer.play("TreasureBox-coin", 1, 1800);
			FishingJoy.Laya.timer.once(2800, this, this._effComplete);

			/*下金币雨*/
			if (this.targetBattery.user && this.targetBattery.user.uid == FishingJoy.Master.instance.uid) {
				FishingJoy.Laya.timer.once(2000, GameObjectFactory.instance, GameObjectFactory.instance.creatGameObject, [GAMEOBJECT_SIGN.DRAGON_TREASUR_EFF, null, LAYER.EFFECT_BIG]);
				FishingJoy.Laya.timer.once(7500, this, this._showCoin, [true]);
			}
			else {
				FishingJoy.Laya.timer.once(3000, this, this._showCoin, [false]);
			}
		}

		/**
		 * 特效播放完毕
		 */
		private _effComplete(): void {
			egret.Tween.get(this._txt).to({ alpha: 1, }, 1000)
			this._txt.text = "恭喜 [" + this.playerNickName + "] 打开金龙的宝藏!";
			this._txt.x = -this._txt.textWidth / 2;

		}

		/**
		 * 显示飞金币
		 */
		private _showCoin(isMine: boolean): void {
			/*消失*/
			egret.Tween.get(this._imagePlayer).to({ alpha: 0 }, 1500);
			let [x, y] = FishingJoy.UIUtil.localToGlobal(this.targetBattery.coinImg);
			game.SoundHand.Instance.playGoldCoinRain();
			for (let i: number = 0; i <= this.MAX_NUM; i++) {
				FishingJoy.Laya.timer.once(MathUtil.random(0, 1000), this, this._creatCoin, [i, x, y], false);
			}

			this._showCoinLabel(isMine);
		}

		/**
		 * 显示金币文本
		 */
		private _showCoinLabel(isMine: boolean): void {
			FishingJoy.Laya.timer.once(500, null, () => {
				let scoreLabel: eui.BitmapLabel
				/*自己*/
				if (isMine) {
					scoreLabel = Pool.getItemByClass(Pool.jumpCoinText, eui.BitmapLabel);
					scoreLabel.font = "flutters1_fnt";
					scoreLabel.name = "jumpCoinText"
				}
				/*别人*/
				else {
					scoreLabel = Pool.getItemByClass(Pool.jumpCoinTexts, eui.BitmapLabel);
					scoreLabel.font = "flutters2_fnt";
					scoreLabel.name = "jumpCoinTexts"
				}
				scoreLabel.text = "+" + GX.GoldFormat(this.score, true, true, false);
				scoreLabel.once(egret.Event.RENDER, () => {
					scoreLabel.x = (uniLib.Global.screenWidth - scoreLabel.textWidth) / 2;
				}, null)

				scoreLabel.y = uniLib.Global.screenHeight - 500;
				scoreLabel.alpha = 0;
				FishingJoy.LayerManager.instance.addToLayer(scoreLabel, LAYER.UI);


				egret.Tween.get(scoreLabel).to({ alpha: 1 }, 1000).wait(1800).call(() => {
					if (scoreLabel.name == "jumpCoinText") {
						Pool.recover(Pool.jumpCoinText, scoreLabel);
					}
					else if (scoreLabel.name == "jumpCoinTexts") {
						Pool.recover(Pool.jumpCoinTexts, scoreLabel);
					}
					FishingJoy.LayerManager.instance.removeFromLayer(scoreLabel, LAYER.UI);
				})

			})
		}

		/**
		 * 动画飞到指定位置结束
		 */
		private _tweenComplete(coin: egret.MovieClip): void {
			coin.stop();
			FishingJoy.LayerManager.instance.removeFromLayer(coin, LAYER.EFFECT_BIG);
			Pool.recover(Pool.flyCoin, coin);
			this.tweenCompleteIndex++
			if (this.tweenCompleteIndex >= this.MAX_NUM) {
				this.tweenCompleteIndex = 0;
				GameObjectFactory.instance.recoverGameObject(this);
				if (this.targetBattery) {
					this.targetBattery.updateGold(this.score);
				}
			}
		}
		//判定点是否在园内
		private pointInsideCircle(point, circle, r) {
			if (r === 0) return false
			var dx = circle[0] - point[0]
			var dy = circle[1] - point[1]
			return dx * dx + dy * dy <= r * r
		}

		/**
		 * 创建金币
		 */
		private _creatCoin(i: number, x: number, y: number): void {
			let coin: egret.MovieClip = Pool.getItemByCreateFun(Pool.flyCoin, Handler.create(GlobeVars, GlobeVars.creatCommonCoin, null, true));
			coin.alpha = 0;
			coin.gotoAndPlay(1, -1);
			// let radius = 250;
			// while (1) {
			// 	//随机坐标在圆内 设置xy并且跳出 不在则重新随机
			// 	let xPoint = MathUtil.random(-radius, radius);
			// 	let yPoint = MathUtil.random(-radius, radius);
			// 	if (this.pointInsideCircle([xPoint, yPoint], [0, 0], radius)) {
			// 		coin.x = xPoint + uniLib.Global.screenWidth / 2;
			// 		coin.y = yPoint + uniLib.Global.screenHeight / 2;
			// 		break;
			// 	}
			// }



			let targetX: number, targetY: number;
			if (i <= 2) {
				targetX = 610 + i * 30
				targetY = 540;
			}
			else if (i >= 2 && i <= 10) {
				targetX = MathUtil.random(500, 720)
				targetY = 500 + MathUtil.random(-10, 10)
			}
			else if (i >= 10 && i <= 25) {
				targetX = MathUtil.random(460, 750);
				targetY = 460 + MathUtil.random(-10, 10)
			}
			else if (i >= 26 && i <= 40) {
				targetX = MathUtil.random(450, 750);
				targetY = 420 + MathUtil.random(-10, 10)
			}
			else if (i >= 41 && i <= 60) {
				targetX = MathUtil.random(450, 760);
				targetY = 380 + MathUtil.random(-10, 10)
			}
			else if (i >= 61 && i <= 69) {
				targetX = MathUtil.random(480, 750);
				targetY = 340 + MathUtil.random(-10, 10)
			}
			else if (i >= 70 && i <= 75) {
				targetX = MathUtil.random(590, 780);
				targetY = 290 + MathUtil.random(-10, 10)
			}
			else if (i >= 75 && i <= 80) {
				targetX = MathUtil.random(600, 725);
				targetY = 250 + MathUtil.random(-10, 10)
			}
			coin.x = targetX
			coin.y = targetY
			FishingJoy.LayerManager.instance.addToLayer(coin, LAYER.EFFECT_BIG);
			egret.Tween.get(coin).to({ alpha: 1 }, 500).wait(800).to({ x: x, y: y }, 500 + i * 10, egret.Ease.quadIn).call(this._tweenComplete, this, [coin]);


		}


		/**
		 * 创建金币影片剪辑
		 */
		private _creatCoinMov(): egret.MovieClip {
			let mov: egret.MovieClip = FishingJoy.UIUtil.creatMovieClip("by_newJinBi");
			mov.frameRate = 8;
			return mov;
		}

		/**
		 * 播放完毕
		 */
		private _onComplete(): void {
			GameObjectFactory.instance.recoverGameObject(this);
		}

		/**
         * 反初始化
         */
		public uninitialize(): void {
			this._txt.text = "";
			this._moviePlayer.hideAll();
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