/**
 * 视图模板
 * @author suo
 */
module FishingJoy {
	export class TempletView extends BasePopPanel implements BaseUIView {

		/**
		 * 急速射击按钮
		 */
		public fastShoot:tool.Button;
		/**
		 * 瞄准射击按钮
		 */
		public aimShoot:tool.Button;
		/**
		 * 自动射击按钮
		 */
		public autoShoot:tool.Button;
		

		public constructor() {
			super();
			this.skinName = "";
		}

		/**
		 * 初始化
		 */
		public onInit():void{
			GX.GameLayerManager.addUIToMain(this);
		}

		/**
		 * 展示时
		 */
		public onShow():void{

		}

		/**
		 * 清除
		 */
		public clear():void{

		}

		/**
		 * 隐藏时
		 */
		public onHide():void{

		}

		/**
		 * 释放时
		 */
		public dispose():void{
			GX.GameLayerManager.removeUI(this);
			super.dispose();
		}
	}
}