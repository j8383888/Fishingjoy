/**
 * 原作者 momo
 * @author suo 
 */
class UIDataCenter {

    protected _datas: Map = new Map();
    private _isLoading: boolean = false;
    private _isLoaded: boolean = false;
    private _isOpened: boolean = false;
    private _openParam: any = null;

    constructor() {
    }

    public set openParam(param: any){
        this._openParam = param;
    }

    public get openParam():any{
        return this._openParam;
    }

    public dispose(): void {
        if (this._datas != null) {
            for (var i: number = 0; i < this._datas.length; i++) {
                var data: BaseUIData = this._datas.getValueByIndex(i);
                if (data != null) {
                    data.dispose();
                    data = null;
                }
            }
            this._datas.dispose();
            this._datas = null;
        }
        this._openParam = null;
    }

    public onInit(): void {
        for (var i: number = 0; i < this._datas.length; i++) {
            var dataClass: any = this._datas.getKey(i);
            this._datas.addValue(dataClass, new dataClass());
        }
    }

    public onShow(): void {

    }

    public onHide(): void {
        if (this._datas != null) {
            for (var i: number = 0; i < this._datas.length; i++) {
                var data: BaseUIData = this._datas.getValueByIndex(i);
                if (data != null) {
                    data.dispose();
                    data = null;
                    this._datas.addValue(this._datas.getKey(i), null);
                }
            }
        }
    }

    public addData(className:any):void{
        if(className == null){
            return;
        }
        this._datas.addValue(className,null);
    }

    public getData(className:any):any{
        if(this._datas == null){
            return null;
        }
        return this._datas.getValueByKey(className);
    }

    public isExist(className:any):boolean{
        if(this._datas == null){
            return false;
        }
        return this._datas.isExist(className);        
    }

    public get isLoading():boolean{
        return this._isLoading;
    }

    public set isLoading(value:boolean){
        this._isLoading = value;
    }

    public get isLoaded():boolean{
        return this._isLoaded;
    }

    public set isLoaded(value:boolean){
        this._isLoaded = value;
    }

    public set isOpened(value: boolean) {
        this._isOpened = value;
    }

    public get isOpened(): boolean {
        return this._isOpened;
    }
}