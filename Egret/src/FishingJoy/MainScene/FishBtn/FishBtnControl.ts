/**
 * 控制器
 * @author suo
 */
module FishingJoy {
	export class FishBtnControl extends BaseUIControl {

		/**
		 * 主场景视图
		 */
		private _fishBtnView: FishBtnView;

		public constructor() {
			super();
			//暂时务删
			console.error("FishBtnControl constructor")
		}

		/**
		 * 初始化
		 */
		public onInit(): void {
			this._fishBtnView = this._viewCenter.getView(FishBtnView);
			this._fishBtnView.autoShoot.mouseClickHandler = Handler.create(this, this._clickAutoShoot);
			this._fishBtnView.frozenShoot.mouseClickHandler = Handler.create(this, this._clickFrozenShoot);
			this._fishBtnView.aimShoot.mouseClickHandler = Handler.create(this, this._clickAimShoot)
			// this._fishBtnView.fastShoot.mouseClickHandler = Handler.create(this, this._clickFreezeShoot)
			this._fishBtnView.gmCheckBox.addEventListener(egret.TouchEvent.TOUCH_TAP, this._clickGmCheckBox, this);
			this._fishBtnView.gmGroup.addEventListener(egret.TouchEvent.TOUCH_TAP, this._clickGmGroup, this);
			this._fishBtnView.exitGameBtn.mouseClickHandler = Handler.create(this, this._onExitBtnClick);
			this._fishBtnView.sceneSwitching.mouseClickHandler = Handler.create(this, this._testHandler);
			this._fishBtnView.helpBtn.mouseClickHandler = Handler.create(this, this._clickHelp);

			EventManager.registerEvent(EVENT_ID.PLAY_USE_PORP_EFF, Handler.create(this, this.setShootEff));
			egret.MainContext.instance.stage.addEventListener(egret.Event.RESIZE, this.onResize, this);

		}


		/**
		 * 点击帮助
		 */
		private _clickHelp(): void {
			UICenter.instance.openUI(commonUI.FishHelp);
		}

		/**
		 * 切换场景
		 */
		public dataMy;
		private _testHandler(): void {
			// let cmd:Cmd.ChangeSceneCmd_S = new Cmd.ChangeSceneCmd_S();
			// cmd.sceneId = 5;
			// FishingJoy.FishingJoyLogic.instance.changeScene(cmd)

			// let data: gameObject.IDragonEffVars = <gameObject.IDragonEffVars>{}
			// data.targetBattery = FishingJoyLogic.instance.allBattery.getByKeyIndex(0);
			// if (data.targetBattery && data.targetBattery.user) {
			// 	game.SoundHand.Instance.playGoldenDragonCapture();
			// 	data.bornX = uniLib.Global.screenWidth / 2;
			// 	data.bornY = uniLib.Global.screenHeight / 2 + 50;
			// 	data.score = 3000;
			// 	data.playerNickName = data.targetBattery.user.nickName;
			// 	gameObject.GameObjectFactory.instance.creatGameObject(GAMEOBJECT_SIGN.DRAGON_EFF, data, LAYER.EFFECT_BIG);
			// }
			// let data: gameObject.IMermaidHeartEff = <gameObject.IMermaidHeartEff>{};
			// data.bornX = uniLib.Global.screenWidth / 2;
			// data.bornY = uniLib.Global.screenHeight / 2;
			// data.targetBattery = Master.instance.masterBattery;
			// data.score = 3000;
			// gameObject.GameObjectFactory.instance.creatGameObject(GAMEOBJECT_SIGN.MERMAID_HEART_EFF, data, LAYER.EFFECT_LOW);

			// let data: gameObject.IMasterWinEffVars = <gameObject.IMasterWinEffVars>{};
			// data.bornX = uniLib.Global.screenWidth / 2;
			// data.bornY = uniLib.Global.screenHeight / 2;
			// data.winLevel = 3;
			// data.money = 30000;
			// gameObject.GameObjectFactory.instance.creatGameObject(GAMEOBJECT_SIGN.MASTER_WIN_EFF, data, LAYER.EFFECT_MEDIUM);

			let mov = UIUtil.creatMovieClip("BoomEx_dieEffFrame");
			mov.scaleX = uniLib.Global.screenWidth / mov.width * 1.05;
			mov.scaleY = uniLib.Global.screenHeight / mov.height * 1.05;
			mov.x = uniLib.Global.screenWidth / 2;
			mov.y = uniLib.Global.screenHeight / 2;
			mov.blendMode = egret.BlendMode.ADD;
			mov.gotoAndPlay(1, -1);
			LayerManager.instance.addToLayer(mov, LAYER.EFFECT_LOW);
		}

		/**
		 * 点击退出按钮
		 */
		private _onExitBtnClick(): void {
			game.SoundHand.Instance.playButtonClick();
			egret.MainContext.instance.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.MenuRecovery, this);
			this._fishBtnView.exitGameBtn.visible = false;
			uniLib.Global.dispatchEvent(uniLib.CustomEvent.Show_MenuPanel);
		}
		//冰冻效果
		private _clickFrozenShoot(): void {
			game.SoundHand.Instance.playButtonClick();
			if (DataCenter.instance.isSwitchFish) {
				GX.Tips.showTips("切换鱼潮中,无法开启冰冻道具!");
				return;
			}

			if (!this.skill) {
				let cis = Number(this._fishBtnView.frozenQuantity.text);
				// let config = DataCenter.instance.accessToProps(4)[0];
				if (cis <= 0) {
					GX.Tips.showTips("没有道具,无法开启!");
					return;
				}
				if (Master.instance.isFrozenShootCooling) {
					GX.Tips.showTips("道具已使用,无法重复开启!");
					return
				}
				FishingJoyLogic.instance.sendUsePorpMsg(PROP_TYPE.FREEZE);
			}
			else {
				// EventManager.fireEvent(EVENT_ID.FREEZE_FISH_OPERA, [GlobeVars.FreezeTime, uniLib.Global.screenWidth / 2, uniLib.Global.screenHeight / 2])
			}
		}


		/**
		 * 点击自动射击
		 */
		private _clickAutoShoot(): void {
			game.SoundHand.Instance.playButtonClick();
			let battery: gameObject.Battery = FishingJoyLogic.instance.allBattery.get(Master.instance.uid)
			if (battery == null) {
				return;
			}
			if (!this.skill) {
				let isOpen: boolean = false;
				let config = DataCenter.instance.accessToProps(1)[0];
				// let duration: number = 1;
				// let coolingTime: number = config.useTime;
				// let cis = Number(this._fishBtnView.autoQuantity.text);
				// if (cis <= 0) {
				// 	GX.Tips.showTips("没有道具,无法开启!");
				// 	return;
				// }
				if (battery.batteryID < config.needBatteryId) {
					GX.Tips.showTips("炮台升至" + config.needBatteryId + "才能使用!");
					return;
				}
				// if (Master.instance.isAutoShootCooling) {
				// 	GX.Tips.showTips("道具已使用,无法重复开启!");
				// 	return
				// }
				// if (duration != 0 && coolingTime != 0) {
				// 	if (Master.instance.isAutoShoot) {
				// 		GX.Tips.showTips("道具已使用,无法重复开启!");
				// 		return
				// 	}
				// 	isOpen = !Master.instance.isAutoShoot;
				// }
				// else {
				// 	isOpen = !Master.instance.isAutoShoot;
				// }
				// FishingJoyLogic.instance.sendUsePorpMsg(PROP_TYPE.AUTO);
				EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [SHOOT_TYPE.AUTO, !Master.instance.isAutoShoot]);
			}
			else {
				EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [SHOOT_TYPE.AUTO, !Master.instance.isAutoShoot]);
			}
		}

		/**
		 * 关闭
		 */
		public MenuRecovery(e: egret.TouchEvent) {
			if (e.stageY > 105) {
				uniLib.Global.dispatchEvent(uniLib.CustomEvent.Remove_MenuPanel);
				egret.MainContext.instance.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.MenuRecovery, this)
				this._fishBtnView.exitGameBtn.visible = true;
			}
		}

		/**
		 * 点击瞄准射击
		 */
		private _clickAimShoot(): void {
			game.SoundHand.Instance.playButtonClick();
			let battery: gameObject.Battery = FishingJoyLogic.instance.allBattery.get(Master.instance.uid)
			if (!battery) {
				return;
			}
			if (!this.skill) {
				let isOpen: boolean = false;
				let config = DataCenter.instance.accessToProps(3)[0];
				// let duration: number = 1 ;
				// let coolingTime: number = config.useTime ;
				// let cis = Number(this._fishBtnView.aimQuantity.text);
				// if (cis <= 0) {
				// 	GX.Tips.showTips("没有道具,无法开启!");
				// 	return;
				// }
				// if(Master.instance.isAimShoot){
				// 	EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [SHOOT_TYPE.AIM, !Master.instance.isAimShoot]);
				// 	return;
				// }
				// if (Master.instance.isAimShootCooling) {
				// 	GX.Tips.showTips("道具已使用,无法重复开启!");
				// 	return;
				// }
				// if (duration != 0 && coolingTime != 0) {
				// 	if (Master.instance.isAimShoot) {
				// 		GX.Tips.showTips("道具已使用,无法重复开启!");
				// 		return;
				// 	}
				// 	isOpen = !Master.instance.isAimShoot;
				// }
				// else {
				// 	isOpen = !Master.instance.isAimShoot;
				// }
				if (!Master.instance.isAimShoot && battery.batteryID < config.needBatteryId) {
					GX.Tips.showTips("炮台升至" + config.needBatteryId + "才能使用!");
					return;
				}
				if (Master.instance.isAimShoot == true) {
					game.SoundHand.Instance.playAimStart();
				}
				// FishingJoyLogic.instance.sendUsePorpMsg(PROP_TYPE.AIM);
				EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [SHOOT_TYPE.AIM, !Master.instance.isAimShoot]);
			}
			else {
				EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [SHOOT_TYPE.AIM, !Master.instance.isAimShoot]);
			}
		}

		/**
		 * 设置瞄准效果
		 */
		public setShootEff(isShow: boolean, shootType: SHOOT_TYPE) {
			let mov: egret.MovieClip = null;
			if (shootType == SHOOT_TYPE.AIM) {
				mov = this._fishBtnView.aimShootEff;
			}
			// else if (shootType == SHOOT_TYPE.FAST) {
			// 	mov = this._fishBtnView.freezeEff;
			// }
			else if (shootType == SHOOT_TYPE.AUTO) {
				mov = this._fishBtnView.autoShootEff;
			}
			else if (shootType == SHOOT_TYPE.FREEZE) {
				mov = this._fishBtnView.freezeEff;
			}

			if (isShow) {
				if (!mov.isPlaying) {
					mov.gotoAndPlay(1, -1);
				}
			}
			else {
				mov.stop();
			}
			mov.visible = isShow;
		}


		/**
		 * 点击急速射击
		 */
		public _clickFastShoot(): void {
			game.SoundHand.Instance.playButtonClick();
			let battery: gameObject.Battery = FishingJoyLogic.instance.allBattery.get(Master.instance.uid)
			let isOpen: boolean = false;
			let config = DataCenter.instance.accessToProps(2)[0];
			let duration: number = config.useTime * 1000;
			let coolingTime: number = config.coolTime * 1000;
			if (battery.batteryID < config.needBatteryId) {
				GX.Tips.showTips("炮台升至" + config.needBatteryId + "才能使用!");
				return;
			}
			if (Master.instance.isFastShootCooling) {
				GX.Tips.showTips("道具正在冷却,无法开启!");
				return;
			}
			if (duration != 0 && coolingTime != 0) {
				if (Master.instance.isFastShoot) {
					GX.Tips.showTips("道具已使用,无法重复开启!");
					return
				}
			}
			else {
				isOpen = !Master.instance.isFastShoot;
			}
			if (!Master.instance.isFastShoot) {
				if (duration != 0 && coolingTime != 0) {
					let back1 = UICenter.instance.getManager(commonUI.FishMainScene).getView(FishingJoy.FishBtnView).BtnGroup;
					let a = new SkillCDEffect(back1, 39.5, 38.75, 60, 60, duration, coolingTime, SHOOT_TYPE.FAST)
				}
			}

			EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [SHOOT_TYPE.FAST, isOpen]);
		}

		/**
		 * 点击冰冻
		 */
		public _clickFreezeShoot(): void {
			if (GlobeVars.isFreeze) {
				return;
			}
			EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [SHOOT_TYPE.FREEZE, true]);
		}

		/**
		 * GM点击
		 */
		private _clickGmCheckBox(): void {
			this._fishBtnView.gmGroup.visible = this._fishBtnView.gmCheckBox.selected;
		}

		//技能测试
		public skill: boolean = false;
		/**
		 * GM点击
		 */
		private _clickGmGroup(e: egret.TouchEvent): void {
			let target: eui.CheckBox = e.target;
			if (target.name == "3") {
				this._fishBtnView.goldPoolLabel.visible = target.selected;
			}
			if (target.name == "5") {
				this.skill = target.selected;
			}
			if (target.selected)
				GM.instance.open(Number(target.name))
			else
				GM.instance.close(Number(target.name))
		}

		/**
		 * 显示时
		 */
		public onShow(): void {

		}
		onResize() {
			this._fishBtnView.width = uniLib.Global.screenWidth;
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			EventManager.unregisterEvent(EVENT_ID.PLAY_USE_PORP_EFF, this, this.setShootEff);
			this._fishBtnView.gmCheckBox.removeEventListener(egret.TouchEvent.TOUCH_TAP, this._clickGmCheckBox, this);
			this._fishBtnView.gmGroup.removeEventListener(egret.TouchEvent.TOUCH_TAP, this._clickGmGroup, this);
			egret.MainContext.instance.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.MenuRecovery, this);
			egret.MainContext.instance.stage.removeEventListener(egret.Event.RESIZE, this.onResize, this);
			this._fishBtnView = null;
			super.dispose();
		}
	}
}