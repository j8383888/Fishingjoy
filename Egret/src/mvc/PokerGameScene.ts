module game {
	/**
	 *
	 * @author 
	 *
	 */
	export class PokerGameScene extends uniLib.GameScene {
		public constructor() {
			super();
		}
		public start(): void {
			super.start();
			// egret.MainContext.instance.stage.setContentSize(1280, 720);
			GameInfo.topLayer = this.mainUILayer;
			GX.GameLayerManager.sceneLayer = this.uiLayer;
			GX.GameLayerManager.mainLayer = this.effectLayer;
			GX.GameLayerManager.effectLayer = this.topLayer;
			GX.GameLayerManager.popLayer = this.mainUILayer;
			GX.GameLayerManager.maskLayer = this.maskLayer;
			GX.GameLayerManager.loadLayer = this.tipsLayer;
			game.MahJongFourFacede.getInstance().startUp(this);
			// game.Config.InteractiveSoundName = "zcjb_button_mp3";
		}
		public destroy(): void {
			super.destroy();
			game.MahJongFourFacede.getInstance().sendNotification(game.MahjongFourFacadeConst.DESTORY);
		}
		/**
		 * 初始化位置属性,以做到右对齐
		 */
		private initPositionData(): void {
			if (DataCache.defaultWidth != uniLib.Global.screenWidth) {
				DataCache.defaultWidth = uniLib.Global.screenWidth;
				DataCache.defaultHeight = uniLib.Global.screenHeight;
			}
		}
	}
}
