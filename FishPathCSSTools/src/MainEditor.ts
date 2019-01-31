// TypeScript file
module editor {

//底注按钮;
export class MainEditor extends eui.Component {
    private gridContainer:egret.DisplayObjectContainer;
    private static  GRID_SIZE:number = 40; 
    private static  GRID_COLOR:number = 0x00ff00;
    private mainViewWidth:number;       //主视图宽;
    private mainViewHeight:number;      //主视图高;
    public mainViewPanel:eui.Group;     //主视图面板;
    public lineGroup:eui.Group;         //绘制线的区域;

    public scroller:eui.Scroller;
    public showGridCbx:eui.CheckBox;    //是否显示网格;
    public delPathPointButton:eui.Button; //删除路径点;
    protected lineEditorView:LineEditorView;

    private pathList:eui.List;

    protected pathListView:PathListView;    //路径列表;

    public operPathIdLabel:eui.TextInput;//当前路径的id;

    public addPathButton:eui.Button;    //增加路径;
    public animationButton:eui.Button;  //播放动画
    public removePathButton:eui.Button; //移除路径;
    public downloadButton:eui.Button; //下载;
    
    public modifyPathButton:eui.Button; //修改路径;
    public savePathButton:eui.Button;   //保存路径;
    public errorMsgLabel:eui.Label;
    public sortPathListButton:eui.Button; //排序按钮;
    public cancelButton:eui.Button; //取消操作按钮;
    public clearPathPointButton:eui.Button;//清除当前路径的所有点;
    public dragCheckBox:eui.CheckBox;//推动
    public FishResourcesImage:eui.Image;
    public SequentialMovement:number = 0;

    public ImmovableGridGroup:eui.Group;
    public totalSelectionCheck:eui.CheckBox;
    public superpositionButton:eui.Button;

    public hideButton:eui.Button;


    public pathConfig: Array<table.TableFishPath>;

    public route:any[];//储存当前的路径;
    constructor() {
        super();
        this.skinName = new MainEditorSkin();
        this.initUI(); 
    }

    public initUI(){
        this.mainViewWidth = this.mainViewPanel.width;
        this.mainViewHeight = this.mainViewPanel.height;
        this.createGrid();
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.clickHandel, this);
        this.lineEditorView = new LineEditorView(this.mainViewWidth, this.mainViewHeight);
        this.mainViewPanel.addChild(this.lineEditorView);
        this.pathListView = new PathListView(this.pathList);
        DataCenter.Instance.LoadData();
        EventManager.Instance.addEventListener(DataCenter.EVENT_LOADDATA_COMPLETED, this.onLoadCompleteData, this);
        EventManager.Instance.addEventListener(DataCenter.EVENT_SAVEDATA_COMPLETED, this.onSaveCompleteData, this);
        EventManager.Instance.addEventListener(PathListView.SELECT_PATHINDEX_EVENT, this.onPathSelectChange, this);
        this.dragCheckBox.selected = true;
        this.scroller.viewport.scrollH = LineEditorView.s_horizonOffset * 0.8 - 25;
        this.scroller.viewport.scrollV = LineEditorView.s_vertialOffset * 0.78 - 25;
        this.scroller.scrollPolicyH = eui.ScrollPolicy.ON;
        this.scroller.scrollPolicyV = eui.ScrollPolicy.ON;
        this.lineEditorView.closeEdit();
    }
    /**
     * 是否拖动
     */
    public get isDrag(){
        return this.dragCheckBox.selected;
    }

    private createGrid(){
        if(this.gridContainer != null){
            return;
        }
        this.gridContainer = new egret.DisplayObjectContainer();
        this.gridContainer.width = this.mainViewWidth;
        this.gridContainer.height = this.mainViewHeight;
        for (let i = 0; i < this.mainViewWidth; i+=MainEditor.GRID_SIZE) {
            var shp: egret.Shape = new egret.Shape();
            shp.graphics.lineStyle(1, MainEditor.GRID_COLOR);
            shp.graphics.moveTo(i, 0);
            shp.graphics.lineTo(i, this.mainViewHeight);
            shp.graphics.endFill();
            this.gridContainer.addChild(shp);
        }
        for (let i = 0; i < this.mainViewHeight; i+=MainEditor.GRID_SIZE) {
            var shp: egret.Shape = new egret.Shape();
            shp.graphics.lineStyle(1, MainEditor.GRID_COLOR);
            shp.graphics.moveTo(0, i);
            shp.graphics.lineTo(this.mainViewWidth, i);
            shp.graphics.endFill();
            this.gridContainer.addChild(shp);
        }
        this.gridContainer.alpha = 0.5;
        this.mainViewPanel.addChild(this.gridContainer);
        this.gridContainer.visible = false;
    }

    public clickHandel(e: egret.TouchEvent) {
        switch (e.target) {
            case this.showGridCbx: this.onCbxShowGrid();break;
            case this.delPathPointButton:this.onDeletePathSelectPoint();break;
            case this.addPathButton:this.onAddPathButton();break;
            case this.removePathButton:this.onRemovePathButton();break;
            case this.modifyPathButton:this.onModifyPathButton();break;
            case this.savePathButton:this.onSavePathButton();break;
            case this.clearPathPointButton:this.onClearPathPointButton();break;
            case this.sortPathListButton:this.onSortPathListButton();break;
            case this.cancelButton:this.onCancelOperButton();break;
            case this.animationButton:this.onanimationButtons();break;
            case this.superpositionButton:this.onsuperpositionButton();break;
            case this.totalSelectionCheck:this.ontotalSelectionCheck();break;
            case this.hideButton:this.onhideButtonk();break;
            case this.downloadButton:this.onDownloadButton();break;
            case this.dragCheckBox:{
                if(this.dragCheckBox.selected){
                    this.scroller.scrollPolicyH =eui.ScrollPolicy.ON;
                    this.scroller.scrollPolicyV =eui.ScrollPolicy.ON;
                    this.lineEditorView.closeEdit();
                }
                else{
                    this.scroller.scrollPolicyH =eui.ScrollPolicy.OFF;
                    this.scroller.scrollPolicyV =eui.ScrollPolicy.OFF;
                    this.lineEditorView.openEdit();
                }
            }
            
        }
    }

    public onCbxShowGrid(){
        this.gridContainer.visible = this.showGridCbx.selected;
    }

    //删除路径的某个路点..
    public onDeletePathSelectPoint(){
        this.lineEditorView.deleteSelectPoint();
    }

    //添加路径;
    protected onAddPathButton(){
        if(this.operPathIdLabel.text.length == 0){
            this.showErrorMsg("请输入路径id");
            return;
        }
        let paths = this.lineEditorView.getPathDatas();
        if(paths.length == 0){
            this.showErrorMsg("路径不能为空");
            return;  
        }

        let id = this.operPathIdLabel.text;
        let succeed = DataCenter.Instance.addData(id, paths);
        if(succeed == false){
            this.showErrorMsg("有相同的路径id");
            return;
        }

        let ids = DataCenter.Instance.getPathIds();
        this.pathListView.SelectIndex = ids.length -1;
        this.pathListView.refreshData();

        //添加导出路径;
        let exportPaths = this.lineEditorView.getExportPathDatas();
        if(paths.length == 0){
            this.showErrorMsg("导出路径不能为空");
            return;  
        }
        succeed = DataCenter.Instance.addExportData(id, exportPaths);
        if(succeed == false){
            this.showErrorMsg("有相同的路径id");
            return;
        }
    }

    //移除路径;
    protected onRemovePathButton(){
        let index = this.pathListView.SelectIndex;
        DataCenter.Instance.removeData(index);
        this.pathListView.refreshData();
        DataCenter.Instance.removeExportData(index);

    }

    //修改路径;
    protected onModifyPathButton(){
        let index = this.pathListView.SelectIndex;
        let paths = this.lineEditorView.getPathDatas();
        let id = this.operPathIdLabel.text;
        let succeed = DataCenter.Instance.setData(index, id, paths);
        if(succeed == false){
            this.showErrorMsg("有相同的路径id");
            return;
        }
        this.pathListView.refreshData();

        //修改导出路径;
        let exportPaths = this.lineEditorView.getExportPathDatas();
        succeed = DataCenter.Instance.setExportData(index, id, exportPaths);
        if(succeed == false){
            this.showErrorMsg("有相同的路径id");
            return;
        }
    }

    //保存路径;
    protected onSavePathButton(){
        //保存数据到远程web服务器;
        DataCenter.Instance.SaveData();
    }

    //清除当前路径点;
    protected onClearPathPointButton(){
        this.lineEditorView.clear();
    }

    //显示错误列表;
    protected showErrorMsg(msg:string){
        this.errorMsgLabel.text = msg;
        this.errorMsgLabel.visible = true;
        this.errorMsgLabel.x = 1280/2;
        this.errorMsgLabel.y = 720/2;
        this.errorMsgLabel.alpha = 1;
        let self = this;
        egret.Tween.removeTweens(self.errorMsgLabel);
        egret.Tween.get(self.errorMsgLabel).wait(1000).to({y:260}, 500).to({y:160,alpha:0}, 500).call(()=>{
            self.errorMsgLabel.visible = false;
            egret.Tween.removeTweens(self.errorMsgLabel);
        });
    }

    //加载完成，需要刷新列表;
    protected onLoadCompleteData(data){
        this.pathListView.refreshData();
        this.onPathSelectChange(0);
    }

    protected onSaveCompleteData(data){
        this.showErrorMsg("保存成功");
    }

    //选中某一路径，刷新实际的详细路径;
    protected onPathSelectChange(data:any){
        egret.Tween.removeTweens(this.FishResourcesImage);
        this.FishResourcesImage.visible = false;
        let selectIndex:number = data;
        let pathInfo = DataCenter.Instance.getDataByPathIndex(selectIndex);
        this.lineEditorView.setPathDatas(pathInfo.path);
        this.route = pathInfo.path;
        this.operPathIdLabel.text = pathInfo.id+"";
        // this.onanimationButton();
    }

    //排序，每次点击，重新按照相反顺序重新排一次;
    private mSortDirection = 1;
    protected onSortPathListButton(){
        this.mSortDirection = -1 * this.mSortDirection;
        DataCenter.Instance.sortData(this.mSortDirection);
        this.pathListView.refreshData();
        this.onPathSelectChange(0);
    }

    //取消当前最后操作;
    protected onCancelOperButton(){
        this.lineEditorView.cancelOperate();
    }

    //播放动画
    // public onanimationButton(){
    //     console.error("走不走这里")
    //     this.pathConfig = RES.getRes("TableFishPath_json").filter((v: table.TableFishPath) => v.id == this.route);//table.TableFishPath.instance().filter((v: table.TableFishPath) => v.id == this.route);
    //     // this.FishResourcesImage.x = this.route[0].x;
    //     // this.FishResourcesImage.y = this.route[0].y;
    //     // this.onanimationButtons();
    //         let time = 1;
	// 		let leftTime = time - 1;
	// 		let distTotal = leftTime * (5 / 1000);
	// 		let curPath: table.TableFishPath;
	// 		let nextPath: table.TableFishPath;
	// 		for (let item of this.pathConfig) {
	// 			if (item.distTotal > distTotal) {
	// 				nextPath = item;
	// 				break;
	// 			}
	// 			curPath = item;
	// 		}
    //         curPath = curPath == null ? this.pathConfig[0] : curPath;
	// 		nextPath = nextPath == null ? this.pathConfig[0] : nextPath;
	// 		let angle = this.getAngleByPoint({ x: curPath.x, y: curPath.y }, { x: nextPath.x, y: nextPath.y }) - 90;
	// 		let distLast = this.getDistanceByPoint({ x: curPath.x, y: curPath.y }, { x: nextPath.x, y: nextPath.y });
	// 		let offsetDist = distTotal - curPath.distTotal;
	// 		let offsetx = offsetDist / distLast * (nextPath.x - curPath.x);//offsetDis * Math.cos(angle - 90);
	// 		let offsety = offsetDist / distLast * (nextPath.y - curPath.y);//offsetDis * Math.sin(angle - 90);
	// 		this.FishResourcesImage.x = curPath.x + offsetx;
	// 		this.FishResourcesImage.y = curPath.y + offsety;
	// 		this.FishResourcesImage.rotation = angle;
	// 		// if (distTotal > this.pathConfig.last().distTotal) {
	// 		// 	gameObject.GameObjectFactory.instance.recoverGameObject(this._gameObj);
	// 		// }
    // }
     private onanimationButtons(){
        egret.Tween.removeTweens(this.FishResourcesImage);
        this.FishResourcesImage.x = this.route[0].x;
        this.FishResourcesImage.y = this.route[0].y;
        this.SequentialMovement = 0;
        if(this.totalSelectionCheck.currentState =="down"){
            for(var i =0;i<DataCenter.Instance.getPathIds().length;++i){
                let yu = new eui.Image();
                yu.source = "puyu_load_Icon_png";
                this.addChild(yu)
                let SequentialMovement = 0;
                let data = RES.getRes("TableFishPath_json").filter((v: table.TableFishPath) => v.id == DataCenter.Instance.getPathIds()[i]);
                yu.x = (data[0].x*0.8)+70;
                yu.y = data[0].y*0.78;
                // let pathInfo = DataCenter.Instance.getDataByPathIndex(i);
                this.onanimationButtonsData([yu,DataCenter.Instance.getPathIds()[i],SequentialMovement]);
            }
        }
        else{
            for(let item of DataCenter.superpositionOption){
                let yu = new eui.Image();
                yu.source = "puyu_load_Icon_png";
                this.addChild(yu)
                let SequentialMovement = 0;
                let pathInfo = DataCenter.Instance.getDataByPathIndex(item);
                let data = RES.getRes("TableFishPath_json").filter((v: table.TableFishPath) => v.id == pathInfo.id);
                yu.x = (data[0].x*0.8)+70;
                yu.y = data[0].y*0.78;
                this.onanimationButtonsData([yu,pathInfo.id,SequentialMovement]);
            }
        }

        //  let item = RES.getRes("TableFishPath_json").filter((v: table.TableFishPath) => v.id == this.route);
        //     this.onanimationButton()
        // console.error(RES.getRes("TableFishPath_json").filter((v: table.TableFishPath) => v.id == this.route),"阿斯顿发送到发送的")
       
         
     }
      private onsuperpositionButton(){
          this.ImmovableGridGroup.removeChildren();
            if(this.totalSelectionCheck.currentState =="down"){
                for(var i =0;i<DataCenter.Instance.getPathIds().length;++i){
                    let pathInfo = DataCenter.Instance.getDataByPathIndex(i);
                    this.lineEditorView.setPathDatasNew(pathInfo.path,this);
                }
            }
            else{
                for(let item of DataCenter.superpositionOption){
                    if(DataCenter.Instance.getDataByPathIndex(item)){
                        let pathInfo = DataCenter.Instance.getDataByPathIndex(item);
                        this.lineEditorView.setPathDatasNew(pathInfo.path,this);
                    }
                }
            }
      }
      private ontotalSelectionCheck(){
          if(this.totalSelectionCheck.currentState =="down"){
              DataCenter.totalSelection = true;
              DataCenter.listVariable = true;
              this.pathListView.refreshData();
          }
          else{
              DataCenter.totalSelection = false;
              DataCenter.listVariable = true;
              this.pathListView.refreshData();
              DataCenter.superpositionOption = [];
          }
      }
      private onhideButtonk(){
          if(this.mainViewPanel.visible){
                this.mainViewPanel.visible =false;
                this.ImmovableGridGroup.visible =false;
          }
          else{
                this.mainViewPanel.visible =true;
                this.ImmovableGridGroup.visible =true;
          }
      }
      private onDownloadButton() {
          window.location.href = DataCenter.DOWNLOAD_CONFIG_URL;
      }
      

     
    
     private onanimationButtonsData(data){
          let item = RES.getRes("TableFishPath_json").filter((v: table.TableFishPath) => v.id == data[1]);
         if(item[data[2]+1]){
            let angle = this.getAngleByPoint({ x: item[data[2]].x*0.8, y: item[data[2]].y*0.78 }, { x: item[data[2] +1].x*0.8, y: item[data[2] +1].y*0.78 }) - 90;

            let dataS = [data[0],data[1],data[2]+1]
            // this.FishResourcesImage.visible = true;
            data[0].rotation = angle;
            // data[0].x
            egret.Tween.get(data[0]).to({ x:  (item[data[2]+1].x*0.8)+70, y:  item[data[2]+1].y*0.78 }, 500).call(this.onanimationButtonsData, this,[dataS])
         }
         else{
             this.removeChild(data[0])
             this.FishResourcesImage.visible = false;
             this.SequentialMovement = 0;
         }
     }
     private getAngleByPoint(p1, p2) {
        var px = p1.x;
        var py = p1.y;
        var mx = p2.x;
        var my = p2.y;
        var x = Math.abs(px - mx);
        var y = Math.abs(py - my);
        var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        var cos = y / z;
        var radina = Math.acos(cos);
        var angle = Math.floor(180 / (Math.PI / radina));
        if (mx > px && my > py) {
            angle = 180 - angle;
        }
        if (mx == px && my > py) {
            angle = 180;
        }
        if (mx > px && my == py) {
            angle = 90;
        }
        if (mx < px && my > py) {
            angle = 180 + angle;
        }
        if (mx < px && my == py) {
            angle = 270;
        }
        if (mx < px && my < py) {
            angle = 360 - angle;
        }
        return angle;
    }
    private getDistanceByPoint(p1, p2) {
        var x = Math.abs(p1.x - p2.x);
        var y = Math.abs(p1.y - p2.y);
        return Math.sqrt(x * x + y * y);
    }

     
}
}