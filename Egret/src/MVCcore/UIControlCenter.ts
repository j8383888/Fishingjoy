/**
 * 原作者 momo
 * @author suo 
 */
class UIControlCenter {
    protected _ui: BaseUIManager = null;
    protected _dataCenter: UIDataCenter = null;
    protected _viewCenter: UIViewCenter = null;
    protected _controls: Map = new Map();

    constructor(ui: BaseUIManager, dataCenter: UIDataCenter, viewCenter: UIViewCenter) {
        this._ui = ui;
        this._dataCenter = dataCenter;
        this._viewCenter = viewCenter;
    }

    public dispose(): void {
        if (this._controls != null) {
            for (var i: number = 0; i < this._controls.length; ++i) {
                var control: BaseUIControl = this._controls.getValueByIndex(i);
                if (control != null) {
                    control.dispose();
                    control = null;
                }
            }

            this._controls.clear();
            this._controls = null;
        }

        this._viewCenter = null;
        this._dataCenter = null;
        this._ui = null;
    }

    public onInit(): void {
        var control: BaseUIControl = null;
        var i: number = 0;
        for (i = 0; i < this._controls.length; ++i) {
            var controlClass: any = this._controls.getKey(i);
            control = new controlClass();
            control.init(this._dataCenter, this._viewCenter);
            this._controls.addValue(controlClass, control);
        }

        for (i = 0; i < this._controls.length; ++i) {
            control = this._controls.getValueByIndex(i);
            if (control != null) {
                control.onInit();
            }
        }
    }

    public onShow(): void {
        for (var i: number = 0; i < this._controls.length; ++i) {
            var control: BaseUIControl = this._controls.getValueByIndex(i);
            if (control != null) {
                control.onShow();
            }
        }
    }

    public onOpenAgain(): void {
        for (var i: number = 0; i < this._controls.length; ++i) {
            var control: BaseUIControl = this._controls.getValueByIndex(i);
            if (control != null) {
                control.onOpenAgain();
            }
        }
    }

    public onHide(): void {
        for (var i: number = 0; i < this._controls.length; ++i) {
            var control: BaseUIControl = this._controls.getValueByIndex(i);
            if (control != null) {
                control.onHide();
                control.dispose();
                this._controls.addValue(this._controls.getKey(i), null);
            }
        }
    }

    public addControl(className: any): void {
        if (null == className) {
            return;
        }
        this._controls.addValue(className, null);
    }

    public getControl(className: any): any {
        if (null == this._controls) {
            return null;
        }

        return this._controls.getValueByKey(className);
    }

    public isExist(className: any): boolean {
        if (null == this._controls) {
            return false;
        }

        return this._controls.isExist(className);
    }
}