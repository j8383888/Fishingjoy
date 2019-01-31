/**
 * <code>Laya</code> 是全局对象的引用入口集。
 * Laya类引用了一些常用的全局对象，使用时注意大小写。
 * author suo
 */
module FishingJoy {
    export class Laya {
        /** 逻辑时间管理器的引用，不允许缩放。*/
        public static timer: Timer = null;

        public constructor() {

        }

        /**
         * 初始化
         */
        public static init(): void {
            FishingJoy.Laya.timer = new Timer();
        }
    }
}