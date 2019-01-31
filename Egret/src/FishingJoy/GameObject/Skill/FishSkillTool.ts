/**
 * 鱼的技能工具
 * @author suo
 */
module gameObject {
	export class FishSkillTool {

		public constructor() {

		}

		public static addSkillEff(host: gameObject.Fish, skill: Cmd.FishSkillType): eui.Image[] | egret.MovieClip {
			if (skill == Cmd.FishSkillType.YiWangDaJin) {
				let yiwangdajinMov: egret.MovieClip = Pool.getItemByCreateFun(Pool.yiWangDaJin, Handler.create(this, this.creatYiwangdajinMov));
				yiwangdajinMov.gotoAndPlay(1, -1);
				host.addChildAt(yiwangdajinMov, 0);
				return yiwangdajinMov;
			}
			else if (skill == Cmd.FishSkillType.SameGroup) {
				let [image1, image2]: [eui.Image, eui.Image] = Pool.getItemByCreateFun(Pool.boomIMG, Handler.create(this, this.creatBombEff, null));
				egret.Tween.get(image1, { loop: true }).to({ rotation: 360 }, 2000)
				egret.Tween.get(image2, { loop: true }).to({ rotation: -360 }, 2000)
				host.addChildAt(image2, 0);
				host.addChildAt(image1, 0);
				return [image1, image2];
			}
		}

		/**
		 * 创建一网打尽
		 */
		private static creatYiwangdajinMov(): egret.MovieClip {
			let mov: egret.MovieClip = FishingJoy.UIUtil.creatMovieClip("ywangdajin");
			mov.scaleX = mov.scaleY = 0.7;
			return mov
		}

		/**
		 * 创建爆炸鱼
		 */
		private static creatBombEff(): eui.Image[] {
			let image1 = new eui.Image()
			let image2 = new eui.Image()
			image1.source = "fishBoom1";
			image2.source = "fishBoom2";
			image1.scaleX = image1.scaleY = 0.7
			image2.scaleX = image2.scaleY = 0.7
			image1.anchorOffsetX = 115;
			image1.anchorOffsetY = 115;
			image2.anchorOffsetX = 115;
			image2.anchorOffsetY = 115;
			image1.touchEnabled = false;
			image2.touchEnabled = false;
			return [image1, image2]
		}

		/**
		 * 暂停技能效果
		 */
		public static stopSkillEff(eff: eui.Image[] | egret.MovieClip): void {
			

			if (eff instanceof Array) {
				for (let i: number = 0; i < eff.length; i++) {
					egret.Tween.removeTweens(eff[i]);
				}
			}
			else if (egret.is(eff, "egret.MovieClip")) {
				eff.stop();
			}
			
		}

		/**
		 * 开始技能效果
		 */
		public static startSkillEff(eff: eui.Image[] | egret.MovieClip): void {
			if (eff instanceof Array) {
				for (let i: number = 0; i < eff.length; i++) {
					if (i == 1) {
						egret.Tween.get(eff[i], { loop: true }).to({ rotation: -360 }, 2000)
					}
					else {
						egret.Tween.get(eff[i], { loop: true }).to({ rotation: 360 }, 2000)
					}

				}
			}
			else if (egret.is(eff, "egret.MovieClip")) {
				eff.play(-1);
			}
		}

		/**
		 * 回收
		 */
		public static removeSkill(host: gameObject.Fish, eff: eui.Image[] | egret.MovieClip): void {
			if (eff instanceof Array) {
				for (let i: number = 0; i < eff.length; i++) {
					host.removeChild(eff[i])
				}
				Pool.recover(Pool.boomIMG, eff);
			}
			else if (egret.is(eff, "egret.MovieClip")) {
				eff.stop();
				host.removeChild(eff);
				Pool.recover(Pool.yiWangDaJin, eff);
			}
			else {
				console.assert(false, "尚不支持该类型！")
			}
		}
	}
}