/**
 * 玩家数据中心
 * @author suo
 */
module FishingJoy {
	export class Master {
		/*单例*/
		private static _instance: Master = null;
		/*uid*/
		public uid: number = -1;
		/*昵称*/
		public nickName: string = undefined;
		/*头像路径*/
		public headURL: string = undefined;
		/*金钱*/
		public money: number = 0;
		/*上一次金钱数量*/
		public lastMoney: number = 0;
		/*性别*/
		public gender: string = undefined;
		/*基础数据*/
		public baseInfo: game.UserInfo = null;
		/*座位数据*/
		public seatID: number = -1;
		/*是否瞄准射击*/
		public isAimShoot: boolean = false;
		/*是否快速射击*/
		public isFastShoot: boolean = false;
		/*是否自动射击*/
		public isAutoShoot: boolean = false;

		/*瞄准射击是否冷却*/
		public isAimShootCooling: boolean = false;
		/*快速射击是否冷却*/
		public isFastShootCooling: boolean = false;
		/*自动射击是否冷却*/
		public isAutoShootCooling: boolean = false;
		/*冰冻是否冷却*/
		public isFrozenShootCooling: boolean = false;

		/*是否普通射击*/
		public isNormalShoot: boolean = true;
		/*瞄准鱼的服务器ID*/
		public aimFishServelID: number = NaN;
		/*是否旋转*/
		public isRotation: boolean = false;
		/*玩家炮台*/
		public masterBattery: gameObject.Battery = null;
		/*禁止射击*/
		public prohibitShoot: boolean = false;

		public constructor() {
			game.RoomData.Instance.MainSeatChanged.add(this.updatePlayerInfo, this);
			EventManager.registerEvent(EVENT_ID.CHANGE_SEAT, Handler.create(this, this._mainSeatChanged));
		}



		/**
		 * 获得单例
		 */
		public static get instance(): Master {
			if (this._instance == null) {
				this._instance = new Master();
			}
			return this._instance;
		}

		/** 
		 * 更新玩家数据
		 */
		public updatePlayerInfo(value: game.USerSeatState): void {
			if (value == game.USerSeatState.SitDown) {
				if (game.PokerFunction.MainUser != null) {
					this.uid = game.PokerFunction.MainUser.uid;
					this.seatID = game.PokerFunction.MainSeatId;
					if (this.baseInfo == null) {
						this.baseInfo = game.PokerFunction.MainUser;
						this.baseInfo.nameChanged.add(this._nameChanged, this);
						this.baseInfo.headUrlChanged.add(this._headChanged, this);
					}
				}
				EventManager.fireEvent(EVENT_ID.MASTER_SIT_DOWN, this.seatID);
			}
			else if (value == game.USerSeatState.StandUp) {
				if (this.seatID != -1) {
					this.seatID = -1;
				}
				if (this.baseInfo != null) {
					this.baseInfo.nameChanged.remove(this._nameChanged, this);
					this.baseInfo.headUrlChanged.remove(this._headChanged, this);
					this.baseInfo = null;
				}
			}
		}

		/**
		  * 主角座位改变
		  */
		private _mainSeatChanged() {
			let mainSeat = game.PokerFunction.MainSeat;
			if (mainSeat == null)
				return;
			let seatId = mainSeat.seatId;
			egret.log("玩家座位id为：" + seatId);
			if (seatId > 2) {
				this.isRotation = true;
				let rotation = 180;
				FishingJoy.LayerManager.instance.setLayerRotation(rotation, LAYER.Fish);
				FishingJoy.LayerManager.instance.setLayerRotation(rotation, LAYER.FishingNet);
				FishingJoy.LayerManager.instance.setLayerRotation(rotation, LAYER.Bullet);
				FishingJoy.LayerManager.instance.setLayerRotation(rotation, LAYER.ElectricEFF);
				FishingJoy.LayerManager.instance.setLayerRotation(rotation, LAYER.EFFECT_ROTATION);
				let backGround0: eui.Image = UICenter.instance.getManager(commonUI.FishMainScene).getView(FishingJoy.FishMainSceneView).backGround0;
				// backGround0.rotation = rotation;
				let batteryGroup: SimpleMap<gameObject.Battery> = UICenter.instance.getManager(commonUI.FishMainScene).getView(FishingJoy.SeatView).batteryGroup;
				let mainBattery: gameObject.Battery = batteryGroup.get(seatId);
				if (seatId == 3) {
					let changeBattery2: gameObject.Battery = batteryGroup.get(2);
					mainBattery.changeSeat(changeBattery2);
					mainBattery.curRotation = 180;
					/*交换14椅子*/
					let changeBattery4: gameObject.Battery = batteryGroup.get(4);
					let changeBattery1: gameObject.Battery = batteryGroup.get(1);
					changeBattery4.changeSeat(changeBattery1);
				}
				else if (seatId == 4) {
					let changeBattery: gameObject.Battery = batteryGroup.get(1);
					mainBattery.changeSeat(changeBattery);
					/*交换23椅子*/
					let changeBattery2: gameObject.Battery = batteryGroup.get(2);
					let changeBattery3: gameObject.Battery = batteryGroup.get(3);
					mainBattery.curRotation = 180;
					changeBattery2.changeSeat(changeBattery3);
				}
			}
		}


		/**
		 * 姓名被更改时
		 */
		private _nameChanged() {
			this.nickName = this.baseInfo.nickName;
		}

		/**
		 * 头像变更
		 */
		private _headChanged(): void {
			this.headURL = this.baseInfo.headUrl;
		}


		/**
		 * 释放
		 */
		public dispose(): void {
			this.uid = -1;
			this.nickName = undefined;
			this.headURL = undefined;
			this.money = -1;
			this.gender = undefined;

			if (this.baseInfo != null) {
				this.baseInfo.nameChanged.remove(this._nameChanged, this);
				this.baseInfo.headUrlChanged.remove(this._headChanged, this);
				this.baseInfo = null;
			}
			game.RoomData.Instance.MainSeatChanged.remove(this.updatePlayerInfo, this);
			EventManager.unregisterEvent(EVENT_ID.CHANGE_SEAT, this, this._mainSeatChanged);
			Master._instance = null;
		}

	}

	export enum SHOOT_TYPE {
		/*极速射击*/
		FAST,
		/*瞄准射击*/
		AIM,
		/*自动射击*/
		AUTO,
		/*普通射击*/
		NORMAL,
		/*全屏冰冻*/
		FREEZE,
	}
}