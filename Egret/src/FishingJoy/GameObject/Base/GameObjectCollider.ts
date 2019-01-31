/**
 * 带碰撞器的物体对象
 * @author suo
 */
module gameObject {
	export class GameObjectCollider extends GameObjectRender {

		/**
		 * 在屏幕的哪个格子里
		 */
		public grid: number[] = [];
		/**
		 * 碰撞器
		 */
		public colliderAry: FishingJoy.Collider[] = [];
		/**
		 * 是否已经发生碰撞
		 */
		public isCollided: boolean = false;
		/**
		 * 是否需要精准碰撞检测
		 */
		public isAccurateCollider: boolean = false;
		// /**
		//  * 碰撞对象ID （用于在偶数帧 还是奇数帧 检测碰撞）
		//  */
		// public colliderObjID: number = 0;

		public constructor() {
			super()
		}

		/**
         * 初始化一次
         */
		public loadConfigData(data: IColliderConfigData): void {
			for (let i: number = 0; i < data.colliderAry.length; i++) {
				let colliderData: ICollider = data.colliderAry[i];
				let collider: FishingJoy.Collider = FishingJoy.Collider.creat(colliderData.posX, colliderData.posY, colliderData.radius);
				collider.setParent(this);
				this.colliderAry.push(collider);
			}
			if (data.isAccurateCollider) {
				this.isAccurateCollider = data.isAccurateCollider;
			}
		}


		/**
		 * 反初始化
		 */
		public uninitialize(): void {
			this.clearGridIndex();
			super.uninitialize();
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			if (this.colliderAry.length != 0) {
				for (let i: number = 0; i < this.colliderAry.length; i++) {
					this.colliderAry[i].recover();
				}
				this.colliderAry.length = 0;
			}
			super.dispose();
		}

		/**
		 * 添加一个屏幕格子坐标
		 */
		public pushGridIndex(index: Grid): void {
			if (this.grid.indexOf(index) == -1) {
				this.grid.push(index);
			}
		}

		/**
		 * 清除屏幕坐标
		 */
		public clearGridIndex(): void {
			if (this.grid.length != 0) {
				this.grid.length = 0;
			}
		}

		/**
		 * 是否在该屏幕坐标内
		 */
		public isExistGrid(gridIndex: number): boolean {
			return this.grid.indexOf(gridIndex) != -1;
		}

		/**
		 * 是否相交
		 */
		public static isIntersect(gameObjA: GameObjectCollider, gameObjB: GameObjectCollider): boolean {
			let gridA: number[] = gameObjA.grid;
			let gridB: number[] = gameObjB.grid;
			for (let i: number = 0; i < gridA.length; i++) {
				if (gameObjB.isExistGrid(gridA[i])) {
					return true
				}
			}
			return false;
		}


		// /**
		//  * 关闭或打开身上的所有碰撞器
		//  */
		// public openOrCloseAllCollider(isOpen: boolean): void {
		// 	let colliderAry: FishingJoy.Collider[] = this.colliderAry;
		// 	for (let i: number = 0; i < colliderAry.length; i++) {
		// 		colliderAry[i].isOpen = isOpen;
		// 	}
		// }
	}
}