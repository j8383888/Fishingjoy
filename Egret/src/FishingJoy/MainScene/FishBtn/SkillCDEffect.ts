/**
* 技能cd特效
* r:圆的半径
* skillTimer:技能时间
* color:圆环的填充颜色
**/
module FishingJoy {
	export class SkillCDEffect extends egret.Sprite {
		private shape: egret.Shape;
		private RectMy: eui.Rect;
		private layeMy: egret.DisplayObjectContainer;
		// private labelMy: eui.Label;


		private label: eui.Label
		public constructor(layer: egret.DisplayObjectContainer, x: number, y: number, width: number, heith: number, Continued: number, cooling: number, type: number) {
			super();
			this.layeMy = layer;
			this.clickAnimation(layer, x, y, width, heith, Continued, cooling, type)
		}
		/**
		 * 点击动效
		 */
		public clickAnimation(layer: egret.DisplayObjectContainer, x: number, y: number, width: number, heith: number, Continued: number, cooling: number, type: number) {
			this.initGraphics(layer, x, y);
			this.changeGraphics(Continued, cooling, type, x);
			this.RectMy = new eui.Rect();
			let RectMy = this.RectMy;
			layer.addChild(RectMy);
			RectMy.width = width;
			RectMy.touchEnabled = false;
			RectMy.height = heith;
			RectMy.anchorOffsetX = RectMy.width / 2;
			RectMy.anchorOffsetY = RectMy.height / 2;
			RectMy.fillAlpha = 0.7;
			RectMy.x = x;
			RectMy.y = y;
			RectMy.ellipseWidth = 7;
			RectMy.ellipseHeight = 7;
			RectMy.mask = this.shape;

			// this.labelMy = new eui.Label();
			// let labelMy = this.labelMy;
			// layer.addChild(labelMy);
			// labelMy.visible = false;
			// labelMy.touchEnabled = false;
			// labelMy.text = Math.ceil(Continued / 1000).toString();

			// labelMy.anchorOffsetX = labelMy.width / 2;
			// labelMy.anchorOffsetY = labelMy.height / 2;
			// labelMy.x = x;
			// labelMy.y = y;

		}
		public initGraphics(layer: egret.DisplayObjectContainer, x: number, y: number) {
			this.shape = new egret.Shape();
			layer.addChild(this.shape);
			this.shape.anchorOffsetX = this.shape.width / 2;
			this.shape.anchorOffsetY = this.shape.height / 2;
			this.shape.rotation = -90;
			this.shape.touchEnabled = false;
			this.shape.x = x;
			this.shape.y = y;
		}
		public destroy() {
			if (this.shape)
				this.layeMy.removeChild(this.shape);
			if (this.RectMy)
				this.layeMy.removeChild(this.RectMy);
			// if (this.labelMy)
			// 	this.layeMy.removeChild(this.labelMy);
			this.removeChildren();
		}
		private coolingTime(type: number, boolMy: boolean) {
			if (type == 0) {
				FishingJoy.Master.instance.isFastShootCooling = boolMy;
			}
			else if (type == 1) {
				FishingJoy.Master.instance.isAimShootCooling = boolMy;
			}
			else if (type == 2) {
				FishingJoy.Master.instance.isAutoShootCooling = boolMy;
			}
			else if (type == 4) {
				FishingJoy.Master.instance.isFrozenShootCooling = boolMy;
			}
			
		}

		private changeGraphics(Continued: number, cooling: number, type: number, x: number) {
			let shape = this.shape;
			let angle = 0;
			let i = -1;
			let Timer
			let countDown
			let battery: gameObject.Battery = FishingJoyLogic.instance.allBattery.get(Master.instance.uid)
			if (battery == null)
				return;
			countDown = Continued;
			let startTime = Date.now();
			let speed = 360 / Continued;

			// let moveStar = function (timeStamp: number) {
			// 	changeGraphics(angle);
			// 	angle += 360;
			// 	if (angle >= 360) {
			// 		i *= -1;
			// 		angle = 0;
			// 		game.Timer.clearInterval(Timer);
			// 		countDown = cooling;
			// 		// EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [type, false]);
			// 		// this.coolingTime(type, true)
			// 	}
			// 	return false;
			// }
			let moveStars = function (timeStamp: number) {
				let end = Date.now();
				angle = speed * (end - startTime)
				changeGraphics(angle);
				// angle += 1;
				// countDown -= cooling / 360;
				// this.labelMy.visible = true;
				// this.labelMy.text = Math.ceil(countDown / 1000).toString();
				// this.labelMy.anchorOffsetX = this.labelMy.width / 2;
				// this.labelMy.anchorOffsetY = this.labelMy.height / 2;
				// this.labelMy.x = x;
				this.coolingTime(type, true)
				if (angle >= 360) {
					i = 1;
					angle = 0;
					EventManager.fireEvent(EVENT_ID.CHANEG_SHOOT_TYPE, [type, false]);
					this.destroy();
					game.Timer.clearInterval(Timer);
					this.coolingTime(type, false)
				}
				return false;
			}
			Timer = game.Timer.setInterval(moveStars, this, 20)
			// Timer = game.Timer.setInterval(moveStar, this, Continued / 360)

			function changeGraphics(angle) {
				shape.graphics.clear();
				shape.graphics.beginFill(0xB0E2FF, 1);
				shape.graphics.moveTo(0, 0);
				shape.graphics.lineTo(60, 0);
				shape.graphics.drawArc(0, 0, 60, 0, angle * Math.PI / 180, i == -1);
				shape.graphics.lineTo(0, 0);
				shape.graphics.endFill();
			}
		}
	}
}
