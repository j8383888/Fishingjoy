/**
 * 提供高效丰富的计时功能(300行代码搞定)
 * 原作者 layaBox
 * @author suo 去除无用方法 整理ts与as3语法差异 (代替原生Timer,setInterval)
 */
class Timer {

	/**@private */
	private static _pool:Array<any> = [];
	
	/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
	/** 两帧之间的时间间隔,单位毫秒。*/
	private _delta:number = 0;
	/** 时针缩放。*/
	public scale:number = 1;
	/** 当前帧开始的时间。*/
	public currTimer:number = this._now();
	/** 当前的帧数。*/
	public currFrame:number = 0;
	/**@private */
	private _lastTimer:number = this._now();
	/**@private */
	private _mid:number = 1;
	/**@private */
	/*[IF-FLASH]*/
	private _methodMap:Dictionary = new Dictionary();
	//[IF-JS] private var _map:Array = [];

	/**@private */
	private _laters:Array<any> = [];
	/**@private */
	private _handlers:Array<any> = [];
	/**@private */
	private _temp:Array<any> = [];
	/**@private */
	private _count:number = 0;

	/**
	 * 创建 <code>Timer</code> 类的一个实例。
	 */
	public constructor() {
		this._init();
	}

	/**
	 *两帧之间的时间间隔,单位毫秒。
	 */
	public get delta():number {
		return this._delta;
	}

	/**@private */
	protected _init():void {
		FishingJoy.Laya.timer && FishingJoy.Laya.timer.frameLoop(1, this, this.update);
	}

	/**@private */
	protected _now():number {
		return Date.now();
	}
		
	/**
	 * @private
	 * 帧循环处理函数。
	 */
	public update():void {
		if (this.scale <= 0) {
			this._lastTimer = this._now();
			return;
		}
		var frame:number = this.currFrame = this.currFrame + this.scale;
		var now:number = this._now();
		this._delta = (now - this._lastTimer) * this.scale;
		var timer:number = this.currTimer = this.currTimer + this._delta;
		this._lastTimer = now;
		
		//处理handler
		var handlers:Array<any> = this._handlers;
		this._count = 0;
		for (i = 0, n = handlers.length; i < n; i++) {
			handler = handlers[i];
			if (handler.method !== null) {
				var t:number = handler.userFrame ? frame : timer;
				if (t >= handler.exeTime) {
					if (handler.repeat) {
						if (!handler.jumpFrame) {
							handler.exeTime += handler.delay;
							handler.run(false);
							if (t > handler.exeTime) {
								//如果执行一次后还能再执行，做跳出处理，如果想用多次执行，需要设置jumpFrame=true
								handler.exeTime += Math.ceil((t - handler.exeTime) / handler.delay) * handler.delay;
							}
						} else {
							while (t >= handler.exeTime) {
								handler.exeTime += handler.delay;
								handler.run(false);
							}
						}
					} else {
						handler.run(true);
					}
				}
			} else {
				this._count++;
			}
		}
		
		if (this._count > 30 || frame % 200 === 0) this._clearHandlers();
		
		//处理callLater
		var laters:Array<any> = this._laters;
		for (var i:number = 0, n:number = laters.length - 1; i <= n; i++) {
			var handler:TimerHandler = laters[i];
			if (handler.method !== null) {
				/*[IF-FLASH]*/
				this._methodMap.remove(handler.method);
				//[IF-SCRIPT]_map[handler.key] = null;
				handler.run(false);
			}
			this._recoverHandler(handler);
			i === n && (n = laters.length - 1);
		}
		laters.length = 0;
	}
	
	/** @private */
	private _clearHandlers():void {
		var handlers:Array<any> = this._handlers;
		for (var i:number = 0, n:number = handlers.length; i < n; i++) {
			var handler:TimerHandler = handlers[i];
			if (handler.method !== null) this._temp.push(handler);
			else this._recoverHandler(handler);
		}
		this._handlers = this._temp;
		this._temp = handlers;
		this._temp.length = 0;
		
	}
	
	/** @private */
	private _recoverHandler(handler:TimerHandler):void {
		/*[IF-FLASH]*/
		if (this._methodMap.get(handler.method) == handler) this._methodMap.remove(handler.method);
		//[IF-SCRIPT]if(_map[handler.key]==handler) _map[handler.key] = null;
		handler.clear();
		Timer._pool.push(handler);
	}
	
	/** @private */
	public _create(useFrame:Boolean, repeat:Boolean, delay:number, caller:any, method:Function, args:Array<any>, coverBefore:Boolean):TimerHandler {
		//如果延迟为0，则立即执行
		if (!delay) {
			method.apply(caller, args);
			return null;
		}
		
		//先覆盖相同函数的计时
		if (coverBefore) {
			var handler:TimerHandler = this._getHandler(caller, method);
			if (handler) {
				handler.repeat = repeat;
				handler.userFrame = useFrame;
				handler.delay = delay;
				handler.caller = caller;
				handler.method = method;
				handler.args = args;
				handler.exeTime = delay + (useFrame ? this.currFrame : this.currTimer + this._now() - this._lastTimer);
				return handler;
			}
		}
		
		//找到一个空闲的timerHandler
		handler = Timer._pool.length > 0 ? Timer._pool.pop() : new TimerHandler();
		handler.repeat = repeat;
		handler.userFrame = useFrame;
		handler.delay = delay;
		handler.caller = caller;
		handler.method = method;
		handler.args = args;
		handler.exeTime = delay + (useFrame ? this.currFrame : this.currTimer + this._now() - this._lastTimer) + 1;
		
		//索引handler
		this._indexHandler(handler);
		
		//插入数组
		this._handlers.push(handler);
		
		return handler;
	}
	
	/** @private */
	private _indexHandler(handler:TimerHandler):void {
		/*[IF-FLASH]*/
		this._methodMap.set(handler.method,handler);
		/*[IF-FLASH]*/
		return;
		// var caller:any = handler.caller;
		// var method:any = handler.method;
		// var cid:number = caller ? caller.$_GID || (caller.$_GID = Utils.getGID()) : 0;
		// var mid:number = method.$_TID || (method.$_TID = (this._mid++) * 100000);
		// handler.key = cid + mid;
		// this._map[handler.key] = handler;
	}
	
	/**
	 * 定时执行一次。
	 * @param	delay	延迟时间(单位为毫秒)。
	 * @param	caller	执行域(this)。
	 * @param	method	定时器回调函数。
	 * @param	args	回调参数。
	 * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
	 */
	public once(delay:number, caller:any, method:Function, args:Array<any> = null, coverBefore:Boolean = true):void {
		this._create(false, false, delay, caller, method, args, coverBefore);
	}
	
	/**
	 * 定时重复执行。
	 * @param	delay	间隔时间(单位毫秒)。
	 * @param	caller	执行域(this)。
	 * @param	method	定时器回调函数。
	 * @param	args	回调参数。
	 * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
	 * @param	jumpFrame 时钟是否跳帧。基于时间的循环回调，单位时间间隔内，如能执行多次回调，出于性能考虑，引擎默认只执行一次，设置jumpFrame=true后，则回调会连续执行多次
	 */
	public loop(delay:number, caller:any, method:Function, args:Array<any> = null, coverBefore:Boolean = true, jumpFrame:Boolean = false):void {
		var handler:TimerHandler = this._create(false, true, delay, caller, method, args, coverBefore);
		if (handler) handler.jumpFrame = jumpFrame;
	}
	
	/**
	 * 定时执行一次(基于帧率)。
	 * @param	delay	延迟几帧(单位为帧)。
	 * @param	caller	执行域(this)。
	 * @param	method	定时器回调函数。
	 * @param	args	回调参数。
	 * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
	 */
	public frameOnce(delay:number, caller:any, method:Function, args:Array<any> = null, coverBefore:Boolean = true):void {
		this._create(true, false, delay, caller, method, args, coverBefore);
	}
	
	/**
	 * 定时重复执行(基于帧率)。
	 * @param	delay	间隔几帧(单位为帧)。
	 * @param	caller	执行域(this)。
	 * @param	method	定时器回调函数。
	 * @param	args	回调参数。
	 * @param	coverBefore	是否覆盖之前的延迟执行，默认为 true 。
	 */
	public frameLoop(delay:number, caller:any, method:Function, args:Array<any> = null, coverBefore:Boolean = true):void {
		this._create(true, true, delay, caller, method, args, coverBefore);
	}
	

	/** 返回统计信息。*/
	public toString():String {
		return "callLater:" + this._laters.length + " handlers:" + this._handlers.length + " pool:" + Timer._pool.length;
	}
	
	/**
	 * 清理定时器。
	 * @param	caller 执行域(this)。
	 * @param	method 定时器回调函数。
	 */
	public clear(caller:any, method:Function):void {
		var handler:TimerHandler = this._getHandler(caller, method);
		if (handler) {
			//[IF-JS] _map[handler.key] = null;handler.key = 0;
			/*[IF-FLASH]*/
			this._methodMap.remove(handler.method);
			handler.clear();
		}
	}
	
	/**
	 * 清理对象身上的所有定时器。
	 * @param	caller 执行域(this)。
	 */
	public clearAll(caller:any):void {
		if (!caller) return;
		for (var i:number = 0, n:number = this._handlers.length; i < n; i++) {
			var handler:TimerHandler = this._handlers[i];
			if (handler.caller === caller) {
				//[IF-JS] _map[handler.key] = null;handler.key = 0;
				/*[IF-FLASH]*/
				this._methodMap.remove(handler.method);
				handler.clear();
			}
		}
	}
	
	/** @private */
	private _getHandler(caller:any, method:any):TimerHandler {
		/*[IF-FLASH]*/
		for (var i:number = 0, n:number = this._handlers.length; i < n; i++) {
			var handler:TimerHandler = this._handlers[i];
			if (handler.caller === caller && handler.method == method) {
				return handler;
			}
		}
		return null;
		// var cid:number = caller ? caller.$_GID || (caller.$_GID = Utils.getGID()) : 0;
		// var mid:number = method.$_TID || (method.$_TID = (_mid++) * 100000);
		// return _map[cid + mid];
	}
	
	/**
	 * 延迟执行。
	 * @param	caller 执行域(this)。
	 * @param	method 定时器回调函数。
	 * @param	args 回调参数。
	 */
	public callLater(caller:any, method:Function, args:Array<any> = null):void {
		if (this._getHandler(caller, method) == null) {
			//trace(caller, method);
			//找到一个空闲的timerHandler
			if (Timer._pool.length)
				var handler:TimerHandler = Timer._pool.pop();
			else handler = new TimerHandler();
			//设置属性
			handler.caller = caller;
			handler.method = method;
			handler.args = args;
			//索引handler
			this._indexHandler(handler);
			//插入队列
			this._laters.push(handler);
		}
	}
	
	/**
	 * 立即执行 callLater 。
	 * @param	caller 执行域(this)。
	 * @param	method 定时器回调函数。
	 */
	public runCallLater(caller:any, method:Function):void {
		var handler:TimerHandler = this._getHandler(caller, method);
		if (handler && handler.method != null) {
			//[IF-JS] _map[handler.key] = null;
			/*[IF-FLASH]*/
			this._methodMap.remove(handler.method);
			handler.run(true);
		}
	}
	
	/**
	 * 立即提前执行定时器，执行之后从队列中删除
	 * @param	caller 执行域(this)。
	 * @param	method 定时器回调函数。
	 */
	public runTimer(caller:any, method:Function):void {
		this.runCallLater(caller, method);
	}
	
}
/** @private */
class TimerHandler {
	public key:number;
	public repeat:Boolean;
	public delay:number;
	public userFrame:Boolean;
	public exeTime:number;
	public caller:any;
	public method:Function;
	public args:Array<any>;
	public jumpFrame:Boolean;
	
	public clear():void {
		this.caller = null;
		this.method = null;
		this.args = null;
	}
	
	public run(withClear:Boolean):void {
		var caller:any = this.caller;
		/*[IF-FLASH]*/
		// if ((caller is Node) && caller.destroyed)
		// 	/*[IF-FLASH]*/
		// 	return this.clear();
		//[IF-SCRIPT] 
		if (caller && caller.destroyed) return this.clear();
		var method:Function = this.method;
		var args:Array<any> = this.args;
		withClear && this.clear();
		if (method == null) return;
		args ? method.apply(caller, args) : method.call(caller);
	}
}