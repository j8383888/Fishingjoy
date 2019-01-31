/**
 * 金龙宝箱 金币雨
 * @author suo
 */
module gameObject {
	export class DragonCoinRainEff extends GameObject {

		/**
		 * 初始金币堆1
		 */
		private _baseCoinPile1: eui.Image[] = [];
		/**
		 * 初始金币堆2
		 */
		private _baseCoinPile2: eui.Image[] = [];
		/**
		 * 追加金币堆1
		 */
		private _exCoinPile1: eui.Image[] = [];
		/**
		 * 追加金币堆2
		 */
		private _exCoinPile2: eui.Image[] = [];

		/**
		 * 追加组
		 */
		private _exGroup: eui.Group[] = []


		/**
		 * 项高度
		 */
		public readonly ITEM_HEIGHT: number = 35;
		/**
		 * 金币
		 */
		public readonly COIN1_WIDTH: number = 719;

		public readonly COIN2_WIDTH: number = 1093;
		/**
		 * 上一组第一张金币图
		 */
		private _lastGroupFirstImg: string = Pool.GoldPile1
		/**
		 * 基础金币堆组数量
		 */
		private readonly BASE_GROUP_NUM: number = 1;
		/**
		 * 缓动显示金币堆索引
		 */
		private _showIndex: number = 0;
		/**
		 * 金币堆容器
		 */
		private _coinPileGroup: egret.DisplayObjectContainer = new egret.DisplayObjectContainer();
		/**
		 * 金币容器
		 */
		private _coinGroup: egret.DisplayObjectContainer = new egret.DisplayObjectContainer();

		public constructor() {
			super();
		}

		/**
         * 加载资源
         */
		public loadConfigAsset(assetData: IConfigAsset): void {
			this.addChild(this._coinGroup);
			this.addChild(this._coinPileGroup);




			this._lastGroupFirstImg = Pool.GoldPile1;
			for (let i: number = 0; i < this.BASE_GROUP_NUM; i++) {
				this._creatGroupCoin(i);
			}
		}

		/**
		 * 创建一组金币堆
		 */
		private _creatGroupCoin(groupIndex: number, isEx: boolean = false): void {
			let layout: eui.HorizontalLayout = new eui.HorizontalLayout();

			if (isEx) {
				layout.horizontalAlign = egret.HorizontalAlign.LEFT;
				layout.gap = -100
			} else {
				layout.horizontalAlign = egret.HorizontalAlign.CENTER;
				layout.gap = -100;
			}
			let group: eui.Group = new eui.Group();
			group.x = -uniLib.Global.screenWidth * 0.2;
			group.layout = layout;
			this._coinPileGroup.addChild(group);
			if (isEx) {
				this._exGroup.push(group);
			}

			let isFirst: boolean = true;
			/*涨金币间隔*/
			let interval: number = 700;
			/*傻逼逻辑 写的想死 别看 下面的逻辑*/
			while (group.width < uniLib.Global.screenWidth * 1.4) {
				this._showIndex++;
				let index: number = 0;
				if (index % 2 == 0) {
					if (this._lastGroupFirstImg == Pool.GoldPile2) {
						if (isFirst) {
							group.width += this.COIN1_WIDTH;
							this._lastGroupFirstImg = Pool.GoldPile1;
							isFirst = false;
						}
						else {
							group.width += this.COIN1_WIDTH - (<eui.HorizontalLayout>group.layout).gap;
						}
						if (isEx) {
							this._pushCoin1(group, interval, this._showIndex);
						}
						else {
							this._pushCoin1(group)
						}
					}
					else {
						if (isFirst) {
							group.width += this.COIN2_WIDTH;
							this._lastGroupFirstImg = Pool.GoldPile2;
							isFirst = false;
						}
						else {
							group.width += this.COIN2_WIDTH - (<eui.HorizontalLayout>group.layout).gap;
						}
						if (isEx) {
							this._pushCoin2(group, interval, this._showIndex);
						}
						else {
							this._pushCoin2(group)
						}
					}

				}
				else {
					if (this._lastGroupFirstImg == Pool.GoldPile2) {
						if (isFirst) {
							group.width += this.COIN1_WIDTH;
							this._lastGroupFirstImg = Pool.GoldPile1;
							isFirst = false;
						}
						else {
							group.width += this.COIN1_WIDTH - (<eui.HorizontalLayout>group.layout).gap;
						}
						if (isEx) {
							this._pushCoin1(group, interval, this._showIndex);
						}
						else {
							this._pushCoin1(group)
						}
					}
					else {
						if (isFirst) {
							group.width += this.COIN2_WIDTH;
							this._lastGroupFirstImg = Pool.GoldPile2;
							isFirst = false;
						}
						else {
							group.width += this.COIN2_WIDTH - (<eui.HorizontalLayout>group.layout).gap;
						}
						if (isEx) {
							this._pushCoin2(group, interval, this._showIndex);
						}
						else {
							this._pushCoin2(group)
						}
					}
				}
				index++
			}
			group.y = uniLib.Global.screenHeight - this.ITEM_HEIGHT * (groupIndex + 1) - 30;

		}

		/**
		 * 添加Coin1图片
		 */
		private _pushCoin1(group: eui.Group, interval: number = 0, itemIndex: number = 0): void {
			if (interval != 0) {
				FishingJoy.Laya.timer.once(interval * itemIndex, null, () => {
					let coin1: eui.Image = Pool.getItemByCreateFun(Pool.GoldPile1, Handler.create(this, this._creatCoinPile1));
					coin1.alpha = 0;
					egret.Tween.get(coin1).to({ alpha: 1 }, 500, egret.Ease.quadIn);
					group.addChild(coin1);
					this._exCoinPile1.push(coin1);
				})
			}
			else {
				let coin1: eui.Image = Pool.getItemByCreateFun(Pool.GoldPile1, Handler.create(this, this._creatCoinPile1));
				group.addChild(coin1);
				this._baseCoinPile1.push(coin1);
			}
		}

		/**
		 * 添加Coin2图片
		 */
		private _pushCoin2(group: eui.Group, interval: number = 0, itemIndex: number = 0): void {
			if (interval != 0) {
				FishingJoy.Laya.timer.once(interval * itemIndex, null, () => {
					let coin2: eui.Image = Pool.getItemByCreateFun(Pool.GoldPile2, Handler.create(this, this._creatCoinPile2));
					group.addChild(coin2);
					coin2.alpha = 0;
					egret.Tween.get(coin2).to({ alpha: 1 }, 500, egret.Ease.quadIn);
					this._exCoinPile2.push(coin2);
				})
			}
			else {
				let coin2: eui.Image = Pool.getItemByCreateFun(Pool.GoldPile2, Handler.create(this, this._creatCoinPile2));
				group.addChild(coin2);
				this._baseCoinPile2.push(coin2);
			}
		}

		/**
         * 初始化配置数据
         */
		public loadConfigData(configData: IConfigData): void {

		}


		/**
         * 初始化
         */
		public initialize(): void {
			this.x = 0;
			this.y = 0;
			this.alpha = 1;
			this._showIndex = 0;
			FishingJoy.LayerManager.instance.addToLayer(this, this.layerType);
			for (let i: number = 0; i < 3; i++) {
				this._creatGroupCoin(i + this.BASE_GROUP_NUM, true);
			}


			for (let i: number = 0; i < 160; i++) {
				let coin: egret.MovieClip = Pool.getItemByCreateFun(Pool.commonGold, Handler.create(GlobeVars, GlobeVars.creatCommonCoin));
				coin.x = MathUtil.random(0, uniLib.Global.screenWidth / 10) * 10;
				coin.y = -30;
				coin.gotoAndPlay(1, - 1);
				this._coinGroup.addChild(coin)
				let targetY: number = uniLib.Global.screenHeight - this.ITEM_HEIGHT * 2;

				egret.Tween.get(coin).wait(i * 25).to({ y: targetY }, 800).call(() => {
					coin.stop();
					this._coinGroup.removeChild(coin);
					Pool.recover(Pool.commonGold, coin);
					if (i == 160 - 1) {
						egret.Tween.get(this).to({ alpha: 0 }, 1000).call(() => {
							GameObjectFactory.instance.recoverGameObject(this);
						});
					}
				});
			}
		}

		/**
		 * 创建金币堆1
		 */
		private _creatCoinPile1(): eui.Image {
			let img1: eui.Image = new eui.Image();
			img1.source = "dragonCoin1";
			return img1;
		}

		/**
		 * 创建金币堆2
		 */
		private _creatCoinPile2(): eui.Image {
			let img2: eui.Image = new eui.Image();
			img2.source = "dragonCoin2";
			return img2;
		}

		/**
		 * 反初始化
		 */
		public uninitialize(): void {

			for (let item of this._exGroup) {
				item.parent.removeChild(item);
			}
			this._exGroup.length = 0;
			for (let item of this._exCoinPile1) {
				Pool.recover(Pool.GoldPile1, item);
			}
			this._exCoinPile1.length = 0;
			for (let item of this._exCoinPile2) {
				Pool.recover(Pool.GoldPile2, item);
			}
			this._exCoinPile2.length = 0;
			FishingJoy.LayerManager.instance.removeFromLayer(this);
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			for (let item of this._baseCoinPile1) {
				Pool.recover(Pool.GoldPile1, item);
			}
			this._baseCoinPile1.length = 0;
			for (let item of this._baseCoinPile2) {
				Pool.recover(Pool.GoldPile2, item);
			}
			this._baseCoinPile2.length = 0;
			super.dispose();
		}
	}
}