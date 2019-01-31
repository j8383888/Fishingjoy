module tool {
	/**
	* 分页组件
	* @author suo
	*/	
	export class PageComponent {
		/*页码文本*/
		private  _tfPage:eui.Label = null;
		/*前翻按钮*/
		private  _btnPre:tool.Button = null;
		/*后翻按钮*/
		private  _btnNext:tool.Button = null;
		/*跳到最终页按钮*/
		private _btnFinally:tool.Button = null;
		/*callback function*/
		private  _changePage:Handler = null;
		/*当前页码*/
		private  _curPage:number = 1;
		/*最大页码*/
		private  _maxPage:number = 1;
		/*一页展示几项*/
		private  _showNum:number = -1;
		/*开始索引*/
		private  _startIndex:number = -1;
		/*最后一个索引*/
		private  _endIndex:number = -1;

		/**
		 * 构造函数
		 * @param btnPre 上一页
		 * @param btnNext 下一页
		 * @param tfPage 页码文本
		 * @param btnFinally 最后一页
		 */	
		public constructor(btnPre:tool.Button, btnNext:tool.Button = null,tfPage:eui.Label = null, btnFinally:tool.Button = null) {		
			this._btnPre = btnPre;
			this._btnNext = btnNext;
			this._btnFinally = btnFinally;
			this._tfPage = tfPage;
			
			if(this._btnPre != null){
				this._btnPre.mouseClickHandler = Handler.create(this,()=>{this.curPage--});
			}
			if(this._btnNext != null){
				this._btnNext.mouseClickHandler = Handler.create(this,()=>{this.curPage++});
			}			
			if(this._btnFinally != null){
				this._btnFinally.mouseClickHandler = Handler.create(this,()=>{this.curPage = this.maxPage});
			}		
		}

		/**
		 * 设置声音
		 */
		public setSound(perBtnSound:string,nextBtnSound:string):void{
			this._btnPre.setSound(perBtnSound);
			this._btnNext.setSound(nextBtnSound);
		}

		/*释放*/
		public dispose():void{
			if(this._btnPre != null){
				this._btnPre.dispose();
				this._btnPre = null;
			}
			if(this._btnNext != null){
				this._btnNext.dispose();
				this._btnNext = null;
			}	
			if(this._changePage != null){
				this._changePage.recover();
				this._changePage = null;
			}
			if(this._btnFinally != null){
				this._btnFinally.dispose();
				this._btnFinally = null;
			}
			this._tfPage = null;
		}
		/**无回调参数*/
		public set onChangePage(changePage:Handler){
			this._changePage = changePage;
		}
		
		public setData(dataLength:number,showNum:number):void{
			this._showNum = showNum;
			this._maxPage = Math.ceil(dataLength / this._showNum);
		}
		
		public get maxPage():number{
			return this._maxPage;
		}

		public set maxPage(value:number){
			this._maxPage = value > 0 ? value : 1;
		}

		public get curPage():number{
			return this._curPage;
		}

		public set curPage(value:number){
			if(value >= 1 && value <= this._maxPage){
				this._curPage = value;
				this._startIndex = (this._curPage - 1) * this._showNum;
				this._endIndex = this._curPage * this._showNum;
				
				if(this._changePage != null){
					this._changePage.run();
				}

				if(this._btnPre != null){
					this._btnPre.enabled = this._curPage > 1;
				}

				if(this._btnNext != null){
					this._btnNext.enabled = this._curPage < this._maxPage;
				}

				if(this._btnFinally!= null){
					this._btnFinally.enabled = !(this._curPage  == this._maxPage); 
				}
			}
			if(this._tfPage != null){
				this._tfPage.text = this._curPage + "/" + this._maxPage;
			}		
		}
		/**Array.slice(startIndex, endIndex)*/
		public get endIndex():number{
			return this._endIndex;
		}
		/**Array.slice(startIndex, endIndex)*/
		public get startIndex():number{
			return this._startIndex;
		}
	}
}