/**
 * 主场景管理器
 * @author suo
 */
module FishingJoy {

	export class FishMainSceneManager extends BaseUIManager {
		public constructor() {
			super();
			this.addView(FishMainSceneView);
			this.addControl(FishMainSceneControl);

			this.addView(SeatView);

			this.addView(FishBtnView);
			this.addControl(FishBtnControl);
		}
	}
}