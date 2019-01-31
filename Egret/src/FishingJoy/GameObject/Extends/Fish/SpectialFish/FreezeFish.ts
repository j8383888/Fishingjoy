/**
 * 冰冻鱼
 * @author suo
 */
module gameObject {
	export class FreezeFish extends Fish {

		public constructor() {
			super()
		}

		/**
         * 初始化
         */
		public initialize(): void {
			super.initialize();
			this.moviePlayer.play("effect", -1);
		}

		/**
		 * 反初始化
		 */
		public uninitialize(): void {
			this.moviePlayer.stop("effect");
			super.uninitialize();
		}

		/**
	 	 * 播放死亡动画并回收到资源池
	 	 */
		public playDieMov(cb: Handler): void {
			this._moviePlayer.play("die", 1, null, cb)
		}
	}
}