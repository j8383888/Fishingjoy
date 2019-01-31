/**
 * 数据处理中心
 * @author suo
 */
module FishingJoy {
	export class DataCenter {

		/*单例*/
		private static _instance: DataCenter = null;
		/*玩家数据*/
		public master: Master = Master.instance;
		/*等级 （低级场,中级场，高级场）*/
		public level: number = 0;
		/*是否已经初始化*/
		public isInit: boolean = false;
		/*房间号*/
		public roomID: number = 0;
		/*上次游戏状态*/
		public lastGameStatus: number;
		/*当前游戏状态*/
		public gameStatus: number;
		/*炮台最大ID*/
		public batteryIDAry: number[];

		public sceneId: SCENEID;
		/*下注额组*/
		public get betAmount(): number[] {
			return game.RoomData.Instance.baseRoomConfig.betAmountList;
		}
		/*跑马灯触发调剂*/
		public noticeTriggers: number = 0;

		public constructor() {
			GX.PokerEvent.Instance.roomDataUpdateEvent.add(this._updataRoomData, this);
			GX.PokerEvent.Instance.gameStateUpdate.add(this._gameStateUpdate, this);
			game.RoomData.Instance.frozenEndTimeChanged.add(this._freezeFish, this);
			game.Action.sendItemInEvent.add(this.propInit, this);
		}

		/**
		 * 冰冻鱼
		 */
		private _freezeFish(data: game.RoomData): void {
			if (data.frozenEndTime == null)
				return;
			let freezeTime: number = data.frozenEndTime - game.GameTime.serverNow() - 200
			if (freezeTime < 0) {
				return;
			}
			// egret.log("data.frozenUserId" + data.frozenUserId);

			let view: FishBtnView = UICenter.instance.getManager(commonUI.FishMainScene).getView(FishingJoy.FishBtnView)
			FishingJoy.Laya.timer.once(200, null, () => {
				let battery: gameObject.Battery = FishingJoyLogic.instance.allBattery.get(data.frozenUserId);
				if (battery) {
					EventManager.fireEvent(EVENT_ID.FREEZE_FISH_OPERA, [freezeTime, battery]);
				}
			})
			let back1 = view.BtnGroup;
			FishingJoy.Laya.timer.once(200, null, () => { let a = new SkillCDEffect(back1, 39.5, 36 + 168.68, 60, 60, freezeTime, freezeTime, SHOOT_TYPE.FREEZE); })


		}

		/**
		 * 获得单例
		 */
		public static get instance(): DataCenter {
			if (this._instance == null) {
				this._instance = new DataCenter();
			}
			return this._instance;
		}

		/**
		 * 游戏状态更新
		 */
		private _gameStateUpdate(data: Cmd.GameStatusInfo) {
			if (!this.isInit) {
				return;
			}
			if (!data) {
				return;
			}

			/*上一次游戏状态*/
			this.lastGameStatus = this.gameStatus;
			if (data.status == Cmd.GameStatus.GameStatus_Bet) {
				egret.log("=============下注状态=============");
				let time: number = Math.floor(data.endTime / 1000 - game.GameTime.serverNow() / 1000);
				this.gameStatus = GAME_STATE.BET;
			}
			else if (data.status == Cmd.GameStatus.GameStatus_Free) {
				egret.log("=============空闲状态=============");
				this.gameStatus = GAME_STATE.FREE;
			}
			else if (data.status == Cmd.GameStatus.GameStatus_Lottery) {
				egret.log("=============开奖状态=============");
				this.gameStatus = GAME_STATE.LOTTERY;
			}
			else if (data.status == Cmd.GameStatus.GameStatus_Settle) {
				egret.log("=============结算状态=============");
				this.gameStatus = GAME_STATE.SETTLE;

			}
			if (this.lastGameStatus != this.gameStatus) {
			}
		}
		/**
		 * 是否正在切换鱼潮
		 */
		private m_isSwitchFish: boolean;
		public set isSwitchFish(b: boolean) {
			this.m_isSwitchFish = b;
		}
		public get isSwitchFish(): boolean {
			return this.m_isSwitchFish;
		}

		/**
		 * 获取下注索引 通过炮id
		 */
		public getBatterIdByIndex(index: number) {
			if (this.betAmount.length) {
				return this.betAmount[index];
			}
		}
		/**
		 * 获取下注索引 通过炮id
		 */
		public getBatteryIndex(batterId: number) {
			if (this.betAmount.length) {
				return this.betAmount.find(v => v == batterId);
			}
		}

		/**
		 * 通过batterId 获取下一个炮batterId
		 */
		public nextBatterId(batterId: number) {
			if (this.betAmount.length) {
				let batterIdList = this.betAmount;
				let index = batterIdList.find(v => v == batterId);
				if (index + 1 > this.betAmount.length - 1) {
					index = 0;
				}
				else {
					index++;
				}
				return batterIdList[index];
				// return nextBatterId == null ? batterIdList.last() : nextBatterId;
			}
		}
		/**
		 * 通过batterId 获取之前炮batterId
		 */
		public beforBatterId(batteryId: number) {
			if (this.betAmount.length) {
				let batterIdList = this.betAmount;
				let index = batterIdList.find(v => v == batteryId);
				if (index - 1 < 0) {
					index = this.betAmount.length - 1;
				}
				else {
					index--;
				}
				return batterIdList[index];
				// let beforBatterId = batterIdList[index];
				// return beforBatterId == null ? batterIdList.first() : beforBatterId;
			}
		}
		/**
		 * 最小的炮id
		 */
		public minBatterId() {

			return this.betAmount.first();
		}
		/**
		 * 最大的炮id
		 */
		public maxBatterId() {
			return this.betAmount.last();
		}
		/** 
		 * 获取奖章等级
		 */
		public getRuleConfigList() {
			return RES.getRes("TableGameRuleConfigList_json").filter((v: table.TableGameRuleConfigList) => v.level == this.level);
		}

		/** 
		 * 获取道具信息
		 */
		public accessToProps(level) {
			return RES.getRes("TablePropConfig_json").filter((v: table.TablePropConfig) => v.id == level);
		}
		/** 
		 * 初始化道具
		 */
		public propInit(rev: Cmd.SendItemInfo_S) {
			let view: FishBtnView = UICenter.instance.getManager(commonUI.FishMainScene).getView(FishBtnView)
			view.frozenQuantity.text = "0";
			view.autoQuantity.text = "0";
			view.aimQuantity.text = "0";
			console.error(rev.items, "这里是什么", rev.items.length)
			if (rev.items && rev.items.length) {
				// if(rev.items[PROP_TYPE.FREEZE - 1].num>99){
				// 	view.frozenQuantity.size = 12;
				// }
				// if(rev.items[PROP_TYPE.AUTO - 1].num>99){
				// 	view.autoQuantity.size = 12;

				// }
				// if(rev.items[PROP_TYPE.AIM - 1].num>99){
				// 	view.aimQuantity.size = 12;
				// }
				for (let item of rev.items) {
					console.error(item, "这里是什么")
					if (item) {
						if (item.id == 1) {
							view.autoQuantity.text = (item.num).toString();
							if (item.num > 99) {
								view.autoQuantity.size = 12;
							}
						}
						else if (item.id == 3) {
							view.aimQuantity.text = (item.num).toString();
							if (item.num > 99) {
								view.aimQuantity.size = 12;
							}
						}
						else if (item.id == 4) {
							view.frozenQuantity.text = (item.num).toString();
							if (item.num > 99) {
								view.frozenQuantity.size = 12;
							}
						}
					}
				}
				// view.frozenQuantity.text = (rev.items[PROP_TYPE.FREEZE - 1].num).toString();
				// view.autoQuantity.text = (rev.items[PROP_TYPE.AUTO - 1].num).toString();
				// view.aimQuantity.text = (rev.items[PROP_TYPE.AIM - 1].num).toString();
			}
		}


		/** 
		 * 初始化房间数据
		 */
		private _updataRoomData(rev: Cmd.RoomDataUpdateCmd_S): void {
			if (!rev) {
				return;
			}
			if (!this.isInit) {
				this.isInit = true;
				// if (rev.roomData.items && rev.roomData.items.length) {
				// 	this.propInit(rev.roomData.items);
				// }

				this.roomID = rev.roomData.roomId;
				/*房间等级*/
				this.level = rev.roomData.level;
				this.noticeTriggers = rev.roomData.baseRoomConfig.noticeTriggers[this.level - 1].id;
				this.batteryIDAry = this.getRuleConfigList()[0].batteryIds;

				EventManager.fireEvent(EVENT_ID.ROOM_LEVEL_UPDATE, this.level);

				/*下注状态*/
				if (this.gameStatus == GAME_STATE.BET) {


				}
				else if (this.gameStatus == GAME_STATE.LOTTERY) {


				}
				else if (this.gameStatus == GAME_STATE.SETTLE) {


				}
				else if (this.gameStatus == GAME_STATE.FREE) {


				}
			}
		}


		/**
		 * 释放
		 */
		public dispose(): void {
			game.RoomData.Instance.frozenEndTimeChanged.remove(this._freezeFish, this);
			GX.PokerEvent.Instance.gameStateUpdate.remove(this._gameStateUpdate, this);
			GX.PokerEvent.Instance.roomDataUpdateEvent.remove(this._updataRoomData, this);
			game.Action.sendItemInEvent.remove(this.propInit, this);
			this.master.dispose();
			this.master = null;
			DataCenter._instance = null;
		}
	}
}


const enum GAME_STATE {
	/*空闲*/
	FREE = 1,
	/*押注*/
	BET = 2,
	/*开奖*/
	LOTTERY = 3,
	/*结算*/
	SETTLE = 4
}