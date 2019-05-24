//import { TextAtlas } from "././TextAtlas";
import { LayaGL } from "../../layagl/LayaGL";
import { RenderInfo } from "../../renders/RenderInfo";
import { Resource } from "../../resource/Resource";
import { WebGLContext } from "../WebGLContext";
import { ILaya } from "../../../ILaya";
export class TextTexture extends Resource {
    //public var isIso:Boolean = false;
    constructor(textureW, textureH) {
        super();
        this._texW = 0;
        this._texH = 0;
        this.__destroyed = false; //父类有，但是private
        this._discardTm = 0; //释放的时间。超过一定时间会被真正删除
        this.genID = 0; // 这个对象会重新利用，为了能让引用他的人知道自己引用的是否有效，加个id
        this.bitmap = { id: 0, _glTexture: null }; //samekey的判断用的
        this.curUsedCovRate = 0; // 当前使用到的使用率。根据面积算的
        this.curUsedCovRateAtlas = 0; // 大图集中的占用率。由于大图集分辨率低，所以会浪费一些空间
        this.lastTouchTm = 0;
        this.ri = null; // 如果是独立文字贴图的话带有这个信息
        this._texW = textureW || TextTexture.gTextRender.atlasWidth;
        this._texH = textureH || TextTexture.gTextRender.atlasWidth;
        this.bitmap.id = this.id;
        this.lock = true; //防止被资源管理清除
    }
    recreateResource() {
        if (this._source)
            return;
        var gl = ILaya.Render.isConchApp ? LayaGL.instance.getDefaultCommandEncoder() : WebGLContext.mainContext;
        var glTex = this._source = gl.createTexture();
        this.bitmap._glTexture = glTex;
        WebGLContext.bindTexture(gl, WebGLContext.TEXTURE_2D, glTex);
        //gl.bindTexture(WebGLContext.TEXTURE_2D, glTex);
        //var sz:int = _width * _height * 4;
        //分配显存。
        gl.texImage2D(WebGLContext.TEXTURE_2D, 0, WebGLContext.RGBA, this._texW, this._texH, 0, WebGLContext.RGBA, WebGLContext.UNSIGNED_BYTE, null);
        gl.texParameteri(WebGLContext.TEXTURE_2D, WebGLContext.TEXTURE_MIN_FILTER, WebGLContext.LINEAR); //不能用点采样，否则旋转的时候，非常难看
        gl.texParameteri(WebGLContext.TEXTURE_2D, WebGLContext.TEXTURE_MAG_FILTER, WebGLContext.LINEAR);
        gl.texParameteri(WebGLContext.TEXTURE_2D, WebGLContext.TEXTURE_WRAP_S, WebGLContext.CLAMP_TO_EDGE);
        gl.texParameteri(WebGLContext.TEXTURE_2D, WebGLContext.TEXTURE_WRAP_T, WebGLContext.CLAMP_TO_EDGE);
        //TODO 预乘alpha
        if (TextTexture.gTextRender.debugUV) {
            this.fillWhite();
        }
    }
    /**
     *
     * @param	data
     * @param	x			拷贝位置。
     * @param	y
     * @param  uv
     * @return uv数组  如果uv不为空就返回传入的uv，否则new一个数组
     */
    addChar(data, x, y, uv = null) {
        //if (!ILaya.Render.isConchApp &&  !__JS__('(data instanceof ImageData)')) {
        if (TextTexture.gTextRender.isWan1Wan) {
            return this.addCharCanvas(data, x, y, uv);
        }
        !this._source && this.recreateResource();
        var gl = ILaya.Render.isConchApp ? LayaGL.instance.getDefaultCommandEncoder() : WebGLContext.mainContext;
        WebGLContext.bindTexture(gl, WebGLContext.TEXTURE_2D, this._source);
        !ILaya.Render.isConchApp && gl.pixelStorei(WebGLContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        var dt = data.data;
        if (data.data instanceof Uint8ClampedArray)
            dt = new Uint8Array(dt.buffer);
        gl.texSubImage2D(WebGLContext.TEXTURE_2D, 0, x, y, data.width, data.height, WebGLContext.RGBA, WebGLContext.UNSIGNED_BYTE, dt);
        !ILaya.Render.isConchApp && gl.pixelStorei(WebGLContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        var u0;
        var v0;
        var u1;
        var v1;
        if (ILaya.Render.isConchApp) {
            u0 = x / this._texW; // +1 表示内缩一下，反正文字总是有留白。否则会受到旁边的一个像素的影响
            v0 = y / this._texH;
            u1 = (x + data.width) / this._texW; // 注意是-1,不是-2
            v1 = (y + data.height) / this._texH;
        }
        else {
            u0 = (x + 1) / this._texW; // +1 表示内缩一下，反正文字总是有留白。否则会受到旁边的一个像素的影响
            v0 = (y) / this._texH;
            u1 = (x + data.width - 1) / this._texW; // 注意是-1,不是-2
            v1 = (y + data.height - 1) / this._texH;
        }
        uv = uv || new Array(8);
        uv[0] = u0, uv[1] = v0;
        uv[2] = u1, uv[3] = v0;
        uv[4] = u1, uv[5] = v1;
        uv[6] = u0, uv[7] = v1;
        return uv;
    }
    /**
     * 玩一玩不支持 getImageData
     * @param	canv
     * @param	x
     * @param	y
     */
    addCharCanvas(canv, x, y, uv = null) {
        !this._source && this.recreateResource();
        var gl = ILaya.Render.isConchApp ? LayaGL.instance.getDefaultCommandEncoder() : WebGLContext.mainContext;
        WebGLContext.bindTexture(gl, WebGLContext.TEXTURE_2D, this._source);
        !ILaya.Render.isConchApp && gl.pixelStorei(WebGLContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texSubImage2D(WebGLContext.TEXTURE_2D, 0, x, y, WebGLContext.RGBA, WebGLContext.UNSIGNED_BYTE, canv);
        !ILaya.Render.isConchApp && gl.pixelStorei(WebGLContext.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        var u0;
        var v0;
        var u1;
        var v1;
        if (ILaya.Render.isConchApp) {
            u0 = x / this._texW; // +1 表示内缩一下，反正文字总是有留白。否则会受到旁边的一个像素的影响
            v0 = y / this._texH;
            u1 = (x + canv.width) / this._texW;
            v1 = (y + canv.height) / this._texH;
        }
        else {
            u0 = (x + 1) / this._texW; // +1 表示内缩一下，反正文字总是有留白。否则会受到旁边的一个像素的影响
            v0 = (y + 1) / this._texH;
            u1 = (x + canv.width - 1) / this._texW;
            v1 = (y + canv.height - 1) / this._texH;
        }
        uv = uv || new Array(8);
        uv[0] = u0, uv[1] = v0;
        uv[2] = u1, uv[3] = v0;
        uv[4] = u1, uv[5] = v1;
        uv[6] = u0, uv[7] = v1;
        return uv;
    }
    /**
     * 填充白色。调试用。
     */
    fillWhite() {
        !this._source && this.recreateResource();
        var gl = ILaya.Render.isConchApp ? LayaGL.instance.getDefaultCommandEncoder() : WebGLContext.mainContext;
        var dt = new Uint8Array(this._texW * this._texH * 4);
        (dt).fill(0xff);
        gl.texSubImage2D(WebGLContext.TEXTURE_2D, 0, 0, 0, this._texW, this._texH, WebGLContext.RGBA, WebGLContext.UNSIGNED_BYTE, dt);
    }
    discard() {
        // 非标准大小不回收。
        if (this._texW != TextTexture.gTextRender.atlasWidth || this._texH != TextTexture.gTextRender.atlasWidth) {
            this.destroy();
            return;
        }
        this.genID++;
        if (TextTexture.poolLen >= TextTexture.pool.length) {
            TextTexture.pool = TextTexture.pool.concat(new Array(10));
        }
        this._discardTm = RenderInfo.loopStTm;
        TextTexture.pool[TextTexture.poolLen++] = this;
    }
    static getTextTexture(w, h) {
        if (w != TextTexture.gTextRender.atlasWidth || w != TextTexture.gTextRender.atlasWidth)
            return new TextTexture(w, h);
        // 否则从回收池中取
        if (TextTexture.poolLen > 0) {
            var ret = TextTexture.pool[--TextTexture.poolLen];
            if (TextTexture.poolLen > 0)
                TextTexture.clean(); //给个clean的机会。
            return ret;
        }
        return new TextTexture(w, h);
    }
    /*override*/ destroy() {
        //console.log('destroy TextTexture');
        this.__destroyed = true;
        var gl = ILaya.Render.isConchApp ? LayaGL.instance.getDefaultCommandEncoder() : WebGLContext.mainContext;
        this._source && gl.deleteTexture(this._source);
        this._source = null;
    }
    /**
     * 定期清理
     * 为了简单，只有发生 getAPage 或者 discardPage的时候才检测是否需要清理
     */
    static clean() {
        var curtm = RenderInfo.loopStTm; // Laya.stage.getFrameTm();
        if (TextTexture.cleanTm === 0)
            TextTexture.cleanTm = curtm;
        if (curtm - TextTexture.cleanTm >= TextTexture.gTextRender.checkCleanTextureDt) { //每10秒看看pool中的贴图有没有很老的可以删除的
            for (var i = 0; i < TextTexture.poolLen; i++) {
                var p = TextTexture.pool[i];
                if (curtm - p._discardTm >= TextTexture.gTextRender.destroyUnusedTextureDt) { //超过20秒没用的删掉
                    p.destroy(); //真正删除贴图
                    TextTexture.pool[i] = TextTexture.pool[TextTexture.poolLen - 1];
                    TextTexture.poolLen--;
                    i--; //这个还要处理，用来抵消i++
                }
            }
            TextTexture.cleanTm = curtm;
        }
    }
    touchRect(ri, curloop) {
        if (this.lastTouchTm != curloop) {
            this.curUsedCovRate = 0;
            this.curUsedCovRateAtlas = 0;
            this.lastTouchTm = curloop;
        }
        var texw2 = TextTexture.gTextRender.atlasWidth * TextTexture.gTextRender.atlasWidth;
        var gridw2 = ILaya.TextAtlas.atlasGridW * ILaya.TextAtlas.atlasGridW;
        this.curUsedCovRate += (ri.bmpWidth * ri.bmpHeight) / texw2;
        this.curUsedCovRateAtlas += (Math.ceil(ri.bmpWidth / ILaya.TextAtlas.atlasGridW) * Math.ceil(ri.bmpHeight / ILaya.TextAtlas.atlasGridW)) / (texw2 / gridw2);
    }
    // 为了与当前的文字渲染兼容的补丁
    get texture() {
        return this;
    }
    _getSource() {
        return this._source;
    }
    // for debug
    drawOnScreen(x, y) {
    }
}
TextTexture.gTextRender = null;
TextTexture.pool = new Array(10); // 回收用
TextTexture.poolLen = 0;
TextTexture.cleanTm = 0;
