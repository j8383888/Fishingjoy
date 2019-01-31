/**
 * 终极大爆炸
 * @author suo
 */
module gameObject {
	export class BoomExEff extends GameObjectRender {

		/**
		 * 获得钱
		 */
		private _gainMoney: eui.BitmapLabel = new eui.BitmapLabel();


		public constructor() {
			super();
		}


		/**
		 * 爆炸位置X
		 */
		public get boomFishEx(): BoomFishEx {
			return (<IBoomEffVars>this.varsData).boomFishEx;
		}


		/**
		 * 鱼死亡列表
		 */
		public get deadFishList(): gameObject.Fish[] {
			return (<IBoomEffVars>this.varsData).deadFishList;
		}

		/**
		 * 玩家ID
		 */
		public get playerID(): number {
			return (<IBoomEffVars>this.varsData).playerID;
		}

		/**
		 * 玩家ID
		 */
		public get scoreSum(): number {
			return (<IBoomEffVars>this.varsData).scoreSum;
		}

		/**
         * 初始化配置数据
         */
		public loadConfigData(configData: IConfigData): void {
			let mov = this._moviePlayer.getMovieClipByKey("BoomEx_dieEffFrame");
			mov.blendMode = egret.BlendMode.ADD;
			this._imagePlayer.blendMode = egret.BlendMode.ADD;
			this.addChild(this._gainMoney);
			this._gainMoney.y = 25;
			this._gainMoney.font = "flutters1_fnt";
		}


		/**
         * 初始化
         */
		public initialize(): void {
			this.alpha = 1;
			this._imagePlayer.alpha = 0;
			this._gainMoney.alpha = 0;

			this._gainMoney.text = GX.GoldFormat(this.scoreSum, true, true, false);
			this._gainMoney.once(egret.Event.RENDER, () => {
				this._gainMoney.x = -0.5 * this._gainMoney.textWidth;
			}, null)



			let mov = this._moviePlayer.getMovieClipByKey("BoomEx_dieEffFrame");
			mov.scaleX = uniLib.Global.screenWidth / mov.width * 1.05;
			mov.scaleY = uniLib.Global.screenHeight / mov.height * 1.05;
			this.x = uniLib.Global.screenWidth / 2;
			this.y = uniLib.Global.screenHeight / 2;
			FishingJoy.LayerManager.instance.addToLayer(this, this.layerType);
			this.isInView = true;
			this._moviePlayer.play("BoomEx_dieEffFrame", -1);

			let len: number = this.deadFishList.length
			let fishList: gameObject.Fish[] = this.deadFishList
			// for (let i: number = 0; i < len; i++) {
			// 	let fish: gameObject.Fish = this.deadFishList[i]
			// if (FishingJoy.UIUtil.inView(fish.x, fish.y)) {
			// fishList.push(fish);
			// }
			// else {
			// 	FishingJoy.EventManager.fireEvent(EVENT_ID.FISH_DIE_ACTION, [fish, this.playerID]);
			// }
			// }

			fishList.sort((a: gameObject.Fish, b: gameObject.Fish) => {
				let boomFishEx: gameObject.BoomFishEx = this.boomFishEx;
				let disA: number = (a.x - boomFishEx.x) * (a.x - boomFishEx.x) + (a.y - boomFishEx.y) * (a.y - boomFishEx.y);
				let disB: number = (b.x - boomFishEx.x) * (b.x - boomFishEx.x) + (b.y - boomFishEx.y) * (b.y - boomFishEx.y);
				if (disA > disB) {
					return 1;

				}
				else {
					return - 1;
				}
			})

			let fishListLen: number = fishList.length
			FishingJoy.FishingJoyLogic.instance.coinDelayTweenComplete = false;
			for (let i: number = 0; i < fishListLen; i++) {
				let fish: gameObject.Fish = fishList[i];
				fish.isDelayDie = true;
				fish.unregisterOperation();
				FishingJoy.Laya.timer.once(i * 200, null, (fish: gameObject.Fish) => {
					let mov: egret.MovieClip;
					mov = Pool.getItemByCreateFun(Pool.BoomExSelf, Handler.create(this, this._creatSelfBoom, null, true))
					mov.x = fish.x;
					mov.y = fish.y;
					FishingJoy.EventManager.fireEvent(EVENT_ID.FISH_DIE_ACTION, [fish, this.playerID, true]);
					FishingJoy.LayerManager.instance.addToLayer(mov, LAYER.EFFECT_ROTATION);
					FishingJoy.UIUtil.playAndAutoRemove(mov, 1, Handler.create(null, (mov: egret.MovieClip) => {
						Pool.recover(Pool.BoomExSelf, mov);
					}, [mov], true));

				}, [fish])
			}
			FishingJoy.Laya.timer.once(200 * len, this, this._recover);
		}



		/**
		 * 回收
		 */
		private _recover(): void {
			FishingJoy.Laya.timer.once(2500, null, () => {
				FishingJoy.FishingJoyLogic.instance.coinTweenDelayHandlerRun();
			})
			if (FishingJoy.Master.instance.uid == this.playerID) {
				this._moviePlayer.hide("BoomEx_dieEffFrame");
				let mov: egret.MovieClip = this._moviePlayer.getMovieClipByKey("by_BoomExSettle")
				mov.gotoAndPlay(1, -1);
				mov.visible = true;
				mov.alpha = 0;
				egret.Tween.get(mov).to({ alpha: 1 }, 500)

				egret.Tween.get(this._gainMoney).to({ alpha: 1 }, 500);
				let img: CustomImage = this._imagePlayer.get("by_BoomExSettle2");
				egret.Tween.get(this._imagePlayer).to({ alpha: 1 }, 500);
				egret.Tween.get(img, { loop: true }).to({ rotation: 360 }, 4000);
				FishingJoy.Laya.timer.once(4000, null, () => {
					egret.Tween.get(this).to({ alpha: 0 }, 500).call(() => {
						gameObject.GameObjectFactory.instance.recoverGameObject(this);
					})
				})
			}
			else {
				egret.Tween.get(this).to({ alpha: 0 }, 500).call(() => {
					gameObject.GameObjectFactory.instance.recoverGameObject(this);
				})
			}
		}

		/**
		 * 创建特效
		 */
		private _creatSelfBoom(): egret.MovieClip {
			let mov = FishingJoy.UIUtil.creatMovieClip("BoomEx_dieEff");
			mov.frameRate = 8;
			return mov;
		}

		/**
         * 反初始化
         */
		public uninitialize(): void {
			let mov: egret.MovieClip = this._moviePlayer.getMovieClipByKey("by_BoomExSettle")
			mov.visible = false;
			let img: CustomImage = this._imagePlayer.get("by_BoomExSettle2");
			egret.Tween.removeTweens(img);
			super.uninitialize();
		}


	}
}