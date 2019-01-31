// TypeScript file
class EditPath extends egret.DisplayObjectContainer {
    constructor() {
        super();
        this.width = 1280;
        this.height = 720;
        this.init();
    }
    public init() {
        let rect = new eui.Rect();
        rect.width = this.width;
        rect.height = this.height;
        this.addChild(rect);

        for (let i = 0; i < 1280; i+=10) {
            var shp: egret.Shape = new egret.Shape();
            shp.graphics.lineStyle(1, 0x00ff00);
            shp.graphics.moveTo(i, 0);
            shp.graphics.lineTo(i, 720);
            shp.graphics.endFill();
            this.addChild(shp);
        }
        for (let i = 0; i < 720; i+=10) {
            var shp: egret.Shape = new egret.Shape();
            shp.graphics.lineStyle(1, 0x00ff00);
            shp.graphics.moveTo(0, i);
            shp.graphics.lineTo(1280, i);
            shp.graphics.endFill();
            this.addChild(shp);
        }
        
    }
}