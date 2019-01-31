/**
 * 追踪弹移动
 * @author suo
 */
module FishingJoy {
	export class BulletTrackOperation extends BulletOperation {
		/**
		 * 跟踪目标鱼
		 */
		private targetFish: gameObject.Fish;

		constructor() {
			super();
		}

		/**
		 * 注册
		 */
		public register(gameObj: gameObject.Bullet): void {
			super.register(gameObj);
			let varsData = (<gameObject.IBulletVars>gameObj.varsData);
			this.targetFish = varsData.targetFish;
		}

		/**
		 * 帧循环
		 */
		public enterFrame() {
			let gameObj: gameObject.Bullet = this._gameObj;
			let targetFish = this.targetFish;
			if (targetFish && targetFish.isAlive && targetFish.isInView) {
				let fishLayer = FishingJoy.LayerManager.instance.getLayer(LAYER.Fish);
				let [x, y]: [number, number] = [-1, -1];
				let isInAimView: boolean = false;
				if (targetFish.isAccurateCollider) {
					for (let i: number = 0; i < targetFish.colliderAry.length; i++) {
						let collider: FishingJoy.Collider = targetFish.colliderAry[i];
						[x, y] = UIUtil.getGlobePos(collider)
						if (UIUtil.inAimView(x, y)) {
							isInAimView = true
							break;
						}
					}
				}
				else {
					[x, y] = UIUtil.getGlobePos(targetFish)
					if (UIUtil.inAimView(x, y)) {
						isInAimView = true
					}
				}



				if (isInAimView) {
					let angle = GX.getRadianByPoint({ x: this.bornX, y: this.bornY }, { x: x, y: y });
					let distTarget = GX.getDistanceByPoint({ x: this.bornX, y: this.bornY }, { x: x, y: y });
					let time = game.GameTime.serverNow();
					let leftTime = time - this.bornTime;
					let distTotal = leftTime * (this._speed / 1000);

					let offsetx = distTotal / distTarget * (x - this.bornX);
					let offsety = distTotal / distTarget * (y - this.bornY);
					gameObj.x = this.bornX + offsetx;
					gameObj.y = this.bornY + offsety;
					gameObj.rotation = angle;
				}
				else {
					gameObj.targetFish = null;
					super.enterFrame();
				}
			}
			else {
				gameObj.targetFish = null;
				super.enterFrame();
			}
		}

        /**
		 * 反注册
		 */
		public unregister(): void {
			super.unregister();
			this.targetFish = null;
		}

	}
}