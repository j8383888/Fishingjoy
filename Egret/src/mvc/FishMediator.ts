module game {
    export class FishMediator extends puremvc.Mediator {
        public static NAME: string = "FishMediator";
        public constructor(viewComponent: any) {
            super(FishMediator.NAME, viewComponent);
            // egret.Logger.logLevel = egret.Logger.OFF
            FishingJoy.GameCenter.instance;
            UICenter.instance.openUI(commonUI.FishMainScene);

            // GX.GameLayerManager.addUIToScene(GameView.Instance);


            this.initGame();
        }
        private uiHandle(evt: egret.Event): void {
        }
        public listNotificationInterests(): Array<any> {
            return [
                MahjongFourFacadeConst.NOTIFY_COMMON_CHAT,  // 聊天
            ];
        }
        public handleNotification(notification: puremvc.INotification): void {
        }

        private initGame(): void {
            this.facade.sendNotification(MahjongFourFacadeConst.SEND_DATA, null, DataRequestCommand.CONNECT_GAME_SERVER);
        }
        public onRemove(): void {
            super.onRemove();
        }

    }
}
