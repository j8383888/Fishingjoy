
/*
 * map数据结构  使用更加方便  但是不适合大数据存储  会消耗大量内存
 */
class Map{

    private _hashKeys:Dictionary = new Dictionary();
    private _keys:Array<any> = new Array();
    private _datas:Dictionary = new Dictionary();


    constructor(){

    }

    public dispose():void{
        this.clear();
        this._hashKeys = null;
        this._datas = null;
        this._keys = null;
    }

    public addValue(key:any,value:any):void{
        if(this.isExist(key)){
            this._datas[key] = value;
            return;
        }
        this._hashKeys[key] = key;
        this._datas[key] = value;
        this._keys.push(key);
    }

    public removeValue(key:any):void{
        var count:number = this._keys.length;
        for(var i:number = 0;i < count;i++){
            var curKey:any = this._keys[i];
            if(curKey == key){
                this._keys.splice(i,1);
                delete this._datas[key];
                delete this._hashKeys[key];
                return;
            }
        }
    }

    public isExist(key:any):boolean{
        if(key == null){
            return false;
        }
        return (this._hashKeys[key] != null);
    }

    public clear():void{
        var count:number = this._keys.length;
            for (var i : number = 0; i < count; ++i)
            {
                var key : any = this._keys[i];
                if (key != null)
                {
                    delete this._datas[key];
                    delete this._hashKeys[key];
                }
            }
            this._keys.splice(0, this._keys.length);
    }

    public get length():number{
        return this._keys.length;
    }

    public getKey(index:number):any{
        if(index >= this._keys.length){
            return null;
        }
        var key:any = this._keys[index];
        return key;
    }    

    public getKeys():Array<any>{
        var keys : Array<any> = new Array();
            var count : number = this._keys.length;
            for (var i : number = 0; i < count; ++i)
            {
                var key : any = this._keys[i];
                if (key != null)
                {
                    keys.push(key);
                }
            }
            return keys;
    }

    public getValueByKey(key:any):any{
        if(!this.isExist(key)){
            return null;
        }
        return this._datas[key];
    }

    public getValueByIndex(index:number):any{
        if(index >= this._keys.length){
            return null;
        }
        var key:any = this._keys[index];
        return this._datas[key];
    }
}