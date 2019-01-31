/**
 * 切换按钮组
 * @author suo
 */
module tool {
	export class ToggleButtonGroup {
		/*切换按钮函数*/
		private _changeHandler:Handler;
		/*按钮组*/
		private _btnGroup:ToggleButton[] = [];	
		/*上一个被点击的按钮*/
		private _lastClickBtn:ToggleButton;
		/*是否可以点击同一对象*/
		private _clickSameObject:boolean = false;
		/*当前点击按钮索引*/
		public index:number = -1;

		public constructor(...args) {
			var len:number = args.length
			for(var i:number = 0; i<len; i++){
				if(args[i] instanceof ToggleButton){
					var btn:ToggleButton =  args[i];
					btn.mouseClickHandler = Handler.create(this,this._onClick);
					this._btnGroup.push(btn);
				}
			}
		}

		/**
		 * 设置是否互斥
		 */
		public set clickSameObject(value:boolean){
			this._clickSameObject = value; 
		}

		/**
		 * 获得长度
		 */
		public get length():number{
			return this._btnGroup.length;
		}


		/**
		 * 设置切页函数
		 */
		public set changeHandler(value:Handler){
			this._changeHandler = value; 
		}

		/**
		 * 获得该按钮在按钮组内的索引
		 */
		public getIndexByBtn(btn:ToggleButton):number{
			return this._btnGroup.indexOf(btn);
		}

		/**
		 * 通过索引设置点击哪个按钮
		 */
		public set clickByIndex(index:number){
			var btn:ToggleButton = this._btnGroup[index];
			if(btn){
				this._onClick(btn);
			}	
		}

		/**
		 * 根据索引获得按钮
		 */
		public getBtnByIndex(index):ToggleButton{
			return this._btnGroup[index]
		}

		/**
		 * 点击函数
		 */
		private _onClick(targetBtn:ToggleButton):void{
			if(this._lastClickBtn){
				if(this._lastClickBtn == targetBtn && !this._clickSameObject){
					return;
				}
				this._lastClickBtn.selected = false;
			}
			
			targetBtn.selected = true;
			this._lastClickBtn = targetBtn;
			this.index =  this.getIndexByBtn(targetBtn);

			if(this._changeHandler){
				this._changeHandler.runWith(targetBtn)
			}
		}

		/**
		 * 获得上一次点击按钮
		 */
		public get lastClickBtn():ToggleButton{
			return this._lastClickBtn;
		}

		/**
		 * 添加按钮
		 */
		public push(btn:ToggleButton):void{
			btn.mouseClickHandler = Handler.create(this,this._onClick);
			this._btnGroup.push(btn);
		}

		/**
		 * 释放
		 */
		public dispose():void{
			if(this._changeHandler){
				this._changeHandler.recover();
				this._changeHandler = null;
			}
			for(var i:number = 0; i<this._btnGroup.length; i++){
				this._btnGroup[i].dispose();
				this._btnGroup[i] = null;
			}
			this._btnGroup.length = 0;
			this._btnGroup = null;
		}

		/**
		 * 清理
		 */
		public clear():void{
			if(this._changeHandler){
				this._changeHandler.recover();
				this._changeHandler = null;
			}
			for(var i:number = 0; i<this._btnGroup.length; i++){
				this._btnGroup[i].dispose();
				this._btnGroup[i] = null;
			}
			this._btnGroup.length = 0;
		}
	}
}