// TypeScript file



module editor {

    export class DataCenter extends egret.EventDispatcher {
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
        public static SAVE_REMOTE_DATA_URL: string = "http://123.207.4.125/fish/saveresult.php";
        //保存成json格式的远程路径
        public static SAVE_JSON_DATA_URL: string = "http://123.207.4.125/fish/savejsonresult.php";
        //读取远程路径
        public static LOAD_REMOTE_DATA_URL: string = "http://123.207.4.125/fish/loadresult.php";
        //下载配置
        public static DOWNLOAD_CONFIG_URL: string = "http://123.207.4.125/fish/pathresult.csv";

        //加载web服务器的数据到本地上;
        public LoadData() {
            this.loadDataFromUrl(DataCenter.LOAD_REMOTE_DATA_URL);
        }

        //保存数据到远程web服务器上;
        public SaveData() {
            egret.log("call call SaveData");
            this.saveDataToUrl(DataCenter.SAVE_REMOTE_DATA_URL);
        }

        //格式化保存的数据;
        protected formatResult(): string {
            let result: string = "";
            let outputStr = function (msg: string) {
                result = result + msg + "\n";
            }
            let pathCount: number = this.mPaths.length;
            let angle = 0;
            let distNext = 0;
            let distTotal = 0;
            outputStr("ID,\"[[x,y,angle,distNext,distTotal]]\"");
            for (let i: number = 0; i < pathCount; i++) {
                let pathItem = this.mPaths[i];
                angle = 0;
                distNext = 0;
                distTotal = 0;
                result += (pathItem.id + "," + "\"[")
                for (let j: number = 0; j < pathItem.path.length; j++) {
                    let x = pathItem.path[j].x - LineEditorView.s_horizonOffset;
                    let y = pathItem.path[j].y - LineEditorView.s_vertialOffset;
                    x = Math.ceil(x);
                    y = Math.ceil(y);
                    if (j > 0) {
                        let beforePoint = pathItem.path[j - 1];
                        let beforeX = beforePoint.x - LineEditorView.s_horizonOffset;
                        let beforeY = beforePoint.y - LineEditorView.s_vertialOffset;
                        beforeX = Math.ceil(beforeX);
                        beforeY = Math.ceil(beforeY);
                        let distlast = GX.getDistanceByPoint({ x: beforeX, y: beforeY }, { x: x, y: y });
                        distTotal = distTotal + distlast;
                    }
                    if (j + 1 < pathItem.path.length) {
                        let nextPoint = pathItem.path[j + 1];
                        let nextX = nextPoint.x - LineEditorView.s_horizonOffset;
                        let nextY = nextPoint.y - LineEditorView.s_vertialOffset;
                        nextX = Math.ceil(nextX);
                        nextY = Math.ceil(nextY);
                        if (x == nextX && y == nextY) {
                            continue;
                        }
                        distNext = GX.getDistanceByPoint({ x: x, y: y }, { x: nextX, y: nextY });
                        angle = GX.getRadianByPoint({ x: x, y: y }, { x: nextX, y: nextY })
                    }
                    result += ("[" + x + "," + y + "," + angle + "," + Math.ceil(distNext) + "," + Math.ceil(distTotal) + "],");
                }
                result += "]\"" + "\n";
            }
            for (let i: number = 0; i < pathCount; i++) {
                let pathItem = this.mPaths[i];
                angle = 0;
                distNext = 0;
                distTotal = 0;
                let array = pathItem.path.reverse();
                result += (pathItem.id + "_REV" + "," + "\"[")
                for (let j: number = 0; j < array.length; j++) {
                    let x = pathItem.path[j].x - LineEditorView.s_horizonOffset;
                    let y = pathItem.path[j].y - LineEditorView.s_vertialOffset;
                    x = Math.ceil(x);
                    y = Math.ceil(y);
                    if (j > 0) {
                        let beforePoint = pathItem.path[j - 1];
                        let beforeX = beforePoint.x - LineEditorView.s_horizonOffset;
                        let beforeY = beforePoint.y - LineEditorView.s_vertialOffset;
                        beforeX = Math.ceil(beforeX);
                        beforeY = Math.ceil(beforeY);
                        let distlast = GX.getDistanceByPoint({ x: beforeX, y: beforeY }, { x: x, y: y });
                        distTotal = distTotal + distlast;
                    }
                    if (j + 1 < pathItem.path.length) {
                        let nextPoint = pathItem.path[j + 1];
                        let nextX = nextPoint.x - LineEditorView.s_horizonOffset;
                        let nextY = nextPoint.y - LineEditorView.s_vertialOffset;
                        nextX = Math.ceil(nextX);
                        nextY = Math.ceil(nextY);
                        if (x == nextX && y == nextY) {
                            continue;
                        }
                        distNext = GX.getDistanceByPoint({ x: x, y: y }, { x: nextX, y: nextY });
                        angle = GX.getRadianByPoint({ x: x, y: y }, { x: nextX, y: nextY })
                    }
                    result += ("[" + x + "," + y + "," + angle + "," + Math.ceil(distNext) + "," + Math.ceil(distTotal) + "],");
                }
                result += "]\"" + "\n";
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
            /*
            let self = this;
            RES.getResByUrl(url,function(data:string):void
            {
                self.parsePathDataFromCsvData(data);
                EventManager.Instance.dispatchEvent(DataCenter.EVENT_LOADDATA_COMPLETED);
            },this,RES.ResourceItem.TYPE_TEXT);

            */

            this.urlloader = new egret.URLLoader();
            this.urlloader.dataFormat = egret.URLLoaderDataFormat.TEXT;
            var urlreq: egret.URLRequest = new egret.URLRequest();
            urlreq.url = url;
            this.urlloader.load(urlreq);
            this.urlloader.addEventListener(egret.Event.COMPLETE, this.onLoadUrlComplete, this);
        }

        protected onLoadUrlComplete(event: egret.Event) {
            egret.log("onLoadUrlComplete!");
            this.parsePathDataFromCsvData(this.urlloader.data);
            EventManager.Instance.dispatchEvent(DataCenter.EVENT_LOADDATA_COMPLETED);
        }

        //加载csv数据，保存到本地内存;
        protected parsePathDataFromCsvData(data: string) {
            //egret.log("call parsePathDataFromCsvData");
            this.mPaths = JSON.parse(data);
            let paths: Array<{ id, path: Array<{ x, y }> }> = JSON.parse(data);
            // for(let item of paths){
            //     let srcpaths = this.mPaths.first(v=>v.id == item.id)
            //     for(let path of item.path){
            //         if(path.x < -20 || path.x > 1300 || path.y < -20 || path.y > 740){
            //             srcpaths.path.removeFirst(v=>v.x == path.x && v.y == path.y);
            //         }
            //     }
            // }
            // if (data.length == 0) {
            //     return;
            // }
            // this.mPaths = [];
            // let paths = data.split("\n");
            // //egret.log("paths:"+JSON.stringify(paths));
            // let curId = "0";
            // for (let i: number = 1; i < paths.length; i++) {
            //     let pathItemStr = paths[i];
            //     //egret.log("pathItemStr:"+pathItemStr);
            //     let valStrs = pathItemStr.split(",");
            //     if (valStrs.length >= 3) {
            //         let id = valStrs[0];
            //         if (id.indexOf("REV") != -1) {
            //             continue;
            //         }
            //         let x: number = parseInt(valStrs[1]);
            //         let y: number = parseInt(valStrs[2]);
            //         if (curId != id) {
            //             this.mPaths.push({ id: id, path: [{ x: x, y: y }] });
            //             curId = id;
            //         } else {
            //             this.mPaths[this.mPaths.length - 1].path.push({ x: x, y: y });
            //         }
            //     }
            // }
            //egret.log("this.mPath:"+JSON.stringify(this.mPaths));
        }

        //保存到指定网址上;
        protected saveDataToUrl(url: string) {
            var urlloader = new egret.URLLoader();
            var req = new egret.URLRequest(url);
            egret.log("call saveDataToUrl, url:" + url);
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


            var savejsonurl = new egret.URLLoader();
            var data = new egret.URLRequest(DataCenter.SAVE_JSON_DATA_URL);
            egret.log("call saveDataToUrl, url:" + url);
            data.method = egret.URLRequestMethod.POST;
            data.data = JSON.stringify(this.mPaths);
            savejsonurl.load(data);
            savejsonurl.addEventListener(egret.Event.COMPLETE, onPostComplete, null);
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