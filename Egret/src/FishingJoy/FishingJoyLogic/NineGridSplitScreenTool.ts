/**
 * 九格分屏
 * @author suo
 */
import Point = egret.Point
module FishingJoy {
    export class NineGridSplitScreenTool {

        public static firstLineX: number = 0;
        public static secondLineX: number = 0;
        public static firstLineY: number = 0;
        public static secondLineY: number = 0;

        public pic: egret.Shape = new egret.Shape();


        public constructor() {

        }

        public static initValue(): void {
            let width = (uniLib.Global.screenWidth + 200) / 3;
            let height = (uniLib.Global.screenHeight + 200) / 3
            this.firstLineX = -100 + width;
            this.firstLineY = -100 + height;
            this.secondLineX = -100 + width * 2;
            this.secondLineY = -100 + height * 2;
        }

		/**
		 * 设置在哪一个格子
		 */
        public static setGridIndex(gameObj: gameObject.GameObjectCollider, dic: Dictionary) {
            gameObj.clearGridIndex();
            /*适用于长鱼 计算每个碰撞器的位置 计算量稍大*/
            if (gameObj.isAccurateCollider) {
                let len: number = gameObj.colliderAry.length;
                for (let i: number = 0; i < len; i++) {
                    let collider: Collider = gameObj.colliderAry[i];
                    this.analyseGridMap(collider.globePosPoint.x, collider.globePosPoint.y, gameObj, dic);
                }
            }
            /*仅关注宿主的位置 计算量小*/
            else {
                this.analyseGridMap(gameObj.x, gameObj.y, gameObj, dic);
            }
        }


		/**
		 * 写入字典
		 */
        public static writeInMap(gridIndex: Grid, gameObj: gameObject.GameObjectCollider, dic: Dictionary): void {
            let gameObjAry: gameObject.GameObjectCollider[] = dic.get(gridIndex);
            if (gameObjAry == null) {
                gameObjAry = new Array<gameObject.GameObjectCollider>()
                dic.set(gridIndex, gameObjAry);
            }
            if (gameObjAry.indexOf(gameObj) == -1) {
                gameObjAry.push(gameObj);
            }
        }

        /**
		 * 分析在哪个格子里
		 */
        public static analyseGrid(gameObj: gameObject.GameObjectCollider): void {
            let firstLineX: number = this.firstLineX;
            let secondLineX: number = this.secondLineX;
            let firstLineY: number = this.firstLineY;
            let secondLineY: number = this.secondLineY;
            let x: number = gameObj.x;
            let y: number = gameObj.y;

            if (UIUtil.inBorder(x, y)) {
                /*第一行*/
                if (y < firstLineY) {
                    if (x < firstLineX) {
                        gameObj.pushGridIndex(Grid.Grid_1);
                    }
                    else if (x >= firstLineX && x < secondLineX) {
                        gameObj.pushGridIndex(Grid.Grid_2);
                    }
                    else if (x >= secondLineX) {
                        gameObj.pushGridIndex(Grid.Grid_3);
                    }
                }
                /*第二行*/
                else if (y < secondLineY && y >= firstLineY) {
                    if (x < firstLineX) {
                        gameObj.pushGridIndex(Grid.Grid_4);
                    }
                    else if (x >= firstLineX && x < secondLineX) {
                        gameObj.pushGridIndex(Grid.Grid_5);
                    }
                    else if (x >= secondLineX) {
                        gameObj.pushGridIndex(Grid.Grid_6);
                    }
                }
                /*第三行*/
                else {
                    if (x < firstLineX) {
                        gameObj.pushGridIndex(Grid.Grid_7);
                    }
                    else if (x >= firstLineX && x < secondLineX) {
                        gameObj.pushGridIndex(Grid.Grid_8);
                    }
                    else if (x >= secondLineX) {
                        gameObj.pushGridIndex(Grid.Grid_9);
                    }
                }
            }
        }

		/**
		 * 分析在哪个格子里
		 */
        public static analyseGridMap(x: number, y: number, gameObj: gameObject.GameObjectCollider, dic: Dictionary): void {
            let firstLineX: number = this.firstLineX;
            let secondLineX: number = this.secondLineX;
            let firstLineY: number = this.firstLineY;
            let secondLineY: number = this.secondLineY;

            if (UIUtil.inBorder(x, y)) {
                /*第一行*/
                if (y < firstLineY) {
                    if (x < firstLineX) {
                        this.writeInMap(Grid.Grid_1, gameObj, dic);
                    }
                    else if (x >= firstLineX && x < secondLineX) {
                        this.writeInMap(Grid.Grid_2, gameObj, dic);
                    }
                    else if (x >= secondLineX) {
                        this.writeInMap(Grid.Grid_3, gameObj, dic);
                    }
                }
                /*第二行*/
                else if (y < secondLineY && y >= firstLineY) {
                    if (x < firstLineX) {
                        this.writeInMap(Grid.Grid_4, gameObj, dic);
                    }
                    else if (x >= firstLineX && x < secondLineX) {
                        this.writeInMap(Grid.Grid_5, gameObj, dic);
                    }
                    else if (x >= secondLineX) {
                        this.writeInMap(Grid.Grid_6, gameObj, dic);
                    }
                }
                /*第三行*/
                else {
                    if (x < firstLineX) {
                        this.writeInMap(Grid.Grid_7, gameObj, dic);
                    }
                    else if (x >= firstLineX && x < secondLineX) {
                        this.writeInMap(Grid.Grid_8, gameObj, dic);
                    }
                    else if (x >= secondLineX) {
                        this.writeInMap(Grid.Grid_9, gameObj, dic);
                    }
                }
            }
        }
    }
}

/**
 * 格子
 */
const enum Grid {
    Grid_1 = 0,
    Grid_2,
    Grid_3,
    Grid_4,
    Grid_5,
    Grid_6,
    Grid_7,
    Grid_8,
    Grid_9,
}
