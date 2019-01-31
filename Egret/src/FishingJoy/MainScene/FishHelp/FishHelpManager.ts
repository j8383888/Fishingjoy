/**
 * 帮助面板管理器
 * @author suo
 */
module FishingJoy {
	export class FishHelpManager extends BaseUIManager {
		public constructor() {
			super();
			this.addControl(FishHelpControl);
			this.addView(FishHelpView);
		}
	}
}