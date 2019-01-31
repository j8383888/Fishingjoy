/**
 * 电鳗
 * @author suo
 */
module gameObject {
	export class ElectricEel extends Fish {
		/**
		 * 死亡后发动电击表现完毕后的 延迟句柄
		 */
		public playDieEffCB: Handler;
		/**
		 * 闪电圈
		 */
		public eletricEff: egret.MovieClip;

		public constructor() {
			super();
		}

		/**
         * 初始化一次
         */
		public loadConfigData(data: IFishConfigData): void {
			super.loadConfigData(data);
			this.eletricEff = Pool.getItemByCreateFun(Pool.ElectricEffBurst_Big, Handler.create(FishingJoy.UIUtil, FishingJoy.UIUtil.creatMovieClip, ["electricBrust"]));

			this.eletricEff.scaleX = this.eletricEff.scaleY = 0.6;
			// this.eletricEff.alpha = 0.5;

		}

		/**
		 * 被冻住了
		 */
		public isFreeze(): void {
			super.isFreeze();
			this.eletricEff.stop();
		}

		/**
		 * 恢复正常状态
		 */
		public isResetNormal(): void {
			super.isResetNormal();;
			this.eletricEff.gotoAndPlay(1, -1);
		}

		/**
         * 初始化
         */
		public initialize(): void {
			super.initialize();
			this.eletricEff.x = 20;
			this.eletricEff.y = 0;
			this.addChildAt(this.eletricEff, 0);
			this.eletricEff.gotoAndPlay(1, -1);
		}

		/**
         * 反初始化
         */
		public uninitialize(): void {
			this.eletricEff.parent.removeChild(this.eletricEff);
			this.eletricEff.stop();
			this.playDieEffCB = null;
			super.uninitialize();
		}

		// /**
	 	//  * 播放死亡动画并回收到资源池
	 	//  */
		// public playDieMov(cb: Handler): void {
		// 	this._resetHitTween();
		// 	this.parent.addChild(this);
		// 	cb.run();
		// }

		/**
		 * 释放
		 */
		public dispose(): void {
			Pool.recover(Pool.ElectricEffBurst_Big, this.eletricEff);
			super.dispose();
		}

		// /**
		//  * 发送地电流协议
		//  */
		// public sendShockSkillMsg(cb: Handler): void {
		// 	this.playDieEffCB = cb;

		// 	let cmd: Cmd.ActionCmd_CS = new Cmd.ActionCmd_CS();
		// 	cmd.act = new Cmd.Action()
		// 	cmd.act.uid = FishingJoy.Master.instance.uid;
		// 	cmd.act.op = Cmd.Operation.Numbfish;
		// 	game.PokerFunction.tcpSend(cmd);
		// }

	}
}