/**
 * 原作者 momo
 * @author suo 
 */
class BaseUIManager {

    public id: number = 0;

    private _resDatas: Array<ResData> = new Array<ResData>();
    private _onInitedCallBack: Function = null;
    private _loadedCount: number = 0;

    protected _dataCenter: UIDataCenter = null;
    protected _viewCenter: UIViewCenter = null;
    protected _controlCenter: UIControlCenter = null;


    constructor() {
        this._dataCenter = new UIDataCenter();
        this._viewCenter = new UIViewCenter();
        this._controlCenter = new UIControlCenter(this, this._dataCenter, this._viewCenter);
    }

    public dispose(): void {
        if (this._controlCenter != null) {
            this._controlCenter.dispose();
            this._controlCenter = null;
        }
        if (this._viewCenter != null) {
            this._viewCenter.dispose();
            this._viewCenter = null;
        }
        if (this._dataCenter != null) {
            this._dataCenter.dispose();
            this._dataCenter = null;
        }
    }

    public open(onInitCallBack: Function, param: any): void {
        if (null == this._dataCenter ||
            this._dataCenter.isLoading ||
            this._dataCenter.isOpened) {
            if (this._controlCenter != null) {
                this._controlCenter.onOpenAgain();
            }
            return;
        }

        this._onInitedCallBack = onInitCallBack;
        this._dataCenter.openParam =  param;

        if (this._dataCenter.isLoaded) {
            this.doOpen();
        }
        else {
            this.doLoad();
        }
    }

    public close(): void {
        if (null == this._dataCenter ||
            this._dataCenter.isLoading ||
            !this._dataCenter.isOpened) {
            return;
        }

        this.doHide();
    }

    public hide(): void {
        if (null == this._dataCenter ||
            this._dataCenter.isLoading ||
            !this._dataCenter.isOpened) {
            return;
        }

        this.doHide();
    }

    public addControl(className: any): void {
        if (className == null) {
            return;
        }
        this._controlCenter.addControl(className);
    }

    public getControl(className: any): any {
        if (null == this._controlCenter) {
            return null;
        }

        return this._controlCenter.getControl(className);
    }

    public addData(className: any): void {
        if (this._dataCenter == null) {
            return;
        }
        this._dataCenter.addData(className);
    }

    public getData(className: any): any {
        if (this._dataCenter == null) {
            return null;
        }
        return this._dataCenter.getData(className);
    }

    public addView(className: any): void {
        if (this._viewCenter == null) {
            return;
        }
        this._viewCenter.addView(className);
    }

    public getView(className: any): any {
        if (this._viewCenter == null) {
            return null;
        }
        return this._viewCenter.getView(className);
    }

    public addResData(data: ResData): void {
        this._resDatas.push(data);
    }

    public get isOpened(): boolean {
        if (this._dataCenter || !this._dataCenter.isOpened) {
            return false;
        }
        return true;
    }

    public setOpenParam(param: any): void {
        if (this._dataCenter == null) {
            return;
        }
        this._dataCenter.openParam = param;
    }

    public getOpenParam(): any {
        if (this._dataCenter != null) {
            return this._dataCenter.openParam;
        }
        return null;
    }

    public doLoad(): void {
        if (this._dataCenter == null) {
            return;
        }
        this._dataCenter.isLoading = true;
        this._loadedCount = 0;

        if (this._resDatas.length <= 0) {
            this.loadComplete();
        } else {
            for (var i: number = 0; i < this._resDatas.length; i++) {
                var resData: ResData = this._resDatas[i];
                if (resData != null) {
                    RES.getResByUrl(resData.url, this.loadComplete, this, resData.resType);
                }
            }
        }

    }

    private loadComplete(): void {
        this._loadedCount++;
        if (this._loadedCount >= this._resDatas.length) {
            if (this._dataCenter == null ||
                this._viewCenter == null || this._controlCenter == null) {
                return;
            }
            this._dataCenter.isLoading = false;
            this._dataCenter.isLoaded = true;
            this.doOpen();
        }
    }

    private doOpen(): void {
        if (this._dataCenter == null || this._viewCenter == null || this._controlCenter == null) {
            return;
        }
        this._dataCenter.onInit();
        this._viewCenter.onInit();
        this._controlCenter.onInit();

        this._dataCenter.isOpened = true;

        this._dataCenter.onShow();
        this._viewCenter.onShow();
        this._controlCenter.onShow();

        if (this._onInitedCallBack != null) {
            this._onInitedCallBack.call(this._onInitedCallBack, this.id);
        }
    }

    private doHide(): void {
        if (this._dataCenter == null || this._viewCenter == null || this._controlCenter == null) {
            return;
        }
        this._controlCenter.onHide();
        this._viewCenter.onHide();
        this._dataCenter.onHide();

        this._dataCenter.isOpened = false;
    }
}