/**
 * 切换按钮
 * @author suo
 */
module tool {
	export class ToggleButton extends Button{
		/*是否被选中*/
		private _selected:boolean = false;
		/*取消选中函数*/
		private _cancelHanlder:Handler;
		/*选中函数*/
		private _selectHandler:Handler


		public constructor(root:eui.Component, soundName:string = null,canExpand:boolean = false, isOffset:boolean = false) {
			super(root,soundName,canExpand,isOffset);
		}

		/**
		 * 鼠标点击函数（重写！）
		 */
		protected onMouseClick(e:egret.Event):void{
			if(this._mouseClickHandler != null){
				this._mouseClickHandler.runWith(this);
			}			
		}

		/**
		 * 设置是否选中
		 */
		public set selected(value:boolean){
			this._selected = value;
			if(this._selected){
				if(this._selectHandler != null){
					this._selectHandler.runWith(this);
				}
			}
			else{
				if(this._cancelHanlder){
					this._cancelHanlder.runWith(this);
				}
			}			
		}

		/**
		 * 设置取消函数
		 */
		public set cancelHanlder(value:Handler){
			this._cancelHanlder = value;
		}

		/**
		 * 设置选中函数函数
		 */
		public set selectHandler(value:Handler){
			this._selectHandler = value;
		}

		/**
		 * 获得是否选中
		 */
		public get selected():boolean{
			return this._selected;
		}

		/**
		 * 释放
		 */
		public dispose():void{
			if(this._cancelHanlder){
				this._cancelHanlder.recover();
				this._cancelHanlder = null;
			}
			if(this._selectHandler){
				this._selectHandler.recover();
				this._selectHandler = null;
			}
			super.dispose();
		}
	}
}