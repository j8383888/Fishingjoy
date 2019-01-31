// TypeScript file
module editor {

    //底注按钮;
    export class MainEditor extends eui.Component {
        constructor() {
            super();
            this.skinName = "MainEditorSkin";
            this.initUI();
        }
        private fishList: eui.List;
        private editorView: eui.Group;
        private editFishGroup: eui.Group;

        private deleteButton: eui.Button;
        private saveButton: eui.Button;
        private downButton: eui.Button;

        private editFishMovieClip: egret.MovieClip;
        public initUI() {
            DataCenter.Instance.LoadData();
            this.fishList.itemRenderer = FishItem;
            this.fishList.dataProvider = new eui.ArrayCollection(table.TableFishConfig.instance());

            this.fishList.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.onItemTap, this);
            let gapX = 10;
            let gapY = 10;
            for (let j: number = 0; j < this.editorView.height / gapX; j++) {
                var shp: egret.Shape = new egret.Shape();
                shp.graphics.lineStyle(2, 0x00ff00);
                shp.graphics.moveTo(0, j * gapY);
                shp.graphics.lineTo(this.editorView.width, j * gapY);
                shp.graphics.endFill();
                shp.alpha = 0.5;
                this.editorView.addChildAt(shp, 0);
            }
            for (let i: number = 0; i < this.editorView.width / gapX; i++) {
                var shp: egret.Shape = new egret.Shape();
                shp.graphics.lineStyle(2, 0x00ff00);
                shp.graphics.moveTo(i * gapX, 0);
                shp.graphics.lineTo(i * gapX, this.editorView.height);
                shp.graphics.endFill();
                shp.alpha = 0.5;
                this.editorView.addChildAt(shp, 0);
            }
            this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onClickTap, this);
        }

        public changedEditFish(sign: number) {
            this.editFishGroup.removeChildren();
            if (this.editFishMovieClip && this.editFishMovieClip.parent) {
                this.editFishMovieClip.parent.removeChild(this.editFishMovieClip);
                this.editFishMovieClip.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onEditRegion, this);
                egret.MainContext.instance.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.onEditRegion, this);
                egret.MainContext.instance.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.onEditRegion, this);
            }
            let movieClip = DataCenter.Instance.getFishRes(sign);
            this.editFishGroup.addChild(movieClip);
            movieClip.play(-1);
            this.editFishMovieClip = movieClip;
            this.editFishMovieClip.touchEnabled = true;
            this.editFishMovieClip.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onEditRegion, this);
            egret.MainContext.instance.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.onEditRegion, this);
            egret.MainContext.instance.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.onEditRegion, this);
            let fishRegion = DataCenter.Instance.fishRegionMap[sign];
            if (fishRegion) {
                for (let item of fishRegion) {
                    let shape = new egret.Shape();
                    shape.x = item.posX;
                    shape.y = item.posY;
                    shape.touchEnabled = true;
                    shape.alpha = 0.4;
                    this.editFishGroup.addChild(shape);
                    shape.graphics.beginFill(0xff0000, 1);
                    shape.graphics.drawCircle(0, 0, item.radius);
                    shape.graphics.endFill();
                    shape["data"] = { posX: shape.x, posY: shape.y, radius: item.radius };
                    let regions = this.fishRegionMap[sign];
                    if (regions == null) {
                        regions = [];
                    }
                    regions.push(shape);
                    this.fishRegionMap[sign] = regions;
                }
            }
        }
        public get selectFishSigon() {
            return this.fishList.selectedItem.sign;
        }
        public selectShape: egret.Shape;

        public isStartEdit: boolean;
        /**
         * 当前画的区域
         */
        private drawShape: egret.Shape;
        private onEditRegion(e: egret.TouchEvent) {
            if (e.type == egret.TouchEvent.TOUCH_BEGIN) {
                this.isStartEdit = true;
                this.drawShape = new egret.Shape();
                let point = this.editFishGroup.globalToLocal(e.stageX, e.stageY);
                this.drawShape.x = point.x;
                this.drawShape.y = point.y;
                this.drawShape.touchEnabled = true;
                this.drawShape.alpha = 0.4;
                this.editFishGroup.addChild(this.drawShape);
            }
            if (e.type == egret.TouchEvent.TOUCH_MOVE) {
                if (!this.isStartEdit)
                    return;
                this.drawShape.graphics.clear();
                this.drawShape.graphics.beginFill(0xff0000, 1);
                let point = this.editFishGroup.globalToLocal(e.stageX, e.stageY);
                this.drawShape.graphics.drawCircle(0, 0, this.getDistanceByPoint({ x: this.drawShape.x, y: this.drawShape.y }, { x: point.x, y: point.y }));
                this.drawShape.graphics.endFill();
            }
            if (e.type == egret.TouchEvent.TOUCH_END) {
                if (!this.isStartEdit)
                    return;
                if (e.stageY > this.editorView.y + this.editorView.height
                    || e.stageX < this.editorView.x) {
                    if (this.drawShape.parent) {
                        this.editFishGroup.removeChild(this.drawShape);
                    }
                }
                else {
                    let point = this.editFishGroup.globalToLocal(e.stageX, e.stageY);
                    this.drawShape["data"] = { posX: this.drawShape.x, posY: this.drawShape.y, radius: this.getDistanceByPoint({ x: this.drawShape.x, y: this.drawShape.y }, { x: point.x, y: point.y }) }
                    this.selectShape = this.drawShape;
                    this.addFishRegion(this.selectFishSigon, this.drawShape);
                }
                this.isStartEdit = false;
            }
        }
        private onItemTap(e: eui.ItemTapEvent) {
            let data: table.TableFishConfig = e.item;
            this.changedEditFish(data.sign);
        }
        private onClickTap(e: egret.TouchEvent) {
            if (e.target == this.deleteButton) {
                if (this.selectShape == null)
                    return;
                if (this.selectShape && this.selectShape.parent) {
                    this.editFishGroup.removeChild(this.selectShape);
                }
                this.removeFishRegion(this.selectFishSigon, this.selectShape)
            }
            else if (e.target == this.saveButton) {
                DataCenter.Instance.SaveData();
            }
            else if (e.target == this.downButton) {
                window.location.href = DataCenter.Down_REMOTE_DATA_URL
            }
            if (e.target instanceof egret.Shape) {
                this.selectShape = e.target;
            }
            else {
                this.selectShape = null;
            }
        }
        /**
     *获取俩点的距离
     */
        public getDistanceByPoint(p1, p2) {
            var x = Math.abs(p1.x - p2.x);
            var y = Math.abs(p1.y - p2.y);
            return Math.sqrt(x * x + y * y);
        }
        public fishRegionMap: { [sign: number]: Array<egret.Shape> } = {};

        public addFishRegion(sign: number, region: egret.Shape) {
            let regions = this.fishRegionMap[sign];
            if (regions == null) {
                regions = [];
            }
            regions.push(region);
            this.fishRegionMap[sign] = regions;
            DataCenter.Instance.addFishRegion(sign, region["data"]);
        }
        public removeFishRegion(sign: number, region: egret.Shape) {
            let regions = this.fishRegionMap[sign];
            if (regions == null) {
                return;
            }
            for (let i: number = 0; i < regions.length; i++) {
                let item = regions[i];
                if (item == region) {
                    regions.splice(i, 1);
                    break;
                }
            }
            DataCenter.Instance.removeFishRegion(sign, region["data"]);
        }
    }

    //底注按钮;
    export class FishItem extends eui.ItemRenderer {
        constructor() {
            super();
            this.skinName = "FishListSkin";
        }
        public dataChanged() {
            let data: table.TableFishConfig = this.data;
            let res = DataCenter.Instance.getFishRes(data.sign);
            res.x = this.width / 2;
            res.y = this.height / 2;
            this.addChild(res);
            res.gotoAndStop(0);
            let ratio = 0.4;
            if (res.width > 400 || res.height > 400) {
                ratio = 0.1;
            }
            res.scaleX = ratio;
            res.scaleY = ratio;
        }
    }

}