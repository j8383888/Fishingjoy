/**
 * UI工具
 * @author suo
 */
module FishingJoy {
	export class UIUtil {

		public constructor() {
		}

		/** 
		 * @param contentBox 内容盒子
		 * @param item 项
		 * @param num 总数量
		 * @param col 列
		 * @param spacing 左右间距
		 * @param lending 垂直间距
		 * @param offsetX X偏移
		 * @param offsetY Y偏移
		 * @return itemList 项list
		 * 网格布局
		 */
		public static setItemGridLayout(contentBox: egret.DisplayObjectContainer, item: egret.DisplayObject, num: number, col: number, spacing: number = 0,
			lending: number = 0, offsetX: number = 0, offsetY: number = 0): void {
			for (var i: number = 0; i < num; i++) {
				var pos: [number, number] = this.getGridItemPos(i, item, col, spacing, lending, offsetX, offsetY)
				item.x = pos[0];
				item.y = pos[1];
				contentBox.addChild(item);
			}
		}

		/**
		 * 传入索引 获得该Index Item坐标
		 */
		public static getGridItemPos(index: number, item: egret.DisplayObject, col: number, spacing: number = 0,
			lending: number = 0, offsetX: number = 0, offsetY: number = 0): [number, number] {
			/**列数量*/
			var x: number = (index % col) * (item.width + spacing) + offsetX;
			var y: number = Math.floor(index / col) * (item.height + lending) + offsetY;
			return [x, y];
		}

		/**
		 * 置灰
		 */
		public static setGray(target: egret.DisplayObject): void {
			var matrix: Array<number> = [0.3086, 0.6094, 0.0820, 0, 0,// red
				0.3086, 0.6094, 0.0820, 0, 0,// green
				0.3086, 0.6094, 0.0820, 0, 0,// blue
				0, 0, 0, 1, 0];
			var stateFilter: egret.ColorMatrixFilter = new egret.ColorMatrixFilter(matrix);
			target.filters = [stateFilter];
		}

		/**
		 * 恢复正常
		 */
		public static setNomarl(target: egret.DisplayObject): void {
			if (target) {
				target.filters = [];
			}
		}

		/**
		 * 高亮
		 */
		public static setLight(target: egret.DisplayObject): void {
			var matrix: Array<number> = [1, 0, 0, 0, 0xff * 0.2, // red
				0, 1, 0, 0, 0xe0 * 0.2, // green
				0, 0, 1, 0, 0x8d * 0.2, // blue
				0, 0, 0, 1, 0];// alpha
			var stateFilter: egret.ColorMatrixFilter = new egret.ColorMatrixFilter(matrix);
			target.filters = [stateFilter];
		}

		/**
		 * 变红色
		 */
		public static setRed(target: egret.DisplayObject): void {
			var matrix: Array<number> = [1, 0.964, 0.999, 0.96, 0xff * 0.2, // red
				0, 1, 0, 0, 0, // green
				0, 1, 1, 0, 0, // blue
				0, 0, 0, 1, 0];// alpha
			var stateFilter: egret.ColorMatrixFilter = new egret.ColorMatrixFilter(matrix);
			target.filters = [stateFilter];
		}


		/**
		 * 从显示列表内移除自身
		 */
		public static removeSelf(...rest) {
			var len: number = rest.length
			for (var i: number = 0; i < len; i++) {
				var target = rest[i];
				if (egret.is(target, "egret.DisplayObject")) {
					if (target.parent && target) {
						target.parent.removeChild(target);
					}
				}
			}
		}

		/**
		 * 格式化金币
		 */
		public static formatMoneny(value: number): string {
			let str: string;
			if (value > 1000000000) {
				str = value / 1000000000 + "M";
			}
			else if (value > 10000) {
				str = value / 10000 + "W"
			}
			else if (value > 1000) {
				str = value / 1000 + "K"
			}
			else {
				str = value.toString();
			}
			return str;
		}

		/**
		 * 创建影片剪辑
		 */
		public static creatMovieClip(groupName: string, action: string = "action"): egret.MovieClip {
			var data: JSON = RES.getRes(groupName + "_json");
			var txtr = RES.getRes(groupName + "_png");
			var mcFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory(data, txtr);
			return new egret.MovieClip(mcFactory.generateMovieClipData(action));
		}

		/**
		 * 播放一次自动从舞台移除
		 */
		public static movPlayOnce(box: egret.DisplayObjectContainer, mov: egret.MovieClip, posX: number, posY: number, scaleX: number = 1, scaleY: number = 1,
			cb: Handler = null, delay?: number) {
			box.addChild(mov);
			mov.x = posX;
			mov.y = posY;
			mov.scaleX = scaleX;
			mov.scaleY = scaleY;
			mov.gotoAndPlay(1, 1);
			if (delay) {
				FishingJoy.Laya.timer.once(delay, this, () => {
					mov.stop();
					if (mov.parent)
						box.removeChild(mov);
					if (cb) {
						cb.run();
					}
				});
			}
			else {
				mov.once(egret.MovieClipEvent.COMPLETE, () => {
					if (mov) {
						mov.stop();
						if (mov.parent)
							box.removeChild(mov);
					}
					if (cb) {
						cb.run();
					}
				}, this)
			}
		}


		/**
		 * 循环加法
		 */
		public static circleAdd(value: number, addNum: number, maxNum: number): number {
			value += addNum;
			if (value > maxNum) {
				value -= maxNum + 1;
			}
			return value;
		}


		/**
		 * 创建龙骨
		 */
		public static creatDragonbones(groupName: string, armatureName = "armatureName"): dragonBones.EgretArmatureDisplay {
			let egretFactory: dragonBones.EgretFactory = dragonBones.EgretFactory.factory;
			if (egretFactory.getDragonBonesData(groupName) == null) {
				var dragonbonesData = RES.getRes("test_ske_dbbin");
				var textureData = RES.getRes("test_tex_json");
				var texture = RES.getRes("test_tex_png");
				egretFactory.parseDragonBonesData(dragonbonesData, groupName);
				egretFactory.parseTextureAtlasData(textureData, texture, groupName);
			}
			let armatureDisplay: dragonBones.EgretArmatureDisplay = egretFactory.buildArmatureDisplay(armatureName, groupName);
			return armatureDisplay;
		}

		/**
		 * 是否在边界内
		 */
		public static inBorder(x: number, y: number): boolean {
			if (x < -100 || x > uniLib.Global.screenWidth + 100) {
				return false
			}
			if (y < -100 || y > uniLib.Global.screenHeight + 100) {
				return false;
			}
			return true;
		}

		/**
		 * 在视图内
		 */
		public static inView(x: number, y: number): boolean {
			if (x < 0 || x > uniLib.Global.screenWidth) {
				return false
			}
			if (y < 0 || y > uniLib.Global.screenHeight) {
				return false;
			}
			return true;
		}

		/**
		 * 在瞄准范围内
		 */
		public static inAimView(x: number, y: number): boolean {
			if (x < 30 || x > uniLib.Global.screenWidth - 30) {
				return false
			}
			if (y < 30 || y > uniLib.Global.screenHeight - 30) {
				return false;
			}
			return true;
		}

		/**
		 * 在瞄准范围内
		 */
		public static inAimView2(x: number, y: number): boolean {
			if (x < 200 || x > uniLib.Global.screenWidth - 200) {
				return false
			}
			if (y < 200 || y > uniLib.Global.screenHeight - 200) {
				return false;
			}
			return true;
		}


		/**
		 * 通过角度获得弧度
		 */
		public static getRadian(angle: number): number {
			return angle * Math.PI / 180;
		}

		/**
		 * 通过弧度获得角度
		 */
		public static getAngle(radian: number): number {
			return radian * 180 / Math.PI;
		}

		/**
		 * 设置对象跳跃动画
		 */
		public static setJumpTween(target: egret.DisplayObject, JumpMaxY: number, JumpMinY: number, durationTime: number = 1000, waitTime: number = MathUtil.random(0, 3000)): void {
			egret.Tween.get(target).to({ scaleX: 1, scaleY: 1, y: JumpMinY }, durationTime, egret.Ease.bounceOut).wait(waitTime).call(() => {
				egret.Tween.get(target).to({ scaleX: 0.9, scaleY: 1.1, y: JumpMaxY }, durationTime, egret.Ease.bounceIn).call(this.setJumpTween, this, [target, JumpMaxY, JumpMinY, durationTime])
			}, this);
		}

		/**
		 * 设置对象呼吸动画
		 */
		public static setBreatheTween(target: egret.DisplayObject, durationTime: number): void {
			egret.Tween.get(target).to({ alpha: 0 }, durationTime).call(() => {
				egret.Tween.get(target).to({ alpha: 1 }, durationTime).wait(500).call(this.setBreatheTween, this, [target, durationTime])
			}, this);
		}

		/**
		 * 设置对象缩放动画
		 */
		public static setScaleTween(target: egret.DisplayObject, scaleXGene: number, scaleYGene: number, durationTime: number = 600): void {
			egret.Tween.get(target).to({ scaleX: 1.1 * scaleXGene, scaleY: 1.1 * scaleYGene }, durationTime).call(() => {
				egret.Tween.get(target).to({ scaleX: 0.9 * scaleXGene, scaleY: 0.9 * scaleYGene }, durationTime).call(this.setScaleTween, this, [target, scaleXGene, scaleYGene, durationTime])
			}, this);
		}

		/**
		 * 设置对象上下移动动画
		 */
		public static setDownUpTween(target: egret.DisplayObject, MaxY: number, MinY: number, durationTime: number = 1000): void {
			egret.Tween.get(target).to({ y: MaxY }, durationTime).call(() => {
				egret.Tween.get(target).to({ y: MinY }, durationTime).call(this.setDownUpTween, this, [target, MaxY, MinY, durationTime])
			}, this);
		}

		/**
		 * 局部坐标转全局
		 */
		public static localToGlobal(target: egret.DisplayObject, localX: number = 0, localY: number = 0): [number, number] {
			let p: egret.Point = Point.create(0, 0);
			p = target.localToGlobal(localX, localY, p);
			let x: number = p.x;
			let y: number = p.y;
			Point.release(p);
			return [x, y];
		}
		/**
		 * 炮台中性点的全局坐标
		 */
		private static batteryFocusGlobalPoint: { [seatId: number]: [number, number] } = {};
		/**
		 * 获取炮台中性点的全局坐标
		 */
		static getBatteryFocusGlobalPoint(battery: gameObject.Battery): [number, number] {
			let point = UIUtil.batteryFocusGlobalPoint[battery.seatID];
			if (!point) {
				let bulletPoint: egret.Point = Point.create(0, 0);
				battery.focus.localToGlobal(0, 0, bulletPoint);
				point = [bulletPoint.x, bulletPoint.y];
				Point.release(bulletPoint);
				UIUtil.batteryFocusGlobalPoint[battery.seatID] = point;
			}
			return point;
		}

		/**
		* 相对于fish层级 炮台位置和舞台点的角度
		*/
		public static calculateBatteryRotation(battery: gameObject.Battery, stageX: number, stageY: number): number {
			let [x, y] = UIUtil.getBatteryFocusGlobalPoint(battery);
			let rotation = GX.getRadianByPoint({ x: x, y: y }, { x: stageX, y: stageY })
			if (FishingJoy.Master.instance.seatID > 2) {
				rotation += 180;
				if (rotation > 360)
					rotation -= 360;
			}
			return rotation;
		}

		/**
		 * 是否能够瞄准
		 */
		public static isCanAim(gameObj: gameObject.GameObjectCollider): boolean {
			let [x, y]: [number, number] = [-1, -1,];
			if (gameObj.isAccurateCollider) {
				for (let i: number = 0; i < gameObj.colliderAry.length; i++) {
					let collider: FishingJoy.Collider = gameObj.colliderAry[i];
					[x, y] = UIUtil.localToGlobal(collider);
					if (UIUtil.inAimView(x, y)) {
						return true;
					}
				}
			}
			else {
				[x, y] = UIUtil.localToGlobal(gameObj);
				if (UIUtil.inAimView(x, y)) {
					return true;
				}
			}
			return false;
		}

		/**
		 * 相对于fish层局部坐标转全局
		 */
		public static getGlobePos(target: egret.DisplayObject): [number, number] {
			let p: egret.Point = Point.create(0, 0);
			target.localToGlobal(0, 0, p);
			if (Master.instance.isRotation) {
				let layer: egret.DisplayObjectContainer = LayerManager.instance.getLayer(LAYER.Fish);
				layer.localToGlobal(p.x, p.y, p)
			}
			let x: number = p.x;
			let y: number = p.y;
			Point.release(p);
			return [x, y];
		}

		/**
		 * 转换金币文本
		 */
		public static traGoldLabel(label: eui.BitmapLabel): void {
			if (game.Config.PublicGoldFont) {
				label.font = game.Config.PublicGoldFont;
			}
		}

		/**
		 * 影片剪辑播放完毕自动移除
		 */
		public static playAndAutoRemove(mov: egret.MovieClip, playTime: number, cb?: Handler): void {
			mov.gotoAndPlay(1, playTime);
			if (playTime != -1) {
				mov.once(egret.MovieClipEvent.COMPLETE, (e: egret.MovieClipEvent) => {
					let mov = e.target;
					if (mov) {
						mov.parent.removeChild(mov);
						if (cb)
							cb.run();
					}
				}, null)
			}
		}
	}
}