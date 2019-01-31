// TypeScript file
module editor {

    //底注按钮;
    export class MainEditor extends eui.Component {
        private static m_Instance: MainEditor;
        public static get Instance() {
            if (this.m_Instance == null)
                this.m_Instance = new MainEditor();
            return this.m_Instance;
        }

        constructor() {
            super();
            this.skinName = new MainEditorSkin();
            this.initUI();
        }
        public gap = 15;
        private fishList: eui.List;
        private formationList: eui.List;
        private editorView: eui.Group;

        private deleteButton: eui.Button;
        private deleteFormationButton: eui.Button;
        private saveButton: eui.Button;
        private downButton: eui.Button;
        private newFormationButton: eui.Button;
        private mainFishButton: eui.Button;
        private clearButton: eui.Button;
        private changeSighButton: eui.Button;

        private signEditableText: eui.EditableText;

        private editFishMovieClip: egret.MovieClip;



        private lineRadioButton: eui.RadioButton;
        private circularRadioButton: eui.RadioButton;
        private pointRadioButton: eui.RadioButton;
        private selectRadioButton: eui.RadioButton;

        private gridGroup: eui.Group;

        private fishNumberList: eui.List;
        private fishNumberScroller: eui.Scroller;
        public initUI() {
            this.fishNumberScroller.visible = false;
            this.selectRadioButton.selected = true;
            DataCenter.Instance.LoadData();
            this.fishList.itemRenderer = FishItem;
            this.fishList.dataProvider = new eui.ArrayCollection(table.TableFishConfig.instance());
            this.fishList.selectedIndex = 0;
            this.signEditableText.restrict = "0-9";
            let gapX = this.gap;
            let gapY = this.gap;
            for (let j: number = 0; j < this.editorView.height / gapX; j++) {
                var shp: egret.Shape = new egret.Shape();
                shp.graphics.lineStyle(1, 0x00ff00);
                shp.graphics.moveTo(0, j * gapY);
                shp.graphics.lineTo(this.editorView.width, j * gapY);
                shp.graphics.endFill();
                shp.alpha = 0.5;
                this.gridGroup.addChildAt(shp, 0);
            }
            for (let i: number = 0; i < this.editorView.width / gapX; i++) {
                var shp: egret.Shape = new egret.Shape();
                shp.graphics.lineStyle(1, 0x00ff00);
                shp.graphics.moveTo(i * gapX, 0);
                shp.graphics.lineTo(i * gapX, this.editorView.height);
                shp.graphics.endFill();
                shp.alpha = 0.5;
                this.gridGroup.addChildAt(shp, 0);
            }
            this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onClickTap, this);
            this.fishNumberList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onFishNumberListTap, this);
            this.formationList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onFormationListTap, this);

            this.editorView.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onEditTouch, this);
            this.editorView.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onEditTouch, this);
            this.editorView.addEventListener(egret.TouchEvent.TOUCH_END, this.onEditTouch, this);
            this.editorView.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onEditTouch, this);
            this.editorView.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onEditTouch, this);


            this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onEditMove, this);
            this.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onEditMove, this);
            this.addEventListener(egret.TouchEvent.TOUCH_END, this.onEditMove, this);
            this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onEditMove, this);
            this.addEventListener(egret.TouchEvent.TOUCH_RELEASE_OUTSIDE, this.onEditMove, this);
        }

        public updataFormationList() {
            this.formationList.dataProvider = new eui.ArrayCollection(DataCenter.Instance.shapeData);
            if (this.formationList.selectedIndex == -1) {
                this.formationList.selectedIndex = 0;
                this.changedShowFishTeam();
            }
        }
        public get selectFormationSign() {
            return this.formationList.selectedItem.sign;
        }
        public selectFishNumber: number = 1;
        public selectShape: egret.Shape;
        public selectFishSprite: FishSprite;
        public get selectFishSigon() {
            return this.fishList.selectedItem.sign;
        }
        private onEditTouch(e: egret.TouchEvent) {
            if (this.pointRadioButton.selected) {
                this.drawPoint(e);
            }
            else if (this.lineRadioButton.selected) {
                this.drawLine(e);
            }
            else if (this.circularRadioButton.selected) {
                this.drawCircular(e);
            }
        }


        private moveShape: egret.Shape;
        private startPoint: { x: number, y: number } = { x: 0, y: 0 };
        private startTime:number;
        private onEditMove(e: egret.TouchEvent) {
            if (e.type == egret.TouchEvent.TOUCH_BEGIN) {
                if (e.target instanceof egret.Shape) {
                    this.moveShape = e.target;
                }
                if (e.target instanceof FishSprite) {
                    this.moveShape = (<FishSprite>e.target).shape;
                }
                let point = this.editorView.globalToLocal(e.stageX, e.stageY);
                point = this.checkoutInGrp(point);
                point = this.editorView.globalToLocal(point.x, point.y);
                this.startPoint.x = point.x;
                this.startPoint.y = point.y;
                this.startTime = Date.now()
            }
            else if (e.type == egret.TouchEvent.TOUCH_MOVE) {
                if (this.moveShape == null)
                    return;
                let time = Date.now();
                if(time - this.startTime < 500){
                    return ;
                }
                let point = this.editorView.globalToLocal(e.stageX, e.stageY);
                point = this.checkoutInGrp(point);
                point = this.editorView.globalToLocal(point.x, point.y);
                let diff = { x: point.x - this.startPoint.x, y: point.y - this.startPoint.y };
                let fishs = this.fishArray.filter((v: FishSprite) => v.shape == this.moveShape);
                this.moveShape.x += diff.x;
                this.moveShape.y += diff.y;
                if (this.moveShape["type"] == 2) {
                    this.moveShape["endX"] += diff.x;
                    this.moveShape["endY"] += diff.y;
                }
                for (let item of fishs) {
                    item.x += diff.x;
                    item.y += diff.y;
                }
                this.startPoint.x = point.x;
                this.startPoint.y = point.y;
                this.fishNumberScroller.visible = false;
            }
            else if (e.type == egret.TouchEvent.TOUCH_END || e.type == egret.TouchEvent.TOUCH_RELEASE_OUTSIDE) {
                if (this.moveShape) {
                    this.startTime = Date.now()*10;
                    this.saveData();
                    this.moveShape = null;
                }
            }
        }

        public checkoutInGrp(point: egret.Point) {
            let gridX = Math.round(point.x / this.gap);
            let gridY = Math.round(point.y / this.gap);
            let target = new egret.Point();
            target.x = gridX * this.gap
            target.y= gridY * this.gap
            return target;
        }
        private pointShape: egret.Shape;
        public drawPoint(e: egret.TouchEvent) {
            if (e.type == egret.TouchEvent.TOUCH_BEGIN) {
                this.pointShape = new egret.Shape();
                this.pointShape.touchEnabled = true;
                let point = this.editorView.globalToLocal(e.stageX, e.stageY);
                point = this.checkoutInGrp(point);
                this.pointShape.x = point.x;
                this.pointShape.y = point.y;
                this.pointShape.graphics.beginFill(0xff0000, 1);
                this.pointShape.graphics.drawCircle(0, 0, 20);
                this.pointShape.graphics.endFill();
                this.editorView.addChild(this.pointShape);
                this.pointShape["type"] = 1;
                this.addShape(this.pointShape);
            }
        }

        private drawLineShape: egret.Shape;
        public drawLine(e: egret.TouchEvent) {
            if (e.type == egret.TouchEvent.TOUCH_BEGIN) {
                this.drawLineShape = new egret.Shape();
                this.drawLineShape.touchEnabled = true;
                let point = this.editorView.globalToLocal(e.stageX, e.stageY);
                point = this.checkoutInGrp(point);
                this.drawLineShape.x = point.x;
                this.drawLineShape.y = point.y;
                this.drawLineShape["type"] = 2;
                this.editorView.addChild(this.drawLineShape);
                this.addShape(this.drawLineShape);
            }
            else if (e.type == egret.TouchEvent.TOUCH_MOVE) {
                this.drawLineShape.graphics.clear();
                let point = this.editorView.globalToLocal(e.stageX, e.stageY);
                point = this.checkoutInGrp(point);
                this.drawLineShape.graphics.lineStyle(5, 0xff0000);
                this.drawLineShape.graphics.moveTo(0, 0);
                let endX = point.x;
                let endY = point.y;
                this.drawLineShape.graphics.lineTo(point.x - this.drawLineShape.x, point.y - this.drawLineShape.y);
                this.drawLineShape["endX"] = endX;
                this.drawLineShape["endY"] = endY;
            }
            else if (e.type == egret.TouchEvent.TOUCH_END || e.type == egret.TouchEvent.TOUCH_RELEASE_OUTSIDE) {
                this.drawLineShape.graphics.endFill();
            }
        }

        private drawCircularShape: egret.Shape;
        public drawCircular(e: egret.TouchEvent) {
            if (e.type == egret.TouchEvent.TOUCH_BEGIN) {
                this.drawCircularShape = new egret.Shape();
                let point = this.editorView.globalToLocal(e.stageX, e.stageY);
                this.drawCircularShape.x = point.x;
                this.drawCircularShape.y = point.y;
                this.drawCircularShape.touchEnabled = true;
                this.drawCircularShape["type"] = 3;
                this.editorView.addChild(this.drawCircularShape);
                this.addShape(this.drawCircularShape);
            }
            else if (e.type == egret.TouchEvent.TOUCH_MOVE) {
                this.drawCircularShape.graphics.clear();
                this.drawCircularShape.graphics.lineStyle(5, 0xff0000);
                let point = this.editorView.globalToLocal(e.stageX, e.stageY);
                let r = GX.getDistanceByPoint({ x: this.drawCircularShape.x, y: this.drawCircularShape.y }, { x: point.x, y: point.y });
                this.drawCircularShape.graphics.drawCircle(0, 0, r);
                this.drawCircularShape.graphics.endFill();
                this.drawCircularShape["r"] = r;
            }
            else if (e.type == egret.TouchEvent.TOUCH_END || e.type == egret.TouchEvent.TOUCH_RELEASE_OUTSIDE) {
            }
        }

        private onClickTap(e: egret.TouchEvent) {
            if (e.target == this.deleteButton) {
                this.fishNumberScroller.visible = false;
                if (this.selectFishSprite) {
                    let shape = this.selectFishSprite.shape;
                    let same = this.fishArray.filter(v => v.shape == shape);
                    for (let item of same) {
                        if (item.parent) {
                            item.parent.removeChild(item);
                        }
                        this.removeFish(item);
                    }
                }
                if (this.selectShape) {
                    if (this.selectShape.parent) {
                        this.selectShape.parent.removeChild(this.selectShape);
                    }
                    this.removeShape(this.selectShape)
                }
            }
            else if (e.target == this.deleteFormationButton) {
                this.deleteFormation(this.selectFormationSign)
            }
            else if (e.target == this.clearButton) {
                this.clearShape();
                this.clearFish();
            }
            else if (e.target == this.saveButton) {
                DataCenter.Instance.SaveData();
            }
            else if (e.target == this.downButton) {
                window.location.href = DataCenter.Down_REMOTE_DATA_URL
            }
            else if (e.target == this.newFormationButton) {
                DataCenter.Instance.newFormation(Number(this.signEditableText.text));
            }
            else if (e.target == this.changeSighButton) {
                DataCenter.Instance.changedFormationSign(this.selectFormationSign, Number(this.signEditableText.text));
            }
            else if (e.target == this.mainFishButton) {
                if (!this.selectFishSprite)
                    return;
                for (let item of this.fishArray) {
                    item.mainFish = false;
                }
                this.selectFishSprite.mainFish = true;
                this.saveData();
            }
            if (this.selectRadioButton.selected) {
                if (e.type == egret.TouchEvent.TOUCH_TAP) {
                    if (e.target instanceof egret.Shape) {
                        this.selectShape = e.target;
                        this.selectFishSprite = null;
                        this.fishNumberScroller.visible = true;
                        this.fishNumberScroller.x = e.stageX;
                        this.fishNumberScroller.y = e.stageY;
                    }
                    if (e.target instanceof FishSprite) {
                        this.fishNumberScroller.visible = false;
                        this.selectFishSprite = e.target;
                        this.selectShape = null;
                    }
                }
            }
        }
        public onFishNumberListTap(e: eui.ItemTapEvent) {
            this.selectFishNumber = e.item.value;
            this.fishNumberScroller.visible = false;
            this.drawFormationFish(this.selectShape, this.selectFishSigon, this.selectFishNumber);
        }
        public onFormationListTap(e: eui.ItemTapEvent) {
            this.changedShowFishTeam();
        }

        public changedShowFishTeam() {
            for (let item of this.shapeArray) {
                if (item.parent) {
                    item.parent.removeChild(item);
                }
            }
            this.shapeArray.clear();
            for (let item of this.fishArray) {
                if (item.parent) {
                    item.parent.removeChild(item);
                }
            }
            this.fishArray.clear();
            let shapes: Array<{ shapeType: number, x: number, y: number, r: number, endX: number, endY: number, fishNum: number, fishId: number }> = DataCenter.Instance.shapeData.first(v => v.sign == this.selectFormationSign).shape;
            if (shapes == null)
                return;
            for (let item of shapes) {
                let type = item.shapeType;
                if (type == 1) {
                    let shape = new egret.Shape();
                    shape.touchEnabled = true;
                    shape.x = item.x;
                    shape.y = item.y;
                    shape.graphics.beginFill(0xff0000, 1);
                    shape.graphics.drawCircle(0, 0, 20);
                    shape.graphics.endFill();
                    this.editorView.addChild(shape);
                    shape["type"] = 1;
                    this.addShape(shape);
                    this.drawFormationFishPoint(shape, item.fishId, item.fishNum);
                }
                else if (type == 2) {
                    let shape = new egret.Shape();
                    shape.touchEnabled = true;
                    shape.x = item.x;
                    shape.y = item.y;
                    shape["type"] = 2;
                    this.editorView.addChild(shape);
                    this.addShape(shape);
                    shape.graphics.lineStyle(5, 0xff0000);
                    shape.graphics.moveTo(0, 0);
                    let endX = item.endX;
                    let endY = item.endY;
                    shape.graphics.lineTo(endX - shape.x, endY - shape.y);
                    shape["endX"] = endX;
                    shape["endY"] = endY;
                    shape.graphics.endFill();
                    this.drawFormationFishLine(shape, item.fishId, item.fishNum);
                }
                else if (type == 3) {
                    let shape = new egret.Shape();
                    shape.x = item.x;
                    shape.y = item.y;
                    shape.touchEnabled = true;
                    shape["type"] = 3;
                    this.editorView.addChild(shape);
                    this.addShape(shape);
                    shape.graphics.clear();
                    shape.graphics.lineStyle(5, 0xff0000);
                    shape.graphics.drawCircle(0, 0, item.r);
                    shape.graphics.endFill();
                    shape["r"] = item.r;
                    this.drawFormationFishCircular(shape, item.fishId, item.fishNum);
                }
            }
        }
        public drawFormationFish(shape: egret.Shape, fishid: number, num: number) {
            let fish = new FishSprite();
            fish.setFish(fishid);
            let type = shape["type"];
            if (type == 1) {
                this.drawFormationFishPoint(shape, fishid, num);
            }
            else if (type == 2) {
                this.drawFormationFishLine(shape, fishid, num);
            }
            else if (type == 3) {
                this.drawFormationFishCircular(shape, fishid, num);
            }
        }
        public drawFormationFishPoint(shape: egret.Shape, fishid: number, num: number) {
            shape["fishid"] = fishid;
            shape["num"] = num;
            let fish = new FishSprite();
            fish.setFish(fishid);
            fish.x = shape.x;
            fish.y = shape.y;
            this.editorView.addChild(fish);
            fish.shape = shape;
            this.addFish(fish);
        }
        public drawFormationFishLine(shape: egret.Shape, fishid: number, num: number) {
            shape["fishid"] = fishid;
            shape["num"] = num;
            let startPoint = { x: shape.x, y: shape.y };
            let endPoint = { x: shape["endX"], y: shape["endY"] };
            for (let i: number = 0; i < num; i++) {
                let fish = new FishSprite();
                fish.setFish(fishid);
                fish.shape = shape;
                fish.x = startPoint.x + (endPoint.x - startPoint.x) / (num - 1) * i;
                fish.y = startPoint.y + (endPoint.y - startPoint.y) / (num - 1) * i;
                this.editorView.addChild(fish);
                this.addFish(fish);
            }
        }
        public drawFormationFishCircular(shape: egret.Shape, fishid: number, num: number) {
            shape["fishid"] = fishid;
            shape["num"] = num;
            let centerX = shape.x;
            let centerY = shape.y;
            let r = shape["r"];
            for (let i: number = 0; i < num; i++) {
                let fish = new FishSprite();
                fish.setFish(fishid);
                fish.x = centerX + r * Math.sin(Math.PI * 2 / num * i);
                fish.y = centerY + r * Math.cos(Math.PI * 2 / num * i);
                this.editorView.addChild(fish);
                fish.shape = shape;
                this.addFish(fish);
            }
        }
        public fishArray: Array<FishSprite> = [];
        public addFish(fish: FishSprite) {
            this.fishArray.push(fish);
            this.saveData();
        }
        public removeFish(fish: FishSprite) {
            this.fishArray.remove(fish);
            this.saveData();
        }
        public clearFish() {
            for (let item of this.fishArray) {
                if (item.parent) {
                    item.parent.removeChild(item);
                }
            }
            this.fishArray.clear();
            this.saveData();
        }
        public shapeArray: Array<egret.Shape> = [];

        public addShape(shape: egret.Shape) {
            this.shapeArray.push(shape);
            this.saveData();
        }
        public removeShape(shape: egret.Shape) {
            this.shapeArray.remove(shape);
            this.saveData();
        }
        public clearShape() {
            for (let item of this.shapeArray) {
                if (item.parent) {
                    item.parent.removeChild(item);
                }
            }
            this.shapeArray.clear();
        }

        public deleteFormation(id: number) {
            DataCenter.Instance.removeShapeData(id);
            DataCenter.Instance.removeFormation(id);
            this.formationList.selectedIndex = 0;
        }
        public saveData() {
            console.error(this.selectFormationSign)
            if (this.selectFormationSign < 1)
                return;
            let mainFish = this.fishArray.first((v: FishSprite) => v.mainFish);
            if (mainFish == null) {
                mainFish = this.fishArray[0];
            }
            let fishs: Array<{ fishid: number, offsetX: number, offsetY: number }> = [];
            if (mainFish) {
                let centerx = mainFish.x;
                let centery = mainFish.y;
                for (let item of this.fishArray) {
                    let offsetX = item.x - centerx;
                    let offsetY = item.y - centery;
                    fishs.push({ fishid: item.sign, offsetX: offsetX, offsetY: offsetY })
                }
            }
            DataCenter.Instance.changedFormation(this.selectFormationSign, fishs);

            let shapeData: Array<{ shapeType: number, x: number, y: number, r: number, endX: number, endY: number, fishNum: number, fishId: number }> = [];
            for (let item of this.shapeArray) {
                shapeData.push({ shapeType: item["type"], x: item.x, y: item.y, r: item["r"], endX: item["endX"], endY: item["endY"], fishNum: item["num"], fishId: item["fishid"] })
            }
            DataCenter.Instance.changedShapeData(this.selectFormationSign, shapeData);
        }
    }

    export class FishSprite extends egret.Sprite {
        private fish: egret.MovieClip;
        constructor() {
            super();
            this.addFish(this.sign);
            this.touchChildren = false;
            this.touchEnabled = true;
        }
        public sign: number = 1;
        private addFish(sign: number) {
            this.sign = sign;
            if (this.fish && this.fish.parent) {
                this.removeChild(this.fish);
            }
            this.fish = DataCenter.Instance.getFishRes(sign);
            this.addChild(this.fish);
        }
        public setFish(sign: number) {
            this.addFish(sign);
        }

        public shape: egret.Shape;

        private _mainFish: boolean = false;
        public set mainFish(b: boolean) {
            this._mainFish = b;
            if (b) {
                let matrix =
                    [1, 0, 0, 0, 0xff * 0.2,// red
                        0, 1, 0, 0, 0xe0 * 0.2,// green
                        0, 0, 1, 0, 0x8d * 0.2,// blue
                        0, 0, 0, 1, 0];				 // alpha
                this.fish.filters = [new egret.ColorMatrixFilter(matrix)];
            }
            else {
                this.fish.filters = [];
            }
        }
        public get mainFish(): boolean {
            return this._mainFish;
        }
    }

    export class FishItem extends eui.ItemRenderer {
        constructor() {
            super();
            this.skinName = new FishListSkin();
        }
        public dataChanged() {
            let data: table.TableFishConfig = this.data;
            let res = DataCenter.Instance.getFishRes(data.sign);
            res.x = this.width / 2;
            res.y = this.height / 2;
            this.addChild(res);
            res.gotoAndStop(0);
            let ratio = 0.3;
            if (res.width > 400 || res.height > 400) {
                ratio = 0.1;
            }
            res.scaleX = ratio;
            res.scaleY = ratio;
        }
    }

}