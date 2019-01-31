/**
 * 炮台
 * @author suo 
 */
module gameObject {
	export class Battery extends eui.Component implements IGameObject {

		/**
		 * 炮台缩放X
		 */
		public readonly batteryScaleX: number = 0.85;
		/**
		 * 炮台缩放Y
		 */
		public readonly batteryScaleY: number = 0.85;
		/**
		 * 缓存标识符
		 */
		public sign: GAMEOBJECT_SIGN;
		/**
		 * uid
		 */
		public uID: number = NaN;
		/**
		 * 放置哪个图层
		 */
		public layerType: LAYER;
		/**
		 * 携带参数
		 */
		public varsData: IGameObjectVars = null;
		/**
		 * 是否可以被释放
		 */
		public canDispose: boolean = false;
		/**
		 * 引用计数
		 */
		public refCount: number = NaN;
		/**
		 * 姓名文本
		 */
		private _nameTF: eui.Label;
		/**
		 * 金钱文本
		 */
		public _moneyTF: eui.BitmapLabel;
		/**
		 * 消耗金币文本
		 */
		public _costMoneyTF: eui.BitmapLabel;
		/**
		 * 座位数据
		 */
		public seatdata: game.SeatData;
		/**
		 * 玩家
		 */
		public _user: game.UserInfo;
		/**
		 * 注册操作id
		 */
		private _registerAry: number[] = [];
		/**
		 * 发炮下半部分
		 */
		private _firingImg: eui.Image;
		/**
		 * 发炮上半部分
		 */
		private _firingTopImg: eui.Image;
		/**
		 * 开火点
		 */
		public firePoint: egret.Shape = new egret.Shape();
		/**
		 * 中心点
		 */
		public focus: eui.Rect;
		/**
		 * 正在缓动
		 */
		public isTween: boolean = false;
		/**
		 * 炮台显示对象
		 */
		private batteryDisplay: eui.Group;
		/**
		 * 等待加入
		 */
		private waitingToJoin: eui.Image
		/**
		 * 座位状态
		 */
		public seatState: SEAT_STATE;
		/**
		 * 是否顶部两个座位
		 */
		public isTop: boolean = false;
		/**
		 * 炮台开盒子
		 */
		private _batteryFireBox: eui.Group;
		/**
		 * 金币图标
		 */
		private _coinImg: eui.Image;
		/**
		 * 左按钮(-)
		 */
		private _decreaseImg: eui.Image;
		/**
		 * 右按钮(+)
		 */
		private _increaseImg: eui.Image;
		/**
		 * 座位索引
		 */
		public seatIndex: number;
		/**
		 * 服务器座位id
		 */
		public get seatID(): number {
			return this.seatdata.seatId;
		}
		/**
		 * 减少按钮
		 */
		public decBtn: tool.Button;
		/**
		 * 增加按钮
		 */
		public incBtn: tool.Button;
		/**
		 * 炮台索引
		 */
		public batteryID: number = 1;
		/**
		 * 炮台切换效果
		 */
		private _batteryChangeEff: egret.MovieClip;
		/**
		 * 炮台开火烟雾效果
		 */
		private _batteryFireEff: egret.MovieClip;
		/**
		 * 等待服务器回应
		 */
		private _waitForServe: boolean = false;
		/**
		 * 锁定fishid
		 */
		public targetFishId: number;
		/**
		 * 是否瞄准射击
		 */
		public isAimShoot: boolean = false;
		/**
		 * 渔网的半径
		 */
		public fishNetRadius: number = 50;
		/**
		 * 发射子弹的数量
		 */
		public fireBulletNum: number = 1;
		/**
		 * 炮台资源编号
		 */
		public resNo: number = 1;
		/**
		 * 当前旋转角度
		 */
		public curRotation: number = 0;
		/**
		 * 是否瞄准特殊鱼
		 */
		public aimSpecialFish: boolean = false;
		/**
		 * 减按钮
		 */
		private _decreaseBtn: eui.Group;
		/**
		 * 加按钮
		 */
		private _increaseBtn: eui.Group;
		/**
		 * 金币发亮动画
		 */
		private _coinBrightMov: egret.MovieClip
		/**
		 * 金币图标是否正在缓动
		 */
		private _coinTween: boolean = false;
		/**
		 * 炮台头部
		 */
		public batteryHeadBox: eui.Group;
		/**
		 * 起始Y
		 */
		private _fireImgBornY: number
		/**
		 * 使用冰冻道具效果
		 */
		private _useFreezePropEff: egret.MovieClip;
		/**
		 * 钱（服务器一返回就变更）(打死鱼，发炮 美人鱼心形动画)
		 */
		public money: number = 0;


		public constructor() {
			super();
			this.skinName = "by_BatterySkin";
			this.touchEnabled = false;

		}

		protected createChildren(): void {
			super.createChildren();
			this.anchorOffsetX = this.width / 2;
			this.anchorOffsetY = this.height / 2;
		}

		/**
         * 加载资源
         */
		public loadConfigAsset(assetData: IConfigAsset): void {

			// this.firePoint.graphics.beginFill(ColorUtil.COLOR_MAPLE);
			// this.firePoint.graphics.drawCircle(0, 0, 10);
			// this.firePoint.graphics.endFill();
			this.firePoint.x = 0;
			this.firePoint.y = 90;
			this.firePoint.anchorOffsetY = 85;
			this._batteryFireBox.addChild(this.firePoint);

			this._batteryChangeEff = FishingJoy.UIUtil.creatMovieClip("batteryChangeEff");
			this._batteryChangeEff.x = 0;
			this._batteryChangeEff.y = 80;
			this._batteryChangeEff.visible = false;
			this._batteryFireBox.addChild(this._batteryChangeEff);

			game.SetPublicFont(this._moneyTF);


			this._fireImgBornY = this._firingTopImg.y
			this._useFreezePropEff = FishingJoy.UIUtil.creatMovieClip("by_useFrezzeProp");
			// this._useFreezePropEff.gotoAndPlay(1, -1);
			this._useFreezePropEff.visible = false;
			this._useFreezePropEff.x = 210;
			this._useFreezePropEff.y = 170;
			this.addChild(this._useFreezePropEff)
			// this._creatFireEff(false);
		}

		/**
		 * 获得金币图标
		 */
		public get coinImg(): eui.Image {
			return this._coinImg;
		}

		/**
		 * 显示冰冻道具效果
		 */
		public showFreezePropEff(isShow: boolean): void {
			if (isShow) {
				this._useFreezePropEff.gotoAndPlay(1, -1)
				this._useFreezePropEff.visible = true;
			}
			else {
				this._useFreezePropEff.stop()
				this._useFreezePropEff.visible = false;
			}
		}


		/**
		 * 金币变大动画
		 */
		public coinImgTween(): void {
			if (this._coinTween) {
				return;
			}
			if (this._user && this._user.uid == FishingJoy.Master.instance.uid) {
				this._coinBrightMov.visible = true;
				this._coinBrightMov.gotoAndPlay(1, 1)
				this._coinBrightMov.once(egret.MovieClipEvent.COMPLETE, (e: egret.MovieClipEvent) => {
					let mov: egret.MovieClip = e.target;
					mov.visible = false
				}, null)
				let coinImgScaleX: number = this.coinImg.scaleX;
				let coinImgScaleY: number = this.coinImg.scaleY;
				this._coinTween = true;
				egret.Tween.get(this._coinImg).to({ scaleX: 1.8 * coinImgScaleX, scaleY: 1.8 * coinImgScaleY }, 200).to({ scaleX: coinImgScaleX, scaleY: coinImgScaleY }, 100).call(() => { this._coinTween = false; });
			}
		}

		/**
		 * 交换椅子
		 */
		public changeSeat(battery: gameObject.Battery): void {
			let temp: Object = { x: this.x, y: this.y, id: this.seatID/*, isTop: this.isTop*/ }
			this.x = battery.x;
			this.y = battery.y;
			this.setSeatIndex(battery.seatID);

			battery.x = temp["x"];
			battery.y = temp["y"];
			battery.setSeatIndex(temp["id"])
		}


		/**
		 * 发射子弹效果
		 */
		public sendBulletEffect(): void {
			egret.Tween.get(this._firingTopImg).to({ y: this._fireImgBornY + 10 }, 80, egret.Ease.quadIn).to({ y: this._fireImgBornY }, 80, egret.Ease.quadIn);
			this.playOnceAndHide(this._batteryFireEff);
		}

		/**
		 * 设置炮口旋转
		 */
		public setFirePortRotation(angle: number): void {
			let seatId = this.seatID;
			if (seatId == 1) {
				angle = -angle;
			}
			else if (seatId == 4) {
				angle = -angle + 180;
			}
			else if (seatId == 3) {
				angle = angle - 180;
			}
			this.batteryHeadBox.rotation = angle;
			this.firePoint.rotation = angle;
			if (this._batteryFireEff) {
				this._batteryFireEff.rotation = angle;
			}
		}

		/**
		 * 缓动旋转
		 */
		public setTweenRotation(angle: number, cb: Handler): void {
			let seatId = this.seatID;
			if (seatId == 1) {
				angle = -angle;
			}
			else if (seatId == 4) {
				angle = -angle + 180;
			}
			else if (seatId == 3) {
				angle = angle - 180;
			}
			if (this.batteryHeadBox.rotation - angle > 180) {
				angle += 360
			}
			else if (this.batteryHeadBox.rotation - angle < -180) {
				angle -= 360
			}
			egret.Tween.get(this._batteryFireEff).to({ rotation: angle }, 150);
			egret.Tween.get(this.firePoint).to({ rotation: angle }, 150);
			egret.Tween.get(this.batteryHeadBox).to({ rotation: angle }, 150).call(() => {
				cb.run();
			}, this)
		}

		/**
         * 初始化一次
         */
		public loadConfigData(initOnce: IConfigData): void {
			this._coinBrightMov = FishingJoy.UIUtil.creatMovieClip("by_coinBright");
			this._coinBrightMov.visible = false;
			this._coinBrightMov.y = this._coinImg.y - 5;
			this._coinImg.parent.addChild(this._coinBrightMov);
			this._coinBrightMov.blendMode = egret.BlendMode.ADD;
		}

		/**
		 * 点击减少按钮
		 */
		private _onClickDec(): void {
			if (this._waitForServe) {
				return;
			}
			let beforBatterId = FishingJoy.DataCenter.instance.beforBatterId(this.batteryID);
			if (beforBatterId < FishingJoy.DataCenter.instance.accessToProps(1)[0].needBatteryId) {
				FishingJoy.EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [FishingJoy.SHOOT_TYPE.AUTO, false])
			}
			if (beforBatterId < FishingJoy.DataCenter.instance.accessToProps(2)[0].needBatteryId) {
				// FishingJoy.EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [FishingJoy.SHOOT_TYPE.FAST, false])
			}
			if (beforBatterId < FishingJoy.DataCenter.instance.accessToProps(3)[0].needBatteryId) {
				FishingJoy.EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [FishingJoy.SHOOT_TYPE.AIM, false])
			}
			game.SoundHand.Instance.playTurretUpgrade();
			this._sendChangeBatteryMsg(beforBatterId);
		}


		/**
		 * 转换炮台协议
		 */
		private _sendChangeBatteryMsg(batteryID): void {
			let cmd: Cmd.ActionCmd_CS = new Cmd.ActionCmd_CS();
			cmd.act = new Cmd.Action()
			cmd.act.uid = FishingJoy.Master.instance.uid;
			cmd.act.value = FishingJoy.DataCenter.instance.getBatteryIndex(batteryID) + 1;
			cmd.act.op = Cmd.Operation.ChangeBattery;
			game.PokerFunction.tcpSend(cmd);
			this._waitForServe = true;
		}

		/**
		 * 播放一次自动隐藏
		 */
		public playOnceAndHide(mov: egret.MovieClip): void {
			mov.visible = true;
			mov.gotoAndPlay(1, 1)
			mov.once(egret.MovieClipEvent.COMPLETE, () => {
				mov.visible = false;
			}, this)
		}

		/**
		 * 点击增加按钮
		 */
		private _onClickinc(): void {
			if (this._waitForServe) {
				return;
			}
			let nextBatterId = FishingJoy.DataCenter.instance.nextBatterId(this.batteryID);
			if (nextBatterId < FishingJoy.DataCenter.instance.accessToProps(1)[0].needBatteryId) {
				FishingJoy.EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [FishingJoy.SHOOT_TYPE.AUTO, false])
			}
			if (nextBatterId < FishingJoy.DataCenter.instance.accessToProps(2)[0].needBatteryId) {
				// FishingJoy.EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [FishingJoy.SHOOT_TYPE.FAST, false])
			}
			if (nextBatterId < FishingJoy.DataCenter.instance.accessToProps(3)[0].needBatteryId) {
				FishingJoy.EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [FishingJoy.SHOOT_TYPE.AIM, false])
			}
			game.SoundHand.Instance.playTurretUpgrade();
			this._sendChangeBatteryMsg(nextBatterId);
		}

		/**
		 * 设置数据
		 */
		public setSeatData(seatdata: game.SeatData): void {
			if (this.seatdata) {
				this.seatdata.userChanged.remove(this._userChanged, this);
				this.seatdata.batteryIndexChanged.remove(this._onbatteryChange, this)
			}
			this.seatdata = seatdata;
			this.seatdata.userChanged.add(this._userChanged, this);
			this.seatdata.batteryIndexChanged.add(this._onbatteryChange, this)
		}

		/**
		 * 设置状态
		 */
		public set state(value: SEAT_STATE) {
			if (this.seatState != value) {
				if (value == SEAT_STATE.EMPTY) {
					this.batteryDisplay.visible = false;
					this.waitingToJoin.visible = true;
					FishingJoy.UIUtil.setBreatheTween(this.waitingToJoin, 1000)

				}
				else if (value == SEAT_STATE.SOMEBODY) {
					this.batteryDisplay.visible = true;
					this.waitingToJoin.visible = false;
					egret.Tween.removeTweens(this.waitingToJoin);
				}
				this.seatState = value;
			}
		}

		/**
		 * 当角色进行变更
		 */
		public _userChanged(user: game.UserInfo) {
			if (user) {
				this.state = SEAT_STATE.SOMEBODY;
				this._user = user;
				FishingJoy.EventManager.fireEvent(EVENT_ID.ADD_BATTERY_IN_MAP, [this._user.uid, this]);
				this._goldCoininit = true;
				this._user.nameChanged.add(this._nameChanged, this);
				this._user.pointChanged.add(this._onMoneyChanged, this);

				if (this._user.uid == uniLib.NetMgr.UID) {
					this._nameTF.textColor = ColorUtil.COLOR_ORANGE;
					this._decreaseImg.source = "batteryBase1";
					this._increaseImg.source = "batteryBase2";
					this.registerOperation(OPERATION_TYPE.MASTER);
					this.registerOperation(OPERATION_TYPE.BATTERY);
					this.decBtn = new tool.Button(this._decreaseBtn);
					this.decBtn.mouseClickHandler = Handler.create(this, this._onClickDec)
					this.incBtn = new tool.Button(this._increaseBtn);
					this.incBtn.mouseClickHandler = Handler.create(this, this._onClickinc)
					this.incBtn.enabled = true;
					FishingJoy.Master.instance.masterBattery = this;

					this._moneyTF.font = "coinFont_fish_fnt";
					this._costMoneyTF.font = "coinFont_fish_fnt";
					this._coinImg.source = "batteryBase7";
					this._decreaseImg.source = "batteryBase1";
					this._increaseImg.source = "batteryBase2";
					this._creatFireEff(true);
					this._playerEnterEff();
				}
				else {
					this._moneyTF.font = "coinFont_fishS_fnt";
					this._costMoneyTF.font = "coinFont_fishS_fnt";
					this._coinImg.source = "batteryBase71";
					this._decreaseImg.source = "batteryBase10";
					this._increaseImg.source = "batteryBase9";
					this._nameTF.textColor = ColorUtil.COLOR_WHITE;
					this.registerOperation(OPERATION_TYPE.BATTERY);
					this._creatFireEff(false);
				}
			}
			else {
				if (this._user == null)
					return;
				this.seatdata.setLock(false, null);
				FishingJoy.EventManager.fireEvent(EVENT_ID.REMOVE_BATTERY_IN_MAP, this._user.uid);
				this.state = SEAT_STATE.EMPTY;
				egret.Tween.removeTweens(this._firingImg);
				FishingJoy.UIUtil.removeSelf(this._batteryFireEff);
				this._batteryFireEff.stop();
				this._user.nameChanged.remove(this._nameChanged, this);
				this._user.pointChanged.remove(this._onMoneyChanged, this);
				this._user = null;
				for (let i: number = 0; i < this._registerAry.length; i++) {
					FishingJoy.OperationManager.instance.unregisterOperation(this._registerAry[i])
				}
				this._clear();
				FishingJoy.FishingJoyLogic.instance.removeTheGoldCoinHeap(this.seatdata);
			}
		}

		/**
		 * 炮台切换
		 */
		private _onbatteryChange(): void {
			this._waitForServe = false;
			this.changeBatery(this.seatdata.batteryIndex)
		}

		/**
		 * 切换
		 */
		public changeBatery(index: number): void {
			let batteryID = FishingJoy.DataCenter.instance.getBatterIdByIndex(index - 1);
			let configList: table.TableBatteryConfig[] = table.TableBatteryConfig.instance();
			let config: table.TableBatteryConfig = configList.first((v: table.TableBatteryConfig) => v.id == batteryID);
			if (config == null) {
				this.seatdata.batteryIndex = 1;
				return;
			}
			this.batteryID = batteryID;
			this.fishNetRadius = config.fishNetRadius;
			let offsetY: number;
			switch (config.resNo) {
				case 1:
				case 2:
					offsetY = 19;
					break;
				case 3:
					offsetY = 13;
					break;
				case 4:
					offsetY = 35;
					break;
				case 5:
					offsetY = 30;
					break;
				case 6:
					offsetY = 30;
					break


				case 7:
					offsetY = 55;
					break;

				case 9:
					offsetY = 35;
					break;
				case 8:
				case 10:
					offsetY = 40
					break;
			}

			if (config.resNo >= 7) {
				this.batteryHeadBox.addChildAt(this._firingTopImg, 0);
			}
			else {
				this.batteryHeadBox.addChildAt(this._firingTopImg, 1);
			}

			if (this._user && this._user.uid == FishingJoy.Master.instance.uid) {
				this._firingImg.source = "batterySelf" + config.resNo;
				this._firingTopImg.source = "batterySelfTop" + config.resNo;
			}
			else {
				this._firingImg.source = "battery" + config.resNo;
				this._firingTopImg.source = "batteryTop" + config.resNo;
			}

			this._costMoneyTF.text = GX.GoldFormat(config.id, true, true, false);
			this.fireBulletNum = config.fireBulletNum;
			this.playOnceAndHide(this._batteryChangeEff);

			this._firingImg.once(egret.Event.RENDER, () => {
				this.batteryHeadBox.width = this.batteryHeadBox.width
				this.batteryHeadBox.anchorOffsetX = this.batteryHeadBox.width / 2;
			}, null)

			this._firingTopImg.once(egret.Event.RENDER, () => {
				this._firingImg.y = this._firingTopImg.height - offsetY;

			}, null)
		}


		/**
		 * 获取座位上玩家数据
		 */
		public get user(): game.UserInfo {
			return this._user;
		}

		/**
		 * 姓名被更改时
		 */
		private _nameChanged() {
			this._nameTF.text = this._user.nickName;
		}

		/**
		 * 玩家入场特效
		 */
		private _playerEnterEff(): void {
			let img1: CustomImage = new CustomImage();
			img1.y = 50;
			img1.source = "batterySelfInfo1";

			let img2: CustomImage = new CustomImage();
			img2.source = "batterySelfInfo2";
			img2.y = - 120;
			img2.x = 2;

			this._batteryFireBox.addChild(img1);
			this._batteryFireBox.addChild(img2);
			if (this.seatID == 1) {
				img1.scaleX = -1;
				img1.scaleY = 1;
				img2.scaleX = -1;
				img2.scaleY = 1;
				FishingJoy.UIUtil.setScaleTween(img1, -1, 1);
			}
			else if (this.seatID == 2) {
				img1.scaleX = 1;
				img1.scaleY = 1;
				img2.scaleX = 1;
				img2.scaleY = 1;
				FishingJoy.UIUtil.setScaleTween(img1, 1, 1);
			}
			else if (this.seatID == 3) {
				img1.scaleX = 1;
				img1.scaleY = 1;
				img2.scaleX = 1;
				img2.scaleY = 1;
				FishingJoy.UIUtil.setScaleTween(img1, 1, 1);
			}
			else if (this.seatID == 4) {
				img1.scaleX = -1;
				img1.scaleY = 1;
				img2.scaleX = -1;
				img2.scaleY = 1;
				FishingJoy.UIUtil.setScaleTween(img1, -1, 1);
			}

			FishingJoy.Laya.timer.once(6000, this, () => {
				egret.Tween.get(img1).to({ alpha: 0 }, 2000);
				egret.Tween.get(img2).to({ alpha: 0 }, 2000).call(() => {
					egret.Tween.removeTweens(img1);
					egret.Tween.removeTweens(img2);
					this._batteryFireBox.removeChild(img1);
					this._batteryFireBox.removeChild(img2);
				})

			})
		}
		/**
		 * 创建开火特效
		 */
		private _creatFireEff(isSelf: boolean) {
			if (isSelf) {
				this._batteryFireEff = FishingJoy.UIUtil.creatMovieClip("paojizi_1_fish");
			}
			else {
				this._batteryFireEff = FishingJoy.UIUtil.creatMovieClip("paojilv_fish");
			}
			this._batteryFireEff.x = 0;
			this._batteryFireEff.y = 88;
			this._batteryFireEff.anchorOffsetY = 110;
			this._batteryFireEff.blendMode = egret.BlendMode.ADD;
			this._batteryFireEff.visible = false;
			this._batteryFireBox.addChild(this._batteryFireEff);
		}

		private _goldCoininit: boolean = true;
		/**
		 * 金币更变
		 */
		private _onMoneyChanged() {
			if (this._user) {
				if (this._goldCoininit) {
					let point = this._user.point;
					this.curMoneyTF = point;
					this.money = point;
					this._adaptMoneyLabel(this.seatIndex, point)
					this._moneyTF.text = GX.GoldFormat(point, true, true, true);
					point == 0 || point == null ? this._goldCoininit = true : this._goldCoininit = false;
				}
			}
		}
		/**
		 * 刷新金币
		 */
		// public goldCoinRefresh() {
		// 	if (this._user) {
		// 		this._moneyTF.text = GX.GoldFormat(this._user.point, true, true, true);
		// 	}
		// }


		public curMoneyTF: number;
		/**
		 * 加钱刷新
		 */
		public updateGold(value: number) {
			if (this._user) {
				this._user.point += value;
				this.curMoneyTF = this._user.point
				this._moneyTF.text = GX.GoldFormat(this._user.point, true, true, true);
				this._adaptMoneyLabel(this.seatIndex, this._user.point)
				if (this._user.uid == FishingJoy.Master.instance.uid) {
					uniLib.Global.dispatchEvent(uniLib.CustomEvent.Menu_ChipsChanged, { type: 1, value: this._user.point });
				}
			}
		}

		/**
		 * 适配金币文本
		 */
		private _adaptMoneyLabel(index: number, point?: number): void {
			let scale: number;
			let offset: number;
			if (point && point > 100000000) {
				this._moneyTF.x = 195
				offset = 20
				scale = 0.45;
			}
			else {
				this._moneyTF.x = 205
				scale = 0.5;
				offset = 40
			}

			if (index == 4) {
				this._moneyTF.scaleX = scale;
				this._moneyTF.scaleY = -scale;
			}
			else if (index == 3) {
				this._moneyTF.x -= offset
				this._moneyTF.scaleX = -scale;
				this._moneyTF.scaleY = -scale;
			}
			else if (index == 2) {
				this._moneyTF.scaleX = scale;
				this._moneyTF.scaleY = scale;
			}
			else if (index == 1) {
				this._moneyTF.x -= offset
				this._moneyTF.scaleX = -scale;
				this._moneyTF.scaleY = scale;
			}
		}

		/**
		 * 清除
		 */
		private _clear(): void {
			this._moneyTF.text = "";
			this._nameTF.text = "";
		}


        /**
         * 初始化
         */
		public initialize(): void {
			this.x = this.varsData.bornX;
			this.y = this.varsData.bornY;
			FishingJoy.LayerManager.instance.addToLayer(this, this.layerType);
		}


        /**
         * 反初始化
         */
		public uninitialize(): void {
			FishingJoy.LayerManager.instance.removeFromLayer(this);
			for (let i: number = 0; i < this._registerAry.length; i++) {
				FishingJoy.OperationManager.instance.unregisterOperation(this._registerAry[i])
			}
			this._registerAry.length = 0;
			if (this._user) {
				this._user.nameChanged.remove(this._nameChanged, this);
				this._user.pointChanged.remove(this._onMoneyChanged, this);
			}
			this._clear();
			this.seatdata = null;
			this._user = null;
		}

		/**
		 * 设置数据
		 */
		public setData(sign: GAMEOBJECT_SIGN, uID: number, varsData: IGameObjectVars, layerType: LAYER = LAYER.Seat): void {
			this.sign = sign;
			this.uID = uID;
			this.varsData = varsData;
			this.layerType = layerType;
		}


		/**
		 * 释放
		 */
		public dispose(): void {
			if (this.decBtn) {
				this.decBtn.dispose();
				this.decBtn = null;
			}
			if (this.incBtn) {
				this.incBtn.dispose();
				this.incBtn = null;
			}
			this._batteryChangeEff.stop();
			this._batteryChangeEff = null;

			this.varsData = null;
			this.uID = NaN;
			this.varsData = null;
		}

		/**
		 * 设置底板
		 */
		public setSeatIndex(index: number): void {
			this._adaptMoneyLabel(index);
			if (index == 4) {
				this.scaleX = this.batteryScaleX;
				this.scaleY = -this.batteryScaleY;
				this._moneyTF.scaleX = 0.5;
				this._moneyTF.scaleY = -0.5;
				this._costMoneyTF.scaleX = 0.5;
				this._costMoneyTF.scaleY = -0.5;
				this._nameTF.scaleX = 1;
				this._nameTF.scaleY = -1;
				this._coinImg.scaleX = 1;
				this._coinImg.scaleY = -1;
				this._coinImg.x = 110
				this._coinBrightMov.x = 100;
				this._increaseBtn.scaleX = 1;
				this._increaseBtn.scaleY = 1
				this._decreaseBtn.scaleX = 1;
				this._decreaseBtn.scaleY = 1
				this.waitingToJoin.scaleY = -1
				this.waitingToJoin.scaleX = 1;
			}
			else if (index == 3) {
				this.scaleX = -this.batteryScaleX;
				this.scaleY = -this.batteryScaleY;
				this._moneyTF.scaleX = -0.5;
				this._moneyTF.scaleY = -0.5;
				this._costMoneyTF.scaleX = -0.5;
				this._costMoneyTF.scaleY = -0.5;
				this._nameTF.scaleX = -1;
				this._nameTF.scaleY = -1;
				this._coinImg.scaleX = -1;
				this._coinImg.scaleY = -1;
				this._coinImg.x = 260
				this._coinBrightMov.x = 260;
				this._increaseBtn.scaleX = -1;
				this._increaseBtn.scaleY = 1
				this._decreaseBtn.scaleX = -1;
				this._decreaseBtn.scaleY = 1
				this.waitingToJoin.scaleY = -1
				this.waitingToJoin.scaleX = -1;
			}
			else if (index == 2) {
				this.scaleX = this.batteryScaleX;
				this.scaleY = this.batteryScaleY;
				this._moneyTF.scaleX = 0.5;
				this._moneyTF.scaleY = 0.5;
				this._costMoneyTF.scaleX = 0.5;
				this._costMoneyTF.scaleY = 0.5;
				this._nameTF.scaleX = 1;
				this._nameTF.scaleY = 1;
				this._coinImg.scaleX = 1;
				this._coinImg.scaleY = 1;
				this._coinImg.x = 110
				this._coinBrightMov.x = 110;
				this._increaseBtn.scaleX = 1;
				this._increaseBtn.scaleY = 1
				this._decreaseBtn.scaleX = 1;
				this._decreaseBtn.scaleY = 1
				this.waitingToJoin.scaleY = 1
				this.waitingToJoin.scaleX = 1;

			}
			else if (index == 1) {
				this.scaleX = -this.batteryScaleX;
				this.scaleY = this.batteryScaleY;
				this._moneyTF.scaleX = -0.5;
				this._moneyTF.scaleY = 0.5;
				this._costMoneyTF.scaleX = -0.5;
				this._costMoneyTF.scaleY = 0.5;
				this._nameTF.scaleX = -1;
				this._nameTF.scaleY = 1;
				this._coinImg.scaleX = -1;
				this._coinImg.scaleY = 1;
				this._coinImg.x = 260
				this._coinBrightMov.x = 260;
				this._increaseBtn.scaleX = -1;
				this._increaseBtn.scaleY = 1
				this._decreaseBtn.scaleX = -1;
				this._decreaseBtn.scaleY = 1
				this.waitingToJoin.scaleY = 1
				this.waitingToJoin.scaleX = -1;
			}
			this.seatIndex = index;
		}

		/**
		 * 翻转
		 */
		public reverse(): void {

		}

		/**
		 * 注册一种行为
		 */
		public registerOperation(value: OPERATION_TYPE): void {
			this._registerAry.push(FishingJoy.OperationManager.instance.registerOperation(this, value));
		}
	}
}

enum SEAT_STATE {
	/*空的*/
	EMPTY,
	/*有人*/
	SOMEBODY
}