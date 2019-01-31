module editor{

    //路径每一项
    class PathListItem extends eui.ItemRenderer{
        private pathIdLabel:eui.Label;
        private selectedRect:eui.Rect;  //是否选中;

        public itemCheck:eui.CheckBox;//叠加

        constructor() {
            super();
            this.skinName = new PathItemRenderSkin();
            this.touchChildren = true;
            this.addUIListener();
        }

        private addUIListener(): void {
			this.itemCheck.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onitemCheck, this);
		}
		private removeUIListener(): void {
			this.itemCheck.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onitemCheck, this);
		}
        protected dataChanged() {
            let data: {id, selected} = this.data;
            this.pathIdLabel.text = data.id+"";
            this.selectedRect.visible = data.selected;
            if(DataCenter.listVariable){
                if(DataCenter.totalSelection){
                    this.itemCheck.currentState = "down";
                }
                else{
                    this.itemCheck.currentState = "up";
                }
                DataCenter.operationTimes++;
                if(DataCenter.operationTimes >= DataCenter.Instance.getPathIds().length){
                    DataCenter.listVariable = false;
                    DataCenter.operationTimes = 0;
                }
            }
        }

        private onitemCheck(){
            if(this.itemCheck.currentState == "up"){
                this.itemCheck.currentState = "down";
                DataCenter.superpositionOption.push(this.itemIndex)
            }
            else{
                this.itemCheck.currentState = "up";
                for(var i = 0;i<DataCenter.superpositionOption.length;++i){
                    if(this.itemIndex == DataCenter.superpositionOption[i]){
                        DataCenter.superpositionOption.splice(i,1);
                    }
                }
            }
        }
    }

    export class PathListView extends egret.EventDispatcher{
        public static SELECT_PATHINDEX_EVENT = "SelectPathIndexEvent";
        private mPathList:eui.List;
        private mArrayCollection: eui.ArrayCollection;
        private mShowDatas: Array<{ id: number, selected: boolean}>;
        private mSelectIndex:number = 0;
        constructor(list:eui.List){
            super();
            this.mPathList = list;
            //设置渲染窗口;
            this.mPathList.itemRenderer = PathListItem;
            this.mShowDatas = [];
            this.mArrayCollection = new eui.ArrayCollection(this.mShowDatas);
            this.mPathList.dataProvider = this.mArrayCollection;
            this.mPathList.addEventListener(egret.Event.CHANGE, this.onChangeIndex, this);
        }

        public onChangeIndex(){
            this.SelectIndex
            this.mSelectIndex = this.mPathList.selectedIndex;
            this.refreshData();
            EventManager.Instance.dispatchEvent(PathListView.SELECT_PATHINDEX_EVENT, this.mSelectIndex);
        }

        //获取当前选中的路径;
        public get SelectIndex(){
            return this.mSelectIndex;
        }

        public set SelectIndex(val:number){
            this.mSelectIndex = val;
        }

        public refreshData(){
            let ids = DataCenter.Instance.getPathIds();
            this.mShowDatas = [];
            for(let i:number = 0; i<ids.length; i++){
                this.mShowDatas.push({id:ids[i], selected:this.mSelectIndex == i});
            }
            this.mArrayCollection.replaceAll(this.mShowDatas);
            this.mPathList.dataProviderRefreshed();
            this.mPathList.selectedIndex = this.mSelectIndex;
        }
    }
}