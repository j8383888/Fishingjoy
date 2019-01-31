
/**
 * 游戏对象创建工厂
 * @author suo
 */
module gameObject {

	export class GameObjectFactory {

		/**
		 * 单例
		 */
		private static _instance: GameObjectFactory = null;
		/**
		 * 对象字典
		 */
		private _objClassDic: SimpleMap<any> = new SimpleMap<any>();
		/**
		 * gid
		 */
		public gid: number = 0;

		constructor() {

			let i: number;
			for (i = GAMEOBJECT_SIGN.BULLET_SELF; i < GAMEOBJECT_SIGN.BULLET_SELF_3 + 1; i++) {
				this._objClassDic.set(i, gameObject.Bullet);
			}
			for (i = GAMEOBJECT_SIGN.BULLET_OTHER; i < GAMEOBJECT_SIGN.BULLET_OTHER_3 + 1; i++) {
				this._objClassDic.set(i, gameObject.Bullet);
			}
			for (i = GAMEOBJECT_SIGN.FishingNet_Green; i < GAMEOBJECT_SIGN.FishingNet_BLUE_3 + 1; i++) {
				this._objClassDic.set(i, gameObject.FishingNet);
			}
			for (i = GAMEOBJECT_SIGN.FishingNet_Self; i < GAMEOBJECT_SIGN.FishingNet_BROWN_3 + 1; i++) {
				this._objClassDic.set(i, gameObject.FishingNet);
			}

			this._objClassDic.set(GAMEOBJECT_SIGN.MASTER_WIN_EFF, gameObject.MasterWinEff);
			this._objClassDic.set(GAMEOBJECT_SIGN.BATTERY, gameObject.Battery);
			this._objClassDic.set(GAMEOBJECT_SIGN.MERMAID_EFF, gameObject.MermaidEff)
			this._objClassDic.set(GAMEOBJECT_SIGN.DRAGON_EFF, gameObject.DragonEff);
			this._objClassDic.set(GAMEOBJECT_SIGN.BOOM_EX_EFF, gameObject.BoomExEff);
			this._objClassDic.set(GAMEOBJECT_SIGN.DRAGON_TREASUR_EFF, gameObject.DragonCoinRainEff);
			this._objClassDic.set(GAMEOBJECT_SIGN.MERMAID_HEART_EFF, gameObject.MermaidHeartEff);


			for (let item of table.TableFishConfig.instance()) {
				/*冰冻鱼*/
				if (item.sign == GAMEOBJECT_SIGN.FREEZE_FISH) {
					this._objClassDic.set(item.sign, gameObject.FreezeFish);
				}
				/*电鳗*/
				else if (item.sign == GAMEOBJECT_SIGN.ELECTRIC_EEL) {
					this._objClassDic.set(item.sign, gameObject.ElectricEel);
				}
				/*金蟾*/
				else if (item.sign == GAMEOBJECT_SIGN.GOLD_TOAD) {
					this._objClassDic.set(item.sign, gameObject.GoldToad);
				}
				/*河豚*/
				else if (item.sign == GAMEOBJECT_SIGN.GLOBE_FISH) {
					this._objClassDic.set(item.sign, gameObject.GlobeFish);
				}
				/*炸弹鱼*/
				else if (item.sign == GAMEOBJECT_SIGN.BOOM_FISH) {
					this._objClassDic.set(item.sign, gameObject.BoomFish);
				}
				/*超级炸弹鱼*/
				else if (item.sign == GAMEOBJECT_SIGN.BOOM_EX_FISH) {
					this._objClassDic.set(item.sign, gameObject.BoomFishEx);
				}
				/*美人鱼*/
				else if (item.sign == GAMEOBJECT_SIGN.MERMAID) {
					this._objClassDic.set(item.sign, gameObject.Mermaid);
				}
				/*其他鱼*/
				else {
					this._objClassDic.set(item.sign, gameObject.Fish);
				}
			}
		}

		/**
		 * 获得单例
		 */
		public static get instance(): GameObjectFactory {
			if (this._instance == null) {
				this._instance = new GameObjectFactory();
			}
			return this._instance;
		}

		/**
		 * 创建一个GameObject
		 */
		public creatGameObject(sign: GAMEOBJECT_SIGN, varsData: IGameObjectVars = null, layerType: LAYER = LAYER.Fish): any {
			let gameObj: gameObject.GameObject = null;
			gameObj = gameObject.GameObjectPool.instance.tryGetGameObjInPool(sign);
			/*资源池无此资源*/
			if (gameObj == null) {
				let className: any = this._objClassDic.get(sign);
				gameObj = new className();
				gameObj.setData(sign, this.gid, varsData, layerType);
				this._loadConfig(sign, gameObj);
			}
			else {
				gameObj.setData(sign, this.gid, varsData, layerType);
			}
			gameObj.refCount++;
			gameObj.initialize();
			this._writeInMap(gameObj);
			this.gid++;
			return gameObj;
		}

		/**
		 * 对象回收
		 */
		public recoverGameObject(gameObj: GameObject): void {
			if (gameObj == null) {
				console.assert(false, "gameObj为空！")
				return;
			}
			if (egret.is(gameObj, "gameObject.Bullet")) {
				let bullet: Bullet = gameObj as Bullet;
				FishingJoy.FishingJoyLogic.instance.removeBulletInMap(bullet.servelID);
			}
			else if (egret.is(gameObj, "gameObject.Fish")) {
				let fish: Fish = gameObj as Fish;
				FishingJoy.FishingJoyLogic.instance.removeFishInMap(fish.servelID);
			}
			gameObj.uninitialize();
			GameObjectPool.instance.recoverGameObject(gameObj);
		}

		/**
		 * 加载资源
		 */
		private _loadConfig(sign: GAMEOBJECT_SIGN, gameObj: GameObject) {
			let configData: IGameObjectConfig = GameObjectConfigParse.configDic.get(sign);
			if (configData) {
				gameObj.loadConfigAsset(configData.configAsset);
				gameObj.loadConfigData(configData.configData);
			}
			else {
				console.assert(false, "找不到sign为" + sign + "资源配置！")
			}
		}

		/**
		 * 写入字典
		 */
		private _writeInMap(gameObject: GameObject): void {
			if (egret.is(gameObject, "gameObject.Fish")) {
				let fish: gameObject.Fish = gameObject as gameObject.Fish;
				FishingJoy.FishingJoyLogic.instance.addFishInMap(fish.servelID, fish)
			}
			else if (egret.is(gameObject, "gameObject.Bullet")) {
				let bullet: gameObject.Bullet = gameObject as gameObject.Bullet;
				FishingJoy.FishingJoyLogic.instance.addBulletInMap(bullet.servelID, bullet)
			}
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			this._objClassDic.clear();
			GameObjectFactory._instance = null;
		}
	}
}