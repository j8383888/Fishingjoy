/**
 * 中心点在中间的Image
 * @author suo
 */
class CustomImage extends eui.Image {
	public constructor() {
		super();
	}

	protected createChildren(): void {
		super.createChildren();
		this.anchorOffsetX = this.width / 2;
		this.anchorOffsetY = this.height / 2;
		this.touchEnabled = false;
	}

	$hitTest(stageX: number, stageY: number):egret.DisplayObject {
		return null;
	}
}