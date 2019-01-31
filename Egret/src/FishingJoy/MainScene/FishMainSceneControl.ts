/**
 * 主场景控制
 * @author suo
 */
module FishingJoy {
	export class FishMainSceneControl extends BaseUIControl {
		/*主场景视图*/
		private _mainView: FishMainSceneView;
		/*座位视图*/
		private _seatView: SeatView;


		public constructor() {
			super();
		}

		/**
		 * 初始化
		 */
		public onInit(): void {
			this._mainView = this._viewCenter.getView(FishMainSceneView);
			this._seatView = this._viewCenter.getView(SeatView);
			this._mainView.addChild(this._seatView);
		}


		/**
		 * 显示时
		 */
		public onShow(): void {
			FishingJoyLogic.instance.initFishingJoyLogic()
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			this._seatView = null;
			this._mainView = null;
			super.dispose();
		}
	}
}