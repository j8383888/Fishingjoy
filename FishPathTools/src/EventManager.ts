// TypeScript file



module editor{
    export class EventManager{
        private eventMaps:{[eventName:string]:Array<{handler:Function, obj:any}>};


        private static m_Instance:EventManager;
        public static get Instance() {
            if (this.m_Instance == null)
                this.m_Instance = new EventManager();
            return this.m_Instance;
        }

        constructor(){
            this.eventMaps = {};
        }


        //监听事件;
        public addEventListener(eventName, handler, target){
            if(this.eventMaps[eventName] == null){
                this.eventMaps[eventName] = new Array<{handler:Function, obj:any}>();
                                                
            }
            this.eventMaps[eventName].push({handler:handler, obj:target});
        }

        //派发事件;
        public dispatchEvent(eventName, data:any=null){
            if(this.eventMaps[eventName] != null){
                for(let handlerInfo of this.eventMaps[eventName]){
                    handlerInfo.handler.call(handlerInfo.obj, data);
                }
            }
        }

        //删除事件;
        public removeEventListener(eventName, handler, target){
            if(this.eventMaps[eventName] != null){
                let index = this.eventMaps[eventName].indexOf({handler:handler, obj:target});
                if(index > -1){
                    this.eventMaps[eventName].slice(index, 1);
                }
            }
        }

    }

}