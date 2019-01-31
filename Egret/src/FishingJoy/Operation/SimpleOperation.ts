/**
 * 简易操作类型
 * @author suo
 */
module FishingJoy {
	export class SimpleOperation extends BaseOperation {

		private _gameObj: gameObject.GameObject;

		public constructor() {
			super();
		}

		/**
		 * 注册
		 */
		public register(gameObj: gameObject.GameObject): void {
			this._gameObj = gameObj;
			let time: number = MathUtil.random(5000, 15000)
			// if (gameObj.varsData.operation.direction) {
			// 	let tween: egret.Tween = egret.Tween.get(gameObj)

			// 	if (gameObj.varsData.operation.direction == OPERATION_DIRECTION.DOWN) {
			// 		gameObj.rotation = 90;
			// 		tween.to({ y: 720 }, time).call(this._onTweenComplete, this)
			// 	}
			// 	else if (gameObj.varsData.operation.direction == OPERATION_DIRECTION.LEFT) {
			// 		gameObj.rotation = 180;
			// 		tween.to({ x: 0 }, time).call(this._onTweenComplete, this)
			// 	}
			// 	else if (gameObj.varsData.operation.direction == OPERATION_DIRECTION.RIGHT) {
			// 		gameObj.rotation = 0;
			// 		tween.to({ x: 1280 }, time).call(this._onTweenComplete, this)
			// 	}
			// 	else if (gameObj.varsData.operation.direction == OPERATION_DIRECTION.UP) {
			// 		gameObj.rotation = 270;
			// 		tween.to({ y: 0 }, time).call(this._onTweenComplete, this)
			// 	}
			// }
		}

		/**
		 * 缓动完毕
		 */
		private _onTweenComplete(): void {
			if (this._gameObj) {
				if (this._gameObj instanceof gameObject.Fish) {
					if (this._gameObj.isAlive) {
						gameObject.GameObjectFactory.instance.recoverGameObject(this._gameObj);
					}
				}
			}
		}

		/**
		 * 反注册
		 */
		public unregister(): void {
			egret.Tween.removeTweens(this._gameObj);
			this._gameObj = null;
		}

	}
}