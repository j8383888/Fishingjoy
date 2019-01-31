/**
 * 配置文件解析
 * @author suo 
 */
class ConfigParse {
	public constructor() {
	}

	public static getJosn(key:string):any{
		var data:Object[] = RES.getRes(key);
		var copy:Object[] = data.slice(0);
		return copy;	
	}

	/**
	 * 根据属性A获得属性B值
	 */
	public static getPropertyByProperty(conf:any,paramA:string, paramAValue:string, paramB:string):any{
		if(!conf || !(conf instanceof Array) || conf.length == 0){
			return;
		}
		for(var subConf of conf){
			var item:Object =  <Object>subConf
			if(item.hasOwnProperty(paramA) && item.hasOwnProperty(paramB)){
				if(item[paramA] == paramAValue){
					return item[paramB];
				}
			}
		}
		return null;
	}
}