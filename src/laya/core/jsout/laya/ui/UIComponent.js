import { Widget } from "././Widget";
import { UIEvent } from "././UIEvent";
import { UIUtils } from "././UIUtils";
import { Sprite } from "../display/Sprite";
import { Event } from "../events/Event";
/**
 * <code>Component</code> 是ui控件类的基类。
 * <p>生命周期：preinitialize > createChildren > initialize > 组件构造函数</p>
 */
export class UIComponent extends Sprite {
    /**
     * <p>创建一个新的 <code>Component</code> 实例。</p>
     */
    constructor() {
        super();
        /**X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。*/
        this._anchorX = NaN;
        /**Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。*/
        this._anchorY = NaN;
        /**@private 相对布局组件*/
        this._widget = Widget.EMPTY;
        this.preinitialize();
        this.createChildren();
        this.initialize();
    }
    /**@inheritDoc */
    /*override*/ destroy(destroyChild = true) {
        super.destroy(destroyChild);
        this._dataSource = null;
        this._tag = null;
        this._toolTip = null;
    }
    /**
     * <p>预初始化。</p>
     * @internal 子类可在此函数内设置、修改属性默认值
     */
    preinitialize() {
    }
    /**
     * <p>创建并添加控件子节点。</p>
     * @internal 子类可在此函数内创建并添加子节点。
     */
    createChildren() {
    }
    /**
     * <p>控件初始化。</p>
     * @internal 在此子对象已被创建，可以对子对象进行修改。
     */
    initialize() {
    }
    /**
     * <p>表示显示对象的宽度，以像素为单位。</p>
     * <p><b>注：</b>当值为0时，宽度为自适应大小。</p>
     */
    /*override*/ get width() {
        return this.get_width();
    }
    get_width() {
        if (this._width)
            return this._width;
        return this.measureWidth();
    }
    /**
     * <p>显示对象的实际显示区域宽度（以像素为单位）。</p>
     */
    measureWidth() {
        var max = 0;
        this.commitMeasure();
        for (var i = this.numChildren - 1; i > -1; i--) {
            var comp = this.getChildAt(i);
            if (comp._visible) {
                max = Math.max(comp._x + comp.width * comp.scaleX, max);
            }
        }
        return max;
    }
    /**
     * <p>立即执行影响宽高度量的延迟调用函数。</p>
     * @internal <p>使用 <code>runCallLater</code> 函数，立即执行影响宽高度量的延迟运行函数(使用 <code>callLater</code> 设置延迟执行函数)。</p>
     * @see #callLater()
     * @see #runCallLater()
     */
    commitMeasure() {
    }
    /**
     * <p>表示显示对象的高度，以像素为单位。</p>
     * <p><b>注：</b>当值为0时，高度为自适应大小。</p>
     */
    /*override*/ get height() {
        return this.get_height();
    }
    get_height() {
        if (this._height)
            return this._height;
        return this.measureHeight();
    }
    /**
     * <p>显示对象的实际显示区域高度（以像素为单位）。</p>
     */
    measureHeight() {
        var max = 0;
        this.commitMeasure();
        for (var i = this.numChildren - 1; i > -1; i--) {
            var comp = this.getChildAt(i);
            if (comp._visible) {
                max = Math.max(comp._y + comp.height * comp.scaleY, max);
            }
        }
        return max;
    }
    /**
     * <p>数据赋值，通过对UI赋值来控制UI显示逻辑。</p>
     * <p>简单赋值会更改组件的默认属性，使用大括号可以指定组件的任意属性进行赋值。</p>
     * @example
       //默认属性赋值
       dataSource = {label1: "改变了label", checkbox1: true};//(更改了label1的text属性值，更改checkbox1的selected属性)。
       //任意属性赋值
       dataSource = {label2: {text:"改变了label",size:14}, checkbox2: {selected:true,x:10}};
     */
    get dataSource() {
        return this.get_dataSource();
    }
    get_dataSource() {
        return this._dataSource;
    }
    set dataSource(value) {
        this.set_dataSource(value);
    }
    set_dataSource(value) {
        this._dataSource = value;
        for (var prop in this._dataSource) {
            if (this.hasOwnProperty(prop) && !(this[prop] instanceof Function)) {
                this[prop] = this._dataSource[prop];
            }
        }
    }
    /**
     * <p>从组件顶边到其内容区域顶边之间的垂直距离（以像素为单位）。</p>
     */
    get top() {
        return this.get_top();
    }
    get_top() {
        return this._widget.top;
    }
    set top(value) {
        this.set_top(value);
    }
    set_top(value) {
        if (value != this._widget.top) {
            this._getWidget().top = value;
        }
    }
    /**
     * <p>从组件底边到其内容区域底边之间的垂直距离（以像素为单位）。</p>
     */
    get bottom() {
        return this.get_bottom();
    }
    get_bottom() {
        return this._widget.bottom;
    }
    set bottom(value) {
        this.set_bottom(value);
    }
    set_bottom(value) {
        if (value != this._widget.bottom) {
            this._getWidget().bottom = value;
        }
    }
    /**
     * <p>从组件左边到其内容区域左边之间的水平距离（以像素为单位）。</p>
     */
    get left() {
        return this._widget.left;
    }
    set left(value) {
        if (value != this._widget.left) {
            this._getWidget().left = value;
        }
    }
    /**
     * <p>从组件右边到其内容区域右边之间的水平距离（以像素为单位）。</p>
     */
    get right() {
        return this._widget.right;
    }
    set right(value) {
        if (value != this._widget.right) {
            this._getWidget().right = value;
        }
    }
    /**
     * <p>在父容器中，此对象的水平方向中轴线与父容器的水平方向中心线的距离（以像素为单位）。</p>
     */
    get centerX() {
        return this._widget.centerX;
    }
    set centerX(value) {
        if (value != this._widget.centerX) {
            this._getWidget().centerX = value;
        }
    }
    /**
     * <p>在父容器中，此对象的垂直方向中轴线与父容器的垂直方向中心线的距离（以像素为单位）。</p>
     */
    get centerY() {
        return this._widget.centerY;
    }
    set centerY(value) {
        if (value != this._widget.centerY) {
            this._getWidget().centerY = value;
        }
    }
    _sizeChanged() {
        if (!isNaN(this._anchorX))
            this.pivotX = this.anchorX * this.width;
        if (!isNaN(this._anchorY))
            this.pivotY = this.anchorY * this.height;
        this.event(Event.RESIZE);
        if (this._widget !== Widget.EMPTY)
            this._widget.resetLayout();
    }
    /**
     * <p>对象的标签。</p>
     * @internal 冗余字段，可以用来储存数据。
     */
    get tag() {
        return this._tag;
    }
    set tag(value) {
        this._tag = value;
    }
    /**
     * <p>鼠标悬停提示。</p>
     * <p>可以赋值为文本 <code>String</code> 或函数 <code>Handler</code> ，用来实现自定义样式的鼠标提示和参数携带等。</p>
     * @example
     * private var _testTips:TestTipsUI = new TestTipsUI();
     * private function testTips():void {
       //简单鼠标提示
     * btn2.toolTip = "这里是鼠标提示&lt;b&gt;粗体&lt;/b&gt;&lt;br&gt;换行";
       //自定义的鼠标提示
     * btn1.toolTip = showTips1;
       //带参数的自定义鼠标提示
     * clip.toolTip = new Handler(this,showTips2, ["clip"]);
     * }
     * private function showTips1():void {
     * _testTips.label.text = "这里是按钮[" + btn1.label + "]";
     * tip.addChild(_testTips);
     * }
     * private function showTips2(name:String):void {
     * _testTips.label.text = "这里是" + name;
     * tip.addChild(_testTips);
     * }
     */
    get toolTip() {
        return this._toolTip;
    }
    set toolTip(value) {
        if (this._toolTip != value) {
            this._toolTip = value;
            if (value != null) {
                this.on(Event.MOUSE_OVER, this, this.onMouseOver);
                this.on(Event.MOUSE_OUT, this, this.onMouseOut);
            }
            else {
                this.off(Event.MOUSE_OVER, this, this.onMouseOver);
                this.off(Event.MOUSE_OUT, this, this.onMouseOut);
            }
        }
    }
    /**
     * 对象的 <code>Event.MOUSE_OVER</code> 事件侦听处理函数。
     */
    onMouseOver(e) {
        window.Laya.stage.event(UIEvent.SHOW_TIP, this._toolTip);
    }
    /**
     * 对象的 <code>Event.MOUSE_OUT</code> 事件侦听处理函数。
     */
    onMouseOut(e) {
        window.Laya.stage.event(UIEvent.HIDE_TIP, this._toolTip);
    }
    /** 是否变灰。*/
    get gray() {
        return this._gray;
    }
    set gray(value) {
        if (value !== this._gray) {
            this._gray = value;
            UIUtils.gray(this, value);
        }
    }
    /** 是否禁用页面，设置为true后，会变灰并且禁用鼠标。*/
    get disabled() {
        return this._disabled;
    }
    set disabled(value) {
        if (value !== this._disabled) {
            this.gray = this._disabled = value;
            this.mouseEnabled = !value;
        }
    }
    /**
     * @private
     * <p>获取对象的布局样式。请不要直接修改此对象</p>
     */
    _getWidget() {
        this._widget === Widget.EMPTY && (this._widget = this.addComponent(Widget));
        return this._widget;
    }
    /**@inheritDoc */
    /*override*/ set scaleX(value) {
        this.set_scaleX(value);
    }
    set_scaleX(value) {
        if (super.get_scaleX() == value)
            return;
        super.set_scaleX(value);
        this.event(Event.RESIZE);
    }
    /**@inheritDoc */
    /*override*/ set scaleY(value) {
        this.set_scaleY(value);
    }
    set_scaleY(value) {
        if (super.get_scaleY() == value)
            return;
        super.set_scaleY(value);
        this.event(Event.RESIZE);
    }
    /**@private */
    onCompResize() {
        this._sizeChanged();
    }
    /**@inheritDoc */
    /*override*/ set width(value) {
        this.set_width(value);
    }
    set_width(value) {
        if (super.get_width() == value)
            return;
        super.set_width(value);
        this.callLater(this._sizeChanged);
    }
    /**@inheritDoc */
    /*override*/ set height(value) {
        this.set_height(value);
    }
    set_height(value) {
        if (super.get_height() == value)
            return;
        super.set_height(value);
        this.callLater(this._sizeChanged);
    }
    /**X锚点，值为0-1，设置anchorX值最终通过pivotX值来改变节点轴心点。*/
    get anchorX() {
        return this.get_anchorX();
    }
    get_anchorX() {
        return this._anchorX;
    }
    set anchorX(value) {
        this.set_anchorX(value);
    }
    set_anchorX(value) {
        if (this._anchorX != value) {
            this._anchorX = value;
            this.callLater(this._sizeChanged);
        }
    }
    /**Y锚点，值为0-1，设置anchorY值最终通过pivotY值来改变节点轴心点。*/
    get anchorY() {
        return this.get_anchorY();
    }
    get_anchorY() {
        return this._anchorY;
    }
    set anchorY(value) {
        this.set_anchorY(value);
    }
    set_anchorY(value) {
        if (this._anchorY != value) {
            this._anchorY = value;
            this.callLater(this._sizeChanged);
        }
    }
    /*override*/ _childChanged(child = null) {
        this.callLater(this._sizeChanged);
        super._childChanged(child);
    }
}
