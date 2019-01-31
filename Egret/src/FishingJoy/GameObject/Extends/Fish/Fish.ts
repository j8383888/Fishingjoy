/**
 * 鱼
 * @author suo
 */
module gameObject {
	export class Fish extends GameObjectCollider {

		/**
		 * 注册操作id
		 */
		public registerAry: number[] = [];
		/**
		 * 生命值
		 */
		public life: number = NaN;
		/**
		 * 最大生命值
		 */
		public maxLife: number = NaN
		/**
		 * 是否活着
		 */
		public isAlive: boolean = false;
		/**
		 * 速度
		 */
		public speed: number = 0;
		/**
		 * 服务器ID
		 */
		public servelID: number = -1;
		/**
		 * 赔率
		 */
		public odds: number = -1;
		/**
		 * 技能ID
		 */
		public skillID: number = -1;
		/**
		 * 技能渲染
		 */
		public skillRender: eui.Image[] | egret.MovieClip;
		/**
		 * 是否镜像
		 */
		public isMirror: boolean = false;
		/**
		 * 是否被击中变红
		 */
		public isRed: boolean = false;
		/**
		 * 滤镜
		 */
		public glowFilter: egret.GlowFilter = null;

		/**
		 * 受击效果定时器
		 */
		public hitTimer: number = 0;
		/**
		 * 是否正在播放受击效果
		 */
		public isPlayHitTween: boolean = false;
		/**
		 * 得分
		 */
		public score: number = -1;
		/**
		 * 掉落道具
		 */
		public items: Cmd.ItemInfo[];
		/**
		 * 鱼类型（0：普通，1：特殊，2有技能的鱼）
		 */
		public fishType: number = 0;
		/**
		 * 是否延迟死亡
		 */
		public isDelayDie: boolean = false;


		/**
		 * 出生时间
		 */
		public get spawnTime(): number {
			return (<gameObject.IFishVars>this.varsData).spawnTime;
		}

		public set spawnTime(value: number) {
			(<gameObject.IFishVars>this.varsData).spawnTime = value;
		}

		/**
		 * 路径ID
		 */
		public get pathID(): string {
			return (<gameObject.IFishVars>this.varsData).pathId;
		}

		public constructor() {
			super();
		}

		/**
         * 初始化一次
         */
		public loadConfigData(data: IFishConfigData): void {
			super.loadConfigData(data);
			this.speed = data.speed;
			this.odds = data.odds;
			this.anchorOffsetX = data.anchorOffsetX;
			this.anchorOffsetY = data.anchorOffsetY;
			this.isMirror = data.isMirror;
			this.fishType = data.fishType;
			this._moviePlayer.scaleX = this._moviePlayer.scaleY = data.fishScale;
			this._setGlowFilter();

			if (data.isMirror && FishingJoy.Master.instance.isRotation) {
				this.scaleY = -1;
			}
			else {
				this.scaleY = 1;
			}
			this.touchEnabled = true;
			this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onSelectFish, this);
		}

		/**
		 * 设置滤镜
		 */
		private _setGlowFilter(): void {
			let blur: number = 1;
			let strength: number;
			if (this.sign == GAMEOBJECT_SIGN.BIG_GOLD_FISH) {
				strength = 2;
			}
			else if (this.sign == GAMEOBJECT_SIGN.DRAGON) {
				strength = 2;
			}
			else if (this.sign == GAMEOBJECT_SIGN.BOOM_EX_FISH) {
				strength = 6;
				blur = 0.6
			}
			else {
				strength = 6;
			}
			this.glowFilter = new egret.GlowFilter(ColorUtil.COLOR_RED, blur, blur, 1, strength, 1, false);
		}

		/**
		 * 播放击中效果
		 */
		private _playHitTween(angle: number, time: number = 80): void {
			game.Timer.clearTimeout(this.hitTimer);
			this.IdleMov.frameRate = this.sign == GAMEOBJECT_SIGN.DRAGON ? 10 : 20;
			this.hitTimer = game.Timer.setTimeout(() => {
				if (this.IdleMov) {
					this.IdleMov.frameRate = 5;
				}
			}, this, time + 300)
			if (this.isPlayHitTween) {
				return;
			}
			this.isPlayHitTween = true;
			let startX = this.x;
			let startY = this.y;
			let radian = GX.getRadian(angle - 90);
			let offsetx = this.x + 2 * Math.cos(radian);
			let offsetY = this.y + 2 * Math.sin(radian);
			egret.Tween.get(this).to({ x: offsetx, y: offsetY }).to({ x: startX, y: startY }, time, function (t) {
				return 2.8 * t - t * t - 0.8;
			}).call(() => { this.isPlayHitTween = false; })
		}

		/**
		 * 播放击中特效
		 */
		public playHitEff(angle: number): void {
			if (game.Config.fluencyModel) {
				return;
			}
			this._setRed();
			this._playHitTween(angle);
			this._playCustomHitEff()
		}

		/**
		 * 播放自定义特效（子类实现）
		 */
		protected _playCustomHitEff(): void {
		}

		/**
		 * 变红
		 */
		private _setRed(): void {
			this.canDispose = false;
			FishingJoy.Laya.timer.once(200, this, this._setNormal)
			if (this.isRed) {
				return;
			}
			this.isRed = true;
			this.IdleMov.filters = [this.glowFilter]
		}

		/**
		 * 获得鱼游动时的Mov
		 */
		public get IdleMov(): egret.MovieClip {
			return this._moviePlayer.getMovieClipByKey("idle");
		}

		/**
		 * 恢复正常
		 */
		protected _setNormal(): void {
			this.IdleMov.filters = []
			this.isRed = false;
			this.canDispose = true;
		}

		/**
		 * 重置击中效果
		 */
		protected _resetHitTween(): void {
			if (game.Config.fluencyModel) {
				return;
			}
			game.Timer.clearTimeout(this.hitTimer);
			this.moviePlayer.getMovieClipByKey("idle").frameRate = 5;
			if (this.isRed) {
				this._setNormal();
			}
		}

		/**
		 * 获得影片播放器
		 */
		public get moviePlayer(): tool.MoviePlayer {
			return this._moviePlayer
		}

		/**
		 * 播放死亡动作
		 */
		public playDieAction(cb: Handler): void {
			if (this.isInView) {
				if (this.skillID == 1) {
					game.SoundHand.Instance.playCatchAllInOneDraft();
				}
				else if (this.skillID == 3) {
					game.SoundHand.Instance.playCatchAllInOneDraft1()
				}
				this._resetHitTween();
				this.parent.addChild(this);
				this.playDieMov(cb);
			}
		}

		/**
		 * 播放死亡动画并回收到资源池
		 */
		public playDieMov(cb: Handler): void {
			if (this.sign != GAMEOBJECT_SIGN.DRAGON && this.sign != GAMEOBJECT_SIGN.MERMAID) {
				if (this.odds >= 40) {
					egret.Tween.get(this.moviePlayer).to({ rotation: 720 }, 1500);
					/*img2是烟圈*/
					let [img1, img2, img3]: CustomImage[] = Pool.getItemByCreateFun(Pool.HighOddsDieEff, Handler.create(this, this._createHighOddFishDieEff));
					let dieMov: egret.MovieClip = this._moviePlayer.getMovieClipByKey("die");
					// console.error("鱼的sign:" + this.sign + "dieMov.width：" + dieMov.width)
					let targetScale: number;
					if (dieMov.width > 260) {
						targetScale = img3.scaleY = img3.scaleX = img1.scaleX = img1.scaleY = 1.2
					}
					else if (dieMov.width > 160) {
						targetScale = img3.scaleY = img3.scaleX = img1.scaleX = img1.scaleY = 0.85
					}
					else {
						targetScale = img3.scaleY = img3.scaleX = img1.scaleX = img1.scaleY = 0.7
					}



					this.addChildAt(img1, 0);
					egret.Tween.get(img1).to({ rotation: 360 }, 1500)
					FishingJoy.Laya.timer.once(1500, null, () => {
						this.removeChild(img1);
						this.removeChild(img2);
						this.removeChild(img3);
						Pool.recover(Pool.HighOddsDieEff, [img1, img2, img3])
					})

					this.addChildAt(img3, 1);
					img2.scaleX = img2.scaleY = targetScale;
					img2.alpha = 1;
					this.addChildAt(img2, 2);
					egret.Tween.get(img2).to({ scaleX: 2.5 * targetScale, scaleY: 2.5 * targetScale, alpha: 0 }, 1000, egret.Ease.cubicIn);
				}
			}
			this._moviePlayer.switchAni("die", -1);
			FishingJoy.Laya.timer.once(1500, null, () => {
				cb.run();
			})
		}

		/**
		 * 创建高倍率鱼死效果
		 */
		protected _createHighOddFishDieEff(): CustomImage[] {
			let img1: CustomImage = new CustomImage();
			img1.blendMode = egret.BlendMode.ADD;
			img1.source = "highOddsFishDieEff";
			let img2: CustomImage = new CustomImage();
			img2.source = "highOddsFishDieEff2";
			let img3: CustomImage = new CustomImage();
			img3.source = "highOddsFishDieEff3";
			return [img1, img2, img3];

		}

		/**
         * 初始化
         */
		public initialize(): void {
			super.initialize();
			let fishVars: IFishVars = this.varsData as IFishVars;
			this.isDelayDie = false;
			this.skillID = fishVars.skillID
			this._moviePlayer.switchAni("idle", -1);

			this.life = this.maxLife;
			this.servelID = (this.varsData as IFishVars).serveID;
			this.registerOperation(fishVars);
			this.isAlive = true;
			if (this.skillID != 0) {
				this.skillRender = FishSkillTool.addSkillEff(this, this.skillID);
			}
		}

		/**
		 * 注册行为
		 */
		public registerOperation(fishVars: IFishVars): void {
			if (fishVars.operation) {
				for (let i: number = 0; i < fishVars.operation.length; i++) {
					this.registerAry.push(FishingJoy.OperationManager.instance.registerOperation(this, fishVars.operation[i].type));
				}
			}
		}

		/**
		 * 被冻住了
		 */
		public isFreeze(): void {
			if (this.isAlive) {
				this._moviePlayer.stopLastMov();
			}
			if (this.skillRender) {
				FishSkillTool.stopSkillEff(this.skillRender);
			}
		}

		/**
		 * 恢复正常状态
		 */
		public isResetNormal(): void {
			if (this.isAlive) {
				this._moviePlayer.playLastMovie();
			}
			if (this.skillRender) {
				FishSkillTool.startSkillEff(this.skillRender);
			}
		}


		/**
		 * 瞄准此鱼
		 */
		public onSelectFish(): void {
			if (FishingJoy.Master.instance.aimFishServelID != this.servelID) {
				if (FishingJoy.UIUtil.isCanAim(this)) {
					FishingJoy.EventManager.fireEvent(EVENT_ID.AIM_FISH, this)
					FishingJoy.Master.instance.masterBattery.aimSpecialFish = true;
				}
			}
			else {
				FishingJoy.EventManager.fireEvent(EVENT_ID.FIRE_BULLET)
			}
		}



        /**
         * 反初始化
         */
		public uninitialize(): void {
			this.score = - 1;
			if (this.items) {
				this.items.length = 0;
				this.items = null;
			}
			if (this.skillRender) {
				FishSkillTool.removeSkill(this, this.skillRender)
				this.skillRender = null;
				this.skillID = -1;
			}
			this.clearGridIndex();
			this.unregisterOperation();
			super.uninitialize();
		}

		/**
		 * 移除行为
		 */
		public unregisterOperation(): void {

			for (let i: number = 0; i < this.registerAry.length; i++) {
				FishingJoy.OperationManager.instance.unregisterOperation(this.registerAry[i])
			}
			this.registerAry.length = 0;
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onSelectFish, this);
			this.glowFilter = null;
			super.dispose();
		}
	}
}