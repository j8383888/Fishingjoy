/**
 * 层级管理
 * @author suo
 */
module FishingJoy {
	export class LayerManager {
		/**
		 * 单例
		 */
		private static _instance: LayerManager;
		/**
		 * 层级字典
		 */
		private _layerMap: SimpleMap<egret.DisplayObjectContainer> = new SimpleMap<egret.DisplayObjectContainer>();

		constructor() {
			for (let i: number = LAYER.back; i < LAYER.CURSOR + 1; i++) {
				let layer: egret.DisplayObjectContainer = new Canves();
				layer.touchChildren = false;
				if (i == LAYER.Fish) {
					layer.name = "fish";
				}
				else if (i == LAYER.UI) {
					layer.name = "UI";
					layer.touchChildren = true;
				}
				else if (i == LAYER.Bullet) {
					layer.name = "Bullet";
				}
				else if (i == LAYER.Seat) {
					layer.name = "battery";
					layer.touchChildren = true;
				}
				else if (i == LAYER.ElectricEFF) {
					layer.name = "ElectricEFF";
				}
				else if (i == LAYER.EFFECT_LOW) {
					layer.name = "effect";
				}
				else if (i == LAYER.POP) {
					layer.name = "pop";
					layer.touchChildren = true;
				}

				GX.GameLayerManager.addUIToMain(layer);
				this._layerMap.set(i, layer);
			}

			EventManager.registerEvent(EVENT_ID.PLAY_USE_PORP_EFF, Handler.create(this, this._canTouch));
		}

		/**
		 * 获得单例
		 */
		public static get instance(): LayerManager {
			if (this._instance == null) {
				this._instance = new LayerManager();
			}
			return this._instance;
		}

		/**
		 * 添加到对应层级
		 */
		public addToLayer(source: egret.DisplayObject, layerType: number): void {
			var layer: egret.DisplayObjectContainer = this._layerMap.get(layerType);
			if (layer != null) {
				layer.addChild(source);
			}
			else {
				console.assert(false, "不存在该layerType！")
			}
		}

		/**
		 * 能被选中
		 */
		private _canTouch(isOpen: boolean, value: SHOOT_TYPE): void {
			if (value == SHOOT_TYPE.AIM) {
				let fishLayer: egret.DisplayObjectContainer = this.getLayer(LAYER.Fish);
				fishLayer.touchChildren = isOpen;
				fishLayer.touchEnabled = isOpen
			}
		}

		/**
		 * 移除
		 */
		public removeFromLayer(source: egret.DisplayObject, layerType?: LAYER): void {
			if (source) {
				if (layerType) {
					let layer: egret.DisplayObjectContainer = this._layerMap.get(layerType);
					if (layer != null) {
						layer.removeChild(source);
					}
				}
				else {
					UIUtil.removeSelf(source);
				}
			}
			else {
				console.assert(false, "source为空！")
			}

		}
		/**
		 * 设置指定层级旋转角度
		 */
		public setLayerRotation(rotation: number, layerType: LAYER) {
			var layer: egret.DisplayObjectContainer = this._layerMap.get(layerType);
			let screenWidth = uniLib.Global.screenWidth;
			let screenHeight = uniLib.Global.screenHeight;
			layer.anchorOffsetX = screenWidth / 2;
			layer.anchorOffsetY = screenHeight / 2;
			layer.x = screenWidth / 2;
			layer.y = screenHeight / 2;
			layer.rotation = rotation;
		}

		/**
		 * 获得层级
		 */
		public getLayer(layerType: LAYER): egret.DisplayObjectContainer {
			return this._layerMap.get(layerType);
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			EventManager.unregisterEvent(EVENT_ID.PLAY_USE_PORP_EFF, this, this._canTouch);
			this._layerMap.clear();
			LayerManager._instance = null;
		}
	}
}

/**
 * 层级
 */
const enum LAYER {
	back = 1,
	Fish = 2,
	Freeze = 3,
	FishingNet = 4,
	Bullet = 5,
	Wave = 6,
	ElectricEFF = 7,
	ElectricEFF_BURST = 8,
	Seat = 9,
	AIM = 10,

	/*不选转特效层*/
	EFFECT_LOW = 11,
	/*旋转特效层*/
	EFFECT_ROTATION,
	
	EFFECT_MEDIUM,
	EFFECT_BIG,


	UI,
	POP,
	CURSOR,
}