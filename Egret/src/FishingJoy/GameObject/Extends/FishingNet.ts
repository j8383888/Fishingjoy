/**
 * 渔网
 * @author suo 
 */
module gameObject {
	export class FishingNet extends GameObjectCollider {

		/**
		 * 渔网数量
		 */
		public netNum: number;
		/**
		 * 碰撞器数据
		 */
		public colliderData: ICollider[];

		/**
		 * 渔网半径
		 */
		public get radius(): number {
			return (this.varsData as IFishNetVars).radius;
		}

		public get isVisible(): boolean {
			return (this.varsData as IFishNetVars).isVisible;
		}

		public constructor() {
			super();
		}

		/**
         * 初始化一次
         */
		public loadConfigData(initOnce: IFishingNetConfigData): void {
			this.netNum = initOnce.netNum;
			this.colliderData = initOnce.colliderAry;
			this._moviePlayer.alpha = 0.75;
			this._moviePlayer.getMovieClipByKey("idle").blendMode = egret.BlendMode.ADD;
		}

		/**
         * 初始化
         */
		public initialize(): void {
			super.initialize();

			this.visible = this.isVisible;
			/*美术资源的渔网半径大致为120*/
			let scale: number = this.radius / 120;
			for (let i: number = 0; i < this.netNum; i++) {
				let collider: FishingJoy.Collider = FishingJoy.Collider.creat(this.colliderData[i].posX * scale, this.colliderData[i].posY * scale, this.radius);
				collider.setParent(this);
				this.colliderAry.push(collider);
			}
			if (this._moviePlayer) {
				this._moviePlayer.scaleX = this._moviePlayer.scaleY = scale;
				this._moviePlayer.playOnceAll(Handler.create(this, this._onComplete));
				this.canDispose = false;
			}
		}



		/**
		 * 播放完毕
		 */
		private _onComplete(): void {
			this.canDispose = true;
			GameObjectFactory.instance.recoverGameObject(this);
		}

		/**
         * 反初始化
         */
		public uninitialize(): void {
			for (let i: number = 0; i < this.colliderAry.length; i++) {
				this.colliderAry[i].recover();
			}
			this.colliderAry.length = 0;
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