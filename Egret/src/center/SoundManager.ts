/**
 * 音频管理
 * author suo
 */
module FishingJoy {
	import Sound = egret.Sound;
	export class SoundManager {
		/*单例*/
		private static _instance: SoundManager = null;
		/*当前正在播放的音源*/
		public curMusic: SOUND_BG = -1;

		public constructor() {
		}

		/**
		 * 获得单例
		 */
		public static get instance(): SoundManager {
			if (this._instance == null) {
				this._instance = new SoundManager();
			}
			return this._instance;
		}


		/**
		 * 获取音频方式一
		 */
		public getSoundMethodOne(): void {
			var sound: egret.Sound = new egret.Sound();
			sound.addEventListener(egret.Event.COMPLETE, function loadOver(event: egret.Event) { sound.play(); }, this);
			sound.addEventListener(egret.IOErrorEvent.IO_ERROR, function loadError(event: egret.IOErrorEvent) { console.log("loaded error!"); }, this);
			sound.load("resource/sound/sound.mp3");
		}

		/**
		 * 获取音频方式二
		 */
		public getSoundMethodTwo(): void {
			var loader: egret.URLLoader = new egret.URLLoader();
			loader.addEventListener(egret.Event.COMPLETE, function loadOver(event: egret.Event) { var sound: egret.Sound = loader.data; sound.play(); }, this);
			loader.dataFormat = egret.URLLoaderDataFormat.SOUND;
			loader.load(new egret.URLRequest("resource/sound/sound.mp3"));
		}

		/**
		 * 获取音频方式三
		 */
		public playSoundByName(name: string, playTime: number = 1): void {
			var sound: egret.Sound = RES.getRes(name);
			if (sound != null) {
				uniLib.SoundMgr.instance.playSound(name, playTime);
			}
			else {
				console.assert(false, "音源key为" + name + "不存在!");
			}
		}

		/**
		 * 停止播放声音
		 */
		public stopSound(name: string):void{
			if(uniLib.SoundMgr.instance.isSoundPlaying(name)){
				uniLib.SoundMgr.instance.stopSound(name);
			}		
		}

		/**
		 * 获得声音
		 */
		public getSound(name: string): egret.Sound {
			return RES.getRes(name);
		}

		/**
		 * 播放哪种背景音乐
		 */
		public playBG(value: number): void {
			// switch(value){
			// 	case SOUND_BG.NORMAL:
			// 		if(this.curMusic != SOUND_BG.NORMAL){
			// 			uniLib.SoundMgr.instance.stopSound(SOUND_CONST.RACE_BG);
			// 			uniLib.SoundMgr.instance.playSound(SOUND_CONST.NORMAL_BG,0);	
			// 		}			
			// 		break;
			// 	case SOUND_BG.RACE:
			// 		if(this.curMusic != SOUND_BG.RACE){
			// 			uniLib.SoundMgr.instance.playSound(SOUND_CONST.RACE_BG,0);
			// 			uniLib.SoundMgr.instance.stopSound(SOUND_CONST.NORMAL_BG);
			// 		}
			// 		break;
			// }
			// this.curMusic = value;
		}

		/**
		 * 释放
		 */
		public dispose() {
			uniLib.SoundMgr.instance.stopSounds();
		}


	}

	const enum SOUND_BG {
		NORMAL,
		RACE
	}
}
