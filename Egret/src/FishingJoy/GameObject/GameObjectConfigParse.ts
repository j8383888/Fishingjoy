/**
 * 游戏对象配置解析
 * @author suo
 */
module gameObject {
	export class GameObjectConfigParse {

		/**
		 * 配置字典
		 */
		public static configDic: SimpleMap<IGameObjectConfig> = new SimpleMap<IGameObjectConfig>();

		public constructor() {
			GameObjectConfigParse.configDic.set(GAMEOBJECT_SIGN.BATTERY, { configAsset: {}, configData: {} });

			/*子弹*/
			for (let item of table.TableBulletConfig.instance()) {
				GameObjectConfigParse.configDic.set(item.sign, {
					configAsset: {
						imageAry: item.imageAry
					}, configData: {
						colliderAry: item.colliderAry, speed: item.speed * uniLib.Global.screenWidth / 1280, level: item.level,
						interval: item.interval, fastInterval: item.fastInterval
					}
				});
			}






			/*6种渔网*/
			GameObjectConfigParse.configDic.set(GAMEOBJECT_SIGN.FishingNet_Green, {
				configAsset: {
					movieClipAry: [
						{ keyName: "idle", groupName: "FishingNetGray", actionName: "action", frameRate: 12 }]
				}, configData: { netNum: 1, colliderAry: [{ posX: 0, posY: 0 }] }
			});
			// GameObjectConfigParse.configDic.set(GAMEOBJECT_SIGN.FishingNet_BLUE_2, {
			// 	asset: {
			// 		movieClipAry: [
			// 			{ keyName: "idle", groupName: "fishingNetBlue", actionName: "action", offsetX: -60 },
			// 			{ keyName: "idle_2", groupName: "fishingNetBlue", actionName: "action", offsetX: 60 }]
			// 	}, initOnceData: { netNum: 2, colliderData: [{ posX: -60, posY: 0 }, { posX: 60, posY: 0 }] }
			// });
			// GameObjectConfigParse.configDic.set(GAMEOBJECT_SIGN.FishingNet_BLUE_3, {
			// 	asset: {
			// 		movieClipAry: [
			// 			{ keyName: "idle", groupName: "fishingNetBlue", actionName: "action", offsetX: -80 },
			// 			{ keyName: "idle_2", groupName: "fishingNetBlue", actionName: "action", offsetX: 80 },
			// 			{ keyName: "idle_3", groupName: "fishingNetBlue", actionName: "action", offsetY: -80 }]
			// 	}, initOnceData: { netNum: 3, colliderData: [{ posX: -80, posY: 0 }, { posX: 80, posY: 0 }, { posX: 0, posY: -80 }] }
			// });

			GameObjectConfigParse.configDic.set(GAMEOBJECT_SIGN.FishingNet_Self, {
				configAsset: {
					movieClipAry: [
						{ keyName: "idle", groupName: "fishingNetPurple", actionName: "action", frameRate: 12 }]
				}, configData: { netNum: 1, colliderAry: [{ posX: 0, posY: 0 }] }
			});
			// GameObjectConfigParse.configDic.set(GAMEOBJECT_SIGN.FishingNet_BROWN_2, {
			// 	asset: {
			// 		movieClipAry: [
			// 			{ keyName: "idle", groupName: "fishingNetBrown", actionName: "action", offsetX: -60 },
			// 			{ keyName: "idle_2", groupName: "fishingNetBrown", actionName: "action", offsetX: 60 }]
			// 	}, initOnceData: { netNum: 2, colliderData: [{ posX: -60, posY: 0 }, { posX: 60, posY: 0 }] }
			// });
			// GameObjectConfigParse.configDic.set(GAMEOBJECT_SIGN.FishingNet_BROWN_3, {
			// 	asset: {
			// 		movieClipAry: [
			// 			{ keyName: "idle", groupName: "fishingNetBrown", actionName: "action", offsetX: -80 },
			// 			{ keyName: "idle_2", groupName: "fishingNetBrown", actionName: "action", offsetX: 80 },
			// 			{ keyName: "idle_3", groupName: "fishingNetBrown", actionName: "action", offsetY: -80 }]
			// 	}, initOnceData: { netNum: 3, colliderData: [{ posX: -80, posY: 0 }, { posX: 80, posY: 0 }, { posX: 0, posY: -80 }] }
			// });




			/*美人鱼特效*/
			GameObjectConfigParse.configDic.set(GAMEOBJECT_SIGN.MERMAID_EFF, {
				configAsset: {
					movieClipAry:
					[

						{ keyName: "MR_Xiaoshi", groupName: "MR_fish", actionName: "action", offsetY: 0 },
						{ keyName: "Rainbow_loop", groupName: "Rainbow_loop", actionName: "action" },
						{ keyName: "Rainbow_start", groupName: "Rainbow_start", actionName: "action" },
						{ keyName: "cloud_left", groupName: "cloud_01", actionName: "action", offsetY: 120 },
						{ keyName: "cloud_right", groupName: "cloud_02", actionName: "action", offsetY: 140 },
						{ keyName: "Rainbow_coin", groupName: "Rainbow_coin", actionName: "action", offsetX: 20, offsetY: 40, frameRate: 10 }]
				}, configData: {}
			});

			/*金龙鱼特效*/
			GameObjectConfigParse.configDic.set(GAMEOBJECT_SIGN.DRAGON_EFF, {
				configAsset: {
					imageAry: [{ keyName: "TreasureBox-end", sourceName: "TreasureBox-end" }],
					movieClipAry:
					[
						{ keyName: "TreasureBox_vanish", groupName: "TreasureBox_vanish", actionName: "action", offsetY: 0, scaleX: 1, scaleY: 1 },
						{ keyName: "TreasureBox_box", groupName: "TreasureBox", actionName: "action", scaleX: 1, scaleY: 1 },
						{ keyName: "TreasureBox-coin", groupName: "TreasureBox-coin", actionName: "action", frameRate: 7 }]
				}, configData: {}
			});

			/*玩家大胜特效*/
			GameObjectConfigParse.configDic.set(GAMEOBJECT_SIGN.MASTER_WIN_EFF, {
				configAsset: {

					movieClipAry:
					[
						{ keyName: "masterWin_dibuguangyun", groupName: "masterWin_dibuguangyun", actionName: "action", scaleX: 2.5, scaleY: 2.5 },
						{ keyName: "masterWin_baofu", groupName: "masterWin_baofu", actionName: "action", frameRate: 8, offsetX: 0, offsetY: 0 },
						{ keyName: "masterWin_baofu1", groupName: "masterWin_baofu1", actionName: "action", frameRate: 8, offsetX: 0, offsetY: 8, blendMode: true },
						{ keyName: "masterWin_xinxin1", groupName: "masterWin_xinxin1", actionName: "action", frameRate: 8, offsetX: -130, offsetY: -25, blendMode: true },
						{ keyName: "masterWin_xinxin2", groupName: "masterWin_xinxin2", actionName: "action", frameRate: 8, offsetX: 125, offsetY: 40, blendMode: true },
						{ keyName: "masterWin_facai", groupName: "by_masterWinFaCai", actionName: "action", frameRate: 8, offsetX: 0, offsetY: 0 },
						{ keyName: "masterWin_facaisaoguang", groupName: "by_masterWinFaCai_soaguang", actionName: "action", frameRate: 8, offsetX: 0, offsetY: 5, blendMode: true }]
				}, configData: {}
			});

			/*超级爆炸鱼 爆炸特效*/
			GameObjectConfigParse.configDic.set(GAMEOBJECT_SIGN.BOOM_EX_EFF, {
				configAsset: {
					imageAry: [{ keyName: "by_BoomExSettle2", sourceName: "by_BoomExSettle2",scaleX: 2, scaleY: 2 },
					{ keyName: "by_BoomExSettle3", sourceName: "by_BoomExSettle3", scaleX: 4, scaleY: 4 }],
					movieClipAry:
					[
						{ keyName: "BoomEx_dieEffFrame", groupName: "BoomEx_dieEffFrame", actionName: "action" },
						{ keyName: "by_BoomExSettle", groupName: "by_BoomExSettle", actionName: "action" }]
				}, configData: {}
			});

			/*金龙宝藏 金币*/
			GameObjectConfigParse.configDic.set(GAMEOBJECT_SIGN.DRAGON_TREASUR_EFF, {
				configAsset: {

				}, configData: {}
			});

			/*美人鱼心型特效*/
			GameObjectConfigParse.configDic.set(GAMEOBJECT_SIGN.MERMAID_HEART_EFF, {
				configAsset: {

				}, configData: {}
			});


			/*鱼*/
			let fishConfig = table.TableFishConfig.instance()
			for (let item of fishConfig) {
				/*超级炸弹鱼*/
				if (item.sign == GAMEOBJECT_SIGN.BOOM_EX_FISH) {
					GameObjectConfigParse.configDic.set(item.sign, {
						configAsset: {
							imageAry: [{ keyName: "BoomFishEx_eff1", sourceName: "BoomFishEx_eff1", offsetY: 0 },
							{ keyName: "BoomFishEx_eff2", sourceName: "BoomFishEx_eff2", offsetY: 0 }],
							movieClipAry: item.movieClipAry
						}, configData: {
							colliderAry: item.colliderAry, speed: item.speed / 1000, odds: item.killOdds,
							anchorOffsetX: item.anchorOffset.x, anchorOffsetY: item.anchorOffset.y, isMirror: item.isMirror, isAccurateCollider: item.isAccurateCollider,
							fishType: item.fishType, fishScale: item.fishScale

						}, table: item
					});
				}
				/*炸弹鱼*/
				else if (item.sign == GAMEOBJECT_SIGN.BOOM_FISH) {
					GameObjectConfigParse.configDic.set(item.sign, {
						configAsset: { movieClipAry: item.movieClipAry }, configData: {
							/*爆炸范围*/
							boomRadius: 180,
							colliderAry: item.colliderAry, speed: item.speed / 1000, odds: item.killOdds,
							anchorOffsetX: item.anchorOffset.x, anchorOffsetY: item.anchorOffset.y, isMirror: item.isMirror, isAccurateCollider: item.isAccurateCollider,
							fishType: item.fishType, fishScale: item.fishScale
						}, table: item
					});
				}
				/*河豚*/
				else if (item.sign == GAMEOBJECT_SIGN.GLOBE_FISH) {
					GameObjectConfigParse.configDic.set(item.sign, {
						configAsset: {
							imageAry: [{ keyName: "effec1", sourceName: "hetunCircle_green" },
							{ keyName: "effec2", sourceName: "hetunCircle_yellow" },
							{ keyName: "effec3", sourceName: "hetunCircle_orange" }],
							movieClipAry: item.movieClipAry
						}, configData: {
							colliderAry: item.colliderAry, speed: item.speed / 1000, odds: item.killOdds,
							anchorOffsetX: item.anchorOffset.x, anchorOffsetY: item.anchorOffset.y, isMirror: item.isMirror, isAccurateCollider: item.isAccurateCollider,
							fishType: item.fishType, fishScale: item.fishScale
						}, table: item
					});
				}

				else {
					GameObjectConfigParse.configDic.set(item.sign, {
						configAsset: { movieClipAry: item.movieClipAry }, configData: {
							colliderAry: item.colliderAry, speed: item.speed / 1000, odds: item.killOdds,
							anchorOffsetX: item.anchorOffset.x, anchorOffsetY: item.anchorOffset.y, isMirror: item.isMirror, isAccurateCollider: item.isAccurateCollider,
							fishType: item.fishType, fishScale: item.fishScale
						}, table: item
					});
				}
			}
		}

		/**
		 * 根据标识获得配置数据
		 */
		public static getConfigBySign(sign: GAMEOBJECT_SIGN): IGameObjectConfig {
			return GameObjectConfigParse.configDic.get(sign);
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			GameObjectConfigParse.configDic.clear();
		}
	}
}