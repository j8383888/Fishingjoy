/**
 * 帮助面板视图
 * @author suo
 */
module FishingJoy {
	export class FishHelpView extends BasePopPanel implements BaseUIView {

		/**
		 * 关闭按钮
		 */
		public closeBtn: tool.Button;

		public constructor() {
			super(true);
			this.skinName = "by_HelpSkin";
		}

		/**
		 * 初始化
		 */
		public onInit(): void {
			this.closeBtn = new tool.Button(this.skin["closeBtn"])
			GX.GameLayerManager.addUIToMain(this);

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
			this.closeBtn.dispose();
			this.closeBtn = null;
		}

		/**
		 * 释放时
		 */
		public dispose(): void {
			GX.GameLayerManager.removeUI(this);
			super.dispose();
		}
	}
}