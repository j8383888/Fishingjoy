/**
 * 原作者 momo
 * @author suo 
 */
class BaseUIControl{

    protected _dataCenter:UIDataCenter = null;
    protected _viewCenter:UIViewCenter = null;
    
    constructor(){

    }

    public init(dataCenter:UIDataCenter,viewCenter:UIViewCenter){
        this._dataCenter = dataCenter;
        this._viewCenter = viewCenter;
    }

    public onInit():void{

    }

    public onShow():void{

    }

    public onOpenAgain():void{

    }

    public onHide():void{

    }

    public dispose():void{
        this._viewCenter = null;
        this._dataCenter = null;
    }
}