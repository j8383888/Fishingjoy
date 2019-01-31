/**
 * 子弹移动
 * @author suo
 */
module FishingJoy {
	export class BulletOperation extends BaseOperation {

        /**
         * 子弹速度
         */
		private readonly BULLET_SPEED: number = 1200;
		/**
		 * 出生时间
		 */
		public bornTime: number = -1
		/**
		 * 旋转度数
		 */
		public rotation: number = -1;
		/**
		 * 起始位置
		 */
		protected bornX: number;
		/**
		 * 起始位置
		 */
		protected bornY: number;
		/**
		 * 路径配置
		 */
		protected pathConfig: Array<{ x: number, y: number, angle: number, distNext: number, distTotal: number }> = [];
		/**
		 * GM
		 */
		private gmShape: Array<egret.Shape> = [];
		/**
		 * 对象
		 */
		protected _gameObj: gameObject.Bullet;
		/**
		 * 移动速度
		 */
		protected _speed: number = this.BULLET_SPEED;

		/**
		 * 当前路径
		 */
		private curPath: { x: number, y: number, angle: number, distNext: number, distTotal: number };
		/**
		 * 下一段路径
		 */
		private nextPath: { x: number, y: number, angle: number, distNext: number, distTotal: number };

		private pathIndex: number = 0;
		constructor() {
			super();
		}

		/**
		 * 注册
		 */
		public register(gameObj: gameObject.Bullet): void {
			this.pathIndex = 0;
			this._gameObj = gameObj
			let varsData = (<gameObject.IBulletVars>gameObj.varsData);
			let operation: gameObject.IOperation = varsData.operation[0];
			this.rotation = operation.rotation;
			this.bornTime = gameObj.bornTime;
			this.bornX = gameObj.varsData.bornX;
			this.bornY = gameObj.varsData.bornY;
			this._speed = 1200//gameObj.speed;
			let seatData = game.PokerFunction.GetSeatDataByUid(varsData.playerUID);
			if (seatData == null)
				return;
			let seatId = seatData.seatId;
			gameObj.x = this.bornX;
			gameObj.y = this.bornY;

			let bornX = this.bornX;
			let bornY = this.bornY;
			let rotation = this.rotation;
			let distTotal = 0;
			this.pathConfig.push({ x: bornX, y: bornY, angle: rotation, distNext: 0, distTotal: distTotal });
			for (let i: number = 0; i < 2; i++) {
				this.addBordPoint();
			}
			this.curPath = this.pathConfig.first();
			this.nextPath = this.pathConfig[1];

			// if (gameObj.playerID == uniLib.NetMgr.UID) {
			// 	let bulletLayer = manager.LayerManager.instance.getLayer(LAYER.Bullet);
			// 	var shp: egret.Shape = new egret.Shape();
			// 	shp.graphics.lineStyle(2, 0x00ff00);
			// 	for (let item of this.pathConfig) {
			// 		shp.graphics.lineTo(item.x, item.y);
			// 		bulletLayer.addChild(shp);
			// 		var circle: egret.Shape = new egret.Shape();
			// 		circle.x = item.x;
			// 		circle.y = item.y;
			// 		circle.graphics.beginFill(0xff0000, 1);
			// 		circle.graphics.drawCircle(0, 0, 50);
			// 		circle.graphics.endFill();
			// 		bulletLayer.addChild(circle);
			// 		this.gmShape.push(circle);
			// 	}
			// 	shp.graphics.endFill();
			// 	this.gmShape.push(shp);
			// }
		}

		/**
	 	* 是否在边界内
	 	*/
		public inBorder(x: number, y: number): Boolean {
			if (x < -100 || x > uniLib.Global.screenWidth + 100) {
				return false
			}
			if (y < -100 || y > uniLib.Global.screenHeight + 100) {
				return false;
			}
			return true;
		}
		private i: number = 0;
		public addBordPoint() {
			let config = this.pathConfig.last();
			let bordPoint = GX.getBorderPoint({ x: config.x, y: config.y }, config.angle);
			let distLast = GX.getDistanceByPoint({ x: bordPoint.x, y: bordPoint.y }, { x: config.x, y: config.y });
			let distTotal = config.distTotal + distLast;
			this.pathConfig.push({ x: bordPoint.x, y: bordPoint.y, angle: bordPoint.angle, distNext: 0, distTotal: distTotal });
			config.distNext = distLast;
			if (distTotal - config.distTotal < 200) {
				this.addBordPoint();
			}
		}
		/**
		 * 帧循环
		 */
		public enterFrame() {


			let gameObj: gameObject.Bullet = this._gameObj;
			if (!this.curPath) {
				gameObject.GameObjectFactory.instance.recoverGameObject(gameObj);
				return;
			}
			let time = game.GameTime.serverNow();
			let leftTime = time - this.bornTime;
			let curMoveDistance = leftTime * (this._speed / 1000);

			let config = this.pathConfig
			let lastConfg = config.last();

			if (curMoveDistance > this.curPath.distTotal) {
				let configLength = config.length;
				for (let i: number = this.pathIndex; i < configLength; i++) {
					if (config[i].distTotal > curMoveDistance) {
						this.pathIndex = i;
						this.nextPath = config[i];
						this.curPath = config[i - 1];
						break;
					}
				}
			}
			let curPath: { x: number, y: number, angle: number, distNext: number, distTotal: number } = this.curPath;
			let nextPath: { x: number, y: number, angle: number, distNext: number, distTotal: number } = this.nextPath;
			curPath = curPath == null ? lastConfg : curPath;
			nextPath = nextPath == null ? lastConfg : nextPath;
			gameObj.rotation = curPath.angle;
			let distNext = curPath.distNext;
			let offsetDist = curMoveDistance - curPath.distTotal;
			let offsetx = offsetDist / distNext * (nextPath.x - curPath.x);
			let offsety = offsetDist / distNext * (nextPath.y - curPath.y);
			gameObj.x = curPath.x + offsetx;
			gameObj.y = curPath.y + offsety;
			if (nextPath == lastConfg) {
				this.addBordPoint();
			}
			if (!this.inBorder(gameObj.x, gameObj.y)) {
				gameObject.GameObjectFactory.instance.recoverGameObject(gameObj);
			}
		}

        /**
		 * 反注册
		 */
		public unregister(): void {
			for (let item of this.gmShape) {
				if (item.parent)
					item.parent.removeChild(item);
			}
			this._gameObj = null;
			this.pathConfig.length = 0;
		}

	}
}