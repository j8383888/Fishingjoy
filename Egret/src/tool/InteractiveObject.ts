
module tool {
	/**
	* 代理逻辑交互对象
	* @author suo
	*/
	export class InteractiveObject {

		/*根节点*/
		protected _root: egret.DisplayObject;
		/*callback function*/
		protected _mouseDownHandler: Handler = null;
		protected _mouseUpHandler: Handler = null;
		protected _mouseOutsideHandler: Handler = null;
		protected _mouseDownAndMoveHandler: Handler = null;
		protected _mouseClickHandler: Handler = null;
		protected _touchCancleHandler:Handler = null;

		public constructor(root: egret.DisplayObject) {
			if (root == null) {
				console.assert(false, "请检查传入参数是否为egret.DisplayObject!")
			}
			this._root = root;

			this._root.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onMouseDown, this);
			this._root.addEventListener(egret.TouchEvent.TOUCH_END, this.onMouseUp, this);
			this._root.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onMouseOustide, this);
			this._root.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onMouseDownAndMove, this);
			this._root.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onMouseClick, this);
			this._root.addEventListener(egret.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);
		}

		/*鼠标按下事件*/
		protected onMouseDown(e: egret.Event, data: any = null): void {
			if (this._mouseDownHandler != null) {
				this._mouseDownHandler.runWith(e);
			}
		}
		/*鼠标抬起事件*/
		protected onMouseUp(e: egret.Event): void {
			if (this._mouseUpHandler != null) {
				this._mouseUpHandler.runWith(e);
			}
		}

		/**
		 * 取消触摸
		 */
		protected onTouchCancle(e:egret.Event):void{
			if(this._touchCancleHandler){
				this._touchCancleHandler.runWith(e);
			}
		}

		/*鼠标OutSide事件*/
		protected onMouseOustide(e: egret.Event): void {
			if (this._mouseOutsideHandler != null) {
				this._mouseOutsideHandler.runWith(e);
			}
		}

		/*鼠标悬浮事件*/
		protected onMouseDownAndMove(e: egret.Event): void {
			if (this._mouseDownAndMoveHandler != null) {
				this._mouseDownAndMoveHandler.runWith(e);
			}
		}

		/*鼠标点击事件*/
		protected onMouseClick(e: egret.Event): void {
			if (this._mouseClickHandler != null) {
				this._mouseClickHandler.runWith(e);
			}
		}

		/*释放*/
		public dispose(): void {
			this._root.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onMouseDown, this);
			this._root.removeEventListener(egret.TouchEvent.TOUCH_END, this.onMouseUp, this);
			this._root.removeEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onMouseOustide, this);
			this._root.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onMouseDownAndMove, this);
			this._root.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onMouseClick, this);
			this._root.removeEventListener(egret.TouchEvent.TOUCH_CANCEL, this.onTouchCancle, this);

			if (this._mouseDownHandler != null) {
				this._mouseDownHandler.recover();
				this._mouseDownHandler = null;
			}
			if (this._mouseUpHandler) {
				this._mouseUpHandler.recover();
				this._mouseUpHandler = null;
			}
			if (this._mouseOutsideHandler) {
				this._mouseOutsideHandler.recover();
				this._mouseOutsideHandler = null;
			}
			if (this._mouseDownAndMoveHandler) {
				this._mouseDownAndMoveHandler.recover();
				this._mouseDownAndMoveHandler = null;
			}
			if(this._touchCancleHandler){
				this._touchCancleHandler.recover();
				this._touchCancleHandler = null;
			}
			if (this._root instanceof egret.MovieClip) {
				this._root.stop();
			}
			
			this._root = null;
		}


		public set mouseDownHandler(value: Handler) {
			this._mouseDownHandler = value;
		}

		public set mouseUpHandler(value: Handler) {
			this._mouseUpHandler = value;
		}

		public set mouseOutsideHandler(value: Handler) {
			this._mouseOutsideHandler = value;
		}

		public set mouseDownAndMoveHandler(value: Handler) {
			this._mouseDownAndMoveHandler = value;
		}

		public set mouseClickHandler(value: Handler) {
			this._mouseClickHandler = value;
		}

		public set touchCancleHandler(value: Handler) {
			this._touchCancleHandler = value;
		}

		public get root(): egret.DisplayObject {
			return this._root;
		}

		/**
		 * 设置是否可见
		 */
		public set visible(value: boolean) {
			this._root.visible = value;
		}

		/**
		 * 获得x坐标
		 */
		public get x(): number {
			return this._root.x;
		}

		/**
		 * 设置x坐标
		 */
		public set x(value: number) {
			this._root.x = value;
		}

		/**
		 * 获得y坐标
		 */
		public get y(): number {
			return this._root.y;
		}

		/**
		 * 设置y坐标
		 */
		public set y(value: number) {
			this._root.y = value;
		}

		/**
		 * 获得宽
		 */
		public get width(): number {
			return this._root.width;
		}

		/**
		 * 获得高
		 */
		public get height(): number {
			return this._root.height;
		}
	}
}