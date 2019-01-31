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
            this.mPaths = new Array<{ id, path: Array<{ x, y, cx, cy }> }>();
            this.mExportPaths = new Array<{ id, path: Array<{ x, y }> }>();
        }

        public static clearInstance() {
            this.m_Instance.destroy();
            this.m_Instance = null;
        }

        private mPaths: Array<{ id, path: Array<{ x, y, cx, cy }> }>;
        //导出的数据结构;
        private mExportPaths: Array<{ id, path: Array<{ x, y }> }>;

        //保存远程路径
        public static SAVE_REMOTE_DATA_URL: string = "http://123.207.4.125/fishpath/saveresult.php";
        //保存成json格式的远程路径
        public static SAVE_JSON_DATA_URL: string = "http://123.207.4.125/fishpath/savejsonresult.php";
        //保存导出数据的远程路径
        public static SAVE_JSON_EXPORT_DATA_URL: string = "http://123.207.4.125/fishpath/saveexportresult.php";

        //读取远程路径
        public static LOAD_REMOTE_DATA_URL: string = "http://123.207.4.125/fishpath/loadresult.php";
        //读取远程导出数据;
        public static LOAD_JSON_EXPORT_DATA_URL: string = "http://123.207.4.125/fishpath/loadexportresult.php"

        //下载配置
        public static DOWNLOAD_CONFIG_URL: string = "http://123.207.4.125/fishpath/export/pathresult.csv";

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
        protected formatExportResult(): string {
            let result: string = "";
            let outputStr = function (msg: string) {
                result = result + msg + "\n";
            }
            let pathCount: number = this.mExportPaths.length;
            let angle = 0;
            let distNext = 0;
            let distTotal = 0;
            egret.log("call formatExportResult, this.mExportPaths:" + JSON.stringify(this.mExportPaths));
            outputStr("id,\"[[x,y,angle,distNext,distTotal]]\"");
            for (let i: number = 0; i < pathCount; i++) {
                let pathItem = this.mExportPaths[i];
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
            return result;
        }

        public getPathIds() {
            let ids: Array<any> = [];
            for (let i: number = 0; i < this.mPaths.length; i++) {
                ids.push(this.mPaths[i].id);
            }
            return ids;
        }

        //根据索引获取数据;
        public getDataByPathIndex(index: number): { id, path: Array<{ x, y, cx, cy }> } {
            return this.mPaths[index];
        }

        //添加一个数据;
        public addData(id, path: Array<{ x, y, cx, cy }>): boolean {
            for (let pathNode of this.mPaths) {
                if (pathNode.id == id) {
                    return false;
                }
            }
            this.mPaths.push({ id: id, path: path });
            return true;
        }

        //添加一个导出数据;
        public addExportData(id, path: Array<{ x, y }>): boolean {
            for (let pathNode of this.mExportPaths) {
                if (pathNode.id == id) {
                    return false;
                }
            }
            this.mExportPaths.push({ id: id, path: path });
            return true;
        }

        //修改数据;
        public setData(index: number, id, path: Array<{ x, y, cx, cy }>): boolean {
            //检查是否由相同的id
            for (let i: number = 0; i < this.mPaths.length; i++) {
                if (i != index && this.mPaths[i].id == id) {
                    return false;
                }
            }

            this.mPaths[index] = { id: id, path: path };
            return true;
        }

        //添加一个导出数据;
        public setExportData(index: number, id, path: Array<{ x, y }>): boolean {
            //检查是否由相同的id
            for (let i: number = 0; i < this.mPaths.length; i++) {
                if (i != index && this.mPaths[i].id == id) {
                    return false;
                }
            }

            this.mExportPaths[index] = { id: id, path: path };
            return true;
        }

        public removeData(index: number) {
            this.mPaths.splice(index, 1);
        }

        public removeExportData(index: number) {
            this.mExportPaths.splice(index, 1);
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
            this.urlloader.addEventListener(egret.Event.COMPLETE, this.onLoadUrlComplete, this);

            var urlLoader = new egret.URLLoader();
            urlLoader.dataFormat = egret.URLLoaderDataFormat.TEXT;
            var urlreq: egret.URLRequest = new egret.URLRequest();
            urlreq.url = DataCenter.LOAD_JSON_EXPORT_DATA_URL;
            urlLoader.load(urlreq);
            let self = this;
            urlLoader.addEventListener(egret.Event.COMPLETE, () => {
                egret.log(urlLoader.data);
                if (self.isJSON(urlLoader.data) == true) {
                    self.mExportPaths = JSON.parse(urlLoader.data);
                }
            }, null);

        }

        protected isJSON(str) {
            if (typeof str == 'string') {
                try {
                    var obj = JSON.parse(str);
                    if (typeof obj == 'object' && obj) {
                        return true;
                    } else {
                        return false;
                    }

                } catch (e) {
                    console.log('error：' + str + '!!!' + e);
                    return false;
                }
            }
            console.log('It is not a string!')
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
        }

        //保存到指定网址上;
        protected saveDataToUrl(url: string) {
            var urlloader = new egret.URLLoader();
            var req = new egret.URLRequest(url);
            egret.log("call saveDataToUrl, url:" + url);
            req.method = egret.URLRequestMethod.POST;
            //保存csv格式数据，供游戏使用
            req.data = this.formatExportResult();
            urlloader.load(req);
            let self = this;
            let onPostComplete = function (event: egret.Event) {
                var loader: egret.URLLoader = <egret.URLLoader>event.target;
                var data: egret.URLVariables = loader.data;
                egret.log("保存成功");
                EventManager.Instance.dispatchEvent(DataCenter.EVENT_SAVEDATA_COMPLETED);
            }
            urlloader.addEventListener(egret.Event.COMPLETE, onPostComplete, null);


            //保存编辑数据，供编辑器用
            var savejsonurl = new egret.URLLoader();
            var data = new egret.URLRequest(DataCenter.SAVE_JSON_DATA_URL);
            egret.log("call saveDataToUrl, url:" + url);
            data.method = egret.URLRequestMethod.POST;
            data.data = JSON.stringify(this.mPaths);
            savejsonurl.load(data);
            savejsonurl.addEventListener(egret.Event.COMPLETE, onPostComplete, null);

            //保存编辑器导出数据，也供下次编辑器读取时用.
            var savejsonurl = new egret.URLLoader();
            var data = new egret.URLRequest(DataCenter.SAVE_JSON_EXPORT_DATA_URL);
            egret.log("call saveDataToUrl, url:" + url);
            data.method = egret.URLRequestMethod.POST;
            data.data = JSON.stringify(this.mExportPaths);
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
            this.mExportPaths.sort(function (pathA, pathB) {
                if (pathA.id == pathB.id) {
                    return 0;
                } else {
                    return pathA.id < pathB.id ? -sortDir : sortDir;
                }
            });
        }

    }
}