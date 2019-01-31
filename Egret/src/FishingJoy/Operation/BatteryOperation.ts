/**
 * 炮台控制
 * @author suo
 */
module FishingJoy {
	export class BatteryOperation extends BaseOperation {

		/**
		 * 对象
		 */
		private _gameObj: gameObject.Battery;
		/**
		 * 目标鱼
		 */
		private _targetFish: gameObject.Fish;
		/**
	 	 * 大瞄准图片
	 	 */
		private _aimBig: CustomImage;
		/**
		 * 瞄准小点
		 */
		private _smallPoint: CustomImage;
		/**
		 * 两点之间的距离
		 */
		private readonly POINT_DIS: number = 20;

		public constructor() {
			super();
		}

		/**
		 * 注册
		 */
		public register(gameObj: gameObject.Battery): void {
			this._gameObj = gameObj;
			this._gameObj.seatdata.lockChanged.add(this._aimFish, this);
			this._gameObj.seatdata.onlineChanged.add(this._clear, this);
			this._initPoint();
			this._smallPoint.alpha = 0.8;
			EventManager.registerEvent(EVENT_ID.CHANGE_SEAT, Handler.create(this, this._rotationSeat), REG_TYPE.ONCE);
			EventManager.registerEvent(EVENT_ID.ROBOT_AIM_FISH, Handler.create(this, this._robotAimFish));
		}

		/**
		 * 旋转椅子
		 */
		private _rotationSeat(): void {
			let [x, y]: [number, number] = UIUtil.localToGlobal(this._gameObj.focus);
			let fishLayer: egret.DisplayObjectContainer = FishingJoy.LayerManager.instance.getLayer(LAYER.Fish);
			let [x1, y1]: [number, number] = UIUtil.localToGlobal(fishLayer, x, y);
			this._smallPoint.x = x;
			this._smallPoint.y = y;
		}

		/**
		 * 改变中心点
		 */
		public changeFocus(): void {

		}

		/**
		 * 初始化点
		 */
		private _initPoint(): void {
			this._aimBig = new CustomImage()
			this._aimBig.source = "aimBig";
			this._aimBig.visible = false;
			FishingJoy.LayerManager.instance.addToLayer(this._aimBig, LAYER.AIM);

			let [x, y]: [number, number] = UIUtil.localToGlobal(this._gameObj.focus);
			let pointImg: CustomImage = new CustomImage();
			pointImg.source = "aimPoint";
			pointImg.visible = false;
			pointImg.fillMode = egret.BitmapFillMode.REPEAT;
			pointImg.x = x;
			pointImg.y = y;

			FishingJoy.LayerManager.instance.addToLayer(pointImg, LAYER.AIM);
			pointImg.anchorOffsetY = pointImg.height / 2;
			pointImg.anchorOffsetX = -20 * 3;
			this._smallPoint = pointImg;

		}

		/**
		 * 清除
		 */
		private _clear(): void {
			let seatdata = this._gameObj.seatdata
			if (seatdata.onlineState == Cmd.OnlineState.OnlineState_Offline) {
				console.error(" this._gameObj.seatdata" + seatdata.user.uid + "断线了");
				this._gameObj.isAimShoot = false;
				this._clearAimEff();
				FishingJoy.Laya.timer.clear(this, this._drawAimEff)
				this._targetFish = null;
				this._gameObj.targetFishId = -1;
			}
		}

		/**
		 * 瞄准鱼
		 */
		private _aimFish(rev: game.SeatData): void {
			let uid = rev.user ? rev.user.uid : null;
			// let name = rev.user ? rev.user.nickName : null;
			// console.error("name:" + name + "rev.lock:" + rev.lock)
			if (rev.lock) {
				if (Master.instance.uid == uid) {
					FishingJoy.Laya.timer.clear(this, this._drawAimEff)
					Master.instance.aimFishServelID = rev.lockFishId;
					Master.instance.isAimShoot = true;
					Master.instance.prohibitShoot = false;
					EventManager.fireEvent(EVENT_ID.PLAY_USE_PORP_EFF, [true, SHOOT_TYPE.AIM]);
				}
				this._gameObj.isAimShoot = true;
				let fish: gameObject.Fish = FishingJoy.FishingJoyLogic.instance.inViewFishes.get(rev.lockFishId);
				if (fish && fish.isAlive && fish.isInView) {
					this._targetFish = fish;
					this._gameObj.targetFishId = rev.lockFishId;
					FishingJoy.Laya.timer.frameLoop(1, this, this._drawAimEff)
				}
				else {
					this._waitAimFish();
				}
			}
			else {
				this.clearAim(uid);
			}
		}

		/**
		 * 清除瞄准
		 */
		public clearAim(uid: number): void {
			if (Master.instance.uid == uid) {
				Master.instance.aimFishServelID = NaN;
				Master.instance.isAimShoot = false;
				EventManager.fireEvent(EVENT_ID.PLAY_USE_PORP_EFF, [false, SHOOT_TYPE.AIM])
			}
			this._gameObj.isAimShoot = false;
			this._clearAimEff();
			FishingJoy.Laya.timer.clear(this, this._drawAimEff)
			this._targetFish = null;
			this._gameObj.targetFishId = -1;
		}

		/**
		 * 机器人瞄准鱼
		 */
		private _robotAimFish(uid: number): void {
			if (uid == this._gameObj.user.uid) {
				FishingJoy.Laya.timer.loop(200, this, this._findTargetFish);
			}
		}

		/**
		 * 每秒检测一次场上最值钱的鱼
		 */
		private _findTargetFish(): void {
			let fish: gameObject.Fish = FishingJoy.FishingJoyLogic.instance.findMostValuableFish();
			if (fish != null) {
				FishingJoy.Laya.timer.clear(this, this._findTargetFish)
				this._targetFish = fish;
				this._gameObj.targetFishId = fish.servelID;
				FishingJoy.Laya.timer.frameLoop(1, this, this._drawAimEff)
			}
		}

		/**
		 * 是否是此炮台
		 */
		private _isMine(playerUid: number): boolean {
			if (this._gameObj.user && playerUid == this._gameObj.user.uid) {
				return true;
			}
			else {
				return false
			}
		}

		/**
		 * 绘制瞄准效果
		 */
		private _drawAimEff(): void {
			let tragetFish: gameObject.Fish = this._targetFish
			this._gameObj.isAimShoot = true;
			if (tragetFish && tragetFish.isAlive && tragetFish.isInView) {
				if (this._targetFish.isAccurateCollider) {
					for (let i: number = 0; i < tragetFish.colliderAry.length; i++) {
						let collider: FishingJoy.Collider = tragetFish.colliderAry[i]
						let [x, y]: [number, number] = UIUtil.localToGlobal(collider);
						if (UIUtil.inAimView(x, y)) {
							this._gameObj.curRotation = UIUtil.calculateBatteryRotation(this._gameObj, x, y)
							this._gameObj.setFirePortRotation(this._gameObj.curRotation);
							this._draw(x, y);
							return;
						}
					}

				}
				else {
					let [x, y]: [number, number] = UIUtil.localToGlobal(this._targetFish);
					if (UIUtil.inAimView(x, y)) {
						this._gameObj.curRotation = UIUtil.calculateBatteryRotation(this._gameObj, x, y)
						this._gameObj.setFirePortRotation(this._gameObj.curRotation);
						this._draw(x, y);
						return;
					}
				}
			}
			FishingJoy.Laya.timer.clear(this, this._drawAimEff);
			this._waitAimFish();
		}

		/**
		 * 等待下次瞄准
		 */
		private _waitAimFish(): void {
			this._gameObj.targetFishId = -1;
			this._gameObj.isAimShoot = false;

			if (!this._gameObj.user) {
				return;
			}
			this.clearAim(this._gameObj.user.uid);
			if (this._gameObj.user.uid == Master.instance.uid) {
				EventManager.fireEvent(EVENT_ID.WAIT_AIM);
			}
			else if (this._gameObj.user.isRobot) {
				this._robotAimFish(this._gameObj.user.uid);
			}
			else {
			}
		}


		/**
		 * 发送瞄准协议
		 */
		private _sendAimMsg(isLock: boolean, fishServelID: number): void {
			let cmd: Cmd.ActionCmd_CS = new Cmd.ActionCmd_CS();
			cmd.act = new Cmd.Action()
			cmd.act.uid = Master.instance.uid;
			if (isLock) {
				cmd.act.op = Cmd.Operation.Lock;
				cmd.act.value = fishServelID;
			}
			else {
				cmd.act.op = Cmd.Operation.Unlock;
			}
			game.PokerFunction.tcpSend(cmd);
		}


		/**
		 * 清除瞄准效果
		 */
		private _clearAimEff(): void {
			if (this._smallPoint) {
				this._smallPoint.visible = false;
			}
			if (this._aimBig) {
				this._aimBig.visible = false;
			}
		}

		/**
		 * 计算角度
		 */
		private _calculateRotation(fishX: number, fishY: number): void {
			let [x1, y1]: [number, number] = UIUtil.localToGlobal(this._gameObj.focus);
			this._gameObj.curRotation = GX.getRadianByPoint({ x: fishX, y: fishY }, { x: x1, y: y1 })
		}

		/**
		 * 绘制瞄准效果
		 */
		private _draw(AimX: number, AimY: number): void {
			let smallPoint: CustomImage = this._smallPoint;
			let aimBig = this._aimBig;
			smallPoint.visible = true;
			aimBig.visible = true;
			aimBig.x = AimX;
			aimBig.y = AimY;
			aimBig.rotation = this._targetFish.rotation;
			let [x1, y1]: [number, number] = [smallPoint.x, smallPoint.y]
			let dis: number = Math.sqrt((AimX - x1) * (AimX - x1) + (AimY - y1) * (AimY - y1));
			dis = (Math.ceil(dis / 20) - 5) * 20
			if (dis < 0) {
				dis = 0;
			}
			let pointRotation: number;
			if (Master.instance.seatID == 1 || Master.instance.seatID == 2) {
				pointRotation = this._gameObj.curRotation - 90;
			}
			else {
				pointRotation = this._gameObj.curRotation + 90;
			}
			smallPoint.width = dis
			smallPoint.rotation = pointRotation;
		}

		/**
		 * 反注册
		 */
		public unregister(): void {
			this._gameObj.seatdata.lockChanged.remove(this._aimFish, this);
			this._gameObj.seatdata.onlineChanged.remove(this._clear, this)
			this._gameObj.isAimShoot = false;
			this._clearAimEff();
			EventManager.unregisterEvent(EVENT_ID.CHANGE_SEAT, this, this._rotationSeat);
			EventManager.unregisterEvent(EVENT_ID.ROBOT_AIM_FISH, this, this._robotAimFish);

			FishingJoy.LayerManager.instance.removeFromLayer(this._smallPoint, LAYER.AIM);
			FishingJoy.LayerManager.instance.removeFromLayer(this._aimBig, LAYER.AIM);
			FishingJoy.Laya.timer.clear(this, this._drawAimEff)
			FishingJoy.Laya.timer.clear(this, this._findTargetFish);
			this._targetFish = null;
			this._gameObj.targetFishId = -1;
			this._gameObj = null;
		}
	}
}