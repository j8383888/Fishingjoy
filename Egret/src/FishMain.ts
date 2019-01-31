//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////

class FishMain extends uniLib.GameDoc {
    /**
     * 加载进度界面
     * loading process interface
     */

    public constructor(param?: any) {
        super(param);
        egret.ImageLoader.crossOrigin = "anonymous";
        game.GameViewConfig.mainMediatorName = uniLib.getQualifiedClassName(game.FishMediator);
        if (this._gameInfo) {
            game.DataCache.gameInfo = this._gameInfo;
        }

        if (param && param.destroyResOnExit) {
            game.DataCache.destroyResOnExit = param.destroyResOnExit;
        }

        if (this._gameInfo && this._gameInfo.extData) {
            game.DataCache.platParam = this._gameInfo.extData;
        }

        game.GameData.iskPoker = true;
        game.Config.SeatGame = false;
        game.Config.GameSeatNumber = 4;
        game.Config.IsFormatName = false;
        game.Config.BetTimeout = 60;
        // game.Config.fluencyModel = true;
        game.Config.BulletClientHandle = true;
    }

    public start(e: egret.Event = null): void {
        var initData: uniLib.initOptions = <uniLib.initOptions>{};
        initData.designWidth = 1280;
        initData.designHeight = 720;
        initData.scaleMode = egret.StageScaleMode.FIXED_HEIGHT;
        initData.debug = true;
        uniLib.init(initData);
        RES.setMaxLoadingThread(6);
        //inject the custom material parser
        //注入自定义的素材解析器
        let assetAdapter = new AssetAdapter();
        egret.registerImplementation("eui.IAssetAdapter", assetAdapter);
        egret.registerImplementation("eui.IThemeAdapter", new ThemeAdapter());

        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");


    }

    private onConfigComplete(event: RES.ResourceEvent): void {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        // load skin theme configuration file, you can manually modify the file. And replace the default skin.
        //加载皮肤主题配置文件,可以手动修改这个文件。替换默认皮肤。
        let theme = new eui.Theme("resource/default.thm.json", this.stage);
        theme.addEventListener(eui.UIEvent.COMPLETE, this.onThemeLoadComplete, this);
    }
    private isThemeLoadEnd: boolean = false;
    /**
     * 主题文件加载完成,开始预加载
     * Loading of theme configuration file is complete, start to pre-load the 
     */
    private onThemeLoadComplete(): void {
        this.preLoadEnd();
    }
    public preLoadEnd(): void {
        uniLib.UIMgr.instance.showProcessBar(null, 2, 100, "正在加载游戏资源...");
        if (uniLib.Global.lobbyMode) {
            uniLib.ResLoadMgr.instance.load(game.GameConstant.ResGroup_BY, this.onLoadComplete, this.onItemLoadError, this, null);
        }
        else {
            uniLib.ResLoadMgr.instance.load(game.GameConstant.ResGroup_BY, this.onLoadComplete, this.onItemLoadError, this, PublicLoadingView);
        }
    }
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    private onItemLoadError(event: RES.ResourceEvent): void {
        console.warn("Url:" + event.groupName + "..." + event.itemsLoaded + "..." + event.itemsTotal + " has failed to load");
    }
    private onLoadComplete(){
        uniLib.UIMgr.instance.showProcessBar(null, 93, 100, "正在加载游戏资源...");
        game.Sound.loadSoundGroup("buyu_sound",game.SoundHand.by_musicBg,()=>{
            this.startCreateScene();
        });
    }
    /**
     * 创建场景界面
     * Create scene interface
     */
    protected startCreateScene(): void {
        if (uniLib.BrowersUtils.GetRequest("ada") == "true")
            egret.MainContext.instance.stage.setContentSize(1280, 720);
        else {
            game.bsAdaptationStageSize(1280, 720);
        }
        game.Config.BuYuClientSettle = true
        // game.GameInfo.manage=game.PublicManage.getInstance();
        game.DataCache.stageWidth = uniLib.Global.screenWidth;
        game.DataCache.stageHight = uniLib.Global.screenHeight;
        uniLib.UIMgr.instance.hideLoading();
        uniLib.SceneMgr.instance.changeScene(game.PokerGameScene);

        uniLib.Console.addLogforbid(new Cmd.HitFishCmd_CS().GetType());
        uniLib.Console.addLogforbid(new Cmd.BetRoomCmd_CS().GetType());
        // uniLib.Console.addLogforbid(new Cmd.MoneyUpdateCmd_S().GetType());
        uniLib.Console.addLogforbid(new Cmd.SpawnFishCmd_S().GetType());
        uniLib.Console.addLogforbid(new Cmd.GameTimeSyncCmd_CS().GetType());



        if (!uniLib.Global.lobbyMode) {
            uniLib.Console.log = function (message: string) {
                for (let item of uniLib.Console.logforbid) {
                    if (message.indexOf(item) != -1) {
                        return;
                    }
                }
                var optionalParams = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    optionalParams[_i - 1] = arguments[_i];
                }
                var level = this.getLocalLevel(this.LogLevel);
                if (level <= uniLib.LOGLEVEL.DEBUG) {
                    if (message == null || message == undefined || (typeof (message) == "string" && message == "")) {
                        this.error("日志不能为空,请加标识头,不能再坑队友了!");
                    }
                    if (uniLib.Global.isH5) {
                        console.log(new Date().toTimeString().split(" ")[0], "LOG", message, optionalParams);
                    }
                    else {
                        console.log(message, optionalParams);
                    }
                    if (level != this.LogLevel) {
                        this.logToServer(level, message, optionalParams);
                    }
                }
            };
        }
    }
    public resize(): void {
        this.scaleY = uniLib.Global.screenHeight / game.DataCache.defaultHeight;
        this.y = (uniLib.Global.screenHeight - game.DataCache.defaultHeight) / 2;
    }
}

module uniLib {
    export module Console {
        export function addLogforbid(name: string) {
            uniLib.Console.logforbid.push(name);
        }
        export let logforbid = [];
    }
}