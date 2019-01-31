/**
 * 游戏中心
 * @author suo
 */
module FishingJoy {
	export class GameCenter extends egret.DisplayObject {

		/*单例*/
		private static _instance: GameCenter = null;
		/*数据中心*/
		public dataCenter: DataCenter = DataCenter.instance;
		/*事件收发中心*/
		public eventManager: EventManager = EventManager.instance;
		/*游戏对象管理中心*/
		public gameObjectManager: GameObjectManager;
		/*层级管理器*/
		public layerManager: LayerManager;
		/*操作管理器*/
		public operationManager: OperationManager;
		/*捕鱼*/
		public fishingJoyLogic: FishingJoy.FishingJoyLogic;

		public constructor() {
			super();
			this._init();
			this.addEventListener(egret.Event.ENTER_FRAME, this._enterFrame, this);
			GX.PokerEvent.Instance.leaveRoom.add(this._leaveRoom, this);
		}

		private _init(): void {
			Laya.init();

			table.TableFishPath.instance;
			this.gameObjectManager = GameObjectManager.instance;
			this.layerManager = LayerManager.instance;
			this.operationManager = OperationManager.instance;
			this.fishingJoyLogic = FishingJoy.FishingJoyLogic.instance;
		}


		/**
		 * 获得单例
		 */
		public static get instance(): GameCenter {
			if (this._instance == null) {
				this._instance = new GameCenter();
			}
			return this._instance;
		}

		/**
		 * 退出游戏
		 */
		public _leaveRoom() {
			this.dispose();
		}

		/**
		* 帧事件
		*/
		private _enterFrame(e: egret.Event): void {
			FishingJoy.Laya.timer.update();
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			UICenter.instance.dispose();

			this.fishingJoyLogic.dispose();
			this.fishingJoyLogic = null;
			this.dataCenter.dispose();
			this.dataCenter = null;
			this.layerManager.dispose();
			this.layerManager = null;
			this.operationManager.dispose();
			this.operationManager = null;
			this.gameObjectManager.dispose();
			this.gameObjectManager = null
			game.SoundHand.Instance.dispose();
			this.eventManager.dispose();
			this.eventManager = null;
			Pool.clearAll();


			this.removeEventListener(egret.Event.ENTER_FRAME, this._enterFrame, this);
			GX.PokerEvent.Instance.leaveRoom.remove(this._leaveRoom, this);
			RES.destroyRes(game.GameConstant.ResGroup_BY, false);
			uniLib.ResUtils.clearResConfigByGroupName([game.GameConstant.ResGroup_BY]);
			game.PokerFunction.exitGame();
			uniLib.GameModuleUtils.ExitGame(false);
			GameCenter._instance = null;
		}
	}
}