/**
 * 爆炸鱼
 * @author suo
 */
module gameObject {
	export class BoomFish extends Fish {

		/**
		 * 爆炸碰撞器
		 */
		public burstCollider: FishingJoy.Collider;

		public constructor() {
			super();
		}

		/**
		 * 加载配置数据
		 */
		public loadConfigData(data: IBoomFishConfig): void {
			super.loadConfigData(data);
			this.burstCollider = FishingJoy.Collider.creat(0, 0, data.boomRadius)
			this.burstCollider.setParent(this);
		}

		/**
		 * 释放
		 */
		public dispose(): void {

			this.burstCollider.recover();
			super.dispose();
		}
	}
}