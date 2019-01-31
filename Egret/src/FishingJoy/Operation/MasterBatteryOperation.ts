/**
 * 注册主角操作
 * @author suo
 */

module FishingJoy {
	export class MasterBatteryOperation extends BaseOperation {
		/**
		 * 是否在冷却
		 */
		private _isCooling: boolean = false;
		/**
		 * 背景
		 */
		private _bg: eui.Image; logger
		/**
		 * 当前子弹发射间隔 
		 */
		private _curInterval: number;
		/**
		 * 当前发射子弹标志
		 */
		private _curSign: number;
		/**
		 * 对象
		 */
		private _gameObj: gameObject.Battery;
		/**
		 * 鼠标指针
		 */
		private _cursorImg: CustomImage;
		/**
		 * 点击特效冷却
		 */
		private _isClickEffCooling: boolean = false;
		/**
		 * 退潮
		 */
		private _isEbbTide: boolean = false;
		/**
		 * 上一次发送子弹消息的时间
		 */
		private lastSendBulletTime: number;


		constructor() {
			super();
		}

		/**
		 * 注册
		 */
		public register(gameObj: gameObject.Battery): void {
			this._gameObj = gameObj;
			if (uniLib.Global.isH5) {
				PCMouseHelper.changeCursor();
			}
			else {
				this._initCursor()
			}
			EventManager.registerEvent(EVENT_ID.CHANEG_SHOOT_TYPE, Handler.create(this, this._changeShootType))
			EventManager.registerEvent(EVENT_ID.AIM_FISH, Handler.create(this, this._aimFish));
			EventManager.registerEvent(EVENT_ID.WAIT_AIM, Handler.create(this, this._waitAim));
			EventManager.registerEvent(EVENT_ID.FIRE_BULLET, Handler.create(this, this._commonShoot));
			EventManager.registerEvent(EVENT_ID.EBB_TIDE, Handler.create(this, this._onEbbTide));
			gameObj.curRotation = this._gameObj.rotation;
			this._bg = UICenter.instance.getManager(commonUI.FishMainScene).getView(FishingJoy.FishMainSceneView).backGround0;
			this._bg.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this._starDrag, this)
			this._bg.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this._outsideDrag, this);
			this._bg.addEventListener(egret.TouchEvent.TOUCH_END, this._endDrag, this);

			this._curSign = GAMEOBJECT_SIGN.BULLET_SELF
			let curBulletConfig: gameObject.IGameObjectConfig = gameObject.GameObjectConfigParse.getConfigBySign(this._curSign);
			this._curInterval = (curBulletConfig.configData as gameObject.IBulletConfigData).interval;
			EventManager.registerEvent(EVENT_ID.AIM_SPECIAL_FISH, Handler.create(this, this._checkSpecialFish));

			EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [SHOOT_TYPE.AUTO, false]);
			EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [SHOOT_TYPE.AIM, false]);
			// EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [SHOOT_TYPE.FAST, false]);
			egret.MainContext.instance.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this._onDrag, this);

		}

		/**
		 * 检测特殊鱼
		 */
		public _checkSpecialFish(fish: gameObject.GameObjectCollider, isOpen: boolean): void {
			if (isOpen) {
				FishingJoy.Laya.timer.loop(300, this, this._checkAim, [fish]);
			}
			else {
				FishingJoy.Laya.timer.clear(this, this._checkAim);
			}
		}

		/**
		 * 退潮
		 */
		private _onEbbTide(): void {
			if (Master.instance.isAimShoot && Master.instance.isAutoShoot) {
				Master.instance.prohibitShoot = true;
			}
			else {
				this._isEbbTide = true;
				FishingJoy.Laya.timer.once(2000, this, () => { this._isEbbTide = false; })
			}
			if (Master.instance.isAimShoot) {
				this._waitAim(MathUtil.random(1800, 2000));
			}
		}

		/**
		 * 检测能否瞄准
		 */
		public _checkAim(fish: gameObject.Fish): void {
			if (fish && fish.isAlive && fish.isInView) {
				let batteryGroup: SimpleMap<gameObject.Battery> = FishingJoy.FishingJoyLogic.instance.allBattery;
				for (let i: number = 0; i < batteryGroup.length; i++) {
					let battery: gameObject.Battery = batteryGroup.getByKeyIndex(i);
					if (battery.isAimShoot) {
						if (UIUtil.isCanAim(fish)) {
							if (battery.user.uid == Master.instance.uid) {
								if (Master.instance.aimFishServelID != fish.servelID && !battery.aimSpecialFish) {
									this._aimFish(fish);
									battery.aimSpecialFish = true;
								}
							}
							else if (battery.user.isRobot) {
								if (battery.targetFishId != fish.servelID && !battery.aimSpecialFish) {
									EventManager.fireEvent(EVENT_ID.ROBOT_AIM_FISH, battery.user.uid);
									battery.aimSpecialFish = true;
								}
							}
						}
						else {
							/*出屏幕了*/
							battery.aimSpecialFish = false;
						}
					}
				}
			}
			else {
				FishingJoy.Laya.timer.clear(this, this._checkAim);
			}
		}

		/**
		 * 等待下次瞄准
		 */
		private _waitAim(timer: number = MathUtil.random(400, 600)): void {
			this._changeShootType(SHOOT_TYPE.AIM, false);
			FishingJoy.Laya.timer.loop(timer, this, this._findTargetFish);
		}

		/**
		 * 初始化鼠标指针
		 */
		private _initCursor(): void {
			this._cursorImg = new CustomImage();
			this._cursorImg.source = "cursor1";
			this._cursorImg.x = uniLib.Global.screenWidth / 2;
			this._cursorImg.y = uniLib.Global.screenHeight / 2;
			FishingJoy.LayerManager.instance.addToLayer(this._cursorImg, LAYER.CURSOR);
		}

		/**
		 * 瞄准此鱼
		 */
		private _aimFish(fish: gameObject.Fish): void {
			if (Master.instance.isAimShoot) {
				this._sendAimMsg(true, fish.servelID);
			}
		}

		/**
		 * 改变射击模式
		 */
		private _changeShootType(value: number, isOpen: boolean): void {
			/*快速射击*/
			if (value == SHOOT_TYPE.FAST) {
				let curBulletConfig: gameObject.IGameObjectConfig = gameObject.GameObjectConfigParse.getConfigBySign(this._curSign);
				if (isOpen) {
					this._curInterval = (curBulletConfig.configData as gameObject.IBulletConfigData).fastInterval;
				}
				else {
					this._curInterval = (curBulletConfig.configData as gameObject.IBulletConfigData).interval;
				}
				Master.instance.isFastShoot = isOpen;
				EventManager.fireEvent(EVENT_ID.PLAY_USE_PORP_EFF, [isOpen, value])
			}
			/*瞄准射击*/
			else if (value == SHOOT_TYPE.AIM) {
				if (isOpen) {
					let fish: gameObject.Fish = FishingJoy.FishingJoyLogic.instance.findMostValuableFish();
					if (fish != null) {
						this._sendAimMsg(true, fish.servelID);
					}
					else {
						FishingJoy.Laya.timer.loop(400, this, this._findTargetFish);
					}

				}
				else {
					FishingJoy.Laya.timer.clear(this, this._findTargetFish);
					this._sendAimMsg(false, -1);
				}
				Master.instance.isAimShoot = isOpen;
			}
			/*自动射击*/
			else if (value == SHOOT_TYPE.AUTO) {
				if (isOpen) {
					FishingJoy.Laya.timer.loop(this._curInterval, this, this._autoOperation);
				}
				else {
					FishingJoy.Laya.timer.clear(this, this._autoOperation)
				}
				Master.instance.isAutoShoot = isOpen;
				EventManager.fireEvent(EVENT_ID.PLAY_USE_PORP_EFF, [isOpen, value])
			}


			/*是否为普通射击*/
			if (!Master.instance.isAutoShoot && !Master.instance.isFastShoot && !Master.instance.isAimShoot) {
				Master.instance.isNormalShoot = true;
			}
			else {
				Master.instance.isNormalShoot = false;
			}
		}

		/**
		 * 每秒检测一次场上最值钱的鱼
		 */
		private _findTargetFish(): void {
			let fish: gameObject.Fish = FishingJoy.FishingJoyLogic.instance.findMostValuableFish();
			if (fish != null) {
				FishingJoy.Laya.timer.clear(this, this._findTargetFish)
				this._sendAimMsg(true, fish.servelID);
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
		 * 开始拖动
		 */
		private _starDrag(e: egret.TouchEvent): void {
			let gameObj = this._gameObj;
			if (!gameObj.user) {
				return;
			}
			if (gameObj.user.point < this._gameObj.batteryID) {
				let tipPanel = MasterBatteryOperation.tipPanel;
				if (!tipPanel || !tipPanel.parent) {
					tipPanel = GX.Tips.showPopup("金币不足!");
					MasterBatteryOperation.tipPanel = tipPanel;
				}
				return;
			}
			if (this._cursorImg) {
				this._cursorImg.x = e.stageX;
				this._cursorImg.y = e.stageY;
			}
			this.clickAnimation(e)


			if (Master.instance.isAutoShoot) {
				gameObj.curRotation = UIUtil.calculateBatteryRotation(gameObj, e.stageX, e.stageY)
			}
			else if (Master.instance.isAimShoot || Master.instance.isFastShoot || Master.instance.isNormalShoot) {
				gameObj.curRotation = UIUtil.calculateBatteryRotation(gameObj, e.stageX, e.stageY)
				this._commonShoot();
				FishingJoy.Laya.timer.loop(this._curInterval, this, this._onDragShoot);

			}

			if (!Master.instance.isAimShoot) {
				egret.MainContext.instance.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this._onDrag, this);
				egret.MainContext.instance.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this._onDrag, this);
			}
		}


		/**
		 * 点击动效
		 */
		public clickAnimation(e: egret.TouchEvent) {
			if (game.Config.fluencyModel) {
				return;
			}
			if (this._isClickEffCooling) {
				return;
			}
			this._isClickEffCooling = true;
			FishingJoy.Laya.timer.once(100, this, () => { this._isClickEffCooling = false })

			let back0 = UICenter.instance.getManager(commonUI.FishMainScene).getView(FishingJoy.FishMainSceneView);
			let click = Pool.getItemByCreateFun(Pool.clickingWaterWave, Handler.create(this, this._creatClickingWaterWave, null, true))
			UIUtil.movPlayOnce(back0, click, e.stageX, e.stageY, 2, 2, Handler.create(this, () => { Pool.recover(Pool.clickingWaterWave, click) }, null, true));
		}

		/**
		 * 创建水波纹
		 */
		private _creatClickingWaterWave(): egret.MovieClip {
			let mov: egret.MovieClip = UIUtil.creatMovieClip("clickingWaterWave");
			mov.blendMode = egret.BlendMode.ADD;
			return mov;
		}



		/**
		 * 拖到屏幕外
		 */
		private _outsideDrag(e: egret.TouchEvent): void {
			GlobeVars.isDraging = false;
			FishingJoy.Laya.timer.clear(this, this._onDragShoot);
			egret.MainContext.instance.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this._onDrag, this);
		}

		/**
		 * 正在拖动
		 */
		private _onDrag(e: egret.TouchEvent): void {
			GlobeVars.isDraging = true;
			this._gameObj.curRotation = UIUtil.calculateBatteryRotation(this._gameObj, e.stageX, e.stageY);
			if (this._cursorImg) {
				this._cursorImg.x = e.stageX;
				this._cursorImg.y = e.stageY;
			}
			this.clickAnimation(e);
		}

		/**
		 * 拖动结束
		 */
		private _endDrag(e: egret.TouchEvent): void {
			GlobeVars.isDraging = false;
			if (this._cursorImg) {
				this._cursorImg.x = e.stageX;
				this._cursorImg.y = e.stageY;
			}
			FishingJoy.Laya.timer.clear(this, this._onDragShoot);
			egret.MainContext.instance.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this._onDrag, this);
		}

		/**
		 * 发送一枚子弹
		 */
		private _fireOneBullet(sign: GAMEOBJECT_SIGN): void {
			this._sendMsg();
		}

		/**
		 * 自动射击
		 */
		private _autoOperation(): void {
			this._onDragShoot();
		}


		/**
		 * 普通射击
		 */
		private _commonShoot(): void {
			/*退潮时不能发子弹*/
			if (this._isEbbTide) {
				return;
			}
			if (Master.instance.prohibitShoot) {
				return;
			}
			if (this._isCooling) {
				return;
			}

			this._isCooling = true;
			FishingJoy.Laya.timer.once(this._curInterval, null, () => { this._isCooling = false; });
			this._fireOneBullet(GAMEOBJECT_SIGN.BULLET_SELF);
		}


		/**
		 * 按住射击
		 */
		private _onDragShoot(): void {
			/*退潮时不能发子弹*/
			if (this._isEbbTide) {
				return;
			}
			if (Master.instance.prohibitShoot) {
				return;
			}
			if (this._isCooling) {
				return;
			}

			this._fireOneBullet(GAMEOBJECT_SIGN.BULLET_SELF);
		}

		/**
		 * 弹出面板
		 */
		private static tipPanel: any;

		/**
		 * 发送协议
		 */
		private _sendMsg(): void {
			if (FishingJoy.DataCenter.instance.isSwitchFish) {
				return;
			}
			if (!this._gameObj) {
				return;
			}

			if (this._gameObj.money < this._gameObj.batteryID) {
				this.stopLaunchBullet();
				let tipPanel = MasterBatteryOperation.tipPanel;
				if (!tipPanel || !tipPanel.parent) {
					tipPanel = GX.Tips.showPopup("金币不足!");
					MasterBatteryOperation.tipPanel = tipPanel;
				}
				return;
			}
			// if (FishingJoy.FishingJoyLogic.instance.inViewBullets.length > 100) {
			// 	GX.Tips.showTips("当前屏幕内子弹过多!");
			// 	Master.instance.prohibitShoot = true;
			// 	FishingJoy.Laya.timer.once(2000, null, () => {
			// 		Master.instance.prohibitShoot = false;
			// 	})
			// 	return;
			// }
			if (!uniLib.NetMgr.ws || uniLib.NetMgr.ws.isConnected != 1) {
				return;
			}
			// let now = Date.now();
			// console.error((now - this.lastSendBulletTime));
			// if (now - this.lastSendBulletTime < 150) {
			// 	return;
			// }
			// this.lastSendBulletTime = now;
			let cmd = new Cmd.BetRoomCmd_CS();
			cmd.bulletinfo = new Cmd.BulletInfo();
			cmd.bulletinfo.angle = this._gameObj.curRotation;
			cmd.bet = new Cmd.DoorChips();
			cmd.bet.chips = DataCenter.instance.getBatteryIndex(this._gameObj.batteryID) + 1;
			game.PokerFunction.tcpSend(cmd);

			var serverNow = game.GameTime.serverNow();
			let rev = new Cmd.BetRoomCmd_CS();
			rev.bulletinfo = new Cmd.BulletInfo();
			rev.bulletinfo.uid = uniLib.NetMgr.UID;
			rev.bulletinfo.cost = this._gameObj.batteryID;
			rev.bulletinfo.id = gameObject.Bullet.VIR_UID--;
			rev.bulletinfo.angle = this._gameObj.curRotation;
			rev.bulletinfo.fireTime = serverNow;
			this.launchBullet(rev);
		}


		/**
		 * 发射子弹
		 */
		launchBullet(rev: Cmd.BetRoomCmd_CS) {
			game.Action.sendBulletEvent.call(rev.bulletinfo);
		}
		/**
		 * 停止发射子弹
		 */
		public stopLaunchBullet() {
			FishingJoy.Laya.timer.clear(this, this._autoOperation);
			FishingJoy.Laya.timer.clear(this, this._onDragShoot);
			EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [SHOOT_TYPE.AUTO, false]);
			EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [SHOOT_TYPE.AIM, false]);
			// EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [SHOOT_TYPE.FAST, false]);
			egret.MainContext.instance.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this._onDrag, this);
		}
		/**
		 * 反注册
		 */
		public unregister(): void {
			FishingJoy.Laya.timer.clear(this, this._findTargetFish)
			FishingJoy.Laya.timer.clear(this, this._autoOperation);
			FishingJoy.Laya.timer.clear(this, this._onDragShoot);
			this._bg.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this._starDrag, this)
			this._bg.removeEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this._outsideDrag, this);
			this._bg.removeEventListener(egret.TouchEvent.TOUCH_END, this._endDrag, this);
			egret.MainContext.instance.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this._onDrag, this);

			if (uniLib.Global.isH5) {
				PCMouseHelper.recover();
			}
			else {
				FishingJoy.LayerManager.instance.removeFromLayer(this._cursorImg, LAYER.CURSOR);
				this._cursorImg = null;
			}
			EventManager.unregisterEvent(EVENT_ID.FIRE_BULLET, this, this._commonShoot);
			EventManager.unregisterEvent(EVENT_ID.AIM_FISH, this, this._aimFish);
			EventManager.unregisterEvent(EVENT_ID.CHANEG_SHOOT_TYPE, this, this._changeShootType);
			EventManager.unregisterEvent(EVENT_ID.WAIT_AIM, this, this._waitAim)
			EventManager.unregisterEvent(EVENT_ID.AIM_SPECIAL_FISH, this, this._checkSpecialFish);
			EventManager.unregisterEvent(EVENT_ID.EBB_TIDE, this, this._onEbbTide);
			this._gameObj = null;
		}
	}

}