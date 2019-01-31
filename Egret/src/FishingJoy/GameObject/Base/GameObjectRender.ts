/**
 * 游戏物体渲染对象
 * @author suo
 */
module gameObject {
    export class GameObjectRender extends GameObject {

        /**
         * 渲染对象
         */
        protected _imagePlayer: tool.ImagePlayer = null;
		/**
         * 渲染对象
         */
        protected _moviePlayer: tool.MoviePlayer = null;
        /**
         * 是否在视图内
         */
        public isInView: boolean = false;

        public constructor() {
            super();
        }

		/**
         * 加载资源
         */
        public loadConfigAsset(assetData: IConfigAsset): void {

            let imageAry: IImagePlayer[] = assetData.imageAry;
            if (imageAry) {
                this._imagePlayer = new tool.ImagePlayer();
                for (let i: number = 0; i < imageAry.length; i++) {
                    this._imagePlayer.push(imageAry[i])
                }
                this.addChild(this._imagePlayer)
            }
            let movieClipAry: IMoviePlayer[] = assetData.movieClipAry;
            if (movieClipAry) {
                this._moviePlayer = new tool.MoviePlayer()
                for (let i: number = 0; i < movieClipAry.length; i++) {
                    this._moviePlayer.push(movieClipAry[i])
                }
                this.addChild(this._moviePlayer)
            }
        }

        /**
         * 初始化配置数据
         */
        public loadConfigData(configData: IConfigData): void {
        }

		/**
         * 初始化
         */
        public initialize(): void {
            if (this.varsData.bornX) {
                this.x = this.varsData.bornX;
            }
            else {
                this.x = -1000;
            }
            if (this.varsData.bornY) {
                this.y = this.varsData.bornY;
            }
            else {
                this.y = -1000;
            }
            if (this.varsData.rotation) {
                this.rotation = this.varsData.rotation;
            }
            FishingJoy.LayerManager.instance.addToLayer(this, this.layerType);
            this.isInView = true;
        }

        /**
         * 反初始化
         */
        public uninitialize(): void {
            if (this._moviePlayer) {
                this._moviePlayer.stopAll();
            }
            FishingJoy.LayerManager.instance.removeFromLayer(this);
            this.isInView = false;
        }

        /**
         * 释放
         */
        public dispose(): void {
            if (this._moviePlayer) {
                this._moviePlayer.dispose();
                this._moviePlayer = null;
            }
            if (this._imagePlayer) {
                this._imagePlayer.dispose();
                this._imagePlayer = null;
            }
            super.dispose();
        }
    }
}