// TypeScript file



module editor {

    export class DataCenter extends egret.EventDispatcher {
        private static m_Instance: DataCenter;
        public static get Instance() {
            if (this.m_Instance == null)
                this.m_Instance = new DataCenter();
            return this.m_Instance;
        }

        //保存远程路径
        public static SAVE_REMOTE_DATA_URL: string = "http://123.207.4.125/fishformation/saveresult.php";

        public static SAVE_JSON_DATA_URL: string = "http://123.207.4.125/fishformation/savejsonresult.php";
        //读取远程路径
        public static LOAD_REMOTE_DATA_URL: string = "http://123.207.4.125/fishformation/loadresult.php";

        public static Down_REMOTE_DATA_URL: string = "http://123.207.4.125/fishformation/result.csv";


        constructor() {
            super();
        }


        public fishResMap: { [sign: number]: egret.MovieClip } = {};
        public getFishRes(sign: number): egret.MovieClip {
            for (let item of table.TableFishConfig.instance()) {
                if (item.sign == sign) {
                    let groupName = item.movieClipAry[0].groupName;
                    var data = RES.getRes(groupName + "_json");
                    var txtr = RES.getRes(groupName + "_png");
                    var mcFactory: egret.MovieClipDataFactory = new egret.MovieClipDataFactory(data, txtr);
                    var mc: egret.MovieClip = new egret.MovieClip(mcFactory.generateMovieClipData());
                    return mc;
                }
            }
        }



        public formationArray: Array<{ sign: number, fishs: Array<{ fishid: number, offsetX: number, offsetY: number }> }> = [];
        public changedFormation(sign: number, fishs: Array<{ fishid: number, offsetX: number, offsetY: number }>) {
            this.formationArray.removeFirst(v => v.sign == sign);
            this.formationArray.push({ sign: sign, fishs: fishs })
            this.formationArray = this.formationArray.sort((a, b) => a.sign - b.sign);
        }
        public removeFormation(sign: number) {
            this.formationArray.removeFirst(v => v.sign == sign);
        }


        public shapeData: Array<{ sign: number, shape: Array<{ shapeType: number, x: number, y: number, r: number, endX: number, endY: number, fishNum: number, fishId: number }> }> = [];
        public changedShapeData(sign: number, shape: Array<{ shapeType: number, x: number, y: number, r: number, endX: number, endY: number, fishNum: number, fishId: number }>) {
             this.shapeData.removeFirst(v => v.sign == sign);
            this.shapeData.push({ sign: sign, shape: shape })
            this.shapeData = this.shapeData.sort((a, b) => a.sign - b.sign);
            editor.MainEditor.Instance.updataFormationList();
        }
        public removeShapeData(sign: number) {
            this.shapeData.removeFirst(v => v.sign == sign);
            editor.MainEditor.Instance.updataFormationList();
        }
        public newFormation(sign: number) {
            if (sign == null || sign == NaN)
                return;
            if (this.shapeData.first(v => v.sign == sign)){
                return ;
            }
            this.shapeData.push({ sign: sign, shape: [] });
            this.shapeData = this.shapeData.sort((a, b) => a.sign - b.sign);
            editor.MainEditor.Instance.updataFormationList();
        }

        public changedFormationSign(oldsign: number,newsign:number) {
            let item = this.shapeData.first(v => v.sign == oldsign);
            item.sign = newsign;
            this.shapeData = this.shapeData.sort((a, b) => a.sign - b.sign);
            editor.MainEditor.Instance.updataFormationList();
        }


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
            }
            urlloader.addEventListener(egret.Event.COMPLETE, onPostComplete, null);

            var urlloader = new egret.URLLoader();
            var req = new egret.URLRequest(DataCenter.SAVE_JSON_DATA_URL);
            egret.log("call saveDataToUrl, url:" + DataCenter.SAVE_JSON_DATA_URL);
            req.method = egret.URLRequestMethod.POST;
            let shapeData = [];
            for(let item of this.shapeData){
                let data = {sign:item.sign,shape:item.shape};
                shapeData.push(data);
            }
            req.data = JSON.stringify(shapeData);
            urlloader.load(req);
            urlloader.addEventListener(egret.Event.COMPLETE, onPostComplete, null);
        }

        //格式化保存的数据;
        protected formatResult(): string {
            let result: string = "";
            let outputStr = function (msg: string) {
                result = result + msg + "\n";
            }
            outputStr("sign,\"fishSign,offsetX,offsetY\"");
            for (let formation of this.formationArray) {
                let str = "\"[";
                for (let j: number = 0; j < formation.fishs.length; j++) {
                    let item = formation.fishs[j];
                    str += ("[" + item.fishid + "," + Math.floor(item.offsetX) + "," + Math.floor(item.offsetY) + "]");
                    if (j != formation.fishs.length - 1) {
                        str += ",";
                    }
                }
                str += "]\"";
                outputStr("" + formation.sign + "," + str);
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
        }

        //加载csv数据，保存到本地内存;
        protected parsePathDataFromCsvData(data: string) {
            if (data == null)
                return;
            this.shapeData = JSON.parse(data);
            this.shapeData = this.shapeData.sort((a, b) => a.sign - b.sign);
            editor.MainEditor.Instance.updataFormationList();
            egret.log("this.fishRegionMap:" + data);
        }
    }
}