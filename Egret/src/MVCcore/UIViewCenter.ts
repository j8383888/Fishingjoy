/**
 * 原作者 momo
 * @author suo 
 */
class UIViewCenter{

    protected _views:Map = new Map();
    constructor(){

    }

    public dispose():void{
        if(this._views != null){
            for(var i:number = 0;i < this._views.length;i++){
                var view:BaseUIView = this._views.getValueByIndex(i);
                if(view != null){
                    view.dispose();
                    view = null;
                }
            }
            this._views.clear();
            this._views = null;            
        }
    }

    public onInit():void{
        var i:number = 0;
        for(i = 0;i < this._views.length;i++){
            var viewClass:any = this._views.getKey(i);
            this._views.addValue(viewClass,new viewClass());
        }
        for(i = 0;i < this._views.length;i++){
            var view:BaseUIView = this._views.getValueByIndex(i);
            if(view != null){
                view.onInit();
            }
        }
    }

    public onShow():void{
        for(var i:number = 0;i < this._views.length;i++){
            var view:BaseUIView = this._views.getValueByIndex(i);
            if(view != null){
                view.onShow();
            }
        }
    }

    public onHide():void{
        for(var i:number = 0;i < this._views.length;i++){
            var view:BaseUIView = this._views.getValueByIndex(i);
            if(view != null){
                view.onHide();
                view.dispose();
                this._views.addValue(this._views.getKey(i),null);
            }
        }
    }

    public addView(className:any):void{
        if(className == null){
            return;
        }
        this._views.addValue(className,null);
    }

    public getView(className:any):any{
        if(this._views == null){
            return null;
        }
        return this._views.getValueByKey(className);
    }


    public isExist(className:any):boolean{
        if(this._views == null){
            return false;
        }
        return this._views.isExist(className);
    }

    public get viewLength():number{
        return this._views.length;
    }

    public getViewByIndex(index:number):BaseUIView{
        return this._views.getValueByIndex(index);
    }
}