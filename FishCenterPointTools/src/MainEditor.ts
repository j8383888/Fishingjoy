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
                this.editFishMovieClip.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onEditCenterPoint, this);
            }
            let movieClip = DataCenter.Instance.getFishRes(sign);
            this.editFishGroup.addChild(movieClip);
            movieClip.play(-1);
            this.editFishMovieClip = movieClip;
            this.editFishMovieClip.touchEnabled = true;
            this.editFishMovieClip.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onEditCenterPoint, this);
            let fishCenter = DataCenter.Instance.fishCenterPoint[sign];
            fishCenter = fishCenter == null ? { x: 0, y: 0 } : fishCenter;
            let shape = new egret.Shape();
            shape.x = fishCenter.x;
            shape.y = fishCenter.y;
            shape.alpha = 0.7;
            this.editFishGroup.addChild(shape);
            shape.graphics.beginFill(0xff0000, 1);
            shape.graphics.drawCircle(0, 0, 10);
            shape.graphics.endFill();
            this.curShape = shape;
            this.editFishGroup.addChild(this.curShape);
        }
        public get selectFishSigon() {
            return this.fishList.selectedItem.sign;
        }
        public curShape: egret.Shape;

        private onItemTap(e: eui.ItemTapEvent) {
            let data: table.TableFishConfig = e.item;
            this.changedEditFish(data.sign);
        }
        private onClickTap(e: egret.TouchEvent) {
            if (e.target == this.saveButton) {
                DataCenter.Instance.SaveData();
            }
            else if (e.target == this.downButton) {
                window.location.href = DataCenter.Down_REMOTE_DATA_URL
            }
        }
        private onEditCenterPoint(e: egret.TouchEvent) {
            let point = this.editFishGroup.globalToLocal(e.stageX, e.stageY);
            if (this.curShape && this.curShape.parent) {
                this.curShape.parent.removeChild(this.curShape);
            }
            let shape = new egret.Shape();
            shape.x = point.x;
            shape.y = point.y;
            shape.alpha = 0.7;
            this.editFishGroup.addChild(shape);
            shape.graphics.beginFill(0xff0000, 1);
            shape.graphics.drawCircle(0, 0, 10);
            shape.graphics.endFill();
            this.curShape = shape;
            this.editFishGroup.addChild(this.curShape);
            DataCenter.Instance.addCenterPoint(this.selectFishSigon,{x:point.x,y:point.y});
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