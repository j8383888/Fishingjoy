module game {
	/**
	 * 扑克常量
	 */
	export class GameConstant {
		public static ResGroup_BY = "buyu_preload"

		private static m_seatPositonList: Array<egret.Point>;

		/**
		 * 同组鱼偏移
		 */
		private static curSameGroupNo: number = 0;
		private static sameGroupOffset: Array<{ offsetX: number, offsetY: number }> = [{ offsetX: 0, offsetY: 0 }, { offsetX: -120, offsetY: -75 }, { offsetX: -120, offsetY: 75 }];
		public static getSameGroupOffset(): { offsetX: number, offsetY: number } {
			if (this.curSameGroupNo > 2) {
				this.curSameGroupNo = 0;
			}
			return this.sameGroupOffset[this.curSameGroupNo++];
		}
		/**
		 * 座位坐标
		 */
		public static get SeatPositonList(): Array<egret.Point> {
			let scale = uniLib.Global.screenWidth / 1280;
			this.m_seatPositonList = [new egret.Point(300 * scale, 620), new egret.Point(980 * scale, 620),
			new egret.Point(300 * scale, 100), new egret.Point(980 * scale, 100)]
			return this.m_seatPositonList;
		}

		// public static get SeatPositonRotationList(): Array<egret.Point> {
		// 	this.m_seatPositonList = [new egret.Point(980, 100), new egret.Point(300, 100),
		// 	new egret.Point(980, 620), new egret.Point(300, 620)]
		// 	return this.m_seatPositonList;
		// }
		/**
         * 获取本地座位Id 通过服务器座位ID 在初始分配座位的使用
         */
		public static GetClientNoBySeatId(id: number) {
			let mainSeat = PokerFunction.MainSeatId;
			if (mainSeat < 3) {
				return id;
			}
			if (id == 4)
				return 1;
			if (id == 3)
				return 2;
			if (id == 2)
				return 3;
			if (id == 1)
				return 4;
			return id;
		}
		/**
         * 获取座位位置通过本地座位id
         */
		public static GetSeatPositionByClientNo(clientNo: number): egret.Point {
			let seatPoint = GameConstant.SeatPositonList[clientNo - 1];
			return seatPoint;
		}


	}
}