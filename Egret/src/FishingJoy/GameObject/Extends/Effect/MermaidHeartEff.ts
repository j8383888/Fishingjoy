/**
 * 美人鱼心型特效
 * @author suo
 */
module gameObject {
	export class MermaidHeartEff extends eui.Component implements IGameObject {
		/**
		 * 缓存标识符
		 */
		public sign: GAMEOBJECT_SIGN;
		/**
		 * uid
		 */
		public uID: number = NaN;
		/**
		 * 放置哪个图层
		 */
		public layerType: LAYER;
		/**
		 * 携带参数
		 */
		public varsData: IGameObjectVars = null;
		/**
		 * 是否可以被释放
		 */
		public canDispose: boolean = true;
		/**
		 * 引用计数
		 */
		public refCount: number = 0;
		/**
		 * 最大数量
		 */
		private readonly MAX_NUM: number = 24;

		/**
		 * 金币盒子
		 */
		private _coinBox: egret.MovieClip[] = [];

		/**
		 * 盒子
		 */
		private rectBox: eui.Group;
		/**
		 * 特效
		 */
		private _eff: egret.MovieClip



		public constructor() {
			super();
			this.skinName = "by_MermaidHeartSkin";
		}

		/**
		 * 设置数据
		 */
		public setData(sign: GAMEOBJECT_SIGN, uID: number, varsData: IGameObjectVars, layerType: LAYER = LAYER.Fish): void {
			this.sign = sign;
			this.uID = uID;
			this.varsData = varsData;
			this.layerType = layerType;
		}

		/**
		 * 加载资源
		 */
		public loadConfigAsset(assetData: IConfigAsset): void {

			this._eff = FishingJoy.UIUtil.creatMovieClip("MermaidHeartEff");
			this._eff.blendMode = egret.BlendMode.ADD;
			this._eff.visible = false;
			this.addChild(this._eff);
		}

		/**
		 * 加载配置（在loadConfigAsset之后调用）
		 */
		public loadConfigData(initOnce: IConfigData): void {

		}

		/**
		 * 获得目标炮台
		 */
		public get battery(): Battery {
			return (<IMermaidHeartEff>this.varsData).targetBattery;
		}

		/**
		 * 获得钱
		 */
		public get score(): number {
			return (<IMermaidHeartEff>this.varsData).score;
		}

		/**
		 * 初始化
		 */
		public initialize(): void {
			this.x = this.varsData.bornX;
			this.y = this.varsData.bornY;
			this._eff.visible = true;
			this._eff.gotoAndPlay(1, 1);
			this._eff.once(egret.MovieClipEvent.COMPLETE, () => {
				this._eff.visible = false;
				this._eff.stop();
			}, null)

			FishingJoy.LayerManager.instance.addToLayer(this, this.layerType);
			for (let i: number = 0; i < this.MAX_NUM; i++) {
				let coin: egret.MovieClip = Pool.getItemByCreateFun(Pool.commonGold, Handler.create(GlobeVars, GlobeVars.creatCommonCoin, null, true));
				coin.x = 0;
				coin.y = 0;
				coin.alpha = 0;
				coin.gotoAndPlay(1, -1);
				this.addChild(coin);

				this._coinBox.push(coin);
				this._goldHeartTween(coin, i);
			}
			let isMine: boolean;
			if (this.battery.user && this.battery.user.uid == FishingJoy.Master.instance.uid) {
				isMine = true
			} else {
				isMine = false;
			}
			this._showCoinLabel(isMine);
		}

		/**
		 * 显示金币文本
		 */
		private _showCoinLabel(isMine: boolean): void {
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
				scoreLabel.x = -scoreLabel.textWidth / 2;
				scoreLabel.y = -scoreLabel.textHeight / 2;
			}, null)

			scoreLabel.alpha = 0;
			this.addChild(scoreLabel);


			egret.Tween.get(scoreLabel).wait(500).to({ alpha: 1 }, 500).wait(1000).to({ alpha: 0 }, 500).call(() => {
				if (scoreLabel.name == "jumpCoinText") {
					Pool.recover(Pool.jumpCoinText, scoreLabel);
				}
				else if (scoreLabel.name == "jumpCoinTexts") {
					Pool.recover(Pool.jumpCoinTexts, scoreLabel);
				}
				this.removeChild(scoreLabel)
			})

		}

		private _goldHeartTween(coin: egret.MovieClip, i: number): void {
			let index: number = i;

			let target: eui.Rect = this.skin["a" + index]
			let targetX: number = target.x + 22.5 //+ MathUtil.random(-10, 10) * 2;
			let targetY: number = target.y + 22.5 //+ MathUtil.random(-10, 10) * 2;
			let tweenTime = 500;
			let waitTime = 50
			if (i == 0) {
				egret.Tween.get(coin).wait(waitTime).to({ x: targetX, y: targetY, alpha: 1 }, tweenTime, egret.Ease.quadIn);
			}
			else if (i > 0 && i < this.MAX_NUM - 1) {
				if (i < this.MAX_NUM / 2) {
					egret.Tween.get(coin).wait(waitTime).to({ x: targetX, y: targetY, alpha: 1 }, tweenTime, egret.Ease.quadIn);
				}
				else {
					egret.Tween.get(coin)
						.wait(waitTime).to({ x: targetX, y: targetY, alpha: 1 }, tweenTime, egret.Ease.quadIn);
				}
			}
			else {
				egret.Tween.get(coin).wait(waitTime).to({ x: targetX, y: targetY, alpha: 1 }, tweenTime, egret.Ease.quadIn).call(this._furlCoinTween, this, [i]);
			}
		}

		/**
		 * 收拢金币Tween
		 */
		private _furlCoinTween(i: number): void {

			let [batteryX, batteryY]: [number, number] = FishingJoy.UIUtil.localToGlobal(this.battery.coinImg);

			for (let i: number = 0; i < this.MAX_NUM; i++) {
				let coin: egret.MovieClip = this._coinBox[i];
				// let targetX: number = coin.x * 1.2;
				// let targetY: number = coin.y * 1.2;
				let targetX2: number = coin.x * 0.3;
				let targetY2: number = coin.y * 0.3;

				let time = GX.getDistanceByPoint({ x: batteryX, y: batteryY }, { x: this.x, y: this.y }) * 2;
				if (time < 300) {
					time = 300;
				}

				egret.Tween.get(coin)./*to({ x: targetX, y: targetY }, 250, egret.Ease.backIn).*/to({ x: targetX2, y: targetY2 }, 500, egret.Ease.quadIn)/*.wait(MathUtil.random(100, 500))*/.
					to({ x: batteryX - this.x, y: batteryY - this.y }, time, egret.Ease.backIn).call(this._recover, this, [i, coin, this.battery]);
			}
		}

		/**
		 * 回收
		 */
		private _recover(i: number, coin: egret.MovieClip, battery: Battery): void {

			if (i == this.MAX_NUM - 1) {
				battery.coinImgTween();
				// battery.updateGold2(this.score)
				battery.updateGold(this.score)
				GameObjectFactory.instance.recoverGameObject(this);
			}
			Pool.recover(Pool.commonGold, coin);
			this.removeChild(coin);
		}




		/**
		 * 反初始化
		 */
		public uninitialize(): void {
			if (this._eff.isPlaying) {
				this._eff.stop();
			}
			this._coinBox.length = 0;
		}

		/**
		 * 释放
		 */
		public dispose(): void {

			this._eff = null;
			this.uID = NaN;
			this.varsData = null;
			this.refCount = 0;
		}
	}
}