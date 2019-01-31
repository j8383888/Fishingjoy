/**
 * 帮助面板控制
 * @author suo
 */
module FishingJoy {
	export class FishHelpControl extends BaseUIControl {
		/*视图*/
		private _view: FishHelpView;

		public constructor() {
			super();
		}

		/**
		 * 初始化
		 */
		public onInit(): void {
			this._view = this._viewCenter.getView(FishHelpView);
			this._view.blackBgHandler = Handler.create(this, this._onClose, null, true);
		}

		/**
		 * 显示时
		 */
		public onShow(): void {
			this._view.closeBtn.mouseClickHandler = Handler.create(this, this._onClose, null, true);
		}

		/**
		 * 关闭
		 */
		private _onClose(): void {
			this._view.showCloseEff(Handler.create(UICenter.instance, UICenter.instance.closeUI, [commonUI.FishHelp], true))
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			this._view = null;
			super.dispose();
		}
	}
}