/**

 @Name：Kz.layedit 富文本编辑器
 @Author：贤心
 @Modifier:KnifeZ
 @License：MIT
  @Version: V18.11.16
 */

layui.define(['layer', 'form'], function (exports) {
    "use strict";

    var $ = layui.$
        , layer = layui.layer
        , form = layui.form
        , hint = layui.hint()
        , device = layui.device()

        , MOD_NAME = 'layedit', THIS = 'layui-this', SHOW = 'layui-show', ABLED = 'layui-disabled'

        , Edit = function () {
            var that = this;
            that.index = 0;

            //全局配置
            that.config = {
                //默认工具bar
                tool: [
                    'strong', 'italic', 'underline', 'del'
                    , '|'
                    , 'left', 'center', 'right'
                    , '|'
                    , 'link', 'unlink', 'face', 'image'
                ]
                , uploadImage: {
                    url: '',
                    accept: 'image',
                    acceptMime: 'image/*',
                    exts: 'jpg|png|gif|bmp|jpeg',
                    size: '10240'
                }
                , uploadVideo: {
                    url: '',
                    accept: 'video',
                    acceptMime: 'video/*',
                    exts: 'mp4|flv|avi|rm|rmvb',
                    size: '20480'
                }
                , calldel: {
                    url: ''
                }
                , quote: {
                    style: [],
                    js: []
                }
                , devmode: false
                , hideTool: []
            };
        };

    //全局设置
    Edit.prototype.set = function (options) {
        var that = this;
        $.extend(true, that.config, options);
        return that;
    };

    //事件监听
    Edit.prototype.on = function (events, callback) {
        return layui.onevent(MOD_NAME, events, callback);
    };

    //建立编辑器
    Edit.prototype.build = function (id, settings) {
        settings = settings || {};

        var that = this
            , config = that.config
            , ELEM = 'layui-layedit', textArea = $(typeof (id) == 'string' ? '#' + id : id)
            , name = 'LAY_layedit_' + (++that.index)
            , haveBuild = textArea.next('.' + ELEM)

            , set = $.extend({}, config, settings)

            , tool = function () {
                var node = [], hideTools = {};
                layui.each(set.hideTool, function (_, item) {
                    hideTools[item] = true;
                });
                layui.each(set.tool, function (_, item) {
                    if (tools[item] && !hideTools[item]) {
                        node.push(tools[item]);
                    }
                });
                return node.join('');
            }()


            , editor = $(['<div class="' + ELEM + '">'
                , '<div class="layui-unselect layui-layedit-tool">' + tool + '</div>'
                , '<div class="layui-layedit-iframe">'
                , '<iframe id="' + name + '" name="' + name + '" textarea="' + id + '" frameborder="0"></iframe>'
                , '</div>'
                , '</div>'].join(''))

        //编辑器不兼容ie8以下
        if (device.ie && device.ie < 8) {
            return textArea.removeClass('layui-hide').addClass(SHOW);
        }

        haveBuild[0] && (haveBuild.remove());

        setIframe.call(that, editor, textArea[0], set)
        textArea.addClass('layui-hide').after(editor);

        return that.index;
    };

    //获得编辑器中内容
    Edit.prototype.getContent = function (index) {
        var iframeWin = getWin(index);
        if (!iframeWin[0]) return;
        return toLower(iframeWin[0].document.body.innerHTML);
    };

    //获得编辑器中纯文本内容
    Edit.prototype.getText = function (index) {
        var iframeWin = getWin(index);
        if (!iframeWin[0]) return;
        return $(iframeWin[0].document.body).text();
    };
    /**
     * 设置编辑器内容
     * @param {[type]} index   编辑器索引
     * @param {[type]} content 要设置的内容
     * @param {[type]} flag    是否追加模式
     */
    Edit.prototype.setContent = function (index, content, flag) {
        var iframeWin = getWin(index);
        if (!iframeWin[0]) return;
        if (flag) {
            $(iframeWin[0].document.body).append(content)
        } else {
            $(iframeWin[0].document.body).html(content)
        };
        this.sync(index)
    };
    //将编辑器内容同步到textarea（一般用于异步提交时）
    Edit.prototype.sync = function (index) {
        var iframeWin = getWin(index);
        if (!iframeWin[0]) return;
        var textarea = $('#' + iframeWin[1].attr('textarea'));
        textarea.val(toLower(iframeWin[0].document.body.innerHTML));
    };

    //获取编辑器选中内容
    Edit.prototype.getSelection = function (index) {
        var iframeWin = getWin(index);
        if (!iframeWin[0]) return;
        var range = Range(iframeWin[0].document);
        return document.selection ? range.text : range.toString();
    };

    //iframe初始化
    var setIframe = function (editor, textArea, set) {
        var that = this, iframe = editor.find('iframe');

        iframe.css({
            height: set.height
        }).on('load', function () {
            var conts = iframe.contents()
                , iframeWin = iframe.prop('contentWindow')
                , head = conts.find('head')
                , style = $(['<style>'
                    , '*{margin: 0; padding: 0;}'
                    , 'body{padding: 10px; line-height: 20px; overflow-x: hidden; word-wrap: break-word; font: 14px Helvetica Neue,Helvetica,PingFang SC,Microsoft YaHei,Tahoma,Arial,sans-serif; -webkit-box-sizing: border-box !important; -moz-box-sizing: border-box !important; box-sizing: border-box !important;}'
                    , 'a{color:#01AAED; text-decoration:none;}a:hover{color:#c00}'
                    , 'p{margin-bottom: 10px;}'
                    , 'video{max-width:400px;}'
                    , '.anchor:after{content:"¿";background-color:yellow;color: red;font - weight: bold;}'
                    , 'img{display: inline-block; border: none; vertical-align: middle;}'
                    , 'pre{margin: 10px 0; padding: 10px; line-height: 20px; border: 1px solid #ddd; border-left-width: 6px; background-color: #F2F2F2; color: #333; font-family: Courier New; font-size: 12px;}'
                    , '</style>'].join(''))
                , body = conts.find('body');

            head.append(style);
            body.attr('contenteditable', 'true').css({
                'min-height': set.height
            }).html(textArea.value || '');

            hotkey.apply(that, [iframeWin, iframe, textArea, set]); //快捷键处理
            toolActive.call(that, iframeWin, editor, set); //触发工具

        });
    }

        //获得iframe窗口对象
        , getWin = function (index) {
            var iframe = $('#LAY_layedit_' + index)
                , iframeWin = iframe.prop('contentWindow');
            return [iframeWin, iframe];
        }

        //IE8下将标签处理成小写
        , toLower = function (html) {
            if (device.ie == 8) {
                html = html.replace(/<.+>/g, function (str) {
                    return str.toLowerCase();
                });
            }
            return html;
        }

        //快捷键处理
        , hotkey = function (iframeWin, iframe, textArea, set) {
            var iframeDOM = iframeWin.document, body = $(iframeDOM.body);
            body.on('keydown', function (e) {
                var keycode = e.keyCode;
                //处理回车
                if (keycode === 13) {
                    var range = Range(iframeDOM);
                    var container = getContainer(range)
                        , parentNode = container.parentNode;

                    if (parentNode.tagName.toLowerCase() === 'pre') {
                        if (e.shiftKey) return
                        layer.msg('请暂时用shift+enter');
                        return false;
                    }
                    if (parentNode.tagName.toLowerCase() === 'body') {
                        iframeDOM.execCommand('formatBlock', false, '<p>');
                    }
                }
            });

            //给textarea同步内容
            $(textArea).parents('form').on('submit', function () {
                var html = body.html();
                //IE8下将标签处理成小写
                if (device.ie == 8) {
                    html = html.replace(/<.+>/g, function (str) {
                        return str.toLowerCase();
                    });
                }
                textArea.value = html;
            });

            //处理粘贴
            body.on('paste', function (e) {
                iframeDOM.execCommand('formatBlock', false, '<p>');
                setTimeout(function () {
                    filter.call(iframeWin, body);
                    textArea.value = body.html();
                }, 100);
            });
        }

        //标签过滤
        , filter = function (body) {
            var iframeWin = this
                , iframeDOM = iframeWin.document;

            //清除影响版面的css属性
            body.find('*[style]').each(function () {
               var textAlign = this.style.textAlign;
               this.removeAttribute('style');
               $(this).css({
                   'text-align': textAlign || ''
               })
            });

            ////修饰表格
            //body.find('table').addClass('layui-table');

            //移除不安全的标签
            body.find('script,link').remove();
        }

        //Range对象兼容性处理
        , Range = function (iframeDOM) {
            return iframeDOM.selection
                ? iframeDOM.selection.createRange()
                : iframeDOM.getSelection().getRangeAt(0);
        }

        //当前Range对象的endContainer兼容性处理
        , getContainer = function (range) {
            return range.endContainer || range.parentElement().childNodes[0]
        }

        //在选区插入内联元素
        , insertInline = function (tagName, attr, range) {
            var iframeDOM = this.document
                , elem = document.createElement(tagName)
            for (var key in attr) {
                elem.setAttribute(key, attr[key]);
            }
            elem.removeAttribute('text');

            if (iframeDOM.selection) { //IE
                var text = range.text || attr.text;
                if (tagName === 'a' && !text) return;
                if (text) {
                    elem.innerHTML = text;
                }
                range.pasteHTML($(elem).prop('outerHTML'));
                range.select();
            } else { //非IE
                var text = range.toString() || attr.text;
                if (tagName === 'a' && !text) return;
                if (text) {
                    elem.innerHTML = text;
                }
                range.deleteContents();
                range.insertNode(elem);
            }
        }

        //工具选中
        , toolCheck = function (tools, othis) {
            var iframeDOM = this.document
                , CHECK = 'layedit-tool-active'
                , container = getContainer(Range(iframeDOM))
                , item = function (type) {
                    return tools.find('.layedit-tool-' + type)
                }

            if (othis) {
                othis[othis.hasClass(CHECK) ? 'removeClass' : 'addClass'](CHECK);

            }
            tools.find('>i').removeClass(CHECK);
            item('unlink').addClass(ABLED);

            $(container).parents().each(function () {
                var tagName = this.tagName.toLowerCase()
                    , textAlign = this.style.textAlign;
                //文字
                //if (tagName === 'b' || tagName === 'strong') {
                //    item('b').addClass(CHECK)
                //}
                //if (tagName === 'i' || tagName === 'em') {
                //    item('i').addClass(CHECK)
                //}
                //if (tagName === 'u') {
                //    item('u').addClass(CHECK)
                //}
                //if (tagName === 'strike') {
                //    item('d').addClass(CHECK)
                //}
                //对齐
                if (tagName === 'p') {
                    if (textAlign === 'center') {
                        item('center').addClass(CHECK);
                    } else if (textAlign === 'right') {
                        item('right').addClass(CHECK);
                    } else {
                        item('left').addClass(CHECK);
                    }
                }
                //超链接
                if (tagName === 'a') {
                    item('link').addClass(CHECK);
                    item('unlink').removeClass(ABLED);
                }
            });
        }

        //触发工具
        , toolActive = function (iframeWin, editor, set) {
            var iframeDOM = iframeWin.document
                , body = $(iframeDOM.body)
                , toolEvent = {
                    //超链接
                    link: function (range) {
                        var container = getContainer(range)
                            , parentNode = $(container).parent();

                        link.call(body, {
                            href: parentNode.attr('href')
                            , target: parentNode.attr('target')
                            , rel: parentNode.attr('rel')
                            , text: parentNode.attr('text')
                            , dmode: set.devmode
                        }, function (field) {
                            var parent = parentNode[0];
                            if (parent.tagName === 'A') {
                                parent.href = field.url;
                                parent.rel = field.rel;
                                parent.text = field.text;
                            } else {
                                insertInline.call(iframeWin, 'a', {
                                    target: field.target
                                    , href: field.url
                                    , rel: field.rel
                                    , text: field.text
                                }, range);
                            }
                        });
                    }
                    //清除超链接
                    , unlink: function (range) {
                        iframeDOM.execCommand('unlink');
                    }
                    //表情
                    , face: function (range) {
                        face.call(this, function (img) {
                            insertInline.call(iframeWin, 'img', {
                                src: img.src
                                , alt: img.alt
                            }, range);
                        });
                    }
                    //图片
                    , image: function (range) {
                        var that = this;
                        layui.use('upload', function (upload) {
                            var uploadImage = set.uploadImage || {};
                            upload.render({
                                url: uploadImage.url
                                , method: uploadImage.type
                                , accept: uploadImage.accept
                                , acceptMime: uploadImage.acceptMime
                                , exts: uploadImage.exts
                                , size: uploadImage.size
                                , elem: $(that).find('input')[0]
                                , done: function (res) {
                                    if (res.code == 0) {
                                        res.data = res.data || {};
                                        insertInline.call(iframeWin, 'img', {
                                            src: res.data.src
                                            , alt: res.data.title
                                        }, range);
                                    } else {
                                        layer.msg(res.msg || '上传失败');
                                    }
                                }
                            });
                        });
                    }
                    //插入代码
                    , code: function (range) {
                        var codeConfig = set.codeConfig || { hide: false };
                        code.call(body, { hide: codeConfig.hide, default: codeConfig.default }, function (pre) {
                            insertInline.call(iframeWin, 'pre', {
                                text: pre.code
                                , 'lay-lang': pre.lang
                            }, range);
                        });
                    }
                    /*#Extens#*/
                    //图片2                    
                    , image_alt: function (range) {
                        var that = this;
                        layer.open({
                            type: 1
                            , id: 'fly-jie-image-upload'
                            , title: '图片管理'
                            , shade: false
                            , area: '485px'
                            , offset: '100px'
                            , skin: 'layui-layer-border'
                            , content: ['<ul class="layui-form layui-form-pane" style="margin: 20px;">'
                                , '<li class="layui-form-item">'
                                , '<label class="layui-form-label">图片</label>'
                                , '<button type="button" class="layui-btn" id="LayEdit_InsertImage"> <i class="layui-icon"></i>上传图片</button>'
                                , '<input type="text" name="Imgsrc" placeholder="请选择文件" style="width: 49%;position: relative;float: right;" class="layui-input">'
                                , '</li>'
                                , '<li class="layui-form-item">'
                                , '<label class="layui-form-label">描述</label>'
                                , '<input type="text" required name="altStr" placeholder="alt属性" style="width: 75%;" value="" class="layui-input">'
                                , '</li>'
                                , '<li class="layui-form-item">'
                                , '<label class="layui-form-label">宽度</label>'
                                , '<input type="text" required name="imgWidth" placeholder="width" style="width: 25%;position: relative;float: left;" value="" class="layui-input">'
                                , '<label class="layui-form-label">高度</label>'
                                , '<input type="text" required name="imgHeight" placeholder="height" style="width: 25%;" value="" class="layui-input">'
                                , '</li>'
                                , '<li class="layui-form-item" style="text-align: center;">'
                                , '<button type="button" lay-submit  class="layui-btn layedit-btn-yes"> 确定 </button>'
                                , '<button style="margin-left: 20px;" type="button" class="layui-btn layui-btn-primary"> 取消 </button>'
                                , '</li>'
                                , '</ul>'].join('')
                            , success: function (layero, index) {
                                layui.use('upload', function (upload) {
                                    var upload = layui.upload;
                                    var loding, altStr = layero.find('input[name="altStr"]'), Imgsrc = layero.find('input[name="Imgsrc"]');
                                    var uploadImage = set.uploadImage || {};
                                    //执行实例
                                    upload.render({
                                        elem: '#LayEdit_InsertImage'
                                        , url: uploadImage.url
                                        , method: uploadImage.type
                                        , accept: uploadImage.accept
                                        , acceptMime: uploadImage.acceptMime
                                        , exts: uploadImage.exts
                                        , size: uploadImage.size
                                        , before: function (obj) { loding = layer.msg('文件上传中,请稍等哦', { icon: 16, shade: 0.3, time: 0 }); }
                                        , done: function (res, input, upload) {
                                            layer.close(loding);
                                            if (res.code == 0) {
                                                res.data = res.data || {};
                                                Imgsrc.val(res.data.src);
                                                altStr.val(res.data.name);
                                            } else {
                                                var curIndex = layer.open({
                                                    type: 1
                                                    , anim: 2
                                                    , icon: 5
                                                    , title: '提示'
                                                    , area: ['390px', '260px']
                                                    , offset: 't'
                                                    , content: res.msg + "<div style='text-align:center;'><img src='" + res.data.src + "' style='max-height:80px'/></div><p style='text-align:center'>确定使用该文件吗？</p>"
                                                    , btn: ['确定', '取消']
                                                    , yes: function () {
                                                        res.data = res.data || {};
                                                        Imgsrc.val(res.data.src);
                                                        altStr.val(res.data.name);
                                                        layer.close(curIndex);
                                                    }
                                                    , btn2: function () {
                                                        layer.close(curIndex);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                    layero.find('.layui-btn-primary').on('click', function () {
                                        layer.close(index);
                                    });
                                    layero.find('.layedit-btn-yes').on('click', function () {
                                        var styleStr = "";
                                        if (layero.find('input[name="imgWidth"]').val() != "") {
                                            styleStr += "width:" + layero.find('input[name="imgWidth"]').val() + ";";
                                        }
                                        if (layero.find('input[name="imgHeight"]').val() != "") {
                                            styleStr += "height:" + layero.find('input[name="imgHeight"]').val() + ";";
                                        }
                                        insertInline.call(iframeWin, 'img', {
                                            src: Imgsrc.val()
                                            , alt: altStr.val()
                                            , style: styleStr
                                        }, range);
                                        layer.close(index);
                                    });
                                })

                            }
                        });
                    }
                    //插入视频
                    , video: function (range) {
                        var body = this;
                        layer.open({
                            type: 1
                            , id: 'fly-jie-video-upload'
                            , title: '视频'
                            , shade: false
                            , area: '600px'
                            , offset: '100px'
                            , skin: 'layui-layer-border'
                            , content: ['<ul class="layui-form layui-form-pane" style="margin: 20px;">'
                                , '<li class="layui-form-item">'
                                , '<button type="button" class="layui-btn" id="LayEdit_InsertVideo"> <i class="layui-icon"></i>上传视频</button>'
                                , '<input type="text" name="video" placeholder="请选择文件" style="width: 79%;position: relative;float: right;" class="layui-input">'
                                , '</li>'
                                , '<li class="layui-form-item">'
                                , '<button type="button" class="layui-btn" id="LayEdit_InsertImage"> <i class="layui-icon"></i>上传封面</button>'
                                , '<input type="text" name="cover" placeholder="请选择文件" style="width: 79%;position: relative;float: right;" class="layui-input">'
                                , '</li>'
                                , '<li class="layui-form-item" style="text-align: center;">'
                                , '<button type="button" lay-submit  class="layui-btn layedit-btn-yes"> 确定 </button>'
                                , '<button style="margin-left: 20px;" type="button" class="layui-btn layui-btn-primary"> 取消 </button>'
                                , '</li>'
                                , '</ul>'].join('')
                            , success: function (layero, index) {

                                layui.use('upload', function (upload) {
                                    var loding, video = layero.find('input[name="video"]'), cover = layero.find('input[name="cover"]');
                                    var upload = layui.upload;
                                    var uploadImage = set.uploadImage || {};
                                    var uploadfile = set.uploadVideo || {};
                                    //执行实例
                                    upload.render({
                                        elem: '#LayEdit_InsertImage'
                                        , url: uploadImage.url
                                        , method: uploadImage.type
                                        , accept: uploadImage.accept
                                        , acceptMime: uploadImage.acceptMime
                                        , exts: uploadImage.exts
                                        , size: uploadImage.size
                                        , before: function (obj) { loding = layer.msg('文件上传中,请稍等哦', { icon: 16, shade: 0.3, time: 0 }); }
                                        , done: function (res, input, upload) {
                                            layer.close(loding);
                                            if (res.code == 0) {
                                                res.data = res.data || {};
                                                cover.val(res.data.src);
                                            } else {
                                                var curIndex = layer.open({
                                                    type: 1
                                                    , anim: 2
                                                    , icon: 5
                                                    , title: '提示'
                                                    , area: ['390px', '260px']
                                                    , offset: 't'
                                                    , content: res.msg + "<div><img src='" + res.data.src + "' style='max-height:100px'/></div><label class='layui-form-label'>确定使用该文件吗？</label>"
                                                    , btn: ['确定', '取消']
                                                    , yes: function () {
                                                        res.data = res.data || {};
                                                        cover.val(res.data.src);
                                                        layer.close(curIndex);
                                                    }
                                                    , btn2: function () {
                                                        layer.close(curIndex);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                    upload.render({
                                        elem: '#LayEdit_InsertVideo'
                                        , url: uploadfile.url
                                        , accept: uploadfile.accept
                                        , acceptMime: uploadfile.acceptMime
                                        , exts: uploadfile.exts
                                        , size: uploadfile.size
                                        , before: function (obj) { loding = layer.msg('文件上传中,请稍等哦', { icon: 16, shade: 0.3, time: 0 }); }
                                        , done: function (res, input, upload) {
                                            layer.close(loding);
                                            if (res.code == 0) {
                                                res.data = res.data || {};
                                                video.val(res.data.src);
                                            } else {
                                                var curIndex = layer.open({
                                                    type: 1
                                                    , anim: 2
                                                    , icon: 5
                                                    , title: '提示'
                                                    , area: ['390px', '260px']
                                                    , offset: 't'
                                                    , content: res.msg + "<div><video src='" + res.data.src + "' style='max-height:100px' controls='controls'/></div>确定使用该文件吗？"
                                                    , btn: ['确定', '取消']
                                                    , yes: function () {
                                                        res.data = res.data || {};
                                                        video.val(res.data.src);
                                                        layer.close(curIndex);
                                                    }
                                                    , btn2: function () {
                                                        layer.close(curIndex);
                                                    }
                                                });
                                            }
                                        }
                                    });
                                    layero.find('.layui-btn-primary').on('click', function () {
                                        layer.close(index);
                                    });
                                    layero.find('.layedit-btn-yes').on('click', function () {

                                        var container = getContainer(range)
                                            , parentNode = $(container).parent();
                                        insertInline.call(iframeWin, 'p', {
                                            text: '&nbsp;<video src="' + video.val() + '" poster="' + cover.val() + '" controls="controls" >您的浏览器不支持video播放</video>&nbsp;'
                                        }, range);
                                        layer.close(index);
                                    });
                                })

                            }
                        });
                    }
                    //源码模式
                    , html: function (range) {
                        var that = this;
                        var docs = that.parentElement.nextElementSibling.firstElementChild.contentDocument.body.innerHTML;
                        docs = style_html(docs, 4, ' ', 80);
                        layer.open({
                            type: 1
                            , id: 'knife-z-html'
                            , title: '源码模式'
                            , shade: 0.3
                            //, maxmin: true
                            , area: ['1366px', '700px']
                            , offset: '0px'
                            , content: ['<div id ="aceHtmleditor" style="width:100%;height:80%"></div>'
                                , '<div style="text-align:center">'
                                , '<button type="button" class="layui-btn layedit-btn-yes"> 确定 </button>'
                                , '<button style="margin-left: 20px;" type="button" class="layui-btn layui-btn-primary"> 取消 </button>'
                                , '</div>'
                            ].join('')
                            , success: function (layero, index) {
                                var editor = ace.edit('aceHtmleditor');
                                editor.setFontSize(14);
                                editor.session.setMode("ace/mode/html");
                                editor.setTheme("ace/theme/tomorrow");
                                editor.setValue(docs);
                                editor.setOption("wrap", "free")
                                editor.gotoLine(0);
                                layero.find('.layui-btn-primary').on('click', function () {
                                    layer.close(index);
                                });
                                layero.find('.layedit-btn-yes').on('click', function () {
                                    iframeWin.document.body.innerHTML = editor.getValue();
                                    layer.close(index);
                                });
                                window.onresize = function () {
                                    editor.resize();
                                }
                            }
                        });
                    }
                    //全屏
                    , fullScreen: function (range) {
                        if (this.parentElement.parentElement.getAttribute("style") == null) {
                            this.parentElement.parentElement.setAttribute("style", "position: fixed;top: 0;left: 0;height: 100%;width: 100%;background-color: antiquewhite;z-index: 9999;");
                            this.parentElement.nextElementSibling.style = "height:100%";
                            this.parentElement.nextElementSibling.firstElementChild.style = "height:100%";
                        } else {
                            this.parentElement.parentElement.removeAttribute("style");
                            this.parentElement.nextElementSibling.removeAttribute("style");
                            this.parentElement.nextElementSibling.firstElementChild.style = "height:" + set.height;
                        }
                    }
                    //字体颜色选择
                    , colorpicker: function (range) {
                        colorpicker.call(this, function (color) {
                            iframeDOM.execCommand('forecolor', false, color);
                            setTimeout(function () {
                                body.focus();
                            }, 10);
                        });
                    }
                    , fontFomatt: function (range) {
                        var alt = set.fontFomatt || {
                            code: ["p", "h1", "h2", "h3", "h4", "div"],
                            text: ["正文(p)", "一级标题(h1)", "二级标题(h2)", "三级标题(h3)", "四级标题(h4)", "块级元素(div)"]
                        }, arr = {}, arr2 = {};
                        var codes = alt.code;
                        var texts = alt.text;
                        var fonts = function () {
                            layui.each(codes, function (index, item) {
                                arr[index] = item;
                            });
                            return arr;
                        }();
                        var fonttexts = function () {
                            layui.each(texts, function (index, item) {
                                arr2[index] = item;
                            });
                            return arr2;
                        }();
                        fontFomatt.call(this, { fonts: fonts, texts: fonttexts }, function (value) {
                            iframeDOM.execCommand('formatBlock', false, "<" + value + ">");
                            setTimeout(function () {
                                body.focus();
                            }, 10);
                        });
                    }

                    , anchors: function (range) {
                        anchors.call(body, {}, function (field) {
                            insertInline.call(iframeWin, 'a', {
                                name: "#" + field.text
                                , text: " ", class: 'anchor'
                            }, range);
                        });
                    }
                    , addhr: function (range) {
                        insertInline.call(iframeWin, 'hr', {}, range);
                    }
                    /*End*/
                    //帮助
                    , help: function () {
                        layer.open({
                            type: 2
                            , title: '帮助'
                            , area: ['600px', '380px']
                            , shadeClose: true
                            , shade: 0.1
                            , offset: '100px'
                            , skin: 'layui-layer-msg'
                            , content: ['http://www.layui.com/about/layedit/help.html', 'no']
                        });
                    }
                }
                , tools = editor.find('.layui-layedit-tool')

                , click = function () {
                    var othis = $(this)
                        , events = othis.attr('layedit-event')
                        , command = othis.attr('lay-command');

                    if (othis.hasClass(ABLED)) return;

                    body.focus();

                    var range = Range(iframeDOM)
                        , container = range.commonAncestorContainer

                    if (command) {
                        if (/justifyLeft|justifyCenter|justifyRight/.test(command)) {
                            if (container.parentNode.tagName === 'BODY') {
                                iframeDOM.execCommand('formatBlock', false, '<p>');
                            }
                        }
                        iframeDOM.execCommand(command);
                        setTimeout(function () {
                            body.focus();
                        }, 10);
                    } else {
                        toolEvent[events] && toolEvent[events].call(this, range, iframeDOM);
                    }
                    toolCheck.call(iframeWin, tools, othis);
                }

                , isClick = /image/

            tools.find('>i').on('mousedown', function () {
                var othis = $(this)
                    , events = othis.attr('layedit-event');
                if (isClick.test(events)) return;
                click.call(this)
            }).on('click', function () {
                var othis = $(this)
                    , events = othis.attr('layedit-event');
                if (!isClick.test(events)) return;
                click.call(this)
            });

            //触发内容区域
            body.on('click', function () {
                toolCheck.call(iframeWin, tools);
                layer.close(face.index);
                layer.close(colorpicker.index);
                layer.close(fontFomatt.index);
            });
            // ------------------------------------------------自己加的  回车发送
            body.keydown(function (event) {
                if (event.keyCode == 13) {
                    event.returnvalue = false;
                    if(!$('#sendMsg').is(":hidden")){
                        $('#sendMsg').click();
                    }else if(!$('#sendMsg2').is(":hidden")){
                        $('#sendMsg2').click();
                    }
                    return false;
                }
            })
            //右键菜单自定义
            body.on('contextmenu', function (event) {
                if (event != null) {
                    switch (event.target.tagName) {
                        case "IMG":
                            layer.open({
                                type: 1,
                                title: false,
                                area: "485px",
                                offset: [event.clientY + "px", event.clientX + "px"],
                                shadeClose: true,
                                content: ['<ul class="layui-form layui-form-pane" style="margin: 20px;">'
                                    , '<li class="layui-form-item">'
                                    , '<label class="layui-form-label">图片</label>'
                                    , '<button type="button" class="layui-btn" id="LayEdit_UpdateImage"> <i class="layui-icon"></i>上传图片</button>'
                                    , '<input type="text" name="Imgsrc" placeholder="请选择文件" style="width: 49%;position: relative;float: right;" value="' + event.target.src + '" class="layui-input">'
                                    , '</li>'
                                    , '<li class="layui-form-item">'
                                    , '<label class="layui-form-label">描述</label>'
                                    , '<input type="text" required name="altStr" placeholder="alt属性" style="width: 75%;" value="' + event.target.alt + '" class="layui-input">'
                                    , '</li>'
                                    , '</li>'
                                    , '<li class="layui-form-item">'
                                    , '<label class="layui-form-label">宽度</label>'
                                    , '<input type="text" required name="imgWidth" placeholder="width" style="width: 25%;position: relative;float: left;" value="' + event.target.width + '" class="layui-input">'
                                    , '<label class="layui-form-label">高度</label>'
                                    , '<input type="text" required name="imgHeight" placeholder="height" style="width: 25%;" value="' + event.target.height + '" class="layui-input">'
                                    , '</li>'
                                    , '<li class="layui-form-item" style="text-align: center;">'
                                    , '<button type="button" lay-submit  class="layui-btn layedit-btn-yes"> 确定 </button>'
                                    , '<button style="margin-left: 20px;" type="button" class="layui-btn layui-btn-primary"> 取消 </button>'
                                    , '<button type="button" class="layui-btn layui-btn-danger" > 删除 </button>'
                                    , '</li>'
                                    , '</ul>'].join(''),
                                success: function (layero, index) {
                                    var uploadImage = set.uploadImage || {};

                                    layui.use('upload', function (upload) {
                                        var loding, altStr = layero.find('input[name="altStr"]'), Imgsrc = layero.find('input[name="Imgsrc"]');
                                        upload = layui.upload;
                                        upload.render({
                                            elem: '#LayEdit_UpdateImage'
                                            , url: uploadImage.url
                                            , method: uploadImage.type
                                            , accept: uploadImage.accept
                                            , acceptMime: uploadImage.acceptMime
                                            , exts: uploadImage.exts
                                            , size: uploadImage.size
                                            , before: function (obj) { loding = layer.msg('文件上传中,请稍等哦', { icon: 16, shade: 0.3, time: 0 }); }
                                            , done: function (res, input, upload) {
                                                layer.close(loding);
                                                if (res.code == 0) {
                                                    res.data = res.data || {};
                                                    Imgsrc.val(res.data.src);
                                                    altStr.val(res.data.name);
                                                } else {
                                                    var curIndex = layer.open({
                                                        type: 1
                                                        , anim: 2
                                                        , icon: 5
                                                        , title: '提示'
                                                        , area: ['390px', '260px']
                                                        , offset: 't'
                                                        , content: res.msg + "<div style='text-align:center;'><img src='" + res.data.src + "' style='max-height:80px'/></div><p style='text-align:center'>确定使用该文件吗？</p>"
                                                        , btn: ['确定', '取消']
                                                        , yes: function () {
                                                            res.data = res.data || {};
                                                            Imgsrc.val(res.data.src);
                                                            altStr.val(res.data.name);
                                                            layer.close(curIndex);
                                                        }
                                                        , btn2: function () {
                                                            layer.close(curIndex);
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    })
                                    layero.find('.layui-btn-primary').on('click', function () {
                                        layer.close(index);
                                    });
                                    layero.find('.layedit-btn-yes').on('click', function () {
                                        event.target.src = layero.find('input[name="Imgsrc"]').val();
                                        event.target.alt = layero.find('input[name="altStr"]').val();
                                        event.target.width = layero.find('input[name="imgWidth"]').val();
                                        event.target.height = layero.find('input[name="imgHeight"]').val();
                                        layer.close(index);
                                    });
                                    layero.find('.layui-btn-danger').on('click', function () {
                                        var callDel = set.calldel;
                                        if (callDel.url != "") {
                                            $.post(callDel.url, { "imgpath": event.target.src }, function (r) {
                                                event.toElement.remove();
                                            })
                                        } else {
                                            event.toElement.remove();
                                        }
                                        layer.close(index);
                                    });
                                    return false;
                                }
                            })
                            break;
                        default:
                            var currenNode = event.toElement, parentNode = event.toElement.parentNode;
                            layer.open({
                                type: 1,
                                title: false,
                                offset: [event.clientY + "px", event.clientX + "px"],
                                shadeClose: true,
                                content: ['<ul style="width:100px">'
                                    , '<li><a type="button" class="layui-btn layui-btn-primary layui-btn-sm" style="width:80%" lay-command="left"> 居左 </a></li>'
                                    , '<li><a type="button" class="layui-btn layui-btn-primary layui-btn-sm" style="width:80%" lay-command="center"> 居中 </a></li>'
                                    , '<li><a type="button" class="layui-btn layui-btn-primary layui-btn-sm" style="width:80%" lay-command="right"> 居右 </a></li>'
                                    , '<li><a type="button" class="layui-btn layui-btn-danger layui-btn-sm"  style="width:80%"> 删除 </a></li>'
                                    , '</ul>'].join(''),
                                success: function (layero, index) {
                                    var callDel = set.calldel;
                                    layero.find('.layui-btn-primary').on('click', function () {
                                        var othis = $(this), command = othis.attr('lay-command');
                                        if (command) {
                                            if (currenNode.tagName == "VIDEO") {
                                                parentNode.style = "text-align:" + command;
                                            } else {
                                                currenNode.style = "text-align:" + command;
                                            }
                                        }
                                        layer.close(index);
                                    });
                                    layero.find('.layui-btn-danger').on('click', function () {
                                        if (currenNode.tagName == "BODY") {
                                            layer.msg("不能再删除了")
                                        }
                                        else if (currenNode.tagName == "VIDEO") {
                                            if (callDel.url != "") {
                                                $.post(callDel.url, { "filepath": event.target.src, "imgpath": event.target.poster }, function (r) {
                                                    parentNode.remove();
                                                })
                                            } else {
                                                parentNode.remove();
                                            }
                                        }
                                        else if (currenNode.tagName == "IMG") {
                                            if (callDel.url != "") {
                                                $.post(callDel.url, { para: event.target.src }, function (r) {
                                                    currenNode.remove();
                                                })
                                            } else {
                                                currenNode.remove();
                                            }
                                        } else {
                                            currenNode.remove();
                                        }
                                        layer.close(index);
                                    });
                                }
                            })
                            break;
                    }
                }
                return false;
            })
        }
        //超链接面板
        , link = function (options, callback) {
            var dMode = options.dmode;
            var body = this, index = layer.open({
                type: 1
                , id: 'LAY_layedit_link'
                , area: '460px'
                , offset: '100px'
                , shade: 0.05
                , shadeClose: true
                , moveType: 1
                , title: '超链接'
                , skin: 'layui-layer-msg'
                , content: ['<ul class="layui-form" style="margin: 15px;">'
                    , '<li class="layui-form-item">'
                    , '<label class="layui-form-label" style="width: 70px;">链接地址</label>'
                    , '<div class="layui-input-block">'
                    , '<input name="url" value="' + (options.href || '') + '" autofocus="true" autocomplete="off" class="layui-input">'
                    , '</div>'
                    , '</li>'
                    , '<li class="layui-form-item">'
                    , '<label class="layui-form-label" style="width: 70px;">链接文本</label>'
                    , '<div class="layui-input-block">'
                    , '<input name="text" value="' + (options.text || '') + '" autofocus="true" autocomplete="off" class="layui-input">'
                    , '</div>'
                    , '</li>'
                    , '<li class="layui-form-item layui-hide">'
                    , '<label class="layui-form-label" style="width: 70px;">打开方式</label>'
                    , '<div class="layui-input-block">'
                    , '<input type="radio" name="target" value="_blank" class="layui-input" title="新窗口" '
                    + ((options.target === '_blank' || !options.target) ? 'checked' : '') + '>'
                    , '<input type="radio" name="target" value="_self" class="layui-input" title="当前窗口"'
                    + (options.target === '_self' ? 'checked' : '') + '>'
                    , '</div>'
                    , '</li>'
                    , '<li class="layui-form-item layui-hide">'
                    , '<label class="layui-form-label" style="width: 70px;">rel属性</label>'
                    , '<div class="layui-input-block">'
                    , '<input type="radio" name="rel" value="nofollow" class="layui-input" title="nofollow"'
                    + ((options.rel === 'nofollow' || !options.target) ? 'checked' : '') + '>'
                    , '<input type="radio" name="rel" value="" class="layui-input" title="无" '
                    + (options.rel === '' ? 'checked' : '') + '>'
                    , '</div>'
                    , '</li>'
                    , '<li class="layui-form-item" style="text-align: center;">'
                    , '<button type="button" lay-submit lay-filter="layedit-link-yes" class="layui-btn"> 确定 </button>'
                    , '<button style="margin-left: 20px;" type="button" class="layui-btn layui-btn-primary"> 取消 </button>'
                    , '</li>'
                    , '</ul>'].join('')
                , success: function (layero, index) {
                    if (dMode) {
                        layero.find('.layui-hide').removeClass("layui-hide");
                    }
                    var eventFilter = 'submit(layedit-link-yes)';
                    form.render('radio');
                    layero.find('.layui-btn-primary').on('click', function () {
                        layer.close(index);
                        setTimeout(function () {
                            body.focus();
                        }, 10);
                    });
                    form.on(eventFilter, function (data) {
                        layer.close(link.index);
                        callback && callback(data.field);
                    });
                }
            });
            link.index = index;
        }
        , anchors = function (options, callback) {
            var body = this, index = layer.open({
                type: 1
                , id: 'LAY_layedit_addmd'
                , area: '300px'
                , offset: '100px'
                , shade: 0.05
                , shadeClose: true
                , moveType: 1
                , title: '添加锚点'
                , skin: 'layui-layer-msg'
                , content: ['<ul class="layui-form" style="margin: 15px;">'
                    , '<li class="layui-form-item">'
                    , '<label class="layui-form-label" style="width: 60px;">名称</label>'
                    , '<div class="layui-input-block" style="margin-left: 90px">'
                    , '<input name="text" value="' + (options.name || '') + '" autofocus="true" autocomplete="off" class="layui-input">'
                    , '</div>'
                    , '</li>'
                    , '<li class="layui-form-item" style="text-align: center;">'
                    , '<button type="button" lay-submit lay-filter="layedit-link-yes" class="layui-btn"> 确定 </button>'
                    , '<button style="margin-left: 20px;" type="button" class="layui-btn layui-btn-primary"> 取消 </button>'
                    , '</li>'
                    , '</ul>'].join('')
                , success: function (layero, index) {
                    var eventFilter = 'submit(layedit-link-yes)';
                    form.render('radio');
                    layero.find('.layui-btn-primary').on('click', function () {
                        layer.close(index);
                        setTimeout(function () {
                            body.focus();
                        }, 10);
                    });
                    form.on(eventFilter, function (data) {
                        layer.close(anchors.index);
                        callback && callback(data.field);
                    });
                }
            });
            anchors.index = index;
        }
        //表情面板
        , face = function (callback) {
            //表情库
            var faces = function () {
                var alt = ["[微笑]", "[嘻嘻]", "[哈哈]", "[可爱]", "[可怜]", "[挖鼻]", "[吃惊]", "[害羞]", "[挤眼]", "[闭嘴]", "[鄙视]", "[爱你]", "[泪]", "[偷笑]", "[亲亲]", "[生病]", "[太开心]", "[白眼]", "[右哼哼]", "[左哼哼]", "[嘘]", "[衰]", "[委屈]", "[吐]", "[哈欠]", "[抱抱]", "[怒]", "[疑问]", "[馋嘴]", "[拜拜]", "[思考]", "[汗]", "[困]", "[睡]", "[钱]", "[失望]", "[酷]", "[色]", "[哼]", "[鼓掌]", "[晕]", "[悲伤]", "[抓狂]", "[黑线]", "[阴险]", "[怒骂]", "[互粉]", "[心]", "[伤心]", "[猪头]", "[熊猫]", "[兔子]", "[ok]", "[耶]", "[good]", "[NO]", "[赞]", "[来]", "[弱]", "[草泥马]", "[神马]", "[囧]", "[浮云]", "[给力]", "[围观]", "[威武]", "[奥特曼]", "[礼物]", "[钟]", "[话筒]", "[蜡烛]", "[蛋糕]"], arr = {};
                layui.each(alt, function (index, item) {
                    arr[item] = layui.cache.dir + 'images/face/' + index + '.gif';
                    arr[item] = arr[item].substring(arr[item].indexOf("Content"));
                });
                return arr;
            }();
            face.hide = face.hide || function (e) {
                if ($(e.target).attr('layedit-event') !== 'face') {
                    layer.close(face.index);
                }
            }
            return face.index = layer.tips(function () {
                var content = [];
                layui.each(faces, function (key, item) {
                    content.push('<li title="' + key + '"><img src="' + item.substring(item.indexOf("Content")) + '" alt="' + key + '"/></li>');
                });
                return '<ul class="layui-clear">' + content.join('') + '</ul>';
            }(), this, {
                    tips: 1
                    , time: 0
                    , skin: 'layui-box layui-util-face'
                    , maxWidth: 500
                    , success: function (layero, index) {
                        layero.css({
                            marginTop: -4
                            , marginLeft: -10
                        }).find('.layui-clear>li').on('click', function () {
                            callback && callback({
                                src: faces[this.title]
                                , alt: this.title
                            });
                            layer.close(index); 
                        });
                        $(document).off('click', face.hide).on('click', face.hide);
                    }
                });
        }
        //字体颜色
        , colorpicker = function (callback) {
            var colors = function () {
                var alt = ["#fff", "#000", "#800000", "#ffb800", "#1e9fff", "#5fb878", "#ff5722", "#999999", "#01aaed", "#cc0000", "#ff8c00", "#ffd700", "#90ee90", "#00ced1", "#1e90ff",
                    "#c71585", "#00babd", "#ff7800"], arr = {};
                layui.each(alt, function (index, item) {
                    arr[item] = item;
                });
                return arr;
            }();
            colorpicker.hide = colorpicker.hide || function (e) {
                if ($(e.target).attr('layedit-event') !== 'colorpicker') {
                    layer.close(colorpicker.index);
                }
            }
            return colorpicker.index = layer.tips(function () {
                var content = [];
                layui.each(colors, function (key, item) {
                    content.push('<li title="' + item + '" style="background-color:' + item + '"><span style="background-' + item + '" alt="' + key + '"/></li>');
                });
                return '<ul class="layui-clear">' + content.join('') + '</ul>';
            }(), this, {
                    tips: 1
                    , time: 0
                    , skin: 'layui-box layui-util-face'
                    //, maxWidth: 300
                    , success: function (layero, index) {
                        layero.css({
                            marginTop: -4
                            , marginLeft: -10
                        }).find('.layui-clear>li').on('click', function () {
                            callback && callback(this.title);
                            layer.close(index);
                        });
                        $(document).off('click', colorpicker.hide).on('click', colorpicker.hide);
                    }
                });
        }
        , fontFomatt = function (options, callback) {
            fontFomatt.hide = fontFomatt.hide || function (e) {
                if ($(e.target).attr('layedit-event') !== 'fontFomatt') {
                    layer.close(fontFomatt.index);
                }
            }
            fontFomatt.index = layer.tips(function () {
                var content = [];
                layui.each(options.fonts, function (index, item) {
                    content.push('<li title="' + options.fonts[index] + '"><' + options.fonts[index] + '>' + options.texts[index] + '</' + options.fonts[index] + '></li>');
                });
                return '<ul class="layui-clear" style="width: max-content;">' + content.join('') + '</ul>';
            }(), this, {
                    tips: 1
                    , time: 0
                    , skin: 'layui-box layui-util-font'
                    , success: function (layero, index) {
                        layero.css({ marginTop: -4, marginLeft: -10 }).find('.layui-clear>li').on('click', function () {
                            callback && callback(this.title, options.fonts);
                            layer.close(index);
                        });
                        $(document).off('click', fontFomatt.hide).on('click', fontFomatt.hide);
                    }
                });
        }
        //插入代码面板
        , code = function (options, callback) {
            var objSel = ['<li class="layui-form-item objSel">'
                , '<label class="layui-form-label">请选择语言</label>'
                , '<div class="layui-input-block">'
                , '<select name="lang">'
                , '<option value="JavaScript">JavaScript</option>'
                , '<option value="HTML">HTML</option>'
                , '<option value="CSS">CSS</option>'
                , '<option value="Java">Java</option>'
                , '<option value="PHP">PHP</option>'
                , '<option value="C#">C#</option>'
                , '<option value="Python">Python</option>'
                , '<option value="Ruby">Ruby</option>'
                , '<option value="Go">Go</option>'
                , '</select>'
                , '</div>'
                , '</li>'].join('');
            if (options.hide) {
                objSel = ['<li class="layui-form-item" style="display:none">'
                    , '<label class="layui-form-label">请选择语言</label>'
                    , '<div class="layui-input-block">'
                    , '<select name="lang">'
                    , '<option value="' + options.default + '" selected="selected">'
                    , options.default
                    , '</option>'
                    , '</select>'
                    , '</div>'
                    , '</li>'].join('');
            }
            var body = this, index = layer.open({
                type: 1
                , id: 'LAY_layedit_code'
                , area: '550px'
                , shade: 0.05
                , shadeClose: true
                , offset: '100px'
                , moveType: 1
                , title: '插入代码'
                , skin: 'layui-layer-msg'
                , content: ['<ul class="layui-form layui-form-pane" style="margin: 15px;">'
                    , objSel
                    , '<li class="layui-form-item layui-form-text">'
                    , '<label class="layui-form-label">代码</label>'
                    , '<div class="layui-input-block">'
                    , '<textarea name="code" lay-verify="required" autofocus="true" class="layui-textarea" style="height: 200px;"></textarea>'
                    , '</div>'
                    , '</li>'
                    , '<li class="layui-form-item" style="text-align: center;">'
                    , '<button type="button" lay-submit lay-filter="layedit-code-yes" class="layui-btn"> 确定 </button>'
                    , '<button style="margin-left: 20px;" type="button" class="layui-btn layui-btn-primary"> 取消 </button>'
                    , '</li>'
                    , '</ul>'].join('')
                , success: function (layero, index) {
                    var eventFilter = 'submit(layedit-code-yes)';
                    form.render('select');
                    layero.find('.layui-btn-primary').on('click', function () {
                        layer.close(index);
                        body.focus();
                    });
                    form.on(eventFilter, function (data) {
                        layer.close(code.index);
                        callback && callback(data.field, options.hide, options.default);
                    });
                }
            });
            code.index = index;
        }
        //全部工具
        , tools = {
            html: '<i class="layui-icon layedit-tool-html" title="HTML源代码"  layedit-event="html"">&#xe64b;</i><span class="layedit-tool-mid"></span>'
            , strong: '<i class="layui-icon layedit-tool-b" title="加粗" lay-command="Bold" layedit-event="b"">&#xe62b;</i>'
            , italic: '<i class="layui-icon layedit-tool-i" title="斜体" lay-command="italic" layedit-event="i"">&#xe644;</i>'
            , underline: '<i class="layui-icon layedit-tool-u" title="下划线" lay-command="underline" layedit-event="u"">&#xe646;</i>'
            , del: '<i class="layui-icon layedit-tool-d" title="删除线" lay-command="strikeThrough" layedit-event="d"">&#xe64f;</i>'

            , '|': '<span class="layedit-tool-mid"></span>'

            , left: '<i class="layui-icon layedit-tool-left" title="左对齐" lay-command="justifyLeft" layedit-event="left"">&#xe649;</i>'
            , center: '<i class="layui-icon layedit-tool-center" title="居中对齐" lay-command="justifyCenter" layedit-event="center"">&#xe647;</i>'
            , right: '<i class="layui-icon layedit-tool-right" title="右对齐" lay-command="justifyRight" layedit-event="right"">&#xe648;</i>'
            , link: '<i class="layui-icon layedit-tool-link" title="插入链接" layedit-event="link"">&#xe64c;</i>'
            , unlink: '<i class="layui-icon layedit-tool-unlink layui-disabled" title="清除链接" lay-command="unlink" layedit-event="unlink"" style="font-size:18px">&#xe64d;</i>'
            , face: '<i class="layui-icon layedit-tool-face" title="表情" layedit-event="face"" style="font-size:18px">&#xe650;</i>'
            , image: '<i class="layui-icon layedit-tool-image" title="图片" layedit-event="image" style="font-size:18px">&#xe64a;<input type="file" name="file"></i>'
            , code: '<i class="layui-icon layedit-tool-code" title="插入代码" layedit-event="code" style="font-size:18px">&#xe64e;</i>'

            , image_alt: '<i class="layui-icon layedit-tool-image_alt" title="图片" layedit-event="image_alt" style="font-size:18px">&#xe64a;</i>'
            , video: '<i class="layui-icon layedit-tool-video" title="插入视频" layedit-event="video" style="font-size:18px">&#xe6ed;</i>'
            , fullScreen: '<i class="layui-icon layedit-tool-fullScreen" title="全屏" layedit-event="fullScreen"style="font-size:18px">&#xe638;</i>'
            , colorpicker: '<i class="layui-icon layedit-tool-colorpicker" title="字体颜色选择" layedit-event="colorpicker" style="font-size:18px">&#xe66a;</i>'
            , fontFomatt: '<i class="layui-icon layedit-tool-fontFomatt" title="段落格式" layedit-event="fontFomatt" style="font-size:18px">&#xe639;</i>'
            , fontFamily: '<i class="layui-icon layedit-tool-fontFamily" title="字体" layedit-event="fontFamily" style="font-size:18px">&#xe702;</i>'
            , addhr: '<i class="layui-icon layui-icon-chart layedit-tool-addhr" title="添加水平线" layedit-event="addhr" style="font-size:18px"></i>'
            , anchors: '<i class="layui-icon layedit-tool-anchors" title="添加锚点" layedit-event="anchors" style="font-size:18px">&#xe60b;</i>'

            , help: '<i class="layui-icon layedit-tool-help" title="帮助" layedit-event="help">&#xe607;</i>'
        }
        , edit = new Edit();
    form.render();
    exports(MOD_NAME, edit);
});
//HTML 格式化
function style_html(html_source, indent_size, indent_character, max_char) {
    var Parser, multi_parser;
    function Parser() {
        this.pos = 0;
        this.token = '';
        this.current_mode = 'CONTENT';
        this.tags = {
            parent: 'parent1',
            parentcount: 1,
            parent1: ''
        };
        this.tag_type = '';
        this.token_text = this.last_token = this.last_text = this.token_type = '';
        this.Utils = {
            whitespace: "\n\r\t ".split(''),
            single_token: 'br,input,link,meta,!doctype,basefont,base,area,hr,wbr,param,img,isindex,?xml,embed'.split(','),
            extra_liners: 'head,body,/html'.split(','),
            in_array: function (what, arr) {
                for (var i = 0; i < arr.length; i++) {
                    if (what === arr[i]) {
                        return true;
                    }
                }
                return false;
            }
        }
        this.get_content = function () {
            var char = '';
            var content = [];
            var space = false;
            while (this.input.charAt(this.pos) !== '<') {
                if (this.pos >= this.input.length) {
                    return content.length ? content.join('') : ['', 'TK_EOF'];
                }
                char = this.input.charAt(this.pos);
                this.pos++;
                this.line_char_count++;
                if (this.Utils.in_array(char, this.Utils.whitespace)) {
                    if (content.length) {
                        space = true;
                    }
                    this.line_char_count--;
                    continue;
                }
                else if (space) {
                    if (this.line_char_count >= this.max_char) {
                        content.push('\n');
                        for (var i = 0; i < this.indent_level; i++) {
                            content.push(this.indent_string);
                        }
                        this.line_char_count = 0;
                    }
                    else {
                        content.push(' ');
                        this.line_char_count++;
                    }
                    space = false;
                }
                content.push(char);
            }
            return content.length ? content.join('') : '';
        }

        this.get_script = function () {

            var char = '';
            var content = [];
            var reg_match = new RegExp('\<\/script' + '\>', 'igm');
            reg_match.lastIndex = this.pos;
            var reg_array = reg_match.exec(this.input);
            var end_script = reg_array ? reg_array.index : this.input.length;
            while (this.pos < end_script) {
                if (this.pos >= this.input.length) {
                    return content.length ? content.join('') : ['', 'TK_EOF'];
                }

                char = this.input.charAt(this.pos);
                this.pos++;


                content.push(char);
            }
            return content.length ? content.join('') : '';
        }

        this.record_tag = function (tag) {
            if (this.tags[tag + 'count']) {
                this.tags[tag + 'count']++;
                this.tags[tag + this.tags[tag + 'count']] = this.indent_level;
            }
            else {
                this.tags[tag + 'count'] = 1;
                this.tags[tag + this.tags[tag + 'count']] = this.indent_level;
            }
            this.tags[tag + this.tags[tag + 'count'] + 'parent'] = this.tags.parent;
            this.tags.parent = tag + this.tags[tag + 'count'];
        }

        this.retrieve_tag = function (tag) {
            if (this.tags[tag + 'count']) {
                var temp_parent = this.tags.parent;
                while (temp_parent) {
                    if (tag + this.tags[tag + 'count'] === temp_parent) {
                        break;
                    }
                    temp_parent = this.tags[temp_parent + 'parent'];
                }
                if (temp_parent) {
                    this.indent_level = this.tags[tag + this.tags[tag + 'count']];
                    this.tags.parent = this.tags[temp_parent + 'parent'];
                }
                delete this.tags[tag + this.tags[tag + 'count'] + 'parent'];
                delete this.tags[tag + this.tags[tag + 'count']];
                if (this.tags[tag + 'count'] == 1) {
                    delete this.tags[tag + 'count'];
                }
                else {
                    this.tags[tag + 'count']--;
                }
            }
        }
        this.get_tag = function () {
            var char = '';
            var content = [];
            var space = false;
            do {
                if (this.pos >= this.input.length) {
                    return content.length ? content.join('') : ['', 'TK_EOF'];
                }
                char = this.input.charAt(this.pos);
                this.pos++;
                this.line_char_count++;
                if (this.Utils.in_array(char, this.Utils.whitespace)) {
                    space = true;
                    this.line_char_count--;
                    continue;
                }
                if (char === "'" || char === '"') {
                    if (!content[1] || content[1] !== '!') {
                        char += this.get_unformatted(char);
                        space = true;
                    }
                }
                if (char === '=') {
                    space = false;
                }
                if (content.length && content[content.length - 1] !== '=' && char !== '>'
                    && space) {
                    if (this.line_char_count >= this.max_char) {
                        this.print_newline(false, content);
                        this.line_char_count = 0;
                    }
                    else {
                        content.push(' ');
                        this.line_char_count++;
                    }
                    space = false;
                }
                content.push(char);
            } while (char !== '>');

            var tag_complete = content.join('');
            var tag_index;
            if (tag_complete.indexOf(' ') != -1) {
                tag_index = tag_complete.indexOf(' ');
            }
            else {
                tag_index = tag_complete.indexOf('>');
            }
            var tag_check = tag_complete.substring(1, tag_index).toLowerCase();
            if (tag_complete.charAt(tag_complete.length - 2) === '/' ||
                this.Utils.in_array(tag_check, this.Utils.single_token)) {
                this.tag_type = 'SINGLE';
            }
            else if (tag_check === 'script') {
                this.record_tag(tag_check);
                this.tag_type = 'SCRIPT';
            }
            else if (tag_check === 'style') {
                this.record_tag(tag_check);
                this.tag_type = 'STYLE';
            }
            else if (tag_check.charAt(0) === '!') {
                if (tag_check.indexOf('[if') != -1) {
                    if (tag_complete.indexOf('!IE') != -1) {
                        var comment = this.get_unformatted('-->', tag_complete);
                        content.push(comment);
                    }
                    this.tag_type = 'START';
                }
                else if (tag_check.indexOf('[endif') != -1) {
                    this.tag_type = 'END';
                    this.unindent();
                }
                else if (tag_check.indexOf('[cdata[') != -1) {
                    var comment = this.get_unformatted(']]>', tag_complete);
                    content.push(comment);
                    this.tag_type = 'SINGLE';
                }
                else {
                    var comment = this.get_unformatted('-->', tag_complete);
                    content.push(comment);
                    this.tag_type = 'SINGLE';
                }
            }
            else {
                if (tag_check.charAt(0) === '/') {
                    this.retrieve_tag(tag_check.substring(1));
                    this.tag_type = 'END';
                }
                else {
                    this.record_tag(tag_check);
                    this.tag_type = 'START';
                }
                if (this.Utils.in_array(tag_check, this.Utils.extra_liners)) {
                    this.print_newline(true, this.output);
                }
            }
            return content.join('');
        }
        this.get_unformatted = function (delimiter, orig_tag) {

            if (orig_tag && orig_tag.indexOf(delimiter) != -1) {
                return '';
            }
            var char = '';
            var content = '';
            var space = true;
            do {
                char = this.input.charAt(this.pos);
                this.pos++

                if (this.Utils.in_array(char, this.Utils.whitespace)) {
                    if (!space) {
                        this.line_char_count--;
                        continue;
                    }
                    if (char === '\n' || char === '\r') {
                        content += '\n';
                        for (var i = 0; i < this.indent_level; i++) {
                            content += this.indent_string;
                        }
                        space = false;
                        this.line_char_count = 0;
                        continue;
                    }
                }
                content += char;
                this.line_char_count++;
                space = true;
            } while (content.indexOf(delimiter) == -1);
            return content;
        }
        this.get_token = function () {
            var token;
            if (this.last_token === 'TK_TAG_SCRIPT') {
                var temp_token = this.get_script();
                if (typeof temp_token !== 'string') {
                    return temp_token;
                }
                token = js_beautify(temp_token, this.indent_size, this.indent_character, this.indent_level);
                return [token, 'TK_CONTENT'];
            }
            if (this.current_mode === 'CONTENT') {
                token = this.get_content();
                if (typeof token !== 'string') {
                    return token;
                }
                else {
                    return [token, 'TK_CONTENT'];
                }
            }
            if (this.current_mode === 'TAG') {
                token = this.get_tag();
                if (typeof token !== 'string') {
                    return token;
                }
                else {
                    var tag_name_type = 'TK_TAG_' + this.tag_type;
                    return [token, tag_name_type];
                }
            }
        }
        this.printer = function (js_source, indent_character, indent_size, max_char) {
            this.input = js_source || '';
            this.output = [];
            this.indent_character = indent_character || ' ';
            this.indent_string = '';
            this.indent_size = indent_size || 2;
            this.indent_level = 0;
            this.max_char = max_char || 7000;
            this.line_char_count = 0;
            for (var i = 0; i < this.indent_size; i++) {
                this.indent_string += this.indent_character;
            }
            this.print_newline = function (ignore, arr) {
                this.line_char_count = 0;
                if (!arr || !arr.length) {
                    return;
                }
                if (!ignore) {
                    while (this.Utils.in_array(arr[arr.length - 1], this.Utils.whitespace)) {
                        arr.pop();
                    }
                }
                arr.push('\n');
                for (var i = 0; i < this.indent_level; i++) {
                    arr.push(this.indent_string);
                }
            }
            this.print_token = function (text) {
                this.output.push(text);
            }
            this.indent = function () {
                this.indent_level++;
            }
            this.unindent = function () {
                if (this.indent_level > 0) {
                    this.indent_level--;
                }
            }
        }
        return this;
    }
    multi_parser = new Parser();
    multi_parser.printer(html_source, indent_character, indent_size);
    var f = true;
    while (true) {
        var t = multi_parser.get_token();
        multi_parser.token_text = t[0];
        multi_parser.token_type = t[1];
        if (multi_parser.token_type === 'TK_EOF') {
            break;
        }
        switch (multi_parser.token_type) {
            case 'TK_TAG_START': case 'TK_TAG_SCRIPT': case 'TK_TAG_STYLE':
                multi_parser.print_newline(false, multi_parser.output);
                multi_parser.print_token(multi_parser.token_text);
                multi_parser.indent();
                multi_parser.current_mode = 'CONTENT';
                break;
            case 'TK_TAG_END':
                if (f)
                    multi_parser.print_newline(true, multi_parser.output);
                multi_parser.print_token(multi_parser.token_text);
                multi_parser.current_mode = 'CONTENT';
                f = true;
                break;
            case 'TK_TAG_SINGLE':
                multi_parser.print_newline(false, multi_parser.output);
                multi_parser.print_token(multi_parser.token_text);
                multi_parser.current_mode = 'CONTENT';
                break;
            case 'TK_CONTENT':
                if (multi_parser.token_text !== '') {
                    f = false;
                    multi_parser.print_token(multi_parser.token_text);
                }
                multi_parser.current_mode = 'TAG';
                break;
        }
        multi_parser.last_token = multi_parser.token_type;
        multi_parser.last_text = multi_parser.token_text;
    }
    return multi_parser.output.join('');
}
function js_beautify(js_source_text, indent_size, indent_character, indent_level) {

    var input, output, token_text, last_type, last_text, last_word, current_mode, modes, indent_string;
    var whitespace, wordchar, punct, parser_pos, line_starters, in_case;
    var prefix, token_type, do_block_just_closed, var_line, var_line_tainted;



    function trim_output() {
        while (output.length && (output[output.length - 1] === ' ' || output[output.length - 1] === indent_string)) {
            output.pop();
        }
    }

    function print_newline(ignore_repeated) {
        ignore_repeated = typeof ignore_repeated === 'undefined' ? true : ignore_repeated;

        trim_output();

        if (!output.length) {
            return; // no newline on start of file
        }

        if (output[output.length - 1] !== "\n" || !ignore_repeated) {
            output.push("\n");
        }
        for (var i = 0; i < indent_level; i++) {
            output.push(indent_string);
        }
    }



    function print_space() {
        var last_output = output.length ? output[output.length - 1] : ' ';
        if (last_output !== ' ' && last_output !== '\n' && last_output !== indent_string) { // prevent occassional duplicate space
            output.push(' ');
        }
    }


    function print_token() {
        output.push(token_text);
    }

    function indent() {
        indent_level++;
    }


    function unindent() {
        if (indent_level) {
            indent_level--;
        }
    }


    function remove_indent() {
        if (output.length && output[output.length - 1] === indent_string) {
            output.pop();
        }
    }


    function set_mode(mode) {
        modes.push(current_mode);
        current_mode = mode;
    }


    function restore_mode() {
        do_block_just_closed = current_mode === 'DO_BLOCK';
        current_mode = modes.pop();
    }


    function in_array(what, arr) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === what) {
                return true;
            }
        }
        return false;
    }



    function get_next_token() {
        var n_newlines = 0;
        var c = '';

        do {
            if (parser_pos >= input.length) {
                return ['', 'TK_EOF'];
            }
            c = input.charAt(parser_pos);

            parser_pos += 1;
            if (c === "\n") {
                n_newlines += 1;
            }
        }
        while (in_array(c, whitespace));

        if (n_newlines > 1) {
            for (var i = 0; i < 2; i++) {
                print_newline(i === 0);
            }
        }
        var wanted_newline = (n_newlines === 1);


        if (in_array(c, wordchar)) {
            if (parser_pos < input.length) {
                while (in_array(input.charAt(parser_pos), wordchar)) {
                    c += input.charAt(parser_pos);
                    parser_pos += 1;
                    if (parser_pos === input.length) {
                        break;
                    }
                }
            }

            // small and surprisingly unugly hack for 1E-10 representation
            if (parser_pos !== input.length && c.match(/^[0-9]+[Ee]$/) && input.charAt(parser_pos) === '-') {
                parser_pos += 1;

                var t = get_next_token(parser_pos);
                c += '-' + t[0];
                return [c, 'TK_WORD'];
            }

            if (c === 'in') { // hack for 'in' operator
                return [c, 'TK_OPERATOR'];
            }
            return [c, 'TK_WORD'];
        }

        if (c === '(' || c === '[') {
            return [c, 'TK_START_EXPR'];
        }

        if (c === ')' || c === ']') {
            return [c, 'TK_END_EXPR'];
        }

        if (c === '{') {
            return [c, 'TK_START_BLOCK'];
        }

        if (c === '}') {
            return [c, 'TK_END_BLOCK'];
        }

        if (c === ';') {
            return [c, 'TK_END_COMMAND'];
        }

        if (c === '/') {
            var comment = '';
            // peek for comment /* ... */
            if (input.charAt(parser_pos) === '*') {
                parser_pos += 1;
                if (parser_pos < input.length) {
                    while (!(input.charAt(parser_pos) === '*' && input.charAt(parser_pos + 1) && input.charAt(parser_pos + 1) === '/') && parser_pos < input.length) {
                        comment += input.charAt(parser_pos);
                        parser_pos += 1;
                        if (parser_pos >= input.length) {
                            break;
                        }
                    }
                }
                parser_pos += 2;
                return ['/*' + comment + '*/', 'TK_BLOCK_COMMENT'];
            }
            // peek for comment // ...
            if (input.charAt(parser_pos) === '/') {
                comment = c;
                while (input.charAt(parser_pos) !== "\x0d" && input.charAt(parser_pos) !== "\x0a") {
                    comment += input.charAt(parser_pos);
                    parser_pos += 1;
                    if (parser_pos >= input.length) {
                        break;
                    }
                }
                parser_pos += 1;
                if (wanted_newline) {
                    print_newline();
                }
                return [comment, 'TK_COMMENT'];
            }

        }

        if (c === "'" || // string
            c === '"' || // string
            (c === '/' &&
                ((last_type === 'TK_WORD' && last_text === 'return') || (last_type === 'TK_START_EXPR' || last_type === 'TK_END_BLOCK' || last_type === 'TK_OPERATOR' || last_type === 'TK_EOF' || last_type === 'TK_END_COMMAND')))) { // regexp
            var sep = c;
            var esc = false;
            c = '';

            if (parser_pos < input.length) {

                while (esc || input.charAt(parser_pos) !== sep) {
                    c += input.charAt(parser_pos);
                    if (!esc) {
                        esc = input.charAt(parser_pos) === '\\';
                    } else {
                        esc = false;
                    }
                    parser_pos += 1;
                    if (parser_pos >= input.length) {
                        break;
                    }
                }

            }

            parser_pos += 1;
            if (last_type === 'TK_END_COMMAND') {
                print_newline();
            }
            return [sep + c + sep, 'TK_STRING'];
        }

        if (in_array(c, punct)) {
            while (parser_pos < input.length && in_array(c + input.charAt(parser_pos), punct)) {
                c += input.charAt(parser_pos);
                parser_pos += 1;
                if (parser_pos >= input.length) {
                    break;
                }
            }
            return [c, 'TK_OPERATOR'];
        }

        return [c, 'TK_UNKNOWN'];
    }


    //----------------------------------

    indent_character = indent_character || ' ';
    indent_size = indent_size || 4;

    indent_string = '';
    while (indent_size--) {
        indent_string += indent_character;
    }

    input = js_source_text;

    last_word = ''; // last 'TK_WORD' passed
    last_type = 'TK_START_EXPR'; // last token type
    last_text = ''; // last token text
    output = [];

    do_block_just_closed = false;
    var_line = false;
    var_line_tainted = false;

    whitespace = "\n\r\t ".split('');
    wordchar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$'.split('');
    punct = '+ - * / % & ++ -- = += -= *= /= %= == === != !== > < >= <= >> << >>> >>>= >>= <<= && &= | || ! !! , : ? ^ ^= |='.split(' ');

    // words which should always start on new line.
    line_starters = 'continue,try,throw,return,var,if,switch,case,default,for,while,break,function'.split(',');

    // states showing if we are currently in expression (i.e. "if" case) - 'EXPRESSION', or in usual block (like, procedure), 'BLOCK'.
    // some formatting depends on that.
    current_mode = 'BLOCK';
    modes = [current_mode];

    indent_level = indent_level || 0;
    parser_pos = 0; // parser position
    in_case = false; // flag for parser that case/default has been processed, and next colon needs special attention
    while (true) {
        var t = get_next_token(parser_pos);
        token_text = t[0];
        token_type = t[1];
        if (token_type === 'TK_EOF') {
            break;
        }

        switch (token_type) {

            case 'TK_START_EXPR':
                var_line = false;
                set_mode('EXPRESSION');
                if (last_type === 'TK_END_EXPR' || last_type === 'TK_START_EXPR') {
                    // do nothing on (( and )( and ][ and ]( ..
                } else if (last_type !== 'TK_WORD' && last_type !== 'TK_OPERATOR') {
                    print_space();
                } else if (in_array(last_word, line_starters) && last_word !== 'function') {
                    print_space();
                }
                print_token();
                break;

            case 'TK_END_EXPR':
                print_token();
                restore_mode();
                break;

            case 'TK_START_BLOCK':

                if (last_word === 'do') {
                    set_mode('DO_BLOCK');
                } else {
                    set_mode('BLOCK');
                }
                if (last_type !== 'TK_OPERATOR' && last_type !== 'TK_START_EXPR') {
                    if (last_type === 'TK_START_BLOCK') {
                        print_newline();
                    } else {
                        print_space();
                    }
                }
                print_token();
                indent();
                break;

            case 'TK_END_BLOCK':
                if (last_type === 'TK_START_BLOCK') {
                    // nothing
                    trim_output();
                    unindent();
                } else {
                    unindent();
                    print_newline();
                }
                print_token();
                restore_mode();
                break;

            case 'TK_WORD':

                if (do_block_just_closed) {
                    print_space();
                    print_token();
                    print_space();
                    break;
                }

                if (token_text === 'case' || token_text === 'default') {
                    if (last_text === ':') {
                        // switch cases following one another
                        remove_indent();
                    } else {
                        // case statement starts in the same line where switch
                        unindent();
                        print_newline();
                        indent();
                    }
                    print_token();
                    in_case = true;
                    break;
                }


                prefix = 'NONE';
                if (last_type === 'TK_END_BLOCK') {
                    if (!in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                        prefix = 'NEWLINE';
                    } else {
                        prefix = 'SPACE';
                        print_space();
                    }
                } else if (last_type === 'TK_END_COMMAND' && (current_mode === 'BLOCK' || current_mode === 'DO_BLOCK')) {
                    prefix = 'NEWLINE';
                } else if (last_type === 'TK_END_COMMAND' && current_mode === 'EXPRESSION') {
                    prefix = 'SPACE';
                } else if (last_type === 'TK_WORD') {
                    prefix = 'SPACE';
                } else if (last_type === 'TK_START_BLOCK') {
                    prefix = 'NEWLINE';
                } else if (last_type === 'TK_END_EXPR') {
                    print_space();
                    prefix = 'NEWLINE';
                }

                if (last_type !== 'TK_END_BLOCK' && in_array(token_text.toLowerCase(), ['else', 'catch', 'finally'])) {
                    print_newline();
                } else if (in_array(token_text, line_starters) || prefix === 'NEWLINE') {
                    if (last_text === 'else') {
                        // no need to force newline on else break
                        print_space();
                    } else if ((last_type === 'TK_START_EXPR' || last_text === '=') && token_text === 'function') {
                        // no need to force newline on 'function': (function
                        // DONOTHING
                    } else if (last_type === 'TK_WORD' && (last_text === 'return' || last_text === 'throw')) {
                        // no newline between 'return nnn'
                        print_space();
                    } else if (last_type !== 'TK_END_EXPR') {
                        if ((last_type !== 'TK_START_EXPR' || token_text !== 'var') && last_text !== ':') {
                            // no need to force newline on 'var': for (var x = 0...)
                            if (token_text === 'if' && last_type === 'TK_WORD' && last_word === 'else') {
                                // no newline for } else if {
                                print_space();
                            } else {
                                print_newline();
                            }
                        }
                    } else {
                        if (in_array(token_text, line_starters) && last_text !== ')') {
                            print_newline();
                        }
                    }
                } else if (prefix === 'SPACE') {
                    print_space();
                }
                print_token();
                last_word = token_text;

                if (token_text === 'var') {
                    var_line = true;
                    var_line_tainted = false;
                }

                break;

            case 'TK_END_COMMAND':

                print_token();
                var_line = false;
                break;

            case 'TK_STRING':

                if (last_type === 'TK_START_BLOCK' || last_type === 'TK_END_BLOCK') {
                    print_newline();
                } else if (last_type === 'TK_WORD') {
                    print_space();
                }
                print_token();
                break;

            case 'TK_OPERATOR':

                var start_delim = true;
                var end_delim = true;
                if (var_line && token_text !== ',') {
                    var_line_tainted = true;
                    if (token_text === ':') {
                        var_line = false;
                    }
                }

                if (token_text === ':' && in_case) {
                    print_token(); // colon really asks for separate treatment
                    print_newline();
                    break;
                }

                in_case = false;

                if (token_text === ',') {
                    if (var_line) {
                        if (var_line_tainted) {
                            print_token();
                            print_newline();
                            var_line_tainted = false;
                        } else {
                            print_token();
                            print_space();
                        }
                    } else if (last_type === 'TK_END_BLOCK') {
                        print_token();
                        print_newline();
                    } else {
                        if (current_mode === 'BLOCK') {
                            print_token();
                            print_newline();
                        } else {
                            // EXPR od DO_BLOCK
                            print_token();
                            print_space();
                        }
                    }
                    break;
                } else if (token_text === '--' || token_text === '++') { // unary operators special case
                    if (last_text === ';') {
                        // space for (;; ++i)
                        start_delim = true;
                        end_delim = false;
                    } else {
                        start_delim = false;
                        end_delim = false;
                    }
                } else if (token_text === '!' && last_type === 'TK_START_EXPR') {
                    // special case handling: if (!a)
                    start_delim = false;
                    end_delim = false;
                } else if (last_type === 'TK_OPERATOR') {
                    start_delim = false;
                    end_delim = false;
                } else if (last_type === 'TK_END_EXPR') {
                    start_delim = true;
                    end_delim = true;
                } else if (token_text === '.') {
                    // decimal digits or object.property
                    start_delim = false;
                    end_delim = false;

                } else if (token_text === ':') {
                    // zz: xx
                    // can't differentiate ternary op, so for now it's a ? b: c; without space before colon
                    if (last_text.match(/^\d+$/)) {
                        // a little help for ternary a ? 1 : 0;
                        start_delim = true;
                    } else {
                        start_delim = false;
                    }
                }
                if (start_delim) {
                    print_space();
                }

                print_token();

                if (end_delim) {
                    print_space();
                }
                break;

            case 'TK_BLOCK_COMMENT':

                print_newline();
                print_token();
                print_newline();
                break;

            case 'TK_COMMENT':

                // print_newline();
                print_space();
                print_token();
                print_newline();
                break;

            case 'TK_UNKNOWN':
                print_token();
                break;
        }

        last_type = token_type;
        last_text = token_text;
    }

    return output.join('');

}
