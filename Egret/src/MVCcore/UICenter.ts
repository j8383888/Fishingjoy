/**
 * 原作者 momo
 * @author suo 
 */
class UICenter extends BaseUICenter {

    private static _instance: UICenter = null;
    constructor() {
        super();

        this.addManager(commonUI.FishMainScene, FishingJoy.FishMainSceneManager);
        this.addManager(commonUI.FishHelp, FishingJoy.FishHelpManager);
        // this.addManager(commonUI.PlayerList,FishingJoy.PlayerListManager);
        // this.addManager(commonUI.FAQ,FishingJoy.FAQManager);
        // this.addManager(commonUI.GainResult,FishingJoy.GainResultManager);
        // this.addManager(commonUI.SurePanel,FishingJoy.SurePanelManager);
        // this.addManager(commonUI.Settle,FishingJoy.SettleManager);
        // this.addManager(commonUI.BtnLayer,FishingJoy.BtnLayarManager);
        // this.addManager(commonUI.MasterInfo,FishingJoy.MasterInfoManager);
    }

    public static get instance(): UICenter {
        if (this._instance == null) {
            this._instance = new UICenter();
        }
        return this._instance;
    }

    public dispose():void{
        super.dispose();
        UICenter._instance = null;
    }


}

const enum commonUI {
    /*捕鱼主场景*/
    FishMainScene = 1000,
    FishHelp = 1001,
    // /*结果校验面板*/
    // ResultCheck,
    // /*玩家列表面板*/
    // PlayerList,
    // /*FAQ面板*/
    // FAQ,
    // /*结算面板*/
    // Settle,
    // /*获得结果面板*/
    // GainResult,
    // /*通用确认面板*/
    // SurePanel,
    // /*按钮层*/
    // BtnLayer,
    // /*玩家信息*/
    // MasterInfo,
}

