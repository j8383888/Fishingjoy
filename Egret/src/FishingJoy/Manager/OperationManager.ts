/**
 * 操作管理器 广义操作管理器  不光包括玩家操作 还包括子弹轨迹 存在注册具体操作方式不一样而已
 * @author suo
 */
module FishingJoy {
	export class OperationManager {

		/**
		 * 单例
		 */
		private static _instance: OperationManager;
		/**
		 * 已注册的操作行为字典
		 */
		private _resgisterOprDic: Dictionary = new Dictionary();
		/**
		 * 操作类型映射字典
		 */
		private _operationClsDic: Dictionary = new Dictionary();
		/**
		 * 注册ID
		 */
		private _registerID: number = -1;
		constructor() {
			this._operationClsDic.set(OPERATION_TYPE.MASTER, MasterBatteryOperation);
			this._operationClsDic.set(OPERATION_TYPE.BULLET, BulletOperation);
			this._operationClsDic.set(OPERATION_TYPE.BulletTrack, BulletTrackOperation);
			this._operationClsDic.set(OPERATION_TYPE.SIMPLE, SimpleOperation);
			this._operationClsDic.set(OPERATION_TYPE.FISH, FishOperation);
			this._operationClsDic.set(OPERATION_TYPE.BATTERY, BatteryOperation);
			FishingJoy.Laya.timer.frameLoop(1, this, this._update)
			EventManager.registerEvent(EVENT_ID.FREEZE_FISH_OPERA, Handler.create(this, this._setFishFreeze));

		}

		/**
		 * 获得行为
		 */
		public getOperation(registerID: number): BaseOperation {
			return this._resgisterOprDic.get(registerID);
		}

		/**
		 * 快速离场
		 */
		public leaveQuickly(): void {
			let values: BaseOperation[] = this._resgisterOprDic.values
			for (let item of values) {
				if (egret.is(item, "FishingJoy.FishOperation")) {
					let operation: FishOperation = (item as FishOperation);
					let spawnTime = operation.spawnTime;
					let leftTime = game.GameTime.serverNow() - spawnTime;
					let distTotal = operation.speed * leftTime;
					operation.speed = 1;
					let needTime = distTotal / operation.speed;
					operation.spawnTime += (leftTime - needTime);
				}
			}
		}

		/**
		 * 鱼被冰冻
		 */
		private _setFishFreeze(time: number, battery: gameObject.Battery, fishX?: number, fishY?: number): void {
			if (time <= 0 || GlobeVars.isFreeze) {
				return;
			}
			battery.showFreezePropEff(true);
			if (battery == Master.instance.masterBattery) {
				EventManager.fireEvent(EVENT_ID.PLAY_USE_PORP_EFF, [true, SHOOT_TYPE.FREEZE])
			}
			console.error("冰冻协议")
			GlobeVars.isFreeze = true;
			EventManager.fireEvent(EVENT_ID.FREEZE_EFF_SHOW, [fishX, fishY]);

			if (time > 1500) {
				FishingJoy.Laya.timer.once(time - 1500, this, () => {
					EventManager.fireEvent(EVENT_ID.FREEZE_EFF_RECOVER, [1500, Handler.create(this, this._freezeRecover, [time, battery], true)]);
				});
			}
			else {
				EventManager.fireEvent(EVENT_ID.FREEZE_EFF_RECOVER, [time, Handler.create(this, this._freezeRecover, [time, battery], true)]);
			}
		}

		/**
		 * 冰冻恢复
		 */
		private _freezeRecover(timer: number, battery: gameObject.Battery): void {
			let fishMap: Dictionary = FishingJoy.FishingJoyLogic.instance.inViewFishes;
			let fishMapLen: number = fishMap.length
			for (let i: number = 0; i < fishMapLen; i++) {
				let fish: gameObject.Fish = fishMap.values[i];
				if (fish) {
					fish.isResetNormal()
				}
			}
			GlobeVars.isFreeze = false;
			let resgisterOprDic = this._resgisterOprDic
			let values: any[] = resgisterOprDic.values;
			for (let item of values) {
				if (egret.is(item, "FishingJoy.FishOperation")) {
					let fishOperation: FishOperation = item;
					fishOperation.spawnTime += timer;
				}
			}
			battery.showFreezePropEff(false);
			if (battery == Master.instance.masterBattery) {
				EventManager.fireEvent(EVENT_ID.PLAY_USE_PORP_EFF, [false, SHOOT_TYPE.FREEZE])
			}

		}


		/**
		 * 获取单例
		 */
		public static get instance(): OperationManager {
			if (this._instance == void 0) {
				this._instance = new OperationManager();
			}
			return this._instance;
		}

		/**
		 * 更新
		 */
		public _update() {
			let resgisterOprDic = this._resgisterOprDic
			let values: string[] = resgisterOprDic.keys;
			for (let item of values) {
				resgisterOprDic.get(item).enterFrame();
			}
			// console.error("行为对象池:" + values.length)
		}

		/**
		 * 对某个对象 注册操作方式 返回注册id用于反注册
		 */
		public registerOperation(gameObj: gameObject.GameObject, opeartionType: OPERATION_TYPE): number {
			if (gameObj == null) {
				console.assert(false, "注册对象为空！")
			}
			let cls = this._operationClsDic.get(opeartionType);
			if (cls == null) {
				console.assert(false, "operation 未被注册！")
			}
			var registerOperation: BaseOperation = new cls();
			registerOperation.operationType = opeartionType;
			registerOperation.register(gameObj);
			this._registerID++;
			this._resgisterOprDic.set(this._registerID, registerOperation);
			return this._registerID;
		}

		/**
		 * 反注册操作
		 */
		public unregisterOperation(registerID: number): void {
			if (registerID == -1) {
				return;
			}
			var operation: BaseOperation = this._resgisterOprDic.get(registerID);
			if (operation != null) {
				operation.unregister();
				operation = null;
				this._resgisterOprDic.remove(registerID);
			}
			else {
				// console.assert(false, "registerID不存在！")
			}
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			FishingJoy.Laya.timer.clear(this, this._update);
			EventManager.unregisterEvent(EVENT_ID.FREEZE_FISH_OPERA, this, this._setFishFreeze);
			this._resgisterOprDic.clear();
			this._resgisterOprDic = null;
			this._operationClsDic.clear();
			this._operationClsDic = null;
			OperationManager._instance = null;
		}
	}
}