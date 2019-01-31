/**
 * 鱼操作类型
 * @author suo
 */
module FishingJoy {
	export class FishOperation extends BaseOperation {
		/**
		 * 路径是否已经添加离开的点
		 */
		public static isPathLeavePoint = {};
		/**
		 * 路径表
		 */
		public pathConfig: Array<table.TableFishPath.PathConfigItem>;
		/**
		 * 出鱼时间
		 */
		public spawnTime: number;
		/**
		 * 移动速度  像素/ms
		 */
		public speed: number;
		/**
		 * 鱼唯一ID
		 */
		public fishSubscript: number;
		/**
		 * GM
		 */
		private gmShape: Array<egret.Shape> = [];
		/**
		 * 对象
		 */
		public _gameObj: gameObject.Fish;
		/**
		 * 免费游戏定时器
		 */
		private specialTimer: number;
		/**
		 * 当前路径
		 */
		private curPath: table.TableFishPath.PathConfigItem;
		/**
		 * 下一段路径
		 */
		private nextPath: table.TableFishPath.PathConfigItem;
		/**
		 * 相对于路径的偏移量
		 */
		private offsetX: number;
		/**
		 * 相对于路径的偏移量
		 */
		private offsetY: number;
		/**
		 * 路径点索引
		 */
		private pathIndex: number = 0;
		/**
		 * 是否被麻痹
		 */
		// public isParalysis: boolean = false;

		public constructor() {
			super();
		}
		/**
		 * 注册
		 */
		public register(gameObj: gameObject.Fish): void {
			this.pathIndex = 0;
			this._gameObj = gameObj;
			let varsData = (<gameObject.IFishVars>gameObj.varsData);
			let pathId = varsData.pathId;
			let fishPath = table.TableFishPath.getFishPath(pathId);
			// if(fishPath.id == "MF0005"){
			// 	console.assert(false,"??")
			// }
			this.pathConfig = fishPath.pathConfig;
			if (!FishOperation.isPathLeavePoint[pathId]) {
				FishOperation.isPathLeavePoint[pathId] = true;
				this.leaveScenePoint();
			}
			this.spawnTime = varsData.spawnTime;
			this.speed = gameObj.speed;
			this.fishSubscript = varsData.serveID;
			this.offsetX = varsData.offsetX == null ? 0 : varsData.offsetX;
			this.offsetY = varsData.offsetY == null ? 0 : varsData.offsetY;
			let curPath: table.TableFishPath.PathConfigItem = this.pathConfig.first();
			/*特殊处理*/
			if (gameObj.sign == GAMEOBJECT_SIGN.GLOBE_FISH) {
				if (Master.instance.isRotation) {
					if (curPath.angle > 180) {
						this._gameObj.scaleY = -1;
					}
					else {
						this._gameObj.scaleY = 1;
					}
				}
				else {
					if (curPath.angle > 180) {
						this._gameObj.scaleY = 1;
					}
					else {
						this._gameObj.scaleY = -1;
					}
				}

			}
			let nextPath: table.TableFishPath.PathConfigItem = this.pathConfig[1];
			// let radian = curPath.angle - 90;
			this.curPath = curPath;
			this.nextPath = nextPath;

			gameObj.rotation = -1;
			if (gameObj.fishType == 1) {
				// let specialNowTime = game.GameTime.serverNow() + 15000;
				let lastPath = this.pathConfig[this.pathConfig.length - 2];
				let leaveTime = - game.GameTime.serverNow() + varsData.spawnTime + lastPath.distTotal / this.speed - 20000;
				if (leaveTime > 0) {
					this.specialTimer = game.Timer.setTimeout(() => {
						if (gameObj.sign == GAMEOBJECT_SIGN.DRAGON) {
							FishingJoy.FishingJoyLogic.instance.onFreeGame(2, true);
						}
						else if (gameObj.sign == GAMEOBJECT_SIGN.MERMAID) {
							FishingJoy.FishingJoyLogic.instance.onFreeGame(4, true);
						}
					}, this, leaveTime);
				}
			}
		}

		/**
		 * 增加离开场景的点
		 */
		public leaveScenePoint() {
			let lastPath = this.pathConfig.last();
			let lastBeforePath = this.pathConfig[this.pathConfig.length - 2];
			let dist = lastBeforePath.distNext;
			let pathConfigItem = new table.TableFishPath.PathConfigItem();
			let sign = this._gameObj.sign;
			let bodyLength = (sign == GAMEOBJECT_SIGN.MERMAID || sign == GAMEOBJECT_SIGN.DRAGON) ? 700 : 300;
			pathConfigItem.x = lastBeforePath.x + (lastPath.x - lastBeforePath.x) / dist * (dist + bodyLength);
			pathConfigItem.y = lastBeforePath.y + (lastPath.y - lastBeforePath.y) / dist * (dist + bodyLength);
			let distLast = GX.getDistanceByPoint({ x: lastPath.x, y: lastPath.y }, { x: pathConfigItem.x, y: pathConfigItem.y });
			let distTotal = lastPath.distTotal + distLast;
			lastPath.distNext = distLast;
			pathConfigItem.angle = lastPath.angle;
			pathConfigItem.distNext = 0;
			pathConfigItem.distTotal = distTotal;
			this.pathConfig.push(pathConfigItem);
		}

		/**
		 * 帧循环
		 */
		public enterFrame() {
			if (GlobeVars.isFreeze /*|| this.isParalysis*/) {
				return;
			}

			/*移动时间*/
			let gameObj: gameObject.Fish = this._gameObj;
			let leftTime = game.GameTime.serverNow() - this.spawnTime;
			if (leftTime < 0) {
				gameObj.x = -1000;
				gameObj.y = -1000;
				return;
			}
			/*当前已移动距离*/
			let curMoveDistance = leftTime * this.speed;
			let config: table.TableFishPath.PathConfigItem[] = this.pathConfig;
			let lastPath = config.last();
			/*已经走完全程*/
			if (gameObj.sign == GAMEOBJECT_SIGN.DRAGON || gameObj.sign == GAMEOBJECT_SIGN.MERMAID) {
				if (curMoveDistance > config[config.length - 2].distTotal) {
					FishingJoy.FishingJoyLogic.instance.freePromptCloses();
				}
			}

			if (curMoveDistance > lastPath.distTotal) {

				if (gameObj.isDelayDie) {
				}
				else {
					gameObject.GameObjectFactory.instance.recoverGameObject(gameObj);
				}
				return;
			}


			if (curMoveDistance > this.nextPath.distTotal) {
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
			let curPath: table.TableFishPath.PathConfigItem = this.curPath;
			let nextPath: table.TableFishPath.PathConfigItem = this.nextPath;

			curPath = curPath == null ? lastPath : curPath;
			nextPath = nextPath == null ? lastPath : nextPath;

			let distNext = curPath.distNext;// GX.getDistanceByPoint({ x: curPath.x, y: curPath.y }, { x: nextPath.x, y: nextPath.y });
			let offsetDist = curMoveDistance - curPath.distTotal;
			let offsetx = offsetDist / distNext * (nextPath.x - curPath.x);
			let offsety = offsetDist / distNext * (nextPath.y - curPath.y);
			gameObj.x = (curPath.x + offsetx - this.offsetX);
			gameObj.y = (curPath.y + offsety - this.offsetY);

			let tableAngle = curPath.angle;

			if (gameObj.sign == GAMEOBJECT_SIGN.DRAGON) {
				if (tableAngle > 200) {
					gameObj.scaleY = Master.instance.isRotation ? 1 : -1;
					tableAngle = 270;
				}
				else {
					gameObj.scaleY = Master.instance.isRotation ? -1 : 1;
					tableAngle = 90;
				}
				tableAngle = tableAngle - 90;
				this._gameObj.rotation = tableAngle;
			}
			else if (gameObj.sign == GAMEOBJECT_SIGN.MERMAID) {
				if (tableAngle > 200) {
					tableAngle = 360;
				}
				else {
					tableAngle = 180;
				}
				tableAngle = tableAngle - 90;
				this._gameObj.rotation = tableAngle;
			}
			else if (gameObj.sign == GAMEOBJECT_SIGN.BOOM_EX_FISH) {
				this._gameObj.rotation = 0;
			}

			else {
				if (gameObj.sign == GAMEOBJECT_SIGN.GOLD_TOAD) {
					if (!Master.instance.isRotation) {
						tableAngle -= 90;
					}
					else {
						tableAngle += 90;
					}
				}
				else if (gameObj.sign == GAMEOBJECT_SIGN.GLOBE_FISH) {
					if (!Master.instance.isRotation) {
						tableAngle -= 180;
					}
					else {
						tableAngle += 180;
					}
				}

				let angle = tableAngle - 90;
				let rotation = gameObj.rotation;
				if (gameObj.rotation == -1) {
					gameObj.rotation = angle;
				} else {
					let diff = angle - rotation;
					if (diff < -180) {
						angle += 360;
					} else if (diff > 180) {
						angle -= 360;
					}
					let speedRotation = (angle - rotation) / 10;
					this._gameObj.rotation = rotation + speedRotation;
				}
			}
			// if (GM.instance.isOpen(GM.Type.FishPath) && gameObj.sign == GAMEOBJECT_SIGN.GOLD_TOAD) {
			// 	var circle: egret.Shape = new egret.Shape();
			// 	circle.x = this._gameObj.x;
			// 	circle.y = this._gameObj.y;
			// 	circle.graphics.beginFill(0xff0000, 1);
			// 	circle.graphics.drawCircle(0, 0, 5);
			// 	circle.graphics.endFill();
			// 	let fishLayer = manager.LayerManager.instance.getLayer(LAYER.Fish);
			// 	fishLayer.addChild(circle);
			// 	this.gmShape.push(circle);
			// }
		}

		/**
		 * 反注册
		 */
		public unregister(): void {
			let fishLayer = FishingJoy.LayerManager.instance.getLayer(LAYER.Fish);
			for (let item of this.gmShape) {
				if (item.parent)
					fishLayer.removeChild(item);
			}
			this.gmShape.length = 0;
			game.Timer.clearTimeout(this.specialTimer);
			this.curPath = null;
			this.nextPath = null;

			this._gameObj = null;
		}
	}
}