/**
 * PC端鼠标帮助
 * @author suo
 */
class PCMouseHelper {


	public constructor() {
	}

	/**
	 * 切换指针形状
	 */
	public static changeCursor(): void {
		let canvas: any = document.getElementsByTagName("canvas")[0];
		let style: CSSStyleDeclaration = canvas.style
		style.cursor = 'url(cursor/cursor.png) 37.5 38,auto';
	}


	/**
	 * 恢复正常
	 */
	public static recover(): void {
		let canvas: any = document.getElementsByTagName("canvas")[0];
		let style: CSSStyleDeclaration = canvas.style
		style.cursor = 'auto';
	}
}