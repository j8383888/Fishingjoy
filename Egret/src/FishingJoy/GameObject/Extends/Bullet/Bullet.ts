/**
 * 子弹
 * @author suo
 */
module gameObject {
	export class Bullet extends GameObjectCollider {

		/**
		 * 注册操作id
		 */
		private _registerAry: number[] = [];
		/**
		 * 伤害
		 */
		public damage: number = 1;
		/**
		 * 发射间隔
		 */
		public interval: number;
		/**
		 * 极速状态下的发射间隔
		 */
		public fastInterval: number;
		/**
		 * 目标鱼
		 */
		public targetFish: gameObject.Fish
		/**
		 * 子弹等级
		 */
		public level: number;
		/**
		 * 子弹速度
		 */
		public speed: number;
		/**
		 * 假子弹ID
		 */
		public static VIR_UID: number = -1

		/**
		 * 是否显示
		 */
		public get isVisible(): boolean {
			return (<IBulletVars>this.varsData).isVisible;
		}

		/**
		 * 是否为真
		 */
		public get isReal(): boolean {
			return (<IBulletVars>this.varsData).isReal;
		}

		/**
		 * 服务器id
		 */
		public get servelID(): number {
			return (<IBulletVars>this.varsData).servelID;
		}

		/**
		 * 玩家id
		 */
		public get playerID(): number {
			return (<IBulletVars>this.varsData).playerUID;
		}


		/**
		 * 出生时间
		 */
		public get bornTime(): number {
			return (<IBulletVars>this.varsData).bornTime;
		}

		/**
		 * 出生炮台
		 */
		public get battery(): Battery {
			return (<IBulletVars>this.varsData).battery;
		}

		constructor() {
			super();
			this.touchEnabled = false;
			this.touchChildren = false;
		}

		/**
         * 初始化一次
         */
		public loadConfigData(data: IBulletConfigData): void {
			super.loadConfigData(data);
			this.damage = data.damage;
			this.level = data.level;
			this.interval = data.interval;
			this.fastInterval = data.fastInterval;
			this.speed = data.speed;
		}

		/**
		 * 初始化
		 */
		public initialize(): void {
			super.initialize();
			let bulletVars: IBulletVars = this.varsData as IBulletVars;
			this.visible = this.isVisible;
			if (bulletVars.operation == null) {
				console.assert(false, "子弹未注册operationID");
			}
			if (bulletVars.servelID == undefined) {
				console.assert(false, "子弹没有servelID")
			}
			this.targetFish = bulletVars.targetFish;
			if (bulletVars.operation) {
				for (let i: number = 0; i < bulletVars.operation.length; i++) {
					this._registerAry.push(FishingJoy.OperationManager.instance.registerOperation(this, bulletVars.operation[i].type));
				}
			}
		}

		/**
		 * 反初始化
		 */
		public uninitialize(): void {
			for (let i: number = 0; i < this._registerAry.length; i++) {
				FishingJoy.OperationManager.instance.unregisterOperation(this._registerAry[i])
			}
			this._registerAry.length = 0;
			this.targetFish = null;
			super.uninitialize();
		}

		/**
		 * 击中鱼
		 */
		private _hitFish(hurtNum: number, fish: gameObject.Fish, Bullet: gameObject.Bullet): void {
			if (this.uID == Bullet.uID) {
				GameObjectFactory.instance.recoverGameObject(this);
			}
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			super.dispose();
		}

		/**
		 * 获取屏幕坐标
		 */
		public getGrid(): number {
			console.info("子弹所在格子：" + this.grid[0]);
			return this.grid[0];
		}
	}
}