/**
 * 操作控制器基类
 * @author suo
 */
module FishingJoy {
    export abstract class BaseOperation {

        /**
         * 操作类型
         */
        public operationType: OPERATION_TYPE;

        constructor() {

        }
        /**
         * 父类重写register
         */
        public abstract register(gameObj: gameObject.GameObject): void

        /**
         * 父类重写unregister
         */
        public abstract unregister(): void


        public enterFrame(): void {

        }

    }
}