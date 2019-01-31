
module tool {
	/**
	* 单帧按钮
	* @author suo
	*/
	import Point = egret.Point;
	export class Button extends InteractiveObject {

		/*是否可以点击*/
		private _enabled: boolean = true;
		/*声音源*/
		private _soundName: string = null;
		/*点击会放大*/
		private _canExpand: boolean = false;
		/*携带数据*/
		public data: any = null;

		public constructor(root: egret.DisplayObject, soundName: string = null, canExpand: boolean = false, isOffset: boolean = false) {
			super(root);
			if (root instanceof egret.DisplayObjectContainer) {
				root.touchChildren = false;
			}
			this._canExpand = canExpand;
			if (isOffset) {
				this._root.anchorOffsetX = this.width / 2;
				this._root.anchorOffsetY = this.height / 2;
				this._root.x += this.width / 2;
				this._root.y += this.height / 2;
			}
			this.setSound(soundName);
		}

		/**
		 * 设置文本
		 */
		public setLabel(str: string, size: number, OffsetX: number = 0, offsetY: number = 0): void {
			let label: eui.Label = new eui.Label();
			label.text = str;
			label.size = size;
			if(this._root instanceof egret.DisplayObjectContainer){
				this._root.addChild(label);
				label.x = (this._root.width - label.width) / 2  + OffsetX;
				label.y = (this._root.height - label.height) / 2  + offsetY;
			}
			else if (this._root.parent) {
				this._root.parent.addChild(label);
				label.x = (this._root.width - label.width) / 2 + this._root.x + OffsetX;
				label.y = (this._root.height - label.height) / 2 + this._root.y + offsetY;
			}
		}

		// /**
		//  * 取消触摸
		//  */
		// protected onTouchCancle(e:egret.Event):void{
		// 	super.onTouchCancle(e);
		// 	this.changeStatus(BTN_STATE.STATUS_DEFAULT);
		// }

		/**
		 * 设置声音
		 */
		public setSound(name: string) {
			this._soundName = name;
		}

		/**
		 * 鼠标OutSide事件
		 */
		protected onMouseOustide(e: egret.Event): void {
			super.onMouseOustide(e);
			this.changeStatus(BTN_STATE.STATUS_DEFAULT);
			if (this._canExpand) {
				this._root.scaleX = this._root.scaleY = 1;
			}
		}

		/**
		 * 鼠标按下函数
		 */
		protected onMouseDown(e: egret.Event): void {
			super.onMouseDown(e);
			this.changeStatus(BTN_STATE.STATUS_HIGH_LIGHT);
			if (this._soundName != null) {
				FishingJoy.SoundManager.instance.playSoundByName(this._soundName);
			}
			if (this._canExpand) {
				this._root.scaleX = this._root.scaleY = 1.1;
			}
		}

		/**
		 * 鼠标抬起函数
		 */
		protected onMouseUp(e: egret.Event): void {
			super.onMouseUp(e);
			this.changeStatus(BTN_STATE.STATUS_DEFAULT);
			if (this._canExpand) {
				this._root.scaleX = this._root.scaleY = 1;
			}
		}

		/**
		 * 鼠标点击函数
		 */
		protected onMouseClick(e: egret.Event): void {
			if (this._mouseClickHandler != null) {
				this._mouseClickHandler.runWith(this);
			}
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			super.dispose();
		}

		/**
		 * 设置鼠标事件是否启用
		 */
		public set enabled(value: boolean) {
			if (this._enabled != value) {
				this._enabled = value;
				this._root.touchEnabled = value;

				if (this._enabled) {
					this.changeStatus(BTN_STATE.STATUS_DEFAULT);
				}
				else {
					this.changeStatus(BTN_STATE.STATUS_GRAY);
				}
			}
		}

		/**
		 * 获得按钮鼠标state
		 */
		public get enabled(): boolean {
			return this._enabled;
		}

		/**
		 * 改变按钮状态
		 */
		protected changeStatus(status: number): void {
			var matrix: Array<number>;
			var stateFilter: egret.ColorMatrixFilter;

			switch (status) {
				case BTN_STATE.STATUS_DEFAULT:
					stateFilter = null;
					break;
				case BTN_STATE.STATUS_HIGH_LIGHT:
					matrix =
						[1, 0, 0, 0, 0xff * 0.2,// red
							0, 1, 0, 0, 0xe0 * 0.2,// green
							0, 0, 1, 0, 0x8d * 0.2,// blue
							0, 0, 0, 1, 0];				 // alpha
					stateFilter = new egret.ColorMatrixFilter(matrix);
					break;
				case BTN_STATE.STATUS_DOWN:
					matrix =
						[1, 0, 0, 0, -30,// red
							0, 1, 0, 0, -30,// green
							0, 0, 1, 0, -30,// blue
							0, 0, 0, 1, 0];// alpha
					stateFilter = new egret.ColorMatrixFilter(matrix);
					break;
				case BTN_STATE.STATUS_GRAY:
					matrix = [0.3086, 0.6094, 0.0820, 0, 0,// red
						0.3086, 0.6094, 0.0820, 0, 0,// green
						0.3086, 0.6094, 0.0820, 0, 0,// blue
						0, 0, 0, 1, 0];				 // alpha
					stateFilter = new egret.ColorMatrixFilter(matrix);
					break;
			}

			if (null == stateFilter) {
				this._root.filters = [];
			}
			else {
				this._root.filters = [stateFilter];
			}
		}
	}
}
enum BTN_STATE {
	STATUS_DEFAULT,
	STATUS_HIGH_LIGHT,
	STATUS_DOWN,//暂时废弃
	STATUS_GRAY
}
