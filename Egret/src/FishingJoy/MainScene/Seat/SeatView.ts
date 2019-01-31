/**
 * 视图模板
 * @author suo
 */
module FishingJoy {
	export class SeatView extends egret.DisplayObjectContainer implements BaseUIView {

		/**
		 * 炮台组 实际上就是座位
		 */
		public batteryGroup: SimpleMap<gameObject.Battery> = new SimpleMap<gameObject.Battery>();
		/**
		 * 索引
		 */
		private _index: number = 0;

		private _isInit: boolean = false;

		public constructor() {
			super();
		}

		/**
		 * 初始化
		 */
		public onInit(): void {
			game.RoomData.Instance.addSeatChanged.add(this._addSeatView, this);
		}

		/**
		 * 添加座位 目前会固定初始化4个座位
		 */
		public _addSeatView(seatData: game.SeatData): void {
			if (this.batteryGroup.length == 4) {
				for (let i: number = 0; i < this.batteryGroup.length; i++) {
					let seat = this.batteryGroup.getByKeyIndex(i);
					gameObject.GameObjectFactory.instance.recoverGameObject(seat);
				}
				this.batteryGroup.clear();
			}


			if (seatData.seatId == 1 || seatData.seatId == 2 || seatData.seatId == 3 || seatData.seatId == 4) {
				let pos = game.GameConstant.GetSeatPositionByClientNo(seatData.seatId);
				if (pos == null)
					return;;
				let vars: gameObject.IGameObjectVars = <gameObject.IGameObjectVars>{}
				vars.bornX = pos.x;
				vars.bornY = pos.y;
				let battery: gameObject.Battery = gameObject.GameObjectFactory.instance.creatGameObject(GAMEOBJECT_SIGN.BATTERY, vars, LAYER.Seat);
				battery.setSeatIndex(seatData.seatId);
				battery.state = SEAT_STATE.EMPTY;
				battery.name = seatData.seatId.toString();
				battery.setSeatData(seatData);
				battery.setFirePortRotation(seatData.seatId > 2 ? 180 : 0);
				this.batteryGroup.set(seatData.seatId, battery);
				if (this.batteryGroup.length == 4) {
					EventManager.fireEvent(EVENT_ID.CHANGE_SEAT)
				}
			}
		}


		/**
		 * 展示时
		 */
		public onShow(): void {

		}

		/**
		 * 清除
		 */
		public clear(): void {

		}

		/**
		 * 隐藏时
		 */
		public onHide(): void {

		}

		/**
		 * 释放时
		 */
		public dispose(): void {
			game.RoomData.Instance.addSeatChanged.remove(this._addSeatView, this);
			this.batteryGroup.clear();
		}
	}
}