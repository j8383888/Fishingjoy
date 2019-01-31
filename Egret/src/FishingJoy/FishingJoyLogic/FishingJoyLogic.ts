/**
 * 捕鱼主逻辑
 * @author suo
 */
module FishingJoy {
    export class FishingJoyLogic {

		/**
		 * 在屏幕内的鱼字典(key：servelID value：鱼)
		 */
        public inViewFishes: Dictionary = new Dictionary();
		/**
		 * 在屏幕内的子弹字典(场景内所有的子弹 跟表现绑定 key：servelID value：子弹)
		 */
        public inViewBullets: Dictionary = new Dictionary();
		/**
		 * 所有的玩家炮台 key:玩家uid value:battery
		 */
        public allBattery: SimpleMap<gameObject.Battery> = new SimpleMap<gameObject.Battery>();
		/**
		 * 单例
		 */
        private static _instance: FishingJoyLogic = null;
		/**
		 * 玩家炮台
		 */
        public masterBattery: gameObject.Battery = null;
        /**
         * 碰撞标记 偶数帧 奇数帧
         */
        private _colliderFlag: number = 0;

        /**
         * 子弹分组字典
         */
        private _bulletGroupDic: Dictionary = new Dictionary()
        /**
         * 鱼分组字典
         */
        private _fishGroupDic: Dictionary = new Dictionary();


        private winAnim0: egret.MovieClip;
        private winAnim1: egret.MovieClip;
        /**
         * 记录每帧打中鱼列表
         */
        private hitFishList: Cmd.HitFish[] = [];
        /**
         * 记录上一次玩家赢得特效
         */
        private _lastMasterWinEff: gameObject.MasterWinEff;
        /**
         * 金币延迟回收句柄
         */
        private _coinTweenDelayHandler: Handler[] = [];
        /**
         * 延迟回收完毕
         */
        public coinDelayTweenComplete: boolean = false;

        /**
         * 延迟金币回收
         */
        public coinTweenDelayHandlerRun(): void {
            let len: number = this._coinTweenDelayHandler.length;
            for (let i: number = 0; i < len; i++) {
                let handler: Handler = this._coinTweenDelayHandler[i];
                handler.run();
            }
            this._coinTweenDelayHandler.length = 0;
            this.coinDelayTweenComplete = true
        }

        public constructor() {

        }

		/**
		 * 从字典移除子弹
		 */
        public removeBulletInMap(servelID: number): void {
            if (!this.inViewBullets.remove(servelID)) {
            }
        }

		/**
		 * 从字典移除鱼
		 */
        public removeFishInMap(servelID: number): void {
            if (!this.inViewFishes.remove(servelID)) {
                console.assert(false, "不存在该鱼！");
            }
        }

		/**
		 * 从字典添加鱼
		 */
        public addFishInMap(servelID: number, fish: gameObject.Fish): void {
            if (this.inViewFishes.isExist(servelID)) {
                console.assert(false, "已经存在该鱼！");
            }
            else {
                this.inViewFishes.set(servelID, fish)
            }
        }


		/**
		 * 从字典添加子弹
		 */
        public addBulletInMap(servelID: number, bullet: gameObject.Bullet): void {
            if (this.inViewBullets.isExist(servelID)) {
                console.assert(false, "已经存在该子弹！");
            }
            else {
                this.inViewBullets.set(servelID, bullet)
            }
        }

		/**
		 * 获得单例
		 */
        public static get instance(): FishingJoyLogic {
            if (this._instance == null) {
                this._instance = new FishingJoyLogic();
            }
            return this._instance;
        }

		/**
		 * 初始化
		 */
        public initFishingJoyLogic(): void {
            NineGridSplitScreenTool.initValue();

            EventManager.registerEvent(EVENT_ID.ADD_BATTERY_IN_MAP, Handler.create(this, this._addBatteryInMap))
            EventManager.registerEvent(EVENT_ID.REMOVE_BATTERY_IN_MAP, Handler.create(this, this._removeBatteryInMap))
            EventManager.registerEvent(EVENT_ID.FISH_DIE_ACTION, Handler.create(this, this._fishDieAction))
            /*鱼死亡协议*/
            game.Action.deadFishEvent.add(this._deadFishCmd, this)
            /*生成鱼协议*/
            game.Action.spawnFishEvent.add(this._spawnFishEvent, this);
            /*切换场景协议*/
            game.Action.changeSceneEvent.add(this.changeScene, this)
            /*房间数据更新*/
            GX.PokerEvent.Instance.roomDataUpdateEvent.add(this._roomDataUpdateEvent, this);
            /*子弹更新*/
            game.Action.sendBulletEvent.add(this._firBullet, this);
            /*鱼击中协议*/
            game.Action.hitFishEvent.add(this._hitFishCmd, this)
            /*道具协议*/
            game.Action.actionEvent.add(this._receptionOfProps, this);

            GX.PokerEvent.Instance.moneyUpdate.add(this._addScore, this)
            FishingJoy.Laya.timer.frameLoop(1, this, this._checkHit);
        }

        /**
         * 两颗子弹命中同一条鱼 要返钱
         */
        private _addScore(rev: Cmd.MoneyUpdateCmd_S): void {
            let update = rev.update;
            if (!update || !(update instanceof Array))
                return;
            for (let item of update) {
                let battery: gameObject.Battery = this.allBattery.get(item.uid);
                if (battery) {
                    if (item.num) {
                        let addNum: number = item.num - battery.money;
                        if (item.uid == uniLib.NetMgr.UID) {
                            let mainUser = game.PokerFunction.MainUser
                            if (mainUser) {
                                mainUser.point = battery.curMoneyTF;
                            }
                        }
                        battery.updateGold(addNum);
                        battery.money = item.num;
                    }
                    if (item.changeNum) {
                        battery.money += item.changeNum;
                        battery.updateGold(item.changeNum);
                    }
                }
            }
            // let main = update.first((v: Cmd.MoneyUpdateCmd_S.Update) => v.uid == uniLib.NetMgr.UID);
            // if (main) {
            //     console.error(".....:" + main["test"]);
            // }
        }

        /**
         * 接收道具
         */
        private _receptionOfProps(rev: Cmd.ActionCmd_CS): void {
            if (rev.act.op == Cmd.Operation.UseItem) {
                let view: FishBtnView = UICenter.instance.getManager(commonUI.FishMainScene).getView(FishBtnView)
                let sizeMy = 18;
                let config;
                let duration;
                let coolingTime;
                let a;
                let back1 = UICenter.instance.getManager(commonUI.FishMainScene).getView(FishingJoy.FishBtnView).BtnGroup;
                if (rev.act.uid == Master.instance.uid) {
                    if (rev.act.id) {
                        if (rev.act.chipsLeft > 99) {
                            sizeMy = 12;
                        }
                        if (rev.act.id == 4) {
                            EventManager.fireEvent(EVENT_ID.FREEZE_FISH_OPERA, [GlobeVars.FreezeTime, Master.instance.masterBattery, uniLib.Global.screenWidth / 2, uniLib.Global.screenHeight / 2])
                            view.frozenQuantity.text = (rev.act.chipsLeft).toString();
                            view.frozenQuantity.size = sizeMy;
                            config = DataCenter.instance.accessToProps(4)[0];
                            duration = config.useTime;
                            coolingTime = config.coolTime;
                            a = new SkillCDEffect(back1, 39.5, 36 + 168.68, 60, 60, duration, coolingTime, SHOOT_TYPE.FREEZE);
                        }
                        else if (rev.act.id == 1) {
                            EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [SHOOT_TYPE.AUTO, true]);
                            view.autoQuantity.text = (rev.act.chipsLeft).toString();
                            view.autoQuantity.size = sizeMy;
                            config = DataCenter.instance.accessToProps(1)[0];
                            duration = config.useTime;
                            coolingTime = config.coolTime;
                            a = new SkillCDEffect(back1, 39.5, 37.75 + 83, 60, 60, duration, coolingTime, SHOOT_TYPE.AUTO)
                        }
                        else if (rev.act.id == 3) {
                            EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [SHOOT_TYPE.AIM, true]);
                            view.aimQuantity.text = (rev.act.chipsLeft).toString();
                            view.aimQuantity.size = sizeMy;
                            config = DataCenter.instance.accessToProps(3)[0];
                            duration = config.useTime;
                            coolingTime = config.coolTime;
                            a = new SkillCDEffect(back1, 39.5, 38.75, 60, 60, duration, coolingTime, SHOOT_TYPE.AIM)
                        }
                    }
                }
                else {
                    if (rev.act.id == 4) {
                        let battery: gameObject.Battery = this.allBattery.get(rev.act.uid);
                        if (battery) {
                            config = DataCenter.instance.accessToProps(4)[0];
                            duration = config.useTime;
                            coolingTime = config.coolTime;
                            EventManager.fireEvent(EVENT_ID.FREEZE_FISH_OPERA, [GlobeVars.FreezeTime, battery, uniLib.Global.screenWidth / 2, uniLib.Global.screenHeight / 2])
                            a = new SkillCDEffect(back1, 39.5, 36 + 168.68, 60, 60, duration, coolingTime, SHOOT_TYPE.FREEZE);
                        }

                    }
                }
            }
        }

        /**
         * 鱼击中协议
         */
        private _hitFishCmd(rev: Cmd.HitFishCmd_CS): void {
            for (let hitFish of rev.list) {
                let list = hitFish.list;
                if (!list || !(list instanceof Array))
                    continue;
                if (hitFish.hitType == GAMEOBJECT_SIGN.GLOBE_FISH) {
                    for (let item of list) {
                        let fish: gameObject.GlobeFish = this.inViewFishes.get(item.id)
                        if (fish && fish.isAlive) {
                            fish.state++;
                            if (hitFish.addOdds) {
                                fish.updateState(fish.state, hitFish.addOdds);
                            }
                            else {
                                console.assert(false, "协议有误")
                            }
                        }
                    }
                }
                else if (hitFish.hitType == GAMEOBJECT_SIGN.MERMAID) {
                    for (let item of list) {
                        let fish: gameObject.Mermaid = this.inViewFishes.get(item.id)
                        let uid = hitFish.uid;
                        let score: number = item.score;
                        let battery: gameObject.Battery = this.allBattery.get(uid);
                        if (battery) {
                            battery.money += score;
                            if (fish && fish.isAlive) {
                                let data: gameObject.IMermaidHeartEff = <gameObject.IMermaidHeartEff>{}
                                data.targetBattery = battery;
                                data.score = score;
                                let [x, y]: [number, number] = UIUtil.localToGlobal(fish);
                                data.bornX = x;
                                data.bornY = y;
                                gameObject.GameObjectFactory.instance.creatGameObject(GAMEOBJECT_SIGN.MERMAID_HEART_EFF, data, LAYER.EFFECT_LOW);
                                let revs = new Cmd.DeadFish();
                                revs.uid = uid;
                                let bulletOdds: number = DataCenter.instance.getBatterIdByIndex(hitFish.bulletIndex - 1);
                                if (!bulletOdds) {
                                    continue;
                                }
                                let odds = score / bulletOdds;
                                this._coinDozer(score, odds, revs);
                                game.SoundHand.Instance.playGoldCoin();
                            }
                            else {
                                battery.updateGold(score);
                            }
                        }
                    }
                }
            }
        }

        /**
         * 预生成鱼
         */
        // private _preInitFish(): void {
        //     let tableFish = table.TableFishConfig.instance();
        //     let tableFirstPath = (<table.TableFishPath[]>loadTable("TableFishPath_json")).first();
        //     let fishList = [];
        //     for (let item of tableFish) {
        //         let varsData: gameObject.IFishVars = <gameObject.IFishVars>{};
        //         let amount = Number(tableFirstPath.id) < 11 ? 6 : 1;
        //         for (let i: number = 0; i < amount; i++) {
        //             let fish: gameObject.Fish = gameObject.GameObjectFactory.instance.creatGameObject(item.sign, varsData, LAYER.Fish)
        //             fishList.push(fish);
        //         }
        //     }
        //     for (let item of fishList) {
        //         gameObject.GameObjectFactory.instance.recoverGameObject(item);
        //     }
        // }



        /**
		 * 发送地电流协议(suo)
		 */
        // private _sendShockFishMsg(value: number[]): void {
        //     let cmd: Cmd.ActionCmd_CS = new Cmd.ActionCmd_CS();
        //     cmd.act = new Cmd.Action()
        //     cmd.act.uid = Master.instance.uid;
        //     cmd.act.op = Cmd.Operation.FilterNumbfish;
        //     cmd.act.extvalue = value;
        //     game.PokerFunction.tcpSend(cmd);
        // }

        /**
		 * 播放死亡 随机电鱼特效(suo)
		 */
        private _playDieElectricEff(fishAry: gameObject.Fish[], eletricEel: gameObject.ElectricEel): void {
            let fishMap: Dictionary = FishingJoy.FishingJoyLogic.instance.inViewFishes;
            let fishListLen: number = fishAry.length;

            for (let i: number = 0; i < fishListLen; i++) {
                let fish: gameObject.Fish = fishAry[i];
                if (fish && fish.isAlive) {

                    if (UIUtil.inAimView(fish.x, fish.y)) {
                        /*电线*/
                        let line: egret.MovieClip = Pool.getItemByCreateFun(Pool.ElectricEffLine, Handler.create(this, this._creatElectricEff, ["electricLine", 0.6]));
                        line.x = eletricEel.x;
                        line.y = eletricEel.y;
                        let scale: number = Math.sqrt((fish.x - eletricEel.x) * (fish.x - eletricEel.x) + (fish.y - eletricEel.y) * (fish.y - eletricEel.y)) / (line.width - 70);
                        if (scale < 0.1) {
                            scale = 0.1
                        }
                        let rotation: number = GX.getRadianByPoint({ x: eletricEel.x, y: eletricEel.y }, { x: fish.x, y: fish.y });
                        line.rotation = rotation - 90;
                        FishingJoy.LayerManager.instance.addToLayer(line, LAYER.ElectricEFF);
                        UIUtil.playAndAutoRemove(line, 2, Handler.create(Pool, Pool.recover, [Pool.ElectricEffLine, line], true));
                        /*这个是每个鱼身上闪电团*/
                        egret.Tween.get(line).set({ scaleX: 0.1 }).to({ scaleX: scale }, MathUtil.random(100, 300)).call(() => {
                            let burst: egret.MovieClip = Pool.getItemByCreateFun(Pool.ElectricEffBurst, Handler.create(this, this._creatElectricEff, ["electricBrust", 0.3]));
                            burst.x = fish.x;
                            burst.y = fish.y;
                            UIUtil.playAndAutoRemove(burst, 2, Handler.create(Pool, Pool.recover, [Pool.ElectricEffBurst, burst], true));
                            FishingJoy.LayerManager.instance.addToLayer(burst, LAYER.ElectricEFF);
                        });
                    }
                }
            }
            let [x, y]: [number, number] = UIUtil.localToGlobal(eletricEel.eletricEff);
            eletricEel.eletricEff.x = x;
            eletricEel.eletricEff.y = y;
            /*ElectricEFF_BURST不会被旋转 ElectricEFF旋转了 所以添加到ElectricEFF_BURST层*/
            LayerManager.instance.addToLayer(eletricEel.eletricEff, LAYER.ElectricEFF_BURST);
        }


        /**
		 * 创建特效
		 */
        private _creatElectricEff(groupName: string, scale: number = 0.3): egret.MovieClip {
            let mov: egret.MovieClip = UIUtil.creatMovieClip(groupName);
            if (groupName == "electricBrust") {
                mov.scaleX = mov.scaleY = scale;
            }
            else if (groupName == "electricLine") {
                mov.scaleY = scale;
            }
            return mov
        }

		/*
		*房间数据更新
		*/
        private _roomDataUpdateEvent(rev: Cmd.RoomDataUpdateCmd_S) {
            this.destroyBullets();
            this._destroyFishes();
            DataCenter.instance.sceneId = rev.roomData.sceneId;
            this.changeScene(null, null, true, false);
            let spawnFish = new Cmd.SpawnFishCmd_S();
            spawnFish.fishlist = rev.roomData.fishlist;
            this._spawnFishEvent(spawnFish, true);
            let bullet = rev.roomData.bulletinfo;
            let serverNow = game.GameTime.serverNow();
            FishingJoy.Laya.timer.once(300, this, () => {
                if (bullet) {
                    for (let item of bullet) {
                        if (serverNow - item.fireTime < 4000)
                            this._firBullet(item, true);
                    }
                }
            });
            let seatList = game.RoomData.Instance.seatList;
            for (let item of seatList) {
                item.lockChanged.call(item);
            }
        }
		/**
		 * 玩家信息更新(gepan)
		 */
        // private onUserInfoData() {
        //     let info = MJLobby.MJLobbyData.getInstance().myBaseInfo;
        //     if (info == null)
        //         return;
        //     let mainUser = game.PokerFunction.MainUser;
        //     if (mainUser == null)
        //         return;
        //     mainUser.point = info.chips;
        //     let battery: gameObject.Battery = FishingJoy.FishingJoyLogic.instance.allBattery.get(uniLib.NetMgr.UID);
        //     if (battery) {
        //         battery.goldCoinRefresh()
        //     }
        // }

		/**
		 *退潮(ssq)
		 */
        public changeScene(rev: Cmd.ChangeSceneCmd_S, sceneId?: number, revert?: boolean, isPlayTween: boolean = true): void {
            if (rev) {
                DataCenter.instance.isSwitchFish = true;
                OperationManager.instance.leaveQuickly();
                DataCenter.instance.sceneId = rev.sceneId;
                EventManager.fireEvent(EVENT_ID.EBB_TIDE);
            }
            else {
                if (GlobeVars.isFreeze) {
                    GlobeVars.isDelayEbb = true;
                    GlobeVars.delayEbbHandler = Handler.create(this, this._showEbbEff, [rev, sceneId, revert, isPlayTween], true)
                    return;
                }
            }
            this._showEbbEff(rev, sceneId, revert, isPlayTween)
        }

        /**
         * 显示退潮效果(ssq)
         */
        private _showEbbEff(rev: Cmd.ChangeSceneCmd_S, sceneId?: number, revert?: boolean, isPlayTween?: boolean): void {
            let revertImage = "bg" + DataCenter.instance.sceneId + "_jpg";
            let view: FishMainSceneView = UICenter.instance.getManager(commonUI.FishMainScene).getView(FishMainSceneView)
            let back0 = view.backGround0;
            if (!isPlayTween) {
                back0.source = revert ? revertImage : "bg" + sceneId + "_jpg";
                return;
            }
            let back1 = view.backGrounds1;
            let sprayGroup = view.sprayGroups;
            let bgScale: number = 1.05;
            let bgOffsetX: number = 1280 * (bgScale - 1)

            LayerManager.instance.addToLayer(sprayGroup, LAYER.Wave);
            LayerManager.instance.addToLayer(back1, LAYER.back);
            view.stopMoveBg();

            back1.rotation = back0.rotation;
            back0.x = uniLib.Global.screenWidth / 2
            back0.y = back1.y;
            let data;

            if (rev || sceneId) {
                data = rev ? DataCenter.instance.sceneId : sceneId;
            }
            let jianbianImages = view.jianbianImages;
            jianbianImages.source = rev ? "jianbian_png" : "jianbian1_png";
            if (rev) {
                back1.x = uniLib.Global.screenWidth * bgScale * 1.5 - 40;
                sprayGroup.x = uniLib.Global.screenWidth + 16 + bgOffsetX;
                jianbianImages.x = -90 - bgOffsetX;
            }
            else {
                back1.x = -uniLib.Global.screenWidth * bgScale * 0.5;
                sprayGroup.x = -uniLib.Global.screenWidth - 16 - bgOffsetX;
                jianbianImages.x = 177 + bgOffsetX;
            }
            if (isPlayTween && sceneId) {
                game.SoundHand.Instance.playGoldTide();
                game.SoundHand.Instance.playBgMusic();
            }
            else if (isPlayTween) {
                game.SoundHand.Instance.playChangeTheSpecialBackground();
                game.SoundHand.Instance.playBgMusic();
            }

            egret.Tween.removeTweens(back0);
            egret.Tween.removeTweens(back1);
            egret.Tween.removeTweens(sprayGroup);


            let langhuaString = rev ? "langbo" : "langbo1";
            sprayGroup.removeChildren()
            let ebbTideMov: egret.MovieClip = Pool.getItemByCreateFun(langhuaString, Handler.create(UIUtil, UIUtil.creatMovieClip, [langhuaString]))//  UIUtil.creatMovieClip(langhuaString);
            sprayGroup.addChild(ebbTideMov);
            sprayGroup.addChild(jianbianImages);
            ebbTideMov.y = 360;
            ebbTideMov.gotoAndPlay(1, -1);
            ebbTideMov.x = rev ? -bgOffsetX + 50 : uniLib.Global.screenWidth + bgOffsetX;

            GlobeVars.ebbTideMov = ebbTideMov;
            GlobeVars.isGoldEbb = true;
            back1.source = data ? "bg" + data + "_jpg" : "bg" + DataCenter.instance.sceneId + "_jpg";
            egret.Tween.get(back0).to({ x: rev ? -uniLib.Global.screenWidth * bgScale * 0.5 : uniLib.Global.screenWidth * bgScale * 1.5 }, uniLib.Global.screenWidth * 1.6).call(() => {
                back0.source = data ? "bg" + data + "_jpg" : "bg" + DataCenter.instance.sceneId + "_jpg";
                back0.x = uniLib.Global.screenWidth * bgScale * 0.5;
            });
            egret.Tween.get(back1).to({ x: uniLib.Global.screenWidth * bgScale / 2 }, uniLib.Global.screenWidth * 1.6).call(() => {
                back1.x = uniLib.Global.screenWidth;
                back1.source = "";
            });


            egret.Tween.get(sprayGroup).to({ x: rev ? -uniLib.Global.screenWidth - 16 - bgOffsetX : uniLib.Global.screenWidth + 16 + bgOffsetX }, 3.2 * (uniLib.Global.screenWidth + 16)).call(() => {
                ebbTideMov.stop();
                sprayGroup.removeChild(ebbTideMov);
                Pool.recover(langhuaString, ebbTideMov);
                LayerManager.instance.removeFromLayer(sprayGroup);
                LayerManager.instance.removeFromLayer(back1);
                GlobeVars.isGoldEbb = false;
                if (GlobeVars.isDelayEbb) {
                    GlobeVars.isDelayEbb = false;
                }
                view.startMoveBg();
            });

            let cmd = new Cmd.GameTimeSyncCmd_CS();
            game.PokerFunction.tcpSend(cmd);
        }

		/**
		 *免费游戏获取金币(ssq)
		 */
        public freeAccessToQuotas(uid: number, x: number, y: number, score: number): void {
            let TextNew = Pool.getItemByClass(Pool.jumpCoinTextsFree, eui.BitmapLabel);
            TextNew.alpha = 1;
            if (uid == Master.instance.uid) {
                TextNew.font = "coinFont_fish_fnt";
                UIUtil.traGoldLabel(TextNew);
            }
            else {
                TextNew.font = "coinFont_fishS_fnt";
            }
            TextNew.text = "+" + GX.GoldFormat(score, true, true, false);
            LayerManager.instance.addToLayer(TextNew, LAYER.EFFECT_LOW);
            TextNew.x = x;
            TextNew.y = y > uniLib.Global.screenHeight / 2 ? y - 80 : y + 80;
            game.Timer.setTimeout(() => {
                egret.Tween.get(TextNew).to({ alpha: 0 }, 2000).call(() => {
                    Pool.recover(Pool.jumpCoinTextsFree, TextNew)
                    LayerManager.instance.removeFromLayer(TextNew);
                });
            }, this, 1000);

        }
		/**
         * 发射子弹(suo)
         */
        private _firBullet(bulletInfo: Cmd.BulletInfo, isResconnect: boolean = false): void {
            let battery: gameObject.Battery = FishingJoyLogic.instance.allBattery.get(bulletInfo.uid);
            if (battery == null) {
                return;
            }
            let serverNow = game.GameTime.serverNow();
            if (serverNow - bulletInfo.fireTime < 1000) {
                bulletInfo.fireTime = serverNow
            }
            //机器人的话角度可能是负数
            bulletInfo.angle = bulletInfo.angle < 0 ? bulletInfo.angle + 360 : bulletInfo.angle;
            bulletInfo.angle = bulletInfo.angle > 360 ? bulletInfo.angle - 360 : bulletInfo.angle;

            /*转炮台的时候没法发子弹 钱就会不同步 所以钱放上面减！*/
            if (!isResconnect) {
                if (bulletInfo.uid == uniLib.NetMgr.UID) {
                    if (bulletInfo.id < 0) {
                    }
                    else {
                        battery.money -= bulletInfo.cost;
                        battery.updateGold(-bulletInfo.cost);
                    }
                }
                else {
                    battery.money -= bulletInfo.cost;
                    battery.updateGold(-bulletInfo.cost);
                }
            }

            if (battery.isAimShoot) {
                this._fire(battery, bulletInfo, battery.curRotation);
            }
            else {
                let bulletRotation: number = bulletInfo.angle;
                if (bulletInfo.uid == uniLib.NetMgr.UID) {
                    if (bulletInfo.id < 0) {
                        battery.setTweenRotation(bulletRotation, Handler.create(this, this._fire, [battery, bulletInfo, bulletRotation], true));
                    }
                    else {

                        FishingJoy.Laya.timer.once(150, this, this._fire, [battery, bulletInfo, bulletRotation]);
                    }
                }
                else {
                    battery.setTweenRotation(bulletRotation, Handler.create(this, this._fire, [battery, bulletInfo, bulletRotation], true));
                }
            }

            // if (bulletInfo.uid == uniLib.NetMgr.UID) {
            //     if (bulletInfo["freeGoldPool"] != null) {
            //         (<FishingJoy.FishBtnView>UICenter.instance.getManager(commonUI.FishMainScene).getView(FishingJoy.FishBtnView)).updataGoldPoolLabel(bulletInfo["freeGoldPool"], bulletInfo["normalGoldPool"])
            //     }
            // }
        }

		/**
		 * 发射(suo)
		 */
        private _fire(battery: gameObject.Battery, bulletInfo: Cmd.BulletInfo, bulletRotation: number): void {
            let startPoint: egret.Point = Point.create(0, 0);
            let fishLayer = LayerManager.instance.getLayer(LAYER.Fish);
            battery.firePoint.localToGlobal(0, 0, startPoint);
            fishLayer.globalToLocal(startPoint.x, startPoint.y, startPoint);

            let vars: gameObject.IBulletVars = <gameObject.IBulletVars>{};
            vars.bornX = startPoint.x;
            vars.bornY = startPoint.y;
            Point.release(startPoint);
            vars.rotation = bulletRotation;
            vars.servelID = bulletInfo.id;
            vars.battery = battery;


            if (Master.instance.uid == bulletInfo.uid) {
                if (battery.fireBulletNum == 1) {
                    vars.sign = GAMEOBJECT_SIGN.BULLET_SELF;
                }
                else if (battery.fireBulletNum == 2) {
                    vars.sign = GAMEOBJECT_SIGN.BULLET_SELF_2;
                }
                else if (battery.fireBulletNum == 3) {
                    vars.sign = GAMEOBJECT_SIGN.BULLET_SELF_3;
                }
                /*自己 假子弹才显示炮口喷火效果*/
                if (bulletInfo.id < 0) {
                    vars.isReal = false;
                    vars.isVisible = true;
                    battery.sendBulletEffect();
                    game.SoundHand.Instance.playLowSpeedGun();
                }
                else {
                    vars.isReal = true;
                    vars.isVisible = false;
                }
            }
            else {
                if (battery.fireBulletNum == 1) {
                    vars.sign = GAMEOBJECT_SIGN.BULLET_OTHER;
                }
                else if (battery.fireBulletNum == 2) {
                    vars.sign = GAMEOBJECT_SIGN.BULLET_OTHER_2;
                }
                else if (battery.fireBulletNum == 3) {
                    vars.sign = GAMEOBJECT_SIGN.BULLET_OTHER_3;
                }
                battery.sendBulletEffect();
                vars.isReal = true;
                vars.isVisible = true;
            }
            if (battery.isAimShoot) {
                let fish: gameObject.Fish = FishingJoy.FishingJoyLogic.instance.inViewFishes.get(battery.targetFishId);
                vars.targetFish = fish;
                vars.bornTime = bulletInfo.fireTime;
            }
            else {
                vars.bornTime = bulletInfo.fireTime + 150;
            }


            vars.operation = [<gameObject.IOperation>{
                type: battery.isAimShoot ? OPERATION_TYPE.BulletTrack : OPERATION_TYPE.BULLET,
                rotation: bulletRotation,
            }]
            vars.playerUID = bulletInfo.uid;
            gameObject.GameObjectFactory.instance.creatGameObject(vars.sign, vars, LAYER.Bullet);
        }
        /**
         * 打死鱼
         */
        private _deadFishCmd(rev: Cmd.DeadFishCmd_S) {
            if (rev.list == null || !(rev.list instanceof Array))
                return;
            for (let item of rev.list) {
                this._deadFish(item);
            }
        }
		/**
		 * 打死鱼(suo)
		 */
        private _deadFish(deadInfo: Cmd.DeadFish): void {
            let bullet: gameObject.Bullet = this.inViewBullets.get(deadInfo.bid)
            if (bullet) {
                let bornX: number = bullet.x;
                let bornY: number = bullet.y;
                gameObject.GameObjectFactory.instance.recoverGameObject(bullet);
                let data: gameObject.IGameObjectVars = <gameObject.IGameObjectVars>{};
                data.bornX = bornX;
                data.bornY = bornY;
                let fishingNet: gameObject.FishingNet = gameObject.GameObjectFactory.instance.creatGameObject(GAMEOBJECT_SIGN.FishingNet_Green, data, LAYER.FishingNet);
            }

            let bulletOdds: number = DataCenter.instance.getBatterIdByIndex(deadInfo.bulletIndex - 1);
            if (!bulletOdds) {
                console.assert(false, "协议有误")
                return;
            }
            /*总钱数*/
            let scoreSum: number = 0;
            /*总赔率*/
            let oddsSum: number = 0;

            let deadFishAry: gameObject.Fish[] = [];
            let fishMap: Dictionary = this.inViewFishes;
            let fishList: Cmd.Fish[] = deadInfo.list;
            let skill: number = 0;
            let fishType: number = 0

            let battery: gameObject.Battery = this.allBattery.get(deadInfo.uid)
            if (battery) {
                for (let i: number = 0; i < fishList.length; i++) {
                    battery.money += fishList[i].score;
                }
            }

            for (let i: number = 0; i < fishList.length; i++) {
                let fish: gameObject.Fish = fishMap.get(fishList[i].id);
                if (fish && fish.isAlive) {
                    if (fish.skillID == 1 || fish.skillID == 3) {
                        skill = fish.skillID;
                    }
                    if (fish.fishType == 1) {
                        fishType = 1;
                    }

                    let score: number = fishList[i].score;
                    fish.score = score;
                    scoreSum += score;
                    let odds: number = score / bulletOdds;
                    fish.odds = odds;
                    fish.items = fishList[i].items;
                    oddsSum += odds;
                    deadFishAry.push(fish);
                }
                else {
                    /*虽然鱼不存在 但是钱还是要加到用户头上 保证前后端一致*/
                    let battery: gameObject.Battery = this.allBattery.get(deadInfo.uid)
                    if (battery) {
                        battery.updateGold(fishList[i].score);
                    }
                }
            }
            /*检测鱼死亡类型*/
            this._checkDeadType(deadInfo.deadType, deadFishAry.slice(), deadInfo.uid, scoreSum);
            /*爆炸鱼死亡 仅播放爆炸鱼特效 其他鱼的死亡效果等待爆炸依次播放*/
            if (deadInfo.deadType == GAMEOBJECT_SIGN.BOOM_EX_FISH) {
            }
            else {
                for (let i: number = 0; i < deadFishAry.length; i++) {
                    let fish: gameObject.Fish = deadFishAry[i];
                    this._fishDieAction(fish, deadInfo.uid);
                }
            }


            if (!game.Config.fluencyModel) {
                FishingJoy.Laya.timer.once(2000, null, (scoreSum: number, oddsSum: number, rev: Cmd.DeadFish, skill: number) => {
                    if (fishType != 1) {
                        this._getMedal(scoreSum, oddsSum, deadInfo, skill);
                    }
                    this._coinDozer(scoreSum, oddsSum, deadInfo);
                }, [scoreSum, oddsSum, deadInfo, skill], false)
            }

            if (deadInfo.uid == uniLib.NetMgr.UID && scoreSum > DataCenter.instance.noticeTriggers) {
                let cmd = new Cmd.ClientSettleFinishCmd_C();
                game.PokerFunction.tcpSend(cmd);
            }


            if (deadInfo.uid == Master.instance.uid) {
                game.SoundHand.Instance.playCatch();
                game.SoundHand.Instance.playCatchS(oddsSum);
            }
        }

        /**
         * 鱼的死亡动作(suo)
         */
        private _fishDieAction(fish: gameObject.Fish, playerID: number, isBoomEx: boolean = false): void {
            fish.isAlive = false;
            fish.unregisterOperation();
            let [fishX, fishY]: [number, number] = UIUtil.localToGlobal(fish)
            if (fish.sign == GAMEOBJECT_SIGN.ELECTRIC_EEL) {
                FishingJoy.Laya.timer.once(1500, this, this._fishDieActionEnd, [fish, fishX, fishY, playerID, isBoomEx], false)
            }
            else {
                /*发送冰冻协议*/
                // if (fish.sign == GAMEOBJECT_SIGN.FREEZE_FISH) {
                //     FishingJoy.Laya.timer.once(500, null, () => {
                //         this.sendUsePorpMsg(PROP_TYPE.FREEZE);
                //         EventManager.fireEvent(EVENT_ID.FREEZE_FISH_OPERA, [GlobeVars.FreezeTime, fishX, fishY])
                //     })
                // }
                fish.playDieAction(Handler.create(this, this._fishDieActionEnd, [fish, fishX, fishY, playerID, isBoomEx], true))
            }
        }
        /**
        * 道具掉落(ssq)
        */
        private thePropsFall(xJd: number, yJd: number, playerUID: number, propId: number, propNum: number): void {
            let view: FishBtnView = UICenter.instance.getManager(commonUI.FishMainScene).getView(FishBtnView)
            let battery: gameObject.Battery = this.allBattery.get(playerUID)
            if (battery == null) {
                return;
            }
            let imageMy = Pool.getItemByClass(Pool.commonIMG, eui.Image) //new eui.Image("fishBD2");
            let pont
            if (propId == 1) {
                imageMy.source = "fishZD2";
            }
            else if (propId == 3) {
                imageMy.source = "fishMZ2";

            }
            else if (propId == 4) {
                imageMy.source = "fishBD2";
            }
            else {
                return;
            }
            LayerManager.instance.addToLayer(imageMy, LAYER.EFFECT_LOW);
            imageMy.x = xJd;
            imageMy.y = yJd;
            imageMy.scaleX = 1;
            imageMy.scaleY = 1;
            imageMy.width = 79;
            imageMy.height = 79;
            imageMy.anchorOffsetX = imageMy.width / 2;
            imageMy.anchorOffsetY = imageMy.height / 2;

            if (playerUID == Master.instance.uid) {
                if (propId == 1) {
                    pont = UIUtil.localToGlobal(view.skin["autoShoot"]);
                }
                else if (propId == 3) {
                    pont = UIUtil.localToGlobal(view.skin["aimShoot"]);
                }
                else if (propId == 4) {
                    pont = UIUtil.localToGlobal(view.skin["frozenShoot"]);
                }
            }
            else {
                pont = UIUtil.localToGlobal(battery.focus);
            }
            egret.Tween.get(imageMy).to({ y: yJd - 100 }, 200)/*.to({ scaleX: 2,scaleY: 2 }, 500).to({ scaleX: 1,scaleY: 1 }, 500)*/
                .to({ y: yJd }, 400, egret.Ease.backInOut).wait(200).to({ x: pont[0] + imageMy.width / 2, y: pont[1] + imageMy.height / 2, scaleX: 0.2, scaleY: 0.2 }, 500).call((imageMy: eui.Image) => {
                    if (playerUID == Master.instance.uid) {
                        if (propId == 4) {
                            view.frozenQuantity.text = propNum.toString();
                            this.increaseOfProps(view.frozenQuantity, propNum)
                        }
                        else if (propId == 1) {
                            view.autoQuantity.text = propNum.toString();
                            this.increaseOfProps(view.autoQuantity, propNum)
                        }
                        else if (propId == 3) {
                            view.aimQuantity.text = propNum.toString();
                            this.increaseOfProps(view.aimQuantity, propNum)
                        }
                    }
                    Pool.recover(Pool.commonIMG, imageMy);
                    LayerManager.instance.removeFromLayer(imageMy, LAYER.EFFECT_LOW);
                }, null, [imageMy]);
        }
        /**
         * 道具数量增加动画
         */
        private increaseOfProps(item: eui.Label, num: number): void {
            item.text =num.toString();
            item.anchorOffsetX = item.textWidth / 2;
            item.anchorOffsetY = item.textHeight / 2;
            egret.Tween.get(item).to({ scaleX: 1.7, scaleY: 1.7 }, 350, egret.Ease.backOut).wait(100).to({ scaleX: 1, scaleY: 1 }, 200)
        }

        /**
         * 检测死亡类型
         */
        private _checkDeadType(deadType: number, fishAry: gameObject.Fish[], playerID: number, scoreSum: number): void {
            // egret.log("deadInfo.deadType" + deadType)

            /*杨永信电疗*/
            if (deadType == GAMEOBJECT_SIGN.ELECTRIC_EEL) {
                let eletricEel: gameObject.ElectricEel = null
                for (let i: number = 0; i < fishAry.length; i++) {
                    let fish: gameObject.Fish = fishAry[i];
                    if (fish.sign == GAMEOBJECT_SIGN.ELECTRIC_EEL) {
                        eletricEel = fish as gameObject.ElectricEel
                        break;
                    }
                }
                if (eletricEel) {
                    fishAry.remove(eletricEel);
                    this._playDieElectricEff(fishAry, eletricEel);
                }
            }
            /*全屏炸弹炸翻全场*/
            else if (deadType == GAMEOBJECT_SIGN.BOOM_EX_FISH) {
                let boomExFish: gameObject.BoomFishEx = null
                for (let i: number = 0; i < fishAry.length; i++) {
                    let fish: gameObject.Fish = fishAry[i];
                    if (fish.sign == GAMEOBJECT_SIGN.BOOM_EX_FISH) {
                        boomExFish = fish as gameObject.BoomFishEx
                        this._fishDieAction(fish, playerID);
                        break;
                    }
                }
                if (boomExFish) {
                    fishAry.remove(boomExFish);
                    let data: gameObject.IBoomEffVars = <gameObject.IBoomEffVars>{}
                    data.boomFishEx = boomExFish
                    data.deadFishList = fishAry;
                    data.playerID = playerID;
                    data.scoreSum = scoreSum;
                    gameObject.GameObjectFactory.instance.creatGameObject(GAMEOBJECT_SIGN.BOOM_EX_EFF, data, LAYER.EFFECT_MEDIUM)
                }
            }
        }

		/**
		 * 鱼死亡动作结束
		 */
        private _fishDieActionEnd(fish: gameObject.Fish, x: number, y: number, playerUID: number, isBoomEx: boolean = false): void {
            /*道具*/
            if (fish.items && fish.items.length) {
                this.thePropsFall(x, y, playerUID, fish.items[0].id, fish.items[0].num);
            }
            this._checkSpecialFish(x, y, fish, playerUID);
            if (fish.sign != GAMEOBJECT_SIGN.MERMAID && fish.sign != GAMEOBJECT_SIGN.DRAGON) {
                this.showGoldAni(x, y, fish, playerUID, isBoomEx)
            }
            gameObject.GameObjectFactory.instance.recoverGameObject(fish);
        }

		/**
		 * 检测是否特殊鱼
		 */
        private _checkSpecialFish(fishX: number, fishY: number, fish: gameObject.Fish, playerUID: number): void {
            if (fish.sign == GAMEOBJECT_SIGN.BOOM_FISH) {
                this._showBurst(fishX, fishY)
            }
            else if (fish.sign == GAMEOBJECT_SIGN.MERMAID) {
                let data: gameObject.IMermaidEffVars = <gameObject.IMermaidEffVars>{};
                data.targetBattery = FishingJoyLogic.instance.allBattery.get(playerUID);
                if (data.targetBattery && data.targetBattery.user) {
                    this.freePromptCloses();
                    game.SoundHand.Instance.playMermaidCapture();
                    data.bornX = uniLib.Global.screenWidth / 2;
                    data.bornY = uniLib.Global.screenHeight / 2 + 50;
                    data.score = fish.score;
                    data.playerNickName = data.targetBattery.user.nickName;
                    gameObject.GameObjectFactory.instance.creatGameObject(GAMEOBJECT_SIGN.MERMAID_EFF, data, LAYER.EFFECT_BIG);
                }
            }
            else if (fish.sign == GAMEOBJECT_SIGN.DRAGON) {
                let data: gameObject.IDragonEffVars = <gameObject.IDragonEffVars>{}
                data.targetBattery = FishingJoyLogic.instance.allBattery.get(playerUID);
                if (data.targetBattery && data.targetBattery.user) {
                    this.freePromptCloses();
                    game.SoundHand.Instance.playGoldenDragonCapture();
                    data.bornX = uniLib.Global.screenWidth / 2;
                    data.bornY = uniLib.Global.screenHeight / 2 + 50;
                    data.score = fish.score;
                    data.playerNickName = data.targetBattery.user.nickName;
                    gameObject.GameObjectFactory.instance.creatGameObject(GAMEOBJECT_SIGN.DRAGON_EFF, data, LAYER.EFFECT_BIG);
                }
            }

        }

		/**
		 * 爆炸鱼特效
		 */
        private _showBurst(bornX: number, bornY: number): void {
            let mov = Pool.getItemByCreateFun(Pool.Boom, Handler.create(UIUtil, UIUtil.creatMovieClip, ["Bomb"], true))
            mov.y = bornY;
            mov.x = bornX;
            mov.gotoAndPlay(1, 1);
            LayerManager.instance.addToLayer(mov, LAYER.EFFECT_LOW);
            game.SoundHand.Instance.playBlast();

            mov.once(egret.Event.COMPLETE, (e: egret.Event) => {
                LayerManager.instance.removeFromLayer(mov);
                Pool.recover(Pool.Boom, e.target)
            }, null);
        }

        /**
         * 金色灰色爆炸
         */
        private _creatGoldBurst(isSelf: boolean): egret.MovieClip {
            if (isSelf) {
                let mov = UIUtil.creatMovieClip("by_BurstGold");
                mov.name = "by_BurstGold";
                mov.blendMode = egret.BlendMode.ADD;
                mov.frameRate = 10;
                return mov;
            }
            else {
                let mov = UIUtil.creatMovieClip("by_BurstGray");
                mov.name = "by_BurstGray";
                mov.blendMode = egret.BlendMode.ADD;
                mov.frameRate = 10;
                mov.alpha = 0.7;
                return mov;
            }
        }

		/**
		 * 显示金币动画
		 */
        public showGoldAni(x: number, y: number, fish: gameObject.Fish, uid: number, isBoomEx: boolean): void {
            let battery: gameObject.Battery = this.allBattery.get(uid);
            if (battery == null || battery.user == null)
                return;
            let odds = fish.odds;
            let score = fish.score;
            // odds = MathUtil.random(30, 100);

            this._showGoldLabel(battery, score, x, y);

            let burstMovBG: egret.MovieClip;
            let burstMovCoin: egret.MovieClip;

            if (odds >= 30 && odds <= 60) {
                /*小金色爆炸*/
                if (uid == Master.instance.uid) {
                    burstMovBG = Pool.getItemByCreateFun(Pool.by_BurstGold, Handler.create(this, this._creatGoldBurst, [true], true));
                    burstMovBG.scaleX = burstMovBG.scaleY = 1;

                    burstMovCoin = Pool.getItemByCreateFun(Pool.by_BurstMoneyGold_S, Handler.create(UIUtil, UIUtil.creatMovieClip, ["by_BurstMoneyGold_S"], true));
                    burstMovCoin.name = "by_BurstMoneyGold_S";
                    burstMovCoin.scaleX = burstMovCoin.scaleY = 0.8;
                    game.SoundHand.Instance.playCoinSound();
                }
                /*小灰色爆炸*/
                else {
                    burstMovBG = Pool.getItemByCreateFun(Pool.by_BurstGray, Handler.create(this, this._creatGoldBurst, [false], true));
                    burstMovBG.scaleX = burstMovBG.scaleY = 1;

                    burstMovCoin = Pool.getItemByCreateFun(Pool.by_BurstMoneyGray_S, Handler.create(UIUtil, UIUtil.creatMovieClip, ["by_BurstMoneyGray_S"], true));
                    burstMovCoin.scaleX = burstMovCoin.scaleY = 0.8;
                    burstMovCoin.name = "by_BurstMoneyGray_S";
                }

            }

            else if (odds > 60) {
                /*大爆炸*/
                if (uid == Master.instance.uid) {
                    burstMovBG = Pool.getItemByCreateFun(Pool.by_BurstGold, Handler.create(this, this._creatGoldBurst, [true], true));
                    burstMovBG.scaleX = burstMovBG.scaleY = 2.5;
                    game.SoundHand.Instance.playCoinSound();

                    // burstMovCoin = Pool.getItemByCreateFun(Pool.by_BurstMoneyGold_S, Handler.create(UIUtil, UIUtil.creatMovieClip, ["by_BurstMoneyGold_S"], true));
                    // burstMovCoin.name = "by_BurstMoneyGold_S";
                    // burstMovCoin.scaleX = burstMovCoin.scaleY = 0.8;
                    // burstMovCoin = Pool.getItemByCreateFun(Pool.by_BurstMoneyGold_B, Handler.create(UIUtil, UIUtil.creatMovieClip, ["by_BurstMoneyGold_B"], true));
                    // burstMovCoin.name = "by_BurstMoneyGold_B";
                    // burstMovCoin.scaleX = burstMovCoin.scaleY = 0.8;
                }
                else {
                    burstMovBG = Pool.getItemByCreateFun(Pool.by_BurstGray, Handler.create(this, this._creatGoldBurst, [false], true));
                    burstMovBG.scaleX = burstMovBG.scaleY = 2.5;

                    // burstMovCoin = Pool.getItemByCreateFun(Pool.by_BurstMoneyGray_S, Handler.create(UIUtil, UIUtil.creatMovieClip, ["by_BurstMoneyGray_S"], true));
                    // burstMovCoin.scaleX = burstMovCoin.scaleY = 0.8;
                    // burstMovCoin.name = "by_BurstMoneyGray_S";
                    // burstMovCoin = Pool.getItemByCreateFun(Pool.by_BurstMoneyGray_B, Handler.create(UIUtil, UIUtil.creatMovieClip, ["by_BurstMoneyGray_B"], true));
                    // burstMovCoin.scaleX = burstMovCoin.scaleY = 0.8;
                    // burstMovCoin.name = "by_BurstMoneyGray_B";
                }
            }

            if (burstMovCoin) {
                burstMovCoin.x = x;
                burstMovCoin.y = y;

                burstMovCoin.gotoAndPlay(1, 1);
                LayerManager.instance.addToLayer(burstMovCoin, LAYER.EFFECT_LOW);
                burstMovCoin.once(egret.MovieClipEvent.COMPLETE, (e: egret.MovieClipEvent) => {
                    let mov: egret.MovieClip = e.target;
                    if (mov.name == "by_BurstMoneyGold_S") {
                        Pool.recover(Pool.by_BurstMoneyGold_S, mov);
                    }
                    else if (mov.name == "by_BurstMoneyGray_S") {
                        Pool.recover(Pool.by_BurstMoneyGray_S, mov);
                    }
                    else if (mov.name == "by_BurstMoneyGold_B") {
                        Pool.recover(Pool.by_BurstMoneyGold_B, mov);
                    }
                    else {
                        Pool.recover(Pool.by_BurstMoneyGray_B, mov);
                    }
                    LayerManager.instance.removeFromLayer(mov, LAYER.EFFECT_LOW);
                }, null);
            }


            if (burstMovBG) {
                if (!game.Config.fluencyModel)
                    ShakeTool.Instance.shakeObj(GX.GameLayerManager.sceneLayer.parent, 1, 15, 15);
                burstMovBG.x = x;
                burstMovBG.y = y;
                burstMovBG.gotoAndPlay(1, 1);
                LayerManager.instance.addToLayer(burstMovBG, LAYER.EFFECT_LOW);
                burstMovBG.once(egret.MovieClipEvent.COMPLETE, (e: egret.MovieClipEvent) => {
                    let mov: egret.MovieClip = e.target;
                    if (mov.name == "by_BurstGold") {
                        Pool.recover(Pool.by_BurstGold, mov);
                    }
                    else {
                        Pool.recover(Pool.by_BurstGray, mov);
                    }
                    LayerManager.instance.removeFromLayer(mov);
                }, null)

                this._showGoldTween(battery, x, y, odds, true, score, isBoomEx);
            }
            else {
                this._showGoldTween(battery, x, y, odds, false, score, isBoomEx);
            }
        }

        /**
         * +多少金币的艺术字
         */
        private _showGoldLabel(battery: gameObject.Battery, score: number, startX: number, startY: number): void {
            let TextNew: eui.BitmapLabel
            if (battery.user && battery.user.uid == Master.instance.uid) {
                game.SoundHand.Instance.playGoldCoin();
                TextNew = Pool.getItemByClass(Pool.jumpCoinText, eui.BitmapLabel);
                TextNew.font = "flutters1_fnt";
                TextNew.name = "jumpCoinText"
            }
            else {
                TextNew = Pool.getItemByClass(Pool.jumpCoinTexts, eui.BitmapLabel);
                TextNew.alpha = 0.7;
                TextNew.font = "flutters2_fnt";
                TextNew.name = "jumpCoinTexts"
            }
            TextNew.text = "+" + GX.GoldFormat(score, true, true, false);
            TextNew.scaleX = 0.8;
            TextNew.scaleY = 0.8;
            TextNew.x = startX - (TextNew.textWidth / 2);
            TextNew.y = startY - 25;
            LayerManager.instance.addToLayer(TextNew, LAYER.EFFECT_LOW);

            FishingJoy.Laya.timer.once(1000, this, (TextNew: eui.BitmapLabel) => {
                TextNew.scaleY = TextNew.scaleX = 1;
                if (TextNew.name == "jumpCoinText") {
                    Pool.recover(Pool.jumpCoinText, TextNew);
                }
                else if (TextNew.name == "jumpCoinTexts") {
                    Pool.recover(Pool.jumpCoinTexts, TextNew);
                }
                else {
                    console.assert(false, "逻辑有误")
                }

                LayerManager.instance.removeFromLayer(TextNew);
            }, [TextNew])
        }

        /**
         * 金币动画表现
         */
        private _showGoldTween(battery: gameObject.Battery, startX: number, startY: number, odds: number, isBurstTween: boolean, score: number, isBoomEx: boolean): void {
            let radius: number = 0;
            let coinNum: number;
            if (odds > 0 && odds <= 5) {
                coinNum = 2;
            }
            else if (odds > 5 && odds <= 10) {
                coinNum = 3;
            }
            else if (odds > 10 && odds < 30) {
                coinNum = 5;
            }
            /*30倍以上爆炸*/
            else if (odds >= 30 && odds <= 60) {
                coinNum = 12;
                radius = 80;
            }
            else if (odds > 60 && odds <= 90) {
                coinNum = 15
                radius = 120;
            }
            else if (odds > 90) {
                coinNum = 30
                radius = 120;
            }
            else {
                console.assert(false, "逻辑有误！")
            }

            let [endX, endY]: [number, number] = UIUtil.localToGlobal(battery.coinImg)
            let seat = game.GameConstant.SeatPositonList[game.GameConstant.GetClientNoBySeatId(battery.seatdata.seatId) - 1]
            let time = GX.getDistanceByPoint({ x: startX, y: startY }, { x: seat.x, y: seat.y }) * 1.5;
            if (time < 200) {
                time = 200;
            }

            for (var i = 0; i < coinNum; ++i) {
                let mov: egret.MovieClip;
                if (battery.user.uid == Master.instance.uid) {
                    mov = Pool.getItemByCreateFun(Pool.commonGold, Handler.create(GlobeVars, GlobeVars.creatCommonCoin, null, true));
                    mov.name = "commonGold";
                }
                else {
                    mov = Pool.getItemByCreateFun(Pool.commonGrayGold, Handler.create(GlobeVars, GlobeVars.creatCommonGrayCoin, null, true));
                    mov.name = "commonGrayGold";
                    mov.alpha = 0.9;
                    mov.scaleX = mov.scaleY = 0.6;
                }

                mov.gotoAndPlay(1, -1);
                LayerManager.instance.addToLayer(mov, LAYER.EFFECT_LOW);
                if (isBurstTween) {
                    this._goldBurstTween(mov, i, coinNum, startX, startY, endX, endY, time, battery, radius, score, isBoomEx)
                }
                else {
                    this._goldJumpTween(mov, i, coinNum, startX, startY, endX, endY, time, battery, score, isBoomEx)
                }
            }
        }


        /**
         * 金币跳动Tween动画
         */
        private _goldJumpTween(mov: egret.MovieClip, i: number, goldNum: number, startX: number, startY: number, endX: number, endY: number,
            time: number, battery: gameObject.Battery, score: number, isBoomEx: boolean): void {
            mov.x = startX + i * 45 - goldNum / 2 * 45;
            mov.y = startY;
            mov.rotation = 0;
            let tween: egret.Tween = egret.Tween.get(mov).wait(i * 100).to({ y: startY - 50 }, 200).to({ y: startY + 80 }, 400, egret.Ease.backInOut).
                to({ y: startY + 30 }, 200)
            if (isBoomEx && !this.coinDelayTweenComplete) {
                this._coinTweenDelayHandler.push(Handler.create(this, this._delayCoinTween
                    , [endX, endY, time, mov, battery, i, goldNum, score], true))
            }
            else {
                tween.wait(400).to({ x: endX, y: endY }, time, egret.Ease.quadIn).call(this._goldTweenComplete, this, [mov, battery, i, goldNum, score]);
            }
        }

        /**
         * 延迟金币回收
         */
        private _delayCoinTween(endX: number, endY: number, time: number, mov: egret.MovieClip, battery: gameObject.Battery, i: number, goldNum: number, score: number): void {
            egret.Tween.get(mov).to({ x: endX, y: endY }, time, egret.Ease.quadIn).call(this._goldTweenComplete, this, [mov, battery, i, goldNum, score])
        }

        /**
         * 金币爆炸Tween动画
         */
        private _goldBurstTween(mov: egret.MovieClip, i: number, goldNum: number, startX: number, startY: number, endX: number, endY: number,
            time: number, battery: gameObject.Battery, radius: number, score: number, isBoomEx: boolean): void {

            let anglePre: number = 360 / goldNum * 2;
            let angle: number = anglePre * i
            let radian: number = UIUtil.getRadian(angle);
            mov.x = Math.cos(radian) * 5 + startX;
            mov.y = Math.sin(radian) * 5 + startY;

            if (i < goldNum / 2) {
                let targetX: number = Math.cos(radian) * radius + startX + MathUtil.random(-30, 30) * 2;
                let targetY: number = Math.sin(radian) * radius + startY + MathUtil.random(-30, 30) * 2;
                let tween: egret.Tween = egret.Tween.get(mov).wait(MathUtil.random(0, 500)).to({ x: targetX, y: targetY, rotation: angle },
                    800, egret.Ease.cubicOut)
                if (isBoomEx && !this.coinDelayTweenComplete) {
                    this._coinTweenDelayHandler.push(Handler.create(this, this._delayCoinTween
                        , [endX, endY, time, mov, battery, i, goldNum, score], true))
                }
                else {
                    tween.wait(200).to({ x: endX, y: endY }, time, egret.Ease.cubicIn).call(this._goldTweenComplete, this, [mov, battery, i, goldNum, score]);
                }
            }
            else {
                let targetX: number = Math.cos(radian) * radius / 2 + startX + MathUtil.random(-60, 60) * 3;
                let targetY: number = Math.sin(radian) * radius / 2 + startY + MathUtil.random(-60, 60) * 3;
                let tween: egret.Tween = egret.Tween.get(mov).wait(MathUtil.random(0, 500)).to({ x: targetX, y: targetY, rotation: angle },
                    800, egret.Ease.cubicOut)
                if (isBoomEx && !this.coinDelayTweenComplete) {
                    this._coinTweenDelayHandler.push(Handler.create(this, this._delayCoinTween
                        , [endX, endY, time, mov, battery, i, goldNum, score], true))
                }
                else {
                    tween.wait(200).to({ x: endX, y: endY }, time, egret.Ease.cubicIn).call(this._goldTweenComplete, this, [mov, battery, i, goldNum, score]);
                }
            }
        }

        /**
         * 金币飞行动画完毕
         *         
         *  */
        private _goldTweenComplete(mov: egret.MovieClip, battery: gameObject.Battery, i: number, goldNum: number, score: number): void {
            if (i == goldNum - 1) {
                battery.coinImgTween();
                battery.updateGold(score);
            }
            mov.stop();
            if (mov.name == "commonGold") {
                Pool.recover(Pool.commonGold, mov);
            }
            else {
                Pool.recover(Pool.commonGrayGold, mov);
            }
            LayerManager.instance.removeFromLayer(mov);

        }

        private eachHeapOfGoldCoinsData = [[], [], [], []];
        private numberOfGoldCoins = [0, 0, 0, 0];
        private goldCoinRemovalTime = [[], [], [], []];
        private dataStorage = [[], [], [], []];


        /**
         * 推金币
         */
        private _coinDozer(scoreSum: number, oddsSum: number, rev: Cmd.DeadFish, seatingData?: gameObject.Battery) {
            let data;
            if (oddsSum < 1) {
                oddsSum = 1
            }
            let battery: gameObject.Battery;
            if (rev) {
                data = rev;
            }
            battery = rev ? this.allBattery.get(rev.uid) : seatingData;
            if (battery == null) {
                return;
            }
            if (!battery.seatdata)
                return;
            let seatId = battery.seatdata.seatId;
            let seatIndex = seatId - 1;
            if (this.eachHeapOfGoldCoinsData[seatIndex].length >= 3 && rev) {
                this.dataStorage[seatIndex].push(rev);
                if (this.dataStorage[seatIndex].length == 1) {
                    this._coinDozer(scoreSum, oddsSum, null, battery)
                }
                return;
            }
            if (rev == null) {
                if (this.dataStorage[seatIndex].length == 0) {
                    return;
                }
                data = this.dataStorage[seatIndex][0];

            }
            let clientNo = game.GameConstant.GetClientNoBySeatId(battery.seatID)
            let seat = game.GameConstant.GetSeatPositionByClientNo(clientNo);
            if (seat == null)
                return;
            let x = 0;
            let y = 0;
            let group = new eui.Group();
            group.touchEnabled = false;
            if (this.numberOfGoldCoins[seatIndex] != 0) {
                let numberMy = this.numberOfGoldCoins[seatIndex];
                if (this.numberOfGoldCoins[seatIndex] >= 3) {
                    this.numberOfGoldCoins[seatIndex] = 3;
                }
                group.x = seat.x > uniLib.Global.screenWidth / 2 ? (795 * uniLib.Global.screenWidth / 1280) - ((numberMy < 3 ? numberMy : 2) * 35) - 20 :
                    (460 * uniLib.Global.screenWidth / 1280) + ((numberMy < 3 ? numberMy : 2) * 35) + 20;
                if (this.numberOfGoldCoins[seatIndex] == 3) {
                    if (this.eachHeapOfGoldCoinsData[seatIndex][0])
                        this.goldCoinPush(battery, 0)
                    if (this.eachHeapOfGoldCoinsData[seatIndex][1])
                        this.goldCoinPush(battery, 1)
                    if (this.eachHeapOfGoldCoinsData[seatIndex][2])
                        this.goldCoinPush(battery, 2, false, group, oddsSum, scoreSum)
                }
            }
            else {
                group.x = seat.x > uniLib.Global.screenWidth / 2 ? (795 * uniLib.Global.screenWidth / 1280) - 20 : (460 * uniLib.Global.screenWidth / 1280) + 20;
            }
            group.y = seat.y > uniLib.Global.screenHeight / 2 ? 553 : -7;//seat.y+43.5;//595
            LayerManager.instance.addToLayer(group, LAYER.EFFECT_LOW);


            if (this.numberOfGoldCoins[seatIndex] < 3) {
                let len: number = oddsSum > 20 ? 20 : oddsSum
                for (var m = 0; m < len; m++) {
                    game.Timer.setTimeout(() => {
                        let imageMy = Pool.getItemByClass("coinDozerImage", eui.Image);
                        if (battery.user && battery.user.uid) {
                            if (battery.user.uid == Master.instance.uid) {
                                imageMy.source = "batteryBase8";
                            }
                            else {
                                imageMy.source = "batteryBase81";
                            }
                        }
                        imageMy.scaleX = 0.85;
                        imageMy.scaleY = 0.85;
                        imageMy.x = 0;//seat.x + x;
                        imageMy.y = seat.y > uniLib.Global.screenHeight / 2 ? 160 + y : 8 - y;
                        imageMy.touchEnabled = false;
                        y -= 6.8;
                        group.addChild(imageMy);
                    }, this, m * 10);
                }
                let TextNew = new eui.BitmapLabel();
                if (battery.user && battery.user.uid) {
                    if (battery.user.uid == Master.instance.uid) {
                        TextNew.font = "flutters1_fnt";
                    }
                    else {
                        TextNew.font = "flutters2_fnt";
                    }
                }

                TextNew.touchEnabled = false;
                TextNew.text = "" + GX.GoldFormat(scoreSum, true, true, false);
                group.addChild(TextNew);
                TextNew.anchorOffsetX = TextNew.width / 2;
                TextNew.anchorOffsetY = TextNew.height / 2;

                TextNew.scaleX = 0.25;
                TextNew.scaleY = 0.25;
                TextNew.x = 12.75;//group.width / 2;
                TextNew.y = seat.y > uniLib.Global.screenHeight / 2 ? 160 + -10 + (-6.8 * ((oddsSum > 20 ? 20 : oddsSum) - 1)) : 16 - (-6.8 * ((oddsSum > 20 ? 20 : oddsSum) - 1)) + 10;
            }

            this.eachHeapOfGoldCoinsData[seatIndex].push(group);
            this.numberOfGoldCoins[seatIndex] += 1;
            if (this.goldCoinRemovalTime[seatIndex][0]) {
                game.Timer.clearTimeout(this.goldCoinRemovalTime[seatIndex][0]);
                this.goldCoinRemovalTime[seatIndex] = [];
            }
            let batterys = battery;
            let goldCoinRemovalTime = game.Timer.setTimeout(() => {
                this.goldCoinAutomaticallyRemoved(batterys)
            }, this, 4000);
            this.goldCoinRemovalTime[seatIndex].push(goldCoinRemovalTime)
        }

        /**
		 * 发送道具协议协议
		 */
        public sendUsePorpMsg(idMy: number): void {
            let cmd: Cmd.ActionCmd_CS = new Cmd.ActionCmd_CS();
            cmd.act = new Cmd.Action();
            cmd.act.uid = Master.instance.uid;
            cmd.act.op = Cmd.Operation.UseItem;
            cmd.act.id = idMy;
            game.PokerFunction.tcpSend(cmd);
        }

        private goldCoinAutomaticallyRemoved(battery: gameObject.Battery) {
            if (!battery.seatdata)
                return;
            let seatId = battery.seatdata.seatId;
            let seatIndex = seatId - 1;
            if (this.goldCoinRemovalTime[seatIndex][0]) {
                game.Timer.clearTimeout(this.goldCoinRemovalTime[seatIndex][0]);
                this.goldCoinRemovalTime[seatIndex] = [];
            }

            if (this.eachHeapOfGoldCoinsData[seatIndex][0]) {
                this.goldCoinPush(battery, 0)
            }
            if (this.eachHeapOfGoldCoinsData[seatIndex][1])
                this.goldCoinPush(battery, 1)
            if (this.eachHeapOfGoldCoinsData[seatIndex][2])
                this.goldCoinPush(battery, 2, true)
            this.eachHeapOfGoldCoinsData[seatIndex].removeAt(0);
            this.numberOfGoldCoins[seatIndex] = this.eachHeapOfGoldCoinsData[seatIndex].length;
            if (this.eachHeapOfGoldCoinsData[seatIndex][0]) {
                let goldCoinRemovalTime = game.Timer.setTimeout(() => {
                    this.goldCoinAutomaticallyRemoved(battery);
                }, this, 4000);
                this.goldCoinRemovalTime[seatIndex].push(goldCoinRemovalTime)
            }
        }

        //金币推移动画
        private goldCoinPush(battery: gameObject.Battery, second: number, bool?: boolean, group?: eui.Group, odds?: number, score?: number) {
            let seat = game.GameConstant.SeatPositonList[game.GameConstant.GetClientNoBySeatId(battery.seatdata.seatId) - 1];
            let y = 0;
            if (second == 0) {
                LayerManager.instance.removeFromLayer(this.eachHeapOfGoldCoinsData[battery.seatdata.seatId - 1][0]);
                // this.eachHeapOfGoldCoinsData[battery.seatdata.seatId - 1].removeAt(0);
                return;
            }

            egret.Tween.get(this.eachHeapOfGoldCoinsData[battery.seatdata.seatId - 1][second]).to({
                x: seat.x > uniLib.Global.screenWidth / 2 ?
                    this.eachHeapOfGoldCoinsData[battery.seatdata.seatId - 1][second].x + 35 : this.eachHeapOfGoldCoinsData[battery.seatdata.seatId - 1][second].x + -35
            }, 300).call((odds: number, score: number) => {
                // if(bool){
                //     this.eachHeapOfGoldCoinsData[battery.seatdata.seatId - 1].removeAt(0);
                // }

                if (group) {
                    for (var m = 0; m < (odds > 20 ? 20 : odds); m++) {
                        game.Timer.setTimeout(() => {
                            let imageMy = Pool.getItemByClass("coinDozerImage", eui.Image);
                            if (battery.user && battery.user.uid) {
                                if (battery.user.uid == Master.instance.uid) {
                                    imageMy.source = "batteryBase8";
                                }
                                else {
                                    imageMy.source = "batteryBase81";
                                }
                            }
                            imageMy.scaleX = 0.85;
                            imageMy.scaleY = 0.85;
                            imageMy.x = 0;//seat.x + x;
                            imageMy.y = seat.y > uniLib.Global.screenHeight / 2 ? 160 + y : 8 - y;
                            y -= 6.8;
                            group.addChild(imageMy);
                        }, this, m * 10);
                    }
                    let TextNew = new eui.BitmapLabel();
                    if (battery.user && battery.user.uid) {
                        if (battery.user.uid == Master.instance.uid) {
                            TextNew.font = "flutters1_fnt";
                        }
                        else {
                            TextNew.font = "flutters2_fnt";
                        }
                    }
                    TextNew.text = "" + GX.GoldFormat(score, true, true, false);
                    group.addChild(TextNew);
                    TextNew.anchorOffsetX = TextNew.width / 2;
                    TextNew.anchorOffsetY = TextNew.height / 2;
                    TextNew.scaleX = 0.25;
                    TextNew.scaleY = 0.25;
                    TextNew.x = 12.75;//group.width / 2;
                    TextNew.y = seat.y > uniLib.Global.screenHeight / 2 ? 160 + -10 + (-6.8 * ((odds > 20 ? 20 : odds) - 1)) : 16 - (-6.8 * ((odds > 20 ? 20 : odds) - 1)) + 10;
                    this.numberOfGoldCoins[battery.seatdata.seatId - 1] = 3;
                    this.eachHeapOfGoldCoinsData[battery.seatdata.seatId - 1].removeAt(0);
                    if (this.dataStorage[battery.seatdata.seatId - 1].length != 0) {
                        this.dataStorage[battery.seatdata.seatId - 1].removeAt(0);
                        this._coinDozer(score, odds, null, battery);
                    }
                }
            }, this, [odds, score]);
        }

        public removeTheGoldCoinHeap(seatdata: game.SeatData) {
            this.numberOfGoldCoins[seatdata.seatId - 1] = 0;
            for (let item = 0; item < this.eachHeapOfGoldCoinsData[seatdata.seatId - 1].length; ++item) {
                LayerManager.instance.removeFromLayer(this.eachHeapOfGoldCoinsData[seatdata.seatId - 1][item]);
            }
            this.eachHeapOfGoldCoinsData[seatdata.seatId - 1] = [];
            this.dataStorage[seatdata.seatId - 1] = [];
            if (this.goldCoinRemovalTime[seatdata.seatId - 1][0]) {
                game.Timer.clearTimeout(this.goldCoinRemovalTime[seatdata.seatId - 1][0]);
                this.goldCoinRemovalTime[seatdata.seatId - 1] = [];
            }
        }
        //Tween动画
        public tweenAnimation(anchors, scale, image1: CustomImage, seat, image: string, bool: boolean, isMove?: boolean) {
            let y = seat.y > uniLib.Global.screenHeight / 2 ? -40 : 40;
            let x = seat.x > uniLib.Global.screenWidth / 2 ? 130 : -130;
            image1.source = image;
            LayerManager.instance.addToLayer(image1, LAYER.EFFECT_LOW);
            image1.anchorOffsetX = anchors;
            image1.anchorOffsetY = anchors;
            image1.scaleX = scale;
            image1.scaleY = scale;
            image1.x = seat.x + x;
            image1.y = seat.y + y;
            if (isMove) {
                this.imageJitter(image1, bool)
            }
            return image1;
        }
        private imageJitter(ImageMy: eui.Image, bool?: boolean): void {
            if (!ImageMy) {
                return;
            }
            egret.Tween.get(ImageMy).to({ rotation: bool ? 360 : -360 }, 2000).call(() => {
                this.imageJitter(ImageMy, bool);
            });
        }

        public createMedalResources(id: number) {
            let image1 = new CustomImage();
            let image2 = new CustomImage();
            let image3 = new CustomImage();
            let aNetImage = new CustomImage();
            let mov = UIUtil.creatMovieClip("deng");
            let mov1 = UIUtil.creatMovieClip("Medal1_jewel");
            let mov2 = UIUtil.creatMovieClip("Medal2_jewel");
            let mov3 = UIUtil.creatMovieClip("Medal3_jewel");
            let textMy = new eui.BitmapLabel()
            this.medalStorage[id].push(image1, image2, image3, aNetImage, textMy, [mov, mov1, mov2, mov3])
        }



        public medalStorage = [[], [], [], []];
        private medalTime = [null, null, null, null];

        /**
         * 奖章
         */
        public _getMedal(scoreSum: number, oddsSum: number, rev: Cmd.DeadFish, skill: number) {

            let levelData: table.TableGameRuleConfigList = FishingJoy.DataCenter.instance.getRuleConfigList()
            let level: number;
            if (oddsSum < levelData[0].medalGrades[0] && skill != 1) {
                return;
            }
            else if (oddsSum >= levelData[0].medalGrades[0] && oddsSum < levelData[0].medalGrades[1]) {
                level = 1;
            }
            else if (oddsSum >= levelData[0].medalGrades[1] && oddsSum < levelData[0].medalGrades[2]) {
                level = 2;
            }
            else if (oddsSum >= levelData[0].medalGrades[2]) {
                level = 3;
            }
            let battery: gameObject.Battery = this.allBattery.get(rev.uid);
            if (battery == null || battery.seatdata == null)
                return;
            let seatId = battery.seatdata.seatId;
            let clientNo = game.GameConstant.GetClientNoBySeatId(seatId);
            this.scavengingMedals(seatId - 1);
            let seatPos: egret.Point = game.GameConstant.SeatPositonList[clientNo - 1]
            let y = seatPos.y > uniLib.Global.screenHeight / 2 ? -40 : 40;
            let x = seatPos.x > uniLib.Global.screenWidth / 2 ? 130 : -130;
            let image1
            let image2
            let image3
            let mov
            let textMy
            let aNetImage
            let zoom = 250 / 284 * 0.9 * 0.75;
            game.SoundHand.Instance.playMedalAppearance();
            if (GX.GameLayerManager.sceneLayer.parent.x != 0 || GX.GameLayerManager.sceneLayer.parent.y != 0) {
                GX.GameLayerManager.sceneLayer.parent.x = 0;
                GX.GameLayerManager.sceneLayer.parent.y = 0;
            }
            let medalStorage = this.medalStorage[seatId - 1];
            if (medalStorage.length == 0) {
                this.createMedalResources(seatId - 1)
            }

            let levelTime: number = skill ? 3000 : level == 3 ? 5000 : (level + 1) * 1000;
            if (skill == 1) {
                image1 = this.tweenAnimation(142, zoom, medalStorage[0], seatPos, "down", true, true)
                image2 = this.tweenAnimation(106, zoom, medalStorage[1], seatPos, "middle", false, true)
                image3 = this.tweenAnimation(125.5, zoom, medalStorage[2], seatPos, "up", true, true)
                mov = medalStorage[5][0];//UIUtil.creatMovieClip("deng");
                mov.touchEnabled = false;
                mov.y = seatPos.y + y;
                mov.x = seatPos.x + x;
                mov.scaleX = zoom;
                mov.scaleY = zoom;
                mov.frameRate = 9;
                mov.gotoAndPlay(1, -1);
                LayerManager.instance.addToLayer(mov, LAYER.EFFECT_LOW);
                aNetImage = medalStorage[3]
                aNetImage.source = "catchAllInOneDraft";
                LayerManager.instance.addToLayer(aNetImage, LAYER.EFFECT_LOW);
                aNetImage.anchorOffsetX = aNetImage.width / 2;
                aNetImage.anchorOffsetY = aNetImage.height / 2;
                aNetImage.x = seatPos.x + x;
                aNetImage.y = seatPos.y + y - 30;
                aNetImage.scaleX = seatPos.y > uniLib.Global.screenHeight / 2 ? 1 : -1;
                aNetImage.scaleY = seatPos.y > uniLib.Global.screenHeight / 2 ? 1 : -1;
            }
            else {
                let anchors1 = level == 1 ? 97 : level == 2 ? 101 : 101;
                let anchors2 = level == 1 ? 118 : level == 2 ? 125 : 137.5;

                if (rev.uid == Master.instance.uid && (level == 2 || level == 3)) {
                    if (this._lastMasterWinEff && this._lastMasterWinEff.isInView) {
                        gameObject.GameObjectFactory.instance.recoverGameObject(this._lastMasterWinEff);
                        this._lastMasterWinEff = null;
                    }

                    let data: gameObject.IMasterWinEffVars = <gameObject.IMasterWinEffVars>{};
                    data.bornX = uniLib.Global.screenWidth / 2;
                    data.bornY = uniLib.Global.screenHeight / 2;
                    data.money = scoreSum;
                    data.winLevel = level;
                    this._lastMasterWinEff = gameObject.GameObjectFactory.instance.creatGameObject(GAMEOBJECT_SIGN.MASTER_WIN_EFF, data, LAYER.EFFECT_MEDIUM);
                }
                let scale: number = 0.9 * 0.75
                image1 = this.tweenAnimation(anchors1, scale, medalStorage[0], seatPos, "Medal_ middle" + level, true)
                image2 = this.tweenAnimation(anchors2, scale, medalStorage[1], seatPos, "Medal_BG" + level, true, true)
                mov = medalStorage[5][level];
                mov.scaleX = scale;
                mov.scaleY = scale;
                mov.touchEnabled = false;
                mov.y = seatPos.y + y;
                mov.x = seatPos.x + x;
                mov.frameRate = 9;
                mov.gotoAndPlay(1, -1);
                LayerManager.instance.addToLayer(mov, LAYER.EFFECT_LOW);
            }
            textMy = medalStorage[4];//new eui.BitmapLabel()
            textMy.font = "multipleFnt_fnt";
            textMy.text = GX.GoldFormat(scoreSum, true, true, false);
            LayerManager.instance.addToLayer(textMy, LAYER.EFFECT_LOW);
            textMy.x = seatPos.x + x;
            textMy.y = aNetImage ? seatPos.y + y + 30 : seatPos.y + y;
            textMy.anchorOffsetX = textMy.width / 2;
            textMy.anchorOffsetY = textMy.height / 2;
            textMy.scaleX = seatPos.y > uniLib.Global.screenHeight / 2 ? 0.9 : -0.9;//skill == 1 ? zoom : 0.9;
            textMy.scaleY = seatPos.y > uniLib.Global.screenHeight / 2 ? 0.9 : -0.9//0.9;
            // textMy.rotation =  seat.y > uniLib.Global.screenHeight / 2 ? 0 : 180;
            this.labelJitter(textMy, true);
            if (aNetImage) {
                this.labelJitter(aNetImage, true);
            }
            if (this.medalTime[seatId - 1]) {
                game.Timer.clearTimeout(this.medalTime[seatId - 1]);
                this.medalTime[seatId - 1] = null;
            }
            this.medalTime[seatId - 1] = game.Timer.setTimeout(() => {
                for (let item of FishingJoy.FishingJoyLogic.instance.medalStorage[seatId - 1]) {
                    egret.Tween.removeTweens(item);
                    LayerManager.instance.removeFromLayer(item);
                }
                for (let item of FishingJoy.FishingJoyLogic.instance.medalStorage[seatId - 1][5]) {
                    egret.Tween.removeTweens(item);
                    LayerManager.instance.removeFromLayer(item);
                }
            }, null, levelTime);
        }

        private scavengingMedals(id: number): void {
            if (this.medalStorage[id].length == 0) {
                return;
            }
            else {
                for (let item of FishingJoy.FishingJoyLogic.instance.medalStorage[id]) {
                    egret.Tween.removeTweens(item);
                    LayerManager.instance.removeFromLayer(item);
                }
                for (let item of FishingJoy.FishingJoyLogic.instance.medalStorage[id][5]) {
                    egret.Tween.removeTweens(item);
                    LayerManager.instance.removeFromLayer(item);
                }
            }
        }

        private labelJitter(textMy: eui.BitmapLabel, bool?: boolean): void {
            if (!textMy) {
                return;
            }
            egret.Tween.get(textMy).to({ rotation: bool ? 13 : -13 }, 500, egret.Ease.backOut).call(() => {
                this.labelJitter(textMy, !bool);
            });
        }

        private outOfTheField: eui.Image;

		/**
		 * 免费游戏出场离场提示 
		 */
        public onFreeGame(imageID: number, boolMy?: boolean): void {
            game.SoundHand.Instance.playAlert();
            if (!boolMy) {
                if (this.winAnim0 != null) {
                    egret.Tween.removeTweens(this.winAnim0)
                    egret.Tween.removeTweens(this.outOfTheField)
                    LayerManager.instance.removeFromLayer(this.winAnim0);
                    this.winAnim0 == null;
                }
                this.winAnim0 = UIUtil.creatMovieClip("appearanceOfLight");
                this.winAnim0.blendMode = egret.BlendMode.ADD;
                this.winAnim0.y = uniLib.Global.screenHeight / 2;
                this.winAnim0.x = uniLib.Global.screenWidth / 2;
                this.winAnim0.scaleX = 4 * uniLib.Global.screenWidth / 1280;
                this.winAnim0.scaleY = 4 * uniLib.Global.screenHeight / 720;;
                LayerManager.instance.addToLayer(this.winAnim0, LAYER.EFFECT_LOW);
                this.winAnim0.frameRate = 10;
                this.winAnim0.gotoAndPlay(1, 4);
                this.winAnim0.addEventListener(egret.Event.COMPLETE, this.animationConcealment, this);
            }

            if (!this.outOfTheField) {
                this.outOfTheField = new eui.Image();
                this.outOfTheField.visible = false;
            }
            LayerManager.instance.addToLayer(this.outOfTheField, LAYER.EFFECT_LOW);
            this.outOfTheField.source = "freeOutOfTheField" + imageID;
            this.outOfTheField.alpha = 1;
            this.outOfTheField.anchorOffsetX = this.outOfTheField.width / 2;
            this.outOfTheField.anchorOffsetY = this.outOfTheField.height / 2;
            this.outOfTheField.visible = true;
            this.outOfTheField.scaleX = 0.8;
            this.outOfTheField.scaleY = 0.8;
            this.outOfTheField.x = 0 - this.outOfTheField.width / 2;
            this.outOfTheField.y = uniLib.Global.screenHeight / 2;

            egret.Tween.get(this.outOfTheField).to({ x: uniLib.Global.screenWidth / 2 }, 500, egret.Ease.backOut).call(() => {
                if (boolMy) {
                    this.animationConcealment(1);
                }
            });
        }

        public freePromptCloses(): void {
            if (this.outOfTheField) {
                this.outOfTheField.visible = false;
                this.outOfTheField.x = 0 - this.outOfTheField.width / 2;
            }

        }


        private animationConcealment(boolMy?: number) {
            if (boolMy != 1) {
                egret.Tween.get(this.winAnim0).to({ alpha: 0 }, 1000).call(() => {
                    if (this.winAnim0 != null) {
                        LayerManager.instance.removeFromLayer(this.winAnim0);
                        this.winAnim0 = null;
                    }
                });
                egret.Tween.get(this.outOfTheField).to({ alpha: 0.5, scaleX: 1.5, scaleY: 1.5 }, 300).call(() => {
                    egret.Tween.get(this.outOfTheField).to({ alpha: 0, scaleX: 0.5, scaleY: 0.5 }, 700).call(() => {
                        this.outOfTheField.visible = false;
                        this.outOfTheField.x = 0 - this.outOfTheField.width / 2;
                        if (this.freeType) {
                            // this.changeScene(null, this.freeType, null, true);
                            this.freeType = null;
                        }
                    });
                });
            }
            else {
                if (!this.outOfTheField.visible) {
                    return;
                }
                egret.Tween.get(this.outOfTheField).to({ scaleX: 1.1, scaleY: 1.1 }, 600).call(() => {
                    egret.Tween.get(this.outOfTheField).to({ scaleX: 0.8, scaleY: 0.8 }, 700).call(() => {
                        this.animationConcealment(1)
                    });
                });

            }
        }


        private animationConcealments() {
            this.winAnim1.removeEventListener(egret.Event.COMPLETE, this.animationConcealments, this);
            let back0 = UICenter.instance.getManager(commonUI.FishMainScene).getView(FishMainSceneView);
            back0.removeChild(this.winAnim1);
            this.winAnim1 = null;
        }
        private freeType: number;
		/**
		 * 出鱼
		 */
        private _spawnFishEvent(data: Cmd.SpawnFishCmd_S, reconnection: boolean = false) {
            DataCenter.instance.isSwitchFish = false;
            let fishlist: Cmd.FishInfo[] = data.fishlist;
            let specialTime = 0;
            if (fishlist == null || !(fishlist instanceof Array)) {
                return;
            }

            for (let fishs of fishlist) {
                if (fishs.spawnTime == null) {
                    console.error("服务器未下发spawnTime");
                    continue;
                }

                for (let item of fishs.fishs) {
                    // item.templateId = GAMEOBJECT_SIGN.GLOBE_FISH;
                    let config: gameObject.IGameObjectConfig = gameObject.GameObjectConfigParse.configDic.get(item.templateId);
                    if (!config) {
                        console.assert(false, "鱼模板id为" + item.templateId + "这找不到配置")
                        continue;
                    }
                    let tableConfig: table.TableFishConfig = config.table;
                    let fishPath = table.TableFishPath.getFishPath(fishs.pathId);
                    if (fishPath == null) {
                        console.assert(false, "找不到配置路径:" + fishs.pathId);
                        return;
                    }
                    if (tableConfig.sign == GAMEOBJECT_SIGN.DRAGON) {
                        specialTime = tableConfig.spawnTimeout;
                        if (!reconnection) {
                            this.freeType = SCENEID.HaiDiBaoZang;
                            this.onFreeGame(1);
                        }
                        else {
                            // this.changeScene(null, SCENEID.HaiDiBaoZang, null, false);
                        }

                    }
                    else if (tableConfig.sign == GAMEOBJECT_SIGN.MERMAID) {
                        specialTime = tableConfig.spawnTimeout;
                        // this.changeScene(null, SCENEID.HaiDiGongDian, null, !reconnection);
                        if (!reconnection) {
                            this.freeType = SCENEID.HaiDiGongDian;
                            this.onFreeGame(3)
                        }
                        else {
                            // this.changeScene(null, SCENEID.HaiDiGongDian, null, false);
                        }
                    }
                    if (item.skill == Cmd.FishSkillType.SameGroup) {
                        let offset = game.GameConstant.getSameGroupOffset()
                        item.offsetX = offset.offsetX;
                        item.offsetY = offset.offsetY;
                    }
                    let varsData: gameObject.IFishVars = <gameObject.IFishVars>{};
                    varsData.serveID = item.id;
                    varsData.pathId = fishs.pathId.toString();
                    varsData.skillID = item.skill;
                    varsData.offsetX = item.offsetX;
                    varsData.offsetY = item.offsetY;
                    varsData.reconnection = reconnection;
                    varsData.spawnTime = fishs.spawnTime + specialTime;
                    varsData.operation = [<gameObject.IOperation>{
                        type: OPERATION_TYPE.FISH
                    }]

                    let fish: gameObject.Fish = gameObject.GameObjectFactory.instance.creatGameObject(item.templateId, varsData, LAYER.Fish)
                    fish.name = "path：" + fishs.pathId.toString();
                    if (fish.sign == GAMEOBJECT_SIGN.MERMAID || fish.sign == GAMEOBJECT_SIGN.DRAGON) {
                        EventManager.fireEvent(EVENT_ID.AIM_SPECIAL_FISH, [fish, true]);
                    }
                }
            }
        }

		/**
		 * 碰撞检测
		 */
        public _checkHit(): void {

            let bulletMap: Dictionary = this.inViewBullets;
            let bulletMapLen: number = bulletMap.length;
            let fishMap: Dictionary = this.inViewFishes;
            let fishMapLen: number = fishMap.length;
            /*小鱼碰撞检测标记*/
            if (bulletMapLen == 0 || fishMapLen == 0) {
                return;
            }
            this.hitFishList.clear();
            let smallFishFlag: boolean = false;

            let fishGroupMap: Dictionary = this._fishGroupDic;
            let bulletGroupMap: Dictionary = this._bulletGroupDic;
            fishGroupMap.clear();
            bulletGroupMap.clear();


            if (this._colliderFlag == 0) {
                this._colliderFlag = 1;
            }
            else {
                this._colliderFlag = 0;
            }

            let i: number = 0;
            for (; i < bulletMapLen; i += this._colliderFlag + 1) {
                let bullet: gameObject.Bullet = bulletMap.values[i];
                let bulletColliderAry: Collider[] = bullet.colliderAry;

                for (let m: number = 0; m < bulletColliderAry.length; m++) {
                    bulletColliderAry[m].setGlobePos();
                }
                NineGridSplitScreenTool.setGridIndex(bullet, bulletGroupMap);
            }

            for (i = 0; i < fishMapLen; i += this._colliderFlag + 1) {
                let fish: gameObject.Fish = fishMap.values[i];
                if (fish.isAlive) {
                    /*大鱼每2帧检测碰撞 避免穿子弹*/
                    if (fish.isAccurateCollider) {
                        let fishColliderAry: Collider[] = fish.colliderAry;
                        for (let m: number = 0; m < fishColliderAry.length; m++) {
                            fishColliderAry[m].setGlobePos();
                        }
                        NineGridSplitScreenTool.setGridIndex(fish, fishGroupMap);
                    }
                    /*小鱼每偶然帧检测偶数碰撞 因为小鱼都是成群结队出现的 不太可能穿子弹*/
                    else {
                        if (fishMapLen >= 60) {
                            smallFishFlag = !smallFishFlag
                            if (smallFishFlag) {
                                let fishColliderAry: Collider[] = fish.colliderAry;
                                for (let m: number = 0; m < fishColliderAry.length; m++) {
                                    fishColliderAry[m].setGlobePos();
                                }
                                NineGridSplitScreenTool.setGridIndex(fish, fishGroupMap);
                            }
                        }
                        else {

                            let fishColliderAry: Collider[] = fish.colliderAry;
                            for (let m: number = 0; m < fishColliderAry.length; m++) {
                                fishColliderAry[m].setGlobePos();
                            }
                            NineGridSplitScreenTool.setGridIndex(fish, fishGroupMap);
                        }
                    }
                }
            }
            let bulletHit: gameObject.Bullet[] = [];

            for (let j: number = Grid.Grid_1; j < Grid.Grid_9 + 1; j++) {

                let bulletGameObjAry: gameObject.GameObjectCollider[] = bulletGroupMap.get(j);
                if (bulletGameObjAry) {
                    let bulletGameObjAryLen: number = bulletGameObjAry.length
                    for (let f: number = 0; f < bulletGameObjAryLen; f++) {
                        let bullet: gameObject.Bullet = bulletGameObjAry[f] as gameObject.Bullet;
                        /*瞄准子弹*/
                        let targetFish: gameObject.Fish = bullet.targetFish;
                        if (this._checkFishCanCollider(targetFish)) {
                            if (this._checkBulletHit(bullet, targetFish, fishGroupMap, j, true)) {
                                bulletHit.push(bullet);
                            }
                        }
                        else {
                            let fishGameObjAry: gameObject.GameObjectCollider[] = fishGroupMap.get(j);
                            if (fishGameObjAry) {
                                let fishGameObjAryLen: number = fishGameObjAry.length
                                for (let k: number = 0; k < fishGameObjAryLen; k++) {
                                    let fish: gameObject.Fish = fishGameObjAry[k] as gameObject.Fish;
                                    if (this._checkBulletHit(bullet, fish, fishGroupMap, j, false)) {
                                        bulletHit.push(bullet);
                                        break;
                                    }
                                }
                            }
                        }

                    }
                }
            }

            for (let item of bulletHit) {
                gameObject.GameObjectFactory.instance.recoverGameObject(item);
            }
            if (this.hitFishList.length > 0) {
                let cmd = new Cmd.HitFishCmd_CS();
                cmd.list = this.hitFishList;
                game.PokerFunction.tcpSend(cmd);
            }

        }


		/**
		 * 检测鱼是否可以碰撞
		 */
        private _checkFishCanCollider(fish: gameObject.Fish): boolean {
            if (fish && fish.isInView && fish.isAlive /*&& !fish.isCollided*/) {
                return true;
            }
            else {
                return false;
            }
        }

		/**
		 * 检测子弹碰撞
		 */
        private _checkBulletHit(bullet: gameObject.Bullet, fish: gameObject.Fish, fishGroupMap: Dictionary, gridIndex: number, isAim: boolean): boolean {
            let bulletColliderAry: Collider[] = bullet.colliderAry;
            let fishColliderAry: Collider[] = fish.colliderAry;
            let fishColliderAryLen: number = fishColliderAry.length;
            for (let k: number = 0; k < bulletColliderAry.length; k++) {
                for (let f: number = 0; f < fishColliderAryLen; f++) {
                    if (Collider.isIntersect(bulletColliderAry[k], fishColliderAry[f])) {

                        let fishingNet: gameObject.FishingNet = this._creatFishingNet(bullet, fish);
                        if (fishingNet) {
                            this._checkFishingNetHit(bullet, fish, fishingNet, fishGroupMap, gridIndex, isAim);
                        }

                        return true;
                    }
                }
            }
            return false;
        }

        /**
         * 创建渔网
         */
        private _creatFishingNet(bullet: gameObject.Bullet, collidedFish: gameObject.Fish): gameObject.FishingNet {
            let battery: gameObject.Battery = this.allBattery.get(bullet.playerID);
            if (!battery) {
                return null;
            }
            let data: gameObject.IFishNetVars = <gameObject.IFishNetVars>{};
            data.bornX = bullet.x;
            data.bornY = bullet.y;
            data.rotation = bullet.rotation;
            data.radius = battery.fishNetRadius;
            let fishingNet: gameObject.FishingNet = null;
            let playerID: number = bullet.playerID;
            if (playerID == Master.instance.uid) {
                if (bullet.isReal) {
                    data.isVisible = false;
                }
                else {
                    /*是自己 且假渔网时候才播放声音*/
                    data.isVisible = true;
                    /*播放被击中鱼特效*/
                    collidedFish.playHitEff(bullet.rotation);
                }
                fishingNet = gameObject.GameObjectFactory.instance.creatGameObject(GAMEOBJECT_SIGN.FishingNet_Self, data, LAYER.FishingNet);
            }
            else {
                data.isVisible = true;
                fishingNet = gameObject.GameObjectFactory.instance.creatGameObject(GAMEOBJECT_SIGN.FishingNet_Green, data, LAYER.FishingNet);
            }
            return fishingNet;
        }


		/**
		 * 检测渔网碰撞
		 */
        private _checkFishingNetHit(bullet: gameObject.Bullet, collidedFish: gameObject.Fish, fishingNet: gameObject.FishingNet,
            fishGroupMap: Dictionary, gridIndex: number, isAim: boolean): void {

            let playerID: number = bullet.playerID
            let user: game.UserInfo = game.PokerFunction.GetUserInfoByUid(playerID)
            if (!user) {
                return;
            }
            if (user.isRobot || playerID == Master.instance.uid) {
                let deadlist: Cmd.Fish[] = [];
                let deadFish: Cmd.Fish = new Cmd.Fish();
                deadFish.id = collidedFish.servelID;
                deadlist.push(deadFish);
                /*如果这颗子弹碰到炸弹鱼 将不再向服务器发送渔网碰撞到鱼 而发送炸弹鱼 能炸到的鱼*/
                if (collidedFish.sign == GAMEOBJECT_SIGN.BOOM_FISH && bullet.isReal) {
                    let fishAry: gameObject.Fish[] = fishGroupMap.get(gridIndex);
                    if (fishAry) {
                        fishAry.remove(collidedFish);
                        /*该真子弹不再走渔网碰撞逻辑*/
                        this._checkBoomHit(fishAry, bullet.servelID, playerID, <gameObject.BoomFish>collidedFish, deadlist);
                        return;
                    }
                }
                /*瞄准不再检测网的范围碰撞*/
                if (isAim) {
                    if (bullet.isReal) {
                        this._addHitFish(deadlist, bullet.servelID, playerID)
                    }
                    return;
                }


                let fishingNetCollider: Collider[] = fishingNet.colliderAry;
                for (let j: number = 0; j < fishingNetCollider.length; j++) {
                    fishingNetCollider[j].setGlobePos();
                }
                NineGridSplitScreenTool.analyseGrid(fishingNet);
                let isBreak: boolean = false;
                for (let i: number = 0; i < fishingNet.grid.length; i++) {
                    let grid: number = fishingNet.grid[i]
                    let fishAry: gameObject.Fish[] = fishGroupMap.get(grid);
                    if (fishAry) {
                        let len: number = fishAry.length
                        for (let m: number = 0; m < len; m++) {
                            let fish: gameObject.Fish = fishAry[m];
                            if (fish.servelID == collidedFish.servelID) {
                                continue;
                            }
                            isBreak = false;
                            let fishColliderAry: Collider[] = fish.colliderAry;
                            let fishColliderAryLen: number = fishColliderAry.length;

                            for (let f: number = 0; f < fishColliderAryLen; f++) {
                                if (isBreak) {
                                    break;
                                }
                                for (let k: number = 0; k < fishingNetCollider.length; k++) {
                                    if (Collider.isIntersect(fishingNetCollider[k], fishColliderAry[f])) {
                                        isBreak = true;
                                        /*真子弹只负责逻辑*/
                                        if (bullet.isReal) {
                                            /*如果是炸弹鱼 将不再向服务器发送渔网碰撞到鱼 而发送炸弹鱼 能炸到的鱼*/
                                            if (fish.sign == GAMEOBJECT_SIGN.BOOM_FISH) {
                                                deadlist.length = 0;
                                                this._checkBoomHit(fishAry, bullet.servelID, playerID, <gameObject.BoomFish>fish, deadlist);
                                                return;
                                            }
                                            else {
                                                let deadFish: Cmd.Fish = new Cmd.Fish();
                                                deadFish.id = fish.servelID;
                                                deadlist.push(deadFish);
                                            }
                                        }
                                        /*假子弹只负责表现*/
                                        else {
                                            if (playerID == Master.instance.uid) {
                                                fish.playHitEff(bullet.rotation);
                                            }
                                        }
                                        break;
                                    }
                                }
                            }

                        }
                    }
                    if (bullet.isReal) {
                        this._addHitFish(deadlist, bullet.servelID, playerID)
                    }
                }
            }
        }



		/**
		 * 检测爆炸碰撞
		 */
        private _checkBoomHit(fishAry: gameObject.Fish[], bulletID: number, playerID: number, boomFish: gameObject.BoomFish, deadlist: Cmd.Fish[]): void {
            let burstCollider: Collider = boomFish.burstCollider;
            burstCollider.setGlobePos();

            let fishAryLen: number = fishAry.length
            let i: number;
            for (i = 0; i < fishAryLen; i++) {
                let fish: gameObject.Fish = fishAry[i];
                if (fish.isAlive) {
                    let fishColliderAry: Collider[] = fish.colliderAry;
                    for (let m: number = 0; m < fishColliderAry.length; m++) {
                        fishColliderAry[m].setGlobePos();
                        if (Collider.isIntersect(burstCollider, fishColliderAry[m])) {
                            let deadFish: Cmd.Fish = new Cmd.Fish();
                            deadFish.id = fish.servelID;
                            deadlist.push(deadFish);
                            break;
                        }
                    }
                }
            }

            if (deadlist.length != 0) {
                this._addHitFish(deadlist, bulletID, playerID, true);
            }

        }

		/**
		 * 发送协议
		 */
        private _addHitFish(deadlist: Cmd.Fish[], bulletID: number, playerID: number, isBurst?: boolean) {
            let hitFish = new Cmd.HitFish();
            hitFish.list = deadlist;
            hitFish.bid = bulletID;
            hitFish.list = deadlist;
            hitFish.uid = playerID;
            if (isBurst) {
                hitFish.hitType = GAMEOBJECT_SIGN.BOOM_FISH;
            }
            this.hitFishList.push(hitFish);
        }

		/**
		 * 字典写入玩家炮台
		 */
        private _addBatteryInMap(uid: number, battery: gameObject.Battery): void {
            if (this.allBattery.length <= 4) {
                if (!this.allBattery.isExist(uid)) {
                    this.allBattery.set(uid, battery);
                }
                else {
                    console.assert(false, "玩家已经存在！");
                }
            }
            else {
                console.assert(false, "座位已满！");
            }
        }

		/**
		 * 字典移除玩家炮台
		 */
        private _removeBatteryInMap(uid: number): void {
            if (!this.allBattery.remove(uid)) {
                console.assert(false, "玩家不存在！");
            }
        }

		/**
		 * 释放
		 */
        public dispose(): void {
            FishingJoy.Laya.timer.clear(this, this._checkHit);
            EventManager.unregisterEvent(EVENT_ID.ADD_BATTERY_IN_MAP, this, this._addBatteryInMap);
            EventManager.unregisterEvent(EVENT_ID.REMOVE_BATTERY_IN_MAP, this, this._removeBatteryInMap);

            EventManager.unregisterEvent(EVENT_ID.FISH_DIE_ACTION, this, this._fishDieAction);
            // MJLobby.MJLobbyEventListener.getInstance().removeEventListener(MJLobby.MahJongLobbyFacadeConsts.USER_INFO_DATA, this.onUserInfoData, this);
            /*鱼死亡协议*/
            game.Action.deadFishEvent.remove(this._deadFishCmd, this)
            /*生成鱼协议*/
            game.Action.spawnFishEvent.remove(this._spawnFishEvent, this);
            /*切换场景协议*/
            game.Action.changeSceneEvent.remove(this.changeScene, this)
            /*房间数据更新*/
            GX.PokerEvent.Instance.roomDataUpdateEvent.remove(this._roomDataUpdateEvent, this);
            /*子弹更新*/
            game.Action.sendBulletEvent.remove(this._firBullet, this);
            /*击中鱼协议*/
            game.Action.hitFishEvent.remove(this._hitFishCmd, this)
            /*道具协议*/
            game.Action.actionEvent.add(this._receptionOfProps, this);

            GX.PokerEvent.Instance.moneyUpdate.remove(this._addScore, this)

            this._destroyBattery();
            this._destroyFishes();
            this.inViewFishes.clear();
            this.allBattery.clear();
            this.masterBattery = null;
            FishingJoyLogic._instance = null;;
        }

		/**
		 * 销毁玩家
		 */
        private _destroyBattery(): void {
            let map: SimpleMap<gameObject.Battery> = this.allBattery.copy();
            var len: number = map.length;
            for (var i: number = 0; i < len; i++) {
                let battery: gameObject.Battery = map.getByKeyIndex(i);
                gameObject.GameObjectFactory.instance.recoverGameObject(battery);
            }
            map.recover();
        }

		/**
		 * 销毁鱼
		 */
        public _destroyFishes(): void {
            let map: Dictionary = this.inViewFishes.copy();
            var len: number = map.length;
            for (var i: number = 0; i < len; i++) {
                var fish: gameObject.Fish = map.values[i];
                gameObject.GameObjectFactory.instance.recoverGameObject(fish);
            }
        }

		/**
		 * 销毁子弹
		 */
        private destroyBullets(): void {
            let map: Dictionary = this.inViewBullets.copy();
            var len: number = map.length;
            for (var i: number = 0; i < len; i++) {
                var bullet: gameObject.Bullet = map.values[i];
                gameObject.GameObjectFactory.instance.recoverGameObject(bullet);
            }
        }

		/**
		 * 找到场上最值钱的鱼
		 */
        public findMostValuableFish(): gameObject.Fish {
            let selectFishes: gameObject.Fish[] = [];
            for (let i: number = 0; i < this.allBattery.length; i++) {
                let battery: gameObject.Battery = this.allBattery.getByKeyIndex(i);
                if (battery && battery.user.uid != Master.instance.uid) {
                    if (battery.targetFishId != - 1) {
                        let fish: gameObject.Fish = this.inViewFishes.get(battery.targetFishId);
                        if (this._checkFishCanCollider(fish)) {
                            selectFishes.push(fish);
                        }
                    }
                }
            }

            let fishMap: Dictionary = this.inViewFishes;
            let mostValuableFish: gameObject.Fish = null;
            let fish: gameObject.Fish;
            let index: number = 0;
            let isBreak: boolean = false;
            let [x, y]: [number, number] = [-1, -1];
            for (let i: number = fishMap.length - 1; i >= 0; i--) {
                if (isBreak) {
                    break;
                }
                fish = fishMap.values[i];
                if (this._checkFishCanCollider(fish)) {
                    if (fish.isAccurateCollider) {
                        for (let j: number = 0; j < fish.colliderAry.length; j++) {
                            let collider: FishingJoy.Collider = fish.colliderAry[j];
                            [x, y] = UIUtil.localToGlobal(collider);
                            if (UIUtil.inAimView(x, y)) {
                                if (fish.sign == GAMEOBJECT_SIGN.DRAGON || fish.sign == GAMEOBJECT_SIGN.MERMAID) {
                                    return fish;
                                }
                                else {
                                    if (selectFishes.indexOf(fish) == -1) {
                                        mostValuableFish = fish;
                                        index = i
                                        isBreak = true;
                                    }
                                    break;
                                }

                            }
                        }
                    }
                    else {
                        [x, y] = UIUtil.localToGlobal(fish);
                        if (selectFishes.indexOf(fish) == -1) {
                            if (UIUtil.inAimView(x, y)) {
                                mostValuableFish = fish;
                                index = i;
                                break;
                            }
                        }
                    }

                }
            }
            if (mostValuableFish != null) {
                for (let k: number = index - 1; k >= 0; k--) {
                    fish = fishMap.values[k];
                    if (this._checkFishCanCollider(fish)) {

                        if (fish.isAccurateCollider) {
                            for (let j: number = 0; j < fish.colliderAry.length; j++) {
                                let collider: FishingJoy.Collider = fish.colliderAry[j];
                                [x, y] = UIUtil.localToGlobal(collider);
                                if (UIUtil.inAimView(x, y)) {
                                    if (fish.sign == GAMEOBJECT_SIGN.DRAGON || fish.sign == GAMEOBJECT_SIGN.MERMAID) {
                                        return fish;
                                    }
                                    if (selectFishes.indexOf(fish) == -1) {
                                        if (mostValuableFish.odds < fish.odds) {
                                            mostValuableFish = fish;
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                        else {
                            [x, y] = UIUtil.localToGlobal(fish);
                            if (selectFishes.indexOf(fish) == -1) {
                                if (UIUtil.inAimView(x, y)) {
                                    if (mostValuableFish.odds < fish.odds) {
                                        mostValuableFish = fish;
                                    }
                                }
                            }
                        }

                    }
                }
            }
            else {
                if (selectFishes.length > 0) {
                    mostValuableFish = selectFishes[0];
                }
            }
            return mostValuableFish;
        }
    }
}