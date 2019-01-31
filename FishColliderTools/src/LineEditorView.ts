// TypeScript file


module editor{

    //控制点;
    class ControlPointView extends eui.Group{
        //绘制的半径;
        private static Radius:number = 5;        
        //绘制控制点颜色.
        private static CTRL_FLAG_COLOR:number = 0xFFff00;
        //选中颜色.
        private static SELECT_FLAG_COLOR:number = 0xffffff;
        //开始颜色.
        private static BEGIN_FLAG_COLOR:number = 0x00ffff;

        //控制点绘制的形状;
        public mShape:egret.Shape;
        //选中点
        private mSelectShape:egret.Shape;
        //开始标识;
        private mBeginShape:egret.Shape;

        //连接上一个节点的线;
        public mLastLine:egret.Shape;

        //前一个控制点;
        private lastCtrlPoint:ControlPointView = null;
        private nextCtrlPoint:ControlPointView = null;
        
        private mIsTouching = false;
        private mIsSelected:boolean = false;


        public static distanceSqrPtToLine(p:{x,y}, q:{x,y},pt:{x,y}):{distSqr:number, lineX:number, lineY:number}{
            let pqx = q.x - p.x;
            let pqy = q.y - p.y;
            let dx = pt.x - p.x;
            let dy = pt.y - p.y;
            let d = pqx * pqx + pqy * pqy;
            let t = pqx * dx + pqy * dy;
            if(d>0){
                t = t / d;
            }
            if(t<0){
                t = 0;
            }else if(t>1){
                t = 1;
            }

            let lx = p.x + t * pqx;
            let ly = p.y + t * pqy;

            let ptx = pt.x - lx;
            let pty = pt.y - ly;

            let distSquare = ptx * ptx + pty * pty;
            return {distSqr:distSquare, lineX:lx, lineY:ly};
        }

        //构造;
        constructor(x:number,y:number,type?){
            super();
            this.x = x;
            this.y = y;
            this.mShape = this.newCircle(ControlPointView.CTRL_FLAG_COLOR, ControlPointView.Radius);
            this.mSelectShape = this.newSelectCircle(ControlPointView.SELECT_FLAG_COLOR, ControlPointView.Radius+2 );
            this.mBeginShape = this.newSelectCircle(ControlPointView.BEGIN_FLAG_COLOR, ControlPointView.Radius+4 );
            this.addChild(this.mBeginShape);
            this.mBeginShape.visible = false;
            this.addChild(this.mSelectShape);
            this.mSelectShape.visible = false;
            this.mLastLine = null;
            this.addChild(this.mShape);
            this.touchEnabled = false;
            if(type){
                this.mShape.visible = false;
            }

        }

        public onTouchBegin(touchEvent:egret.TouchEvent){
            this.mIsTouching = true;
        }

        public onTouchMove(touchEvent:egret.TouchEvent){
            if(this.mIsTouching == false){
                return;
            }
            let newPos = this.parent.globalToLocal(touchEvent.stageX, touchEvent.stageY)
            this.x = newPos.x;
            this.y = newPos.y;
            this.refreshConnectLines();
        }

        public onTouchCancel(touchEvent:egret.TouchEvent){
            this.mIsTouching = false;
        }

        public onTouchReleaseOutside(touchEvent:egret.TouchEvent){
            this.mIsTouching = false;
        }

        public onTouchEnd(touchEvent:egret.TouchEvent){
            let newPos = this.parent.globalToLocal(touchEvent.stageX, touchEvent.stageY)
            this.x = newPos.x;
            this.y = newPos.y;
            this.refreshConnectLines();
            this.mIsTouching = false;
        } 
                      
        public isHover(x, y){
            return (x-this.x)*(x-this.x)+(y-this.y)*(y-this.y) <= (ControlPointView.Radius+2) * (ControlPointView.Radius+2);
        }

        //如果在线上，则返回hover为true， x, y为实际线的点；如果不在线上，则hover为false;
        public getHoverLine(x, y, maxDistance:number):{hover:boolean,x:number,y:number}{
            if(this.lastCtrlPoint == null){
                return {hover:false,x:0,y:0};
            }
            let distInfo = ControlPointView.distanceSqrPtToLine({x:this.x, y:this.y},
                                                                {x:this.lastCtrlPoint.x, y:this.lastCtrlPoint.y},
                                                                {x:x,y:y});
            if(distInfo.distSqr < maxDistance * maxDistance){
                return {hover:true, x:distInfo.lineX, y:distInfo.lineY};
            }
            return {hover:false,x:0,y:0};
        }

        private isFirstPoint():boolean{
            return this.lastCtrlPoint == null;
        }

        public getNextCtrl():ControlPointView{
            return this.nextCtrlPoint;
        }

        public getLastCtrl():ControlPointView{
            return this.lastCtrlPoint;
        }

        public refreshConnectLines(type?){
            this.refreshLastLine(type);
            if(this.nextCtrlPoint != null){
                this.nextCtrlPoint.refreshLastLine(type);
            }
        }

        public refreshLastLine(type?){
            if(this.mLastLine != null){
                this.removeChild(this.mLastLine);
                this.mLastLine = null;
            }
            if(this.lastCtrlPoint != null){
                this.mLastLine = this.newLine(new egret.Point(this.lastCtrlPoint.x, this.lastCtrlPoint.y),
                    new egret.Point(this.x, this.y),type);
                this.mLastLine.x = -this.x;
                this.mLastLine.y = - this.y;
                this.addChild(this.mLastLine);
            }
        }

        public setSelected(selected:boolean){
            this.mIsSelected = selected;
            this.refreshState();
        }

        public refreshState(){
            this.mSelectShape.visible = this.mIsSelected;
            this.mBeginShape.visible = this.isFirstPoint();
        }

        protected newSelectCircle(color:number, radius:number):egret.Shape{
            let shp = new egret.Shape();
            shp.graphics.lineStyle(1, color);
            shp.graphics.drawCircle(0,0,radius);
            shp.blendMode = egret.BlendMode.ADD;
            return shp;   
        }

        protected newCircle(color:number, radius:number):egret.Shape{
            let shp = new egret.Shape();
            shp.graphics.lineStyle(1, color);
            shp.graphics.beginFill(color, 1);
            shp.graphics.drawCircle(0,0,radius);
            shp.graphics.endFill();
            shp.blendMode = egret.BlendMode.ADD;
            return shp;
        }

        protected newLine(fromPt, dstPt,type?, color:number=0xff0000, lineBold:number=2):egret.Shape{
            let line: egret.Shape = new egret.Shape();
            line.graphics.lineStyle(lineBold, type?0x0037FF:color);
            line.graphics.moveTo(fromPt.x, fromPt.y);
            line.graphics.lineTo(dstPt.x, dstPt.y);
            line.x = 0;
            line.y = 0;
            // line.alpha = 0.5;
            return line;      
        }


        public setLastControl(ctrlPoint:ControlPointView){
            this.lastCtrlPoint = ctrlPoint;
            this.refreshLastLine();
        }


        public setNextControl(ctrlPoint:ControlPointView){
            this.nextCtrlPoint = ctrlPoint;
        }

        //绘制线的滤镜...
        protected GetGlowFilter(color: number, strength:number = 1): egret.GlowFilter {
            var color: number = color;        /// 光晕的颜色，十六进制，不包含透明度
            var alpha: number = 0.8;             /// 光晕的颜色透明度，是对 color 参数的透明度设定。有效值为 0.0 到 1.0。例如，0.8 设置透明度值为 80%。
            var blurX: number = 10;              /// 水平模糊量。有效值为 0 到 255.0（浮点）
            var blurY: number = 10;              /// 垂直模糊量。有效值为 0 到 255.0（浮点）
            var strength: number = 1;            /// 压印的强度，值越大，压印的颜色越深，而且发光与背景之间的对比度也越强。有效值为 0 到 255。暂未实现
            var quality: number = egret.BitmapFilterQuality.MEDIUM;        /// 应用滤镜的次数，建议用 BitmapFilterQuality 类的常量来体现
            var inner: boolean = false;            /// 指定发光是否为内侧发光，暂未实现
            var knockout: boolean = false;            /// 指定对象是否具有挖空效果，暂未实现
            var glowFilter: egret.GlowFilter = new egret.GlowFilter(color, alpha, blurX, blurY,
                strength, quality, inner, knockout);
            return glowFilter;
        }

    };


    //操作命令;
    class OperTouchControlCmd{
        public cmd:string;//命令类型;
        public ctrl:ControlPointView;
        public param:any;
        protected newPos:{x,y};
        protected parent:any;
        constructor(cmd:string, ctrl:ControlPointView, param=null){
            this.cmd = cmd;
            this.ctrl = ctrl;
            this.param = param;
            this.parent = this.ctrl.parent;
            this.newPos = {x:ctrl.x,y:ctrl.y};
        }

        //执行命令;
        public redo(){
            if(this.cmd == "addNewCtrl"){
                if(this.ctrl.getLastCtrl() != null){
                    this.ctrl.getLastCtrl().setNextControl(this.ctrl);
                }
                if(this.ctrl.getNextCtrl() != null){
                    this.ctrl.getNextCtrl().setLastControl(this.ctrl);
                }
            }
        }

        //撤销命令;
        public cancel(){
            if(this.cmd == "addNewCtrl"){
                LineEditorView.Instance.deleteSelectPoint(this.ctrl);
            }else if(this.cmd == "moveCtrl"){
                this.ctrl.x = this.param.x;
                this.ctrl.y = this.param.y;
            }
        }
    }

    //绘制线的编辑器类
    export class LineEditorView extends eui.Group{
        public static s_IsTouchControlPoint:boolean = false;
        public static s_horizonOffset:number = 50;
        public static s_vertialOffset:number = 50;

        public static s_Instance:LineEditorView;

        public operCmdList:Array<OperTouchControlCmd>;

        public static get Instance(){
            return LineEditorView.s_Instance;
        }

        constructor(width:number, height:number){
            super();
            this.width =  width  + 2*LineEditorView.s_horizonOffset; 
            this.height = height + 2*LineEditorView.s_vertialOffset;
            this.anchorOffsetX = LineEditorView.s_horizonOffset;
            this.anchorOffsetY = LineEditorView.s_vertialOffset;
            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onTouchBegin, this, true);
            this.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouchEnd, this);
            this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onTouchMove, this, true);
            this.addEventListener(egret.TouchEvent.TOUCH_CANCEL, this.onTouchCancel, this);
            this.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onTouchReleaseOutside, this);
            LineEditorView.s_Instance = this;
            this.operCmdList = new Array<OperTouchControlCmd>();
        }

        //绘制的开始节点;
        public mHeadCtrlView:ControlPointView = null;
        public mHeadCtrlViewNew:ControlPointView = null;
        //绘制的结束节点;
        public mTailCtrlView:ControlPointView = null;
        public mTailCtrlViewNew:ControlPointView = null;

        //触摸开始;
        private mSelectCtrlPoint:ControlPointView = null;

        private mSelectCtrlPointNew:ControlPointView = null;

        private mTouchBeginPos:{x,y};
        protected onTouchBegin(event:egret.TouchEvent){
            let newPos = this.globalToLocal(event.stageX, event.stageY)
            if(this.mSelectCtrlPoint != null){
                this.mSelectCtrlPoint.setSelected(false);
                this.mSelectCtrlPoint = null;
            }
            this.mSelectCtrlPoint = this.getHoverControlPoint(newPos.x, newPos.y);
            this.mTouchBeginPos = newPos;
            if(this.mSelectCtrlPoint != null){
                this.mSelectCtrlPoint.onTouchBegin(event);
                this.mSelectCtrlPoint.setSelected(true);
                return;
            }

            //如果在线上，则在线上添加路点;
            let hoverLineInfo = this.getHoverCtontrolLine(newPos.x, newPos.y, 5);
            if(hoverLineInfo.CtrlPt != null){
                this.addNewCtrlFromLine(hoverLineInfo.CtrlPt, hoverLineInfo.x, hoverLineInfo.y);
                this.mSelectCtrlPoint.onTouchBegin(event);
                return;
            }
            this.addNewControlPoint(newPos.x, newPos.y);
            this.mSelectCtrlPoint.onTouchBegin(event);
        }

        //添加一个新点;
        protected addNewControlPoint(x, y):ControlPointView{
            let newCtrl = new ControlPointView(x, y);
            this.addChild(newCtrl);
            this.addCtrlToList(newCtrl);
            this.refreshAllCtrlState();  
            if(this.mSelectCtrlPoint != null){
                this.mSelectCtrlPoint.setSelected(false);
                this.mSelectCtrlPoint = null;
            }
            this.mSelectCtrlPoint = newCtrl;  
            this.mSelectCtrlPoint.setSelected(true);
            this.operCmdList.push(new OperTouchControlCmd("addNewCtrl", newCtrl));
            return newCtrl;
        }


        //添加叠加点
         protected addNewControlPointNew(x, y,panel):ControlPointView{
            let newCtrl = new ControlPointView(x, y,true);
            newCtrl.touchEnabled = false;
            newCtrl.alpha = 0.3;
            panel.addChild(newCtrl);
            this.addCtrlToListNew(newCtrl,panel);
            this.refreshAllCtrlState(true);  
            if(this.mSelectCtrlPointNew != null){
                this.mSelectCtrlPointNew.setSelected(false);
                this.mSelectCtrlPointNew = null;
            }
            this.mSelectCtrlPointNew = newCtrl;  
            this.mSelectCtrlPointNew.setSelected(true);
            // this.operCmdList.push(new OperTouchControlCmd("addNewCtrl", newCtrl));
            return newCtrl;
        }


        //在线上添加新的点;
        public addNewCtrlFromLine(dstCtrl:ControlPointView, x:number, y:number){
            let newCtrl = new ControlPointView(x, y);
            this.addChild(newCtrl);
            let lastCtrl = dstCtrl.getLastCtrl();
            newCtrl.setLastControl(lastCtrl);
            lastCtrl.setNextControl(newCtrl);
            newCtrl.setNextControl(dstCtrl);
            dstCtrl.setLastControl(newCtrl);
            if(this.mSelectCtrlPoint != null){
                this.mSelectCtrlPoint.setSelected(false);
            }
            this.mSelectCtrlPoint = newCtrl;
            this.mSelectCtrlPoint.setSelected(true);
            this.refreshAllCtrlState(); 
            this.operCmdList.push(new OperTouchControlCmd("addNewCtrl", newCtrl));
        }

        protected refreshAllCtrlState(type?,bool?){
            let listTemp = bool?this.mHeadCtrlViewNew:this.mHeadCtrlView;
            while(listTemp != null){
                listTemp.refreshState();
                if(type){
                    listTemp.refreshConnectLines(type);
                }
                else{
                    listTemp.refreshConnectLines();
                }
                listTemp = listTemp.getNextCtrl();
            }
        }

        protected onTouchMove(event:egret.TouchEvent){
            if(this.mSelectCtrlPoint != null){
                this.mSelectCtrlPoint.onTouchMove(event);
            }
        }

        protected onTouchCancel(event:egret.TouchEvent){
            if(this.mSelectCtrlPoint != null)this.mSelectCtrlPoint.onTouchCancel(event);
        }

        protected onTouchReleaseOutside(event:egret.TouchEvent){
            if(this.mSelectCtrlPoint != null)this.mSelectCtrlPoint.onTouchReleaseOutside(event);
        }

        //触摸结束;
        protected onTouchEnd(event:egret.TouchEvent){
            if(this.mSelectCtrlPoint != null){
                this.mSelectCtrlPoint.onTouchEnd(event);
                this.operCmdList.push(new OperTouchControlCmd("moveCtrl", this.mSelectCtrlPoint, this.mTouchBeginPos));
            }
        }

        public getHoverControlPoint(x, y):ControlPointView{
            let listTemp = this.mHeadCtrlViewNew;//this.mHeadCtrlView;
            while(listTemp != null){
                if(listTemp.isHover(x, y) == true){
                    return listTemp;
                }
                listTemp = listTemp.getNextCtrl();
            }
            return null;
        }


        //获取
        public getHoverCtontrolLine(x, y, ignoreDistance:number = 5):{CtrlPt:ControlPointView, x:number, y:number}{
            let listTemp = this.mHeadCtrlView;
            while(listTemp != null){
                let hoverLineInfo = listTemp.getHoverLine(x, y, ignoreDistance);
                
                if(hoverLineInfo.hover == true){
                    return {CtrlPt:listTemp, x:hoverLineInfo.x, y:hoverLineInfo.y};
                }
                listTemp = listTemp.getNextCtrl();
            }
            return{CtrlPt:null, x:0,y:0};
        }

        //添加控制点到路径中;
        protected addCtrlToList(ctrl:ControlPointView){
            if(this.mHeadCtrlView == null){
                this.mHeadCtrlView = ctrl;
                this.mHeadCtrlViewNew = ctrl;
                this.mTailCtrlView = ctrl;
                this.addChild(this.mHeadCtrlView);
            }else{
                if(this.mTailCtrlView == null){
                    this.mTailCtrlView = this.mTailCtrlViewNew
                }
                this.mTailCtrlView.setNextControl(ctrl);
                ctrl.setLastControl(this.mTailCtrlView);
                this.mTailCtrlView = ctrl;
                this.mTailCtrlViewNew = ctrl;
            }  
        }

        //添加叠加控制点到路径中;
        protected addCtrlToListNew(ctrl:ControlPointView,panel){
            if(this.mHeadCtrlView == null){
                this.mHeadCtrlView = ctrl;
                this.mTailCtrlView = ctrl;
                panel.addChild(this.mHeadCtrlView);
            }else{
                this.mTailCtrlView.setNextControl(ctrl);
                ctrl.setLastControl(this.mTailCtrlView);
                this.mTailCtrlView = ctrl;
            }  
        }

        //清除路径;
        public clear(){
            let listTemp
            if(this.mHeadCtrlViewNew){
                listTemp = this.mHeadCtrlViewNew;
            }
            else{
                listTemp = this.mHeadCtrlView;
            }
            while(listTemp != null){
                this.removeChild(listTemp);
                // listTemp.visible = false;
                listTemp = listTemp.getNextCtrl();
            }
            this.mHeadCtrlView = null;
            this.mHeadCtrlViewNew = null;
            this.mTailCtrlView = null;
            this.mSelectCtrlPoint = null;
        }

        public get HeadCtrlView(){
            return this.mHeadCtrlView;
        }
        public set HeadCtrlView(headCtrl:ControlPointView){
            this.mHeadCtrlView = headCtrl;
        }

        public get TailCtrlView(){
            return this.mHeadCtrlView;
        }
        public set TailCtrlView(tailCtrl:ControlPointView){
            this.mTailCtrlView = tailCtrl;
        }

        //获取路径的数据;
        public getPathDatas():Array<{x,y}>{
            let result:Array<{x,y}> =new Array<{x,y}>();
            let listTemp = this.mHeadCtrlView;
            while(listTemp != null){
                result.push({x:listTemp.x-this.anchorOffsetX, y:listTemp.y-this.anchorOffsetY});
                listTemp = listTemp.getNextCtrl();
            }
            return result;
        }

        public setPathDatas(data:Array<{x, y}>){
            this.clear();
            for(let i:number=0; i<data.length; i++){
                this.addNewControlPoint(data[i].x+this.anchorOffsetX, data[i].y+this.anchorOffsetY);
            }
            this.operCmdList = [];
        }

        public setPathDatasNew(data:Array<{x, y}>,panel){
            this.mHeadCtrlView = null;
            this.mTailCtrlView = null;
            let groupNew = new eui.Group()
            groupNew.width = 1280;
            groupNew.height = 720;
            groupNew.touchEnabled = false;
            // groupNew.scaleX = 0.8;
            // groupNew.scaleY = 0.78;
            panel.ImmovableGridGroup.addChild(groupNew)
            for(let i:number=0; i<data.length+1; i++){
                if(i == data.length){
                    this.mTailCtrlView = null;
                }
                else{
                    this.addNewControlPointNew(data[i].x+groupNew.anchorOffsetX, data[i].y+groupNew.anchorOffsetY,groupNew);
                }
            }
        }

        //撤销命令;
        public cancelOperate(){
            if(this.operCmdList.length==0){
                return false;
            }
            let cmd = this.operCmdList.pop();
            cmd.cancel();
            this.refreshAllCtrlState(null,true);
            return true;
        }

        //删除选中点;
        public deleteSelectPoint(ctrl:ControlPointView = null){
            if(ctrl != null){
                if(this.mSelectCtrlPoint != null){
                    this.mSelectCtrlPoint.setSelected(false);
                }
                this.mSelectCtrlPoint = ctrl;
            }
            if(this.mSelectCtrlPoint != null){
                let lastCtrl = this.mSelectCtrlPoint.getLastCtrl();
                let nextCtrl = this.mSelectCtrlPoint.getNextCtrl();
                if(lastCtrl != null){
                    lastCtrl.setNextControl(nextCtrl);
                }
                if(nextCtrl != null){
                    nextCtrl.setLastControl(lastCtrl);
                }
                if(this.mHeadCtrlView == this.mSelectCtrlPoint){
                    this.mHeadCtrlView = nextCtrl;
                }
                if(this.mTailCtrlView == this.mSelectCtrlPoint){
                    this.mTailCtrlView = lastCtrl;
                }
                this.refreshAllCtrlState();
                if(lastCtrl != null){
                    lastCtrl.refreshConnectLines();
                }
                if(nextCtrl != null){
                    nextCtrl.refreshConnectLines();
                }
                this.removeChild(this.mSelectCtrlPoint);
                this.mSelectCtrlPoint = null;
            }
        }

    }

}