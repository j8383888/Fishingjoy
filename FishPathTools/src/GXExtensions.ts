module GX {
	/**
	 * 时间戳格式
	 */
	export enum TimeFormat {
		/**
		 * Y-M-D H:M:S
		 */
		ALL = 1,
		/**
		 * H:M
		 */
		HM = 2,
		/**
		 * H:M:S
		 */
		HMS = 3,
		/**
		 * M:S
		 */
		MS = 4,
	}
	/**
     * 资源风格
     */
	export enum RESStyle {
        /**
         * 矩形
         */
		Rect = 1,
        /**
         * 圆形
         */
		Circular = 2,
		/**
		 * 圆角矩形
		 */
		RoundRect = 3.
	}
	/**
	 * 字符串不是`undefined`、`null`或`""`
	 */
	export function stringIsNullOrEmpty(value: string): boolean {
		return typeof (value) !== "string" || value.length == 0;
	}

	/**
	 * @ref http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript/8809472#8809472
	 */
	export function generateUUID(): string {
		var d = new Date().getTime();
		var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
		return uuid;
	}

	/**
	 * @ref http://stackoverflow.com/questions/221294/how-do-you-get-a-timestamp-in-javascript
	 */
	export function unixTimestamp(): number {
		if (!Date.now) {
			Date.now = function () { return new Date().getTime(); }
		}
		return Date.now() / 1000 | 0;
	}

	/**
	 * 得到扩展名，带“.”
	 * @param path
	 */
	export function getExtension(path: string): string {
		let index = path.lastIndexOf(".");
		if (index == -1)
			return "";
		return path.substring(index);
	}
	/**
	 * 得到路径，不带末尾“/”
	 * @param path
	 */
	export function getDirectoryName(path: string): string {
		let index = path.lastIndexOf("/");
		if (index == -1)
			return "";
		return path.substring(0, index);
	}

	/**
	 * 得到文件名，带扩展名
	 * @param path
	 */
	export function getFileName(path: string): string {
		let index = path.lastIndexOf("/");
		if (index == -1)
			return path;
		return path.substring(index + 1);
	}

	/**
	 * 得到不带扩展名的文件名
	 * @param path
	 */
	export function getFileNameWithoutExtension(path: string): string {
		let name = getFileName(path);
		let index = name.lastIndexOf(".");
		if (index == -1)
			return name;
		return name.substring(0, index);
	}
	/**
     * 【金额表示方法】：
	 *1 - 10万（不含10万），不用单位
	 *10万 - 1000万（不含1000万），用K
	 *1000万及以上，用M
	 *数字加千分号，保留2位小数
     */
	export function GoldFormat(value: number): string {
		if (value == null)
			return;
		value = Math.floor(value * 100) / 100
		if (value < 100000) {
			return toEnInLocaleString(GX.numToFixed(value, 2));
		}
		if (value < 10000000) {
			let point = value / 1000;
			return toEnInLocaleString(GX.numToFixed(point, 2)) + "K";
		}
		let point = value / 1000000;
		return toEnInLocaleString(GX.numToFixed(point, 2)) + "M";
	}

	/**
	 * 千位/拉克（十万）/克若尔（千万）分隔
	 */
	export function toEnInLocaleString(n: string): string {
		var b = parseInt(n).toString();
		var point = (n + "").split(".")[1];
		var len = b.length;
		if (len <= 3) { return b + (Number(point) > 0 ? ("." + point) : ""); }
		var r = len % 3;
		return (r > 0 ? b.slice(0, r) + "," + b.slice(r, len).match(/\d{3}/g).join(",") : b.slice(r, len).match(/\d{3}/g).join(",")) + (Number(point) > 0 ? ("." + point) : "");
	}

	/**
	 * value转化为num位小数的字符串
	 */
	export function numToFixed(value: number, num: number = 2): string {
		let scaleValue = Math.pow(10, num);
		value = value * scaleValue;
		value = Math.floor(value);
		let intValue = Math.floor(value / scaleValue);
		let dotValue = value % scaleValue;
		let dotVal = dotValue + "";
		let dotLen: number = dotVal.length;
		for (let i: number = dotLen; i < num; i++) {
			dotVal = "0" + dotVal;
		}
		if (dotVal.length == 0) {
			return intValue + "";
		} else {
			return intValue + "." + dotVal;
		}
	}
	/**
	 * 获取俩点的弧度
	 */
	export function getRadianByPoint(p1: { x: number, y: number }, p2: { x: number, y: number }): number {
		let px = p1.x;
		let py = p1.y;
		let mx = p2.x;
		let my = p2.y;
		var x = Math.abs(px - mx);
		var y = Math.abs(py - my);
		var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		var cos = y / z;
		var radina = Math.acos(cos);
		var radian = Math.floor(180 / (Math.PI / radina));

		if (mx > px && my > py) {
			radian = 180 - radian;
		}

		if (mx == px && my > py) {
			radian = 180;
		}

		if (mx > px && my == py) {
			radian = 90;
		}

		if (mx < px && my > py) {
			radian = 180 + radian;
		}

		if (mx < px && my == py) {
			radian = 270;
		}
		if (mx < px && my < py) {
			radian = 360 - radian;
		}
		return radian;
	}
	/**
	 *获取俩点的距离 
	 */
	export function getDistanceByPoint(p1: { x: number, y: number }, p2: { x: number, y: number }): number {
		var x = Math.abs(p1.x - p2.x);
		var y = Math.abs(p1.y - p2.y);
		return Math.sqrt(x * x + y * y);
	}
	/**
	 * 通过角度获得弧度
	 */
	export function getRadian(angle: number): number {
		return angle * Math.PI / 180;
	}

	/**
	 * 通过弧度获得角度
	 */
	export function getAngle(radian: number): number {
		return radian * 180 / Math.PI;
	}
	/**
	*获取弧度所在的象限
	 */
	export function getQuadrantByRadian(radian: number): number {
		if (radian > 270)
			return 4;
		else if (radian > 180)
			return 3;
		else if (radian > 90)
			return 2;
		return 1;
	}
}