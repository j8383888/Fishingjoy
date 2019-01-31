// TypeScript file



module editor {

    export class DataCenter extends egret.EventDispatcher {
        public fishResMap: { [sign: number]: egret.MovieClip } = {};
        public getFishRes(sign: number): egret.MovieClip {
            for (let item of table.TableFishConfig.instance()) {
                if (item.sign == sign) {
                    let groupName = item.movieClipAry[0].groupName;
                    var data = RES.getRes(groupName + "_json");
                    var txtr = RES.getRes(groupName + "_png");
                    var mcFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory(data, txtr);
                    var mc: egret.MovieClip = new egret.MovieClip(mcFactory.generateMovieClipData(item.movieClipAry[0].actionName));
                    return mc;
                }
            }
        }

        public fishCenterPoint: { [sign: number]: {x: number, y: number}} = {};

        public addCenterPoint(sign:number,point:{x: number, y: number}){
            this.fishCenterPoint[sign] = point;
        }
        public removeFishRegion(sign:number){
            delete this.fishCenterPoint[sign];
        }
        public static EVENT_LOADDATA_COMPLETED = "loadDataCompleted";
        public static EVENT_SAVEDATA_COMPLETED = "saveDataCompleted";


        public static superpositionOption: any[] = [];

        public static totalSelection: boolean = false;

        public static listVariable: boolean = false;
        public static operationTimes: number = 0;


        private static m_Instance: DataCenter;
        public static get Instance() {
            if (this.m_Instance == null)
                this.m_Instance = new DataCenter();
            return this.m_Instance;
        }

        constructor() {
            super();
            this.mPaths = new Array<{ id, path: Array<{ x, y }> }>();
        }

        public static clearInstance() {
            this.m_Instance.destroy();
            this.m_Instance = null;
        }

        private mPaths: Array<{ id, path: Array<{ x, y }> }>;
        //保存远程路径
        public static SAVE_REMOTE_DATA_URL: string = "http://123.207.4.125/fishcenter/saveresult.php";

        public static SAVE_JSON_DATA_URL: string = "http://123.207.4.125/fishcenter/savejsonresult.php";
        //读取远程路径
        public static LOAD_REMOTE_DATA_URL: string = "http://123.207.4.125/fishcenter/loadresult.php";

        public static Down_REMOTE_DATA_URL: string = "http://123.207.4.125/fishcenter/result.csv";

        //加载web服务器的数据到本地上;
        public LoadData() {
            this.loadDataFromUrl(DataCenter.LOAD_REMOTE_DATA_URL);
        }

        //保存数据到远程web服务器上;
        public SaveData() {
            var urlloader = new egret.URLLoader();
            var req = new egret.URLRequest(DataCenter.SAVE_REMOTE_DATA_URL);
            egret.log("call saveDataToUrl, url:" + DataCenter.SAVE_REMOTE_DATA_URL);
            req.method = egret.URLRequestMethod.POST;
            req.data = this.formatResult();
            urlloader.load(req);
            let self = this;
            let onPostComplete = function (event: egret.Event) {
                var loader: egret.URLLoader = <egret.URLLoader>event.target;
                var data: egret.URLVariables = loader.data;
                egret.log("保存成功");
                EventManager.Instance.dispatchEvent(DataCenter.EVENT_SAVEDATA_COMPLETED);
            }
            urlloader.addEventListener(egret.Event.COMPLETE, onPostComplete, null);

            var urlloader = new egret.URLLoader();
            var req = new egret.URLRequest(DataCenter.SAVE_JSON_DATA_URL);
            egret.log("call saveDataToUrl, url:" + DataCenter.SAVE_JSON_DATA_URL);
            req.method = egret.URLRequestMethod.POST;
            req.data = JSON.stringify(this.fishCenterPoint);
            urlloader.load(req);
            urlloader.addEventListener(egret.Event.COMPLETE, onPostComplete, null);
        }

        //格式化保存的数据;
        protected formatResult(): string {
            let result: string = "";
            let outputStr = function (msg: string) {
                result = result + msg + "\n";
            }
            outputStr("sign,centerPoint");
            for (let i in this.fishCenterPoint) {
                let point = this.fishCenterPoint[i];
                let pointstr = "\"["+point.x+","+point.y+"]\"";
                outputStr("" + i + "," + pointstr);
            }
            return result;
        }


        protected calcAngleAndDistance(p1: { x, y }, p2: { x, y }): { angle, dist } {
            let p2p1x = p2.x - p1.x;
            let p2p1y = p2.y - p1.y;
            let angle = 0;
            if (p2p1x < 0.001 && p2p1x > -0.001) {
                if (p2p1y < 0) {
                    angle = 90;
                } else {
                    angle = 270;
                }
            } else {
                angle = Math.atan(p2p1y / p2p1x) * 180;
            }
            let dist = Math.sqrt(p2p1x * p2p1x + p2p1y * p2p1y);
            return { angle: angle, dist: dist };
        }

        public getPathIds() {
            let ids: Array<any> = [];
            for (let i: number = 0; i < this.mPaths.length; i++) {
                ids.push(this.mPaths[i].id);
            }
            return ids;
        }

        //根据索引获取数据;
        public getDataByPathIndex(index: number): { id, path: Array<{ x, y }> } {
            return this.mPaths[index];
        }

        //添加一个数据;
        public addData(id, path: Array<{ x, y }>): boolean {
            for (let pathNode of this.mPaths) {
                if (pathNode.id == id) {
                    return false;
                }
            }
            this.mPaths.push({ id: id, path: path });
            return true;
        }

        //修改数据;
        public setData(index: number, id, path: Array<{ x, y }>): boolean {
            //检查是否由相同的id
            for (let i: number = 0; i < this.mPaths.length; i++) {
                if (i != index && this.mPaths[i].id == id) {
                    return false;
                }
            }

            this.mPaths[index] = { id: id, path: path };
            return true;
        }

        public removeData(index: number) {
            this.mPaths.splice(index, 1);
        }

        //读取到指定网址上;
        private urlloader: egret.URLLoader;
        protected loadDataFromUrl(url: string) {
            egret.log("call loadDataFromUrl:" + url);
            this.urlloader = new egret.URLLoader();
            this.urlloader.dataFormat = egret.URLLoaderDataFormat.TEXT;
            var urlreq: egret.URLRequest = new egret.URLRequest();
            urlreq.url = url;
            this.urlloader.load(urlreq);
            this.urlloader.addEventListener(egret.Event.COMPLETE, this.onLoadUrlComplete, this)
        }

        protected onLoadUrlComplete(event: egret.Event) {
            this.parsePathDataFromCsvData(this.urlloader.data);
            EventManager.Instance.dispatchEvent(DataCenter.EVENT_LOADDATA_COMPLETED);
        }

        //加载csv数据，保存到本地内存;
        protected parsePathDataFromCsvData(data: string) {
            if (data == null)
                return;
            if(!GX.isJsonString(data)){
                return ;
            }
            this.fishCenterPoint = JSON.parse(data);
            egret.log("this.fishRegionMap:" + data);
        }

        //保存到指定网址上;
        protected saveDataToUrl(url: string) {
            
        }

        protected destroy() {

        }

        //排序数据;
        public sortData(sortDir: number) {
            this.mPaths.sort(function (pathA, pathB) {
                if (pathA.id == pathB.id) {
                    return 0;
                } else {
                    return pathA.id < pathB.id ? -sortDir : sortDir;
                }
            })
        }

    }
}