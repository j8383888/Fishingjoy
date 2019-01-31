/**
 * 主场景视图
 * @author suo
 */
module FishingJoy {
	export class FishMainSceneView extends eui.Component implements BaseUIView {
		/**
		 * 背景
		 */
		public backGround0: eui.Image
		/**
		 * 即将切换的背景
		 */
		public backGrounds1: eui.Image
		/**
		 * 浪花特效group
		 */
		public sprayGroups: eui.Group;

		/**
		 * 浪花渐变图
		 */
		public jianbianImages: eui.Image;

		/**
		 * 水波纹 自定义滤镜
		 */
		private customFilter: egret.CustomFilter;
		/**
		 * 冰冻效果
		 */
		public freezeEff: eui.Image;
		/**
		 * 水波纹组
		 */
		public waveGroup: egret.MovieClip[] = [];
		/**
		 * 冰冻遮罩
		 */
		public freezeMask: egret.Shape = new egret.Shape();
		/**
		 * 冰冻盒子
		 */
		public freezeBox: eui.Component = new eui.Component();
		/**
		 * 遮罩半径
		 */
		private maskRadius: number = 1;
		/**
		 * 最大遮罩半径
		 */
		private radiusMax: number;
		/**
		 * 背景移动最小点
		 */
		private _startP: egret.Point;
		/**
		 * 背景移动最大点
		 */
		private _endP: egret.Point;

		private _moveDown: boolean = false;

		private _moveRight: boolean = false;

		public constructor() {
			super();
			this.skinName = "by_MainSceneSkin";
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			egret.MainContext.instance.stage.removeEventListener(egret.Event.RESIZE, this._onResize, this);
			this.removeEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
			GX.GameLayerManager.removeUI(this);
			egret.Tween.removeTweens(this.freezeEff);
			EventManager.unregisterEvent(EVENT_ID.FREEZE_EFF_SHOW, this, this._showFreezeEff);
			EventManager.unregisterEvent(EVENT_ID.FREEZE_EFF_RECOVER, this, this._freezeRecover);
			game.Action.fluencyModelEvent.remove(this.fluencyModelEvent, this);
			FishingJoy.Laya.timer.clear(this, this._changeMask);
			this.stopMoveBg();
		}
		/**
		 * 初始化
		 */
		public init(): void {

			this.ebbResources();
			game.SoundHand.Instance.playBgMp3();
			EventManager.registerEvent(EVENT_ID.FREEZE_EFF_SHOW, Handler.create(this, this._showFreezeEff));
			EventManager.registerEvent(EVENT_ID.FREEZE_EFF_RECOVER, Handler.create(this, this._freezeRecover));
			this.freezeEff = new eui.Image();
			this.freezeEff.blendMode = egret.BlendMode.ADD;
			this.freezeEff.source = "ice_png";
			this.freezeBox.scaleX = 100;
			this.freezeBox.scaleY = 100;
			this.freezeBox.addChild(this.freezeEff);
			this.freezeBox.addChild(this.freezeMask);
			game.Action.fluencyModelEvent.add(this.fluencyModelEvent, this);
			if (uniLib.Global.isH5)
				this.initCustomFilter();
			egret.MainContext.instance.stage.addEventListener(egret.Event.RESIZE, this._onResize, this);
			this._onResize();
		}

		public startMoveBg(): void {
			FishingJoy.Laya.timer.frameLoop(1, this, this._moveBg);
		}

		public stopMoveBg(): void {
			FishingJoy.Laya.timer.clear(this, this._moveBg);
		}

		private _onResize(): void {
			this.jianbianImages.width = this.width = uniLib.Global.screenWidth;
			this.height = uniLib.Global.screenHeight;
			let bgScale: number = 1.05;
			let bgW: number = uniLib.Global.screenWidth * bgScale
			let bgH: number = uniLib.Global.screenHeight * bgScale

			this.backGrounds1.width = this.backGround0.width = bgW;
			this.backGrounds1.height = this.backGround0.height = bgH;
			this.backGrounds1.anchorOffsetX = this.backGround0.anchorOffsetX = bgW / 2;
			this.backGrounds1.anchorOffsetY = this.backGround0.anchorOffsetY = bgH / 2;
			this.backGrounds1.y = bgH / 2;

			this.backGround0.x = this.backGrounds1.width / 2
			this.backGrounds1.x = this.width;
			this.sprayGroups.x = this.width + 140;

			
			this.freezeEff.width = uniLib.Global.screenWidth * 0.01;
			this.freezeEff.height = uniLib.Global.screenHeight * 0.01;
			this.freezeEff.mask = this.freezeMask;

			this.freezeBox.width = uniLib.Global.screenHeight * 0.01;
			this.freezeBox.height = uniLib.Global.screenHeight * 0.01;
			
			
			this.radiusMax = Math.sqrt((this.freezeEff.width) * (this.freezeEff.width) + (this.freezeEff.height) * (this.freezeEff.height));

			
			this._endP = new egret.Point(bgW / 2, bgH / 2);
			this._startP = new egret.Point(bgW / 2 - uniLib.Global.screenWidth * (bgScale - 1), bgH / 2 - uniLib.Global.screenHeight * (bgScale - 1));
			this.startMoveBg();


			let seatLayer = FishingJoy.LayerManager.instance.getLayer(LAYER.Seat);
            let batteryLength = seatLayer.numChildren;
            for (let i = 0; i < batteryLength; i++) {
                let battery = <gameObject.Battery>seatLayer.getChildAt(i);
                if (battery) {
					let clientNo = game.GameConstant.GetClientNoBySeatId(battery.seatID)
					let pos = game.GameConstant.GetSeatPositionByClientNo(clientNo);
					if (pos == null)
						continue;
                    battery.varsData.bornX = pos.x;
                    battery.varsData.bornY = pos.y;
                    battery.x = pos.x;
                    battery.y = pos.y;
                }
            }
		}

		/**
		 * 移动背景
		 */
		private _moveBg(): void {
			if (this._startP == null || this._endP == null) {
				return;
			}
			if (this.backGround0.x < this._startP.x) {
				this._moveRight = true;
			}
			else if (this.backGround0.x > this._endP.x) {
				this._moveRight = false;
			}

			if (this.backGround0.y < this._startP.y) {
				this._moveDown = true;

			}
			else if (this.backGround0.y > this._endP.y) {
				this._moveDown = false;
			}

			if (this._moveRight) {
				this.backGround0.x += 0.2;
			} else {
				this.backGround0.x -= 0.2;
			}

			if (this._moveDown) {
				this.backGround0.y += 0.2;
			}
			else {
				this.backGround0.y -= 0.2;
			}
		}

		/**
		 * 退潮资源
		 */
		public ebbResources(): void {
			this.sprayGroups = new eui.Group();
			this.sprayGroups.height = uniLib.Global.screenHeight;
			this.jianbianImages = new eui.Image();
			this.jianbianImages.source = "jianbian_png";
			this.backGrounds1 = new eui.Image();

		}

		/**
		 * 冰冻恢复
		 */
		private _freezeRecover(timer: number, cb: Handler): void {
			egret.Tween.get(this.freezeEff).to({ alpha: 0 }, timer).call(() => {
				cb.run();
				this.startMoveBg();
				FishingJoy.LayerManager.instance.removeFromLayer(this.freezeBox, LAYER.Freeze);
				for (let i: number = 0; i < this.waveGroup.length; i++) {
					this.waveGroup[i].play(-1);
				}
				if (GlobeVars.isGoldEbb) {
					GlobeVars.ebbTideMov.gotoAndPlay(1, -1);
					egret.Tween.resumeTweens(this.backGround0);
					egret.Tween.resumeTweens(this.backGrounds1);
					egret.Tween.resumeTweens(this.sprayGroups);
				}
				if (GlobeVars.delayEbbHandler) {
					GlobeVars.delayEbbHandler.run();
					GlobeVars.delayEbbHandler = null;
				}

			}, this);
		}
		/**
		 * 冰冻效果显示
		 */
		private _showFreezeEff(fishX?: number, fishY?: number): void {

			this.stopMoveBg();
			if (GlobeVars.isGoldEbb) {
				GlobeVars.ebbTideMov.stop();
				egret.Tween.pauseTweens(this.backGround0);
				egret.Tween.pauseTweens(this.backGrounds1);
				egret.Tween.pauseTweens(this.sprayGroups);
			}

			let fishMap: Dictionary = FishingJoy.FishingJoyLogic.instance.inViewFishes;
			let fishMapLen: number = fishMap.length
			for (let i: number = 0; i < fishMapLen; i++) {
				let fish: gameObject.Fish = fishMap.values[i];
				fish.isFreeze()
			}
			FishingJoy.LayerManager.instance.addToLayer(this.freezeBox, LAYER.Freeze);
			this.freezeEff.alpha = 1;

			if (fishX && fishY && UIUtil.inView(fishX, fishY) && !game.Config.fluencyModel) {
				this.freezeEff.mask = this.freezeMask;
				this.freezeBox.anchorOffsetX = fishX / uniLib.Global.screenWidth * this.freezeEff.width;
				this.freezeBox.anchorOffsetY = fishY / uniLib.Global.screenHeight * this.freezeEff.height;
				this.freezeBox.x = fishX;
				this.freezeBox.y = fishY;

				this.freezeMask.x = this.freezeEff.width * fishX / uniLib.Global.screenWidth;
				this.freezeMask.y = this.freezeEff.height * fishY / uniLib.Global.screenHeight;
				this.maskRadius = 0;

				let numTemp: number;
				numTemp = this.freezeEff.width - this.freezeBox.anchorOffsetX
				let maskW: number = this.freezeBox.anchorOffsetX > numTemp ? this.freezeBox.anchorOffsetX : numTemp;
				numTemp = this.freezeEff.height - this.freezeBox.anchorOffsetY;
				let maskH: number = this.freezeBox.anchorOffsetY > numTemp ? this.freezeBox.anchorOffsetY : numTemp;
				this.radiusMax = Math.sqrt(maskH * maskH + maskW * maskW);
				FishingJoy.Laya.timer.frameLoop(1, this, this._changeMask);
			}
			else {
				this.freezeMask.graphics.clear();
				this.freezeEff.mask = null
			}
			for (let i: number = 0; i < this.waveGroup.length; i++) {
				this.waveGroup[i].stop();
			}
		}

		/**
		 * 改变遮罩
		 */
		private _changeMask(): void {
			this.maskRadius += 0.25;
			this.freezeMask.graphics.clear();
			if (this.maskRadius > this.radiusMax) {
				FishingJoy.Laya.timer.clear(this, this._changeMask);
				this.freezeEff.mask = null;
			}
			else {
				this.freezeMask.graphics.beginFill(ColorUtil.COLOR_BLACK);
				this.freezeMask.graphics.drawCircle(0, 0, this.maskRadius);
				this.freezeMask.graphics.endFill();
			}
		}

		/**
		 * 清除
		 */
		public clear(): void {
		}

		/**
		 * 初始化自定义滤镜
		 */
		private initCustomFilter() {
			let vertexSrc =
				"attribute vec2 aVertexPosition;\n" +
				"attribute vec2 aTextureCoord;\n" +
				"attribute vec2 aColor;\n" +

				"uniform vec2 projectionVector;\n" +

				"varying vec2 vTextureCoord;\n" +
				"varying vec4 vColor;\n" +

				"const vec2 center = vec2(-1.0, 1.0);\n" +

				"void main(void) {\n" +
				"   gl_Position = vec4( (aVertexPosition / projectionVector) + center , 0.0, 1.0);\n" +
				"   vTextureCoord = aTextureCoord;\n" +
				"   vColor = vec4(aColor.x, aColor.x, aColor.x, aColor.x);\n" +
				"}";

			let fragmentSrc = [
				"precision lowp float;\n" +
				"varying vec2 vTextureCoord;",
				"varying vec4 vColor;\n",
				"uniform sampler2D uSampler;",

				"uniform vec2 center;",
				"uniform vec3 params;", // 10.0, 0.8, 0.1"
				"uniform float time;",

				"void main()",
				"{",
				"vec2 uv = vTextureCoord.xy;",
				"vec2 texCoord = uv;",

				"float dist = distance(uv, center);",

				"if ( (dist <= (time + params.z)) && (dist >= (time - params.z)) )",
				"{",
				"float diff = (dist - time);",
				"float powDiff = 1.0 - pow(abs(diff*params.x), params.y);",

				"float diffTime = diff  * powDiff * 0.4;",
				"vec2 diffUV = normalize(uv - center);",
				"texCoord = uv + (diffUV * diffTime);",
				"}",

				"gl_FragColor = texture2D(uSampler, texCoord);",
				"}"
			].join("\n");

			let customFilter = new egret.CustomFilter(
				vertexSrc,
				fragmentSrc,
				{
					center: { x: 0.5, y: 0.5 },
					params: { x: 10, y: 0.8, z: 0.1 },
					time: 0.1
				}
			);
			// let fishLayer = manager.LayerManager.instance.getLayer(LAYER.Fish);
			// fishLayer.width = uniLib.Global.screenWidth;
			// fishLayer.height = uniLib.Global.screenHeight;
			// fishLayer.filters = [customFilter];
			this.filters = [customFilter];
			this.customFilter = customFilter;
			this.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
		}
		private onEnterFrame() {
			if (GlobeVars.isFreeze) {
				return;
			}
			// let customFilter = this.customFilter
			// let time = customFilter.uniforms.time;
			// console.error(time)
			// time*= 100;
			// time+=1;
			// console.error(time)
			// time = Math.floor(time) / 100;
			// customFilter.uniforms.time = time;
			// if (time > 1) {
			// 	customFilter.uniforms.time = 0.0;
			let customFilter = this.customFilter
			customFilter.uniforms.time += 0.005;
			// console.error(customFilter.uniforms.time)
			if (customFilter.uniforms.time > 1) {
				customFilter.uniforms.time = 0.1;
				// this.removeEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
				// game.Timer.setTimeout(() => {
				// 	this.removeEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
				// 	this.addEventListener(egret.Event.ENTER_FRAME, this.onEnterFrame, this);
				// }, this, 5000);
			}
		}
		/**
		 * 初始化
		 */
		public onInit(): void {
			this.init();
			GX.GameLayerManager.addUIToScene(this);
			for (let i: number = 0; i < 4; i++) {
				let wave = uniLib.DisplayUtils.createMovieClicp("wave");
				wave.touchEnabled = false;
				let [x, y] = UIUtil.getGridItemPos(i, wave, 2, -20, -20)
				wave.play(-1);
				wave.scaleX = wave.scaleY = 3;
				wave.x = wave.width / 2 * wave.scaleX + x * wave.scaleX;
				wave.y = wave.height / 2 * wave.scaleY + y * wave.scaleY;
				if (uniLib.Global.isH5) {
					wave.alpha = 0.3;
				}
				else {
					wave.alpha = 0.5;
				}
				wave.blendMode = egret.BlendMode.ADD;
				this.waveGroup.push(wave);
				FishingJoy.LayerManager.instance.addToLayer(wave, LAYER.Wave);
			}
		}
		private fluencyModelEvent() {
			if (game.Config.fluencyModel) {
				for (let item of this.waveGroup) {
					item.stop();
					if (item.parent) {
						item.parent.removeChild(item);
					}
				}
				this.waveGroup.clear();
			}
		}
		/**
		 * 展示时
		 */
		public onShow(): void {
		}

		/**
		 * 隐藏时
		 */
		public onHide(): void {

		}

	}
}