/**
 * 层级管理
 * @author suo
 */
module FishingJoy {
    export class Canves extends egret.DisplayObjectContainer {

        constructor() {
			super();
			this.touchChildren = false;
			this.touchEnabled = false;
		}

		$hitTest(stageX: number, stageY: number):egret.DisplayObject {
            if(GlobeVars.isDraging) return null;
            if(this.touchEnabled || this.touchChildren)
            {
                return super.$hitTest(stageX, stageY);
            }
			return null;
		}

    }
}