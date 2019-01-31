/**
 * 图片集合
 */
module tool {
	export class ImagePlayer extends egret.DisplayObjectContainer {
		/**
		 * key：动画组名字 value：egret.movie
		 */
		private _dataDic: SimpleMap<CustomImage> = new SimpleMap<CustomImage>();

		public constructor(data?: gameObject.IImagePlayer[]) {
			super();
			if (data) {
				for (let i: number = 0; i < data.length; i++) {
					let img: CustomImage = new CustomImage();
					img.source = data[i].sourceName;

					if (data[i].offsetX) {
						img.x = data[i].offsetX;
					}
					if (data[i].offsetY) {
						img.y = data[i].offsetY;
					}
					if (data[i].scaleX) {
						img.scaleX = data[i].scaleX;
					}
					if (data[i].scaleY) {
						img.scaleY = data[i].scaleY;
					}
					this.addChild(img);
					this._dataDic.set(data[i].keyName, img);
				}
			}
		}

		/**
		 * 根据键找图
		 */
		public get(keyName: string): CustomImage {
			return this._dataDic.get(keyName);
		}

		/**
		 * 隐藏所有
		 */
		public hideAll(): void {
			let map = this._dataDic;
			map.keys.forEach(function (key: string) {
				map[key].visible = false;
			})
		}

		/**
		 * 添加图片
		 */
		public push(data: gameObject.IImagePlayer): void {
			let img: CustomImage = new CustomImage();
			img.source = data.sourceName;
			if (data.offsetX) {
				img.x = data.offsetX;
			}
			if (data.offsetY) {
				img.y = data.offsetY;
			}
			if (data.scaleX) {
				img.scaleX = data.scaleX;
			}
			if (data.scaleY) {
				img.scaleY = data.scaleY;
			}
			this.addChild(img);
			this._dataDic.set(data.keyName, img);
		}

		/**
		 * 释放
		 */
		public dispose(): void {
			this._dataDic.clear();
			this._dataDic = null;
		}


	}
}