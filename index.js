window.state = window.state || {};
state.aspectRatio = state.aspectRatio || (16/9);
state.currentSlide = state.currentSlide || 0;
state.view = state.view || "slide";
state.isPlaying = typeof state.isPlaying == "undefined" ? false : state.isPlaying;

// Applies the `style` object to the DOM `element`. Special keys:
// - `text`: Create a text node inside with value text.
// - `html`: Use value as innerHTML for node.
function applyStyle(e, style)
{
    for (k in style) {
        var v = style[k];
        if (k == "text")        e.appendChild(document.createTextNode(v));
        else if (k == "html")   e.innerHTML = v;
        else if (k == "attributes") {for (a in v) e[a] = v[a];}
        else                    e.style[k] = v;
    }
}

// Create a DOM element with style(s) from arguments.
function e(tag)
{
    var e = document.createElement(tag);
    [].forEach.call(arguments, style => applyStyle(e, style));
    return e;
}

// Return true if we should play animations
function isPlaying()
{
    return state.isPlaying && state.view == "slide";
}

// Render DOM for current state.
function render()
{
    var body = document.getElementsByTagName("body")[0];
    applyStyle(body, {margin: "0px", padding: "0px", backgroundColor: "#ccc"});
    while (body.lastChild) body.removeChild(body.lastChild);

    var addDiv = function(body, arg)
    {
        return body.appendChild( e("div", {backgroundColor: "#fff", position: "absolute",
            overflow: "hidden", fontSize: arg.width/30}, arg) );
    };

    var centerDiv = function(body)
    {
        var r = state.aspectRatio;
        var win = {w: window.innerWidth, h: window.innerHeight};
        var sz = win.w / r > win.h ? {w: win.h * r, h: win.h} : {w: win.w, h: win.w / r};
        return addDiv(body, {height: sz.h, width: sz.w, top: (win.h - sz.h)/2, left: (win.w - sz.w)/2});
    };

    var showHelp = function(body)
    {
        var w = window.innerWidth;
        var keyboardShortcuts =
            `<h1>Keyboard Shortcuts</h1>

            <dl>
                <dt>&lt;Left&gt;</dt>       <dd>: Previous slide</dd>
                <dt>&lt;Right&gt;</dt>      <dd>: Next slide</dd>
                <dt>&lt;space&gt;</dt>      <dd>: Toggle animations</dd>
                <dt>w</dt>                  <dd>: Toggle aspect ratio (16:9/3:4)</dd>
                <dt>v</dt>                  <dd>: Toggle view (slides/list)</dd>
                <dt>r</dt>                  <dd>: Force reload</dd>
                <dt>h <span style="color: #fff">or</span> ?</dt>             <dd>: Toggle help</dd>
            </dl>`;
        var div = e("div", {html: keyboardShortcuts, fontFamily: "arial, sans-serif", fontSize: 13,
            width: 300, left: w-400, top: 50, backgroundColor: "#000", color: "#fff", padding: 20,
            opacity: 0.8, borderRadius: "10px", position: "fixed"});
        [].forEach.call(div.getElementsByTagName("h1"), e => applyStyle(e, {marginBottom: "1em",
            fontSize: 15, borderBottomStyle: "solid", borderBottomWidth: "1px", paddingBottom: "0.5em"}));
        [].forEach.call(div.getElementsByTagName("dt"), e => applyStyle(e, {color: "#ff0", width: 100,
            float: "left", clear: "left", lineHeight: "2em", textAlign: "right", marginRight: "0.5em"}));
        [].forEach.call(div.getElementsByTagName("dd"), e => applyStyle(e, {lineHeight: "2em"}));
        body.appendChild(div);
    };

    state.canReload = true;

    state.currentSlide = Math.max(0, Math.min(state.currentSlide, slides.length-1));

    if (state.view == "list") {
        var root = e("div", {});
        var sz = {w: 300 * state.aspectRatio, h: 300};
        for (var i=0; i<slides.length; ++i) {
            var div = addDiv(root, {top: i*(sz.h+10), width: sz.w, height: sz.h});
            (slides[i].template || defaultTemplate)(div, slides[i]);
        }
        body.appendChild(root);
    } else
        (slides[state.currentSlide].template || defaultTemplate)(centerDiv(body), slides[state.currentSlide]);

    if (state.showHelp) showHelp(body);

    body.onresize = render;
    body.onkeydown = function (evt) {
        if (evt.keyCode == 37)          state.currentSlide--;
        else if (evt.keyCode == 39)     state.currentSlide++;
        else return;
        render();
    };
    body.onkeypress = function (evt) {
        var s = String.fromCharCode(evt.keyCode)
        if (s == "w")                   state.aspectRatio = state.aspectRatio > 14/9 ? 12/9 : 16/9;
        else if (s == "v")              state.view = state.view == "list" ? "slide" : "list";
        else if (s == "?" || s == "h")  state.showHelp = !state.showHelp;
        else if (s == " ")              state.isPlaying = !state.isPlaying;
        else if (s != "r")              return;
        render();
    }
}

function require(src)
{
    var script = document.createElement("script");
    script.src = `${src}?${performance.now()}`;
    script.charset = "UTF-8";
    var head = document.getElementsByTagName("head")[0];
    head.removeChild(head.appendChild(script));
}

function reload()
{
    if (!state.canReload) return;
    require("index.js");
    render();
}

window.onload = render;
if (state.interval) window.clearInterval(state.interval);

// Hot reload iff loaded through file:// URL
if (window.location.href.startsWith("file://"))
    state.interval = window.setInterval(reload, 500);

// ------------------------------------------------------------
// Slide templates
// ------------------------------------------------------------

var baseStyle = {
    position: "absolute", overflow: "hidden",
    width: "100%", height: "100%", fontFamily: "arial, sans-serif"
};

function defaultTemplate(div, arg)
{
    div.appendChild( e("div", baseStyle, {fontSize: "1.5em",
        top: "10%", textAlign: "center", text: arg.title} ));

    var c = e("div", baseStyle, {padding: "2%", width: "90%", top: "17%"});
    c.appendChild( e("ul", {html: arg.html}) );
    div.appendChild(c);

    [].forEach.call(div.getElementsByTagName("li"), e => applyStyle(e, {marginBottom: "0.4em"}));
}

function title(div, arg)
{
    div.appendChild( e("div", baseStyle, {fontSize: "2em",
        top: "40%", textAlign: "center", text: arg.title}) );
    if (arg.subtitle) {
        div.appendChild( e("div", baseStyle, {fontSize: "1em",
            top: "60%", textAlign: "center", text: arg.subtitle}) );
    }
}

function image(div, arg)
{
    div.style.backgroundColor = "#000";
    if (arg.url)
        div.appendChild( e("div", baseStyle, {width: "100%", height: "100%",
            backgroundImage: `url('${arg.url}')`, backgroundSize: "contain",
            backgroundPosition: "center", backgroundRepeat: "no-repeat"}));
    div.appendChild( e("div", baseStyle, {fontSize: "1em",
        top: "90%", textAlign: "center", text: arg.title || "", color: "#fff",
        textShadow: "0px 0px 20px #000"} ));
}

function videoBase(div, arg)
{
    div.style.backgroundColor = "#000";

    if (isPlaying()) {
        var player = arg.playerType == "object"
            ? e("object", baseStyle, {attributes: {data: arg.videoSrc}})
            : e("video", baseStyle, {attributes: {src: arg.videoSrc, autoplay: true, loop: true}}) ;
        div.appendChild(player);
        state.canReload = false;
    } else {
        if (arg.thumbnailSrc)
            div.appendChild( e("div", baseStyle, {width: "100%", height: "100%",
            backgroundImage: `url('${arg.thumbnailSrc}')`, backgroundSize: "contain",
            backgroundPosition: "center", backgroundRepeat: "no-repeat"}));
        div.appendChild( e("div", baseStyle, {fontSize: "1em",
            top: "90%", textAlign: "center", text: arg.title || "", color: "#fff",
            textShadow: "0px 0px 20px #000"} ));
    }
}

function youtube(div, arg)
{
    videoBase(div, {thumbnailSrc: `http://img.youtube.com/vi/${arg.id}/0.jpg`, title: arg.title,
        playerType: "object", videoSrc: `http://www.youtube.com/embed/${arg.id}?autoplay=1&showinfo=0&controls=0`});
}

function video(div, arg)
{
    videoBase(div, arg);
}

function canvas(div, arg)
{
    var sz = [div.style.width, div.style.height].map(e => parseFloat(e));
    var w = sz[0], h = sz[1];
    var canvas = div.appendChild(e("canvas", baseStyle, {attributes: {width:w, height:h}}));
    var ctx = canvas.getContext("2d");
    ctx.translate(w/2, h/2);
    ctx.scale(h/2000, h/2000);
    arg.render(ctx, 0);
    if (isPlaying() && arg.animation) {
        var start = Date.now();
        var animate = function() {
            if (document.getElementsByTagName("canvas")[0] != canvas) return;
            arg.render(ctx, (Date.now() - start)/1000.0);
            window.requestAnimationFrame(animate);
        };
        window.requestAnimationFrame(animate);
        state.canReload = false;
    }
}

function markdown(div, arg)
{
    var unindent = function(s) {
        s = s.replace(/^\s*\n/, ""); // Remove initial space
        var indent = s.match(/^\s*/)[0];
        var matchIndent = new RegExp(`^${indent}`, "mg");
        s = s.replace(matchIndent, "");
        return s;
    };

    if (typeof marked === "undefined") {
        require("marked.min.js");
        window.setTimeout(render, 50);
        return;
    }

    var html = marked(unindent(arg.markdown));

    div.appendChild( e("div", baseStyle, {left: "5%", width: "90%", top: "10%",
        html: html}) );

    [].forEach.call(div.getElementsByTagName("h1"), e => applyStyle(e, {
        textAlign: "center", fontSize: "1.5em", marginTop: 0, fontWeight: "normal"
    }));
    [].forEach.call(div.getElementsByTagName("li"), e => applyStyle(e, {marginBottom: "0.4em"}));
}

// ------------------------------------------------------------
// Slides
// ------------------------------------------------------------

var slides = [
    {template: title, title: "nfslides", subtitle: "Niklas Frykholm, 15 Feb 2016"},
    {title: "nfslides — Minimalistic Slideshows", html: `
        <li>~120 lines of JavaScript in core</li>
        <li>ES6 — backwards compatibility is boring</li>
        <li>Hackable: Add your own templates, styles and effects</li>
        <li>Everything is code</li>`},
    {title: "Features", html: `
        <li>Auto-reload, just save in your text editor</li>
        <li>Keyboard interface: press <b>h</b> or <b>?</b> for help</li>
        <li>Toggle between 16:9 and 4:3: press <b>w</b></li>
        <li>Toggle between views: press <b>v</b></li>`},
    {title: "Built-In Templates", html: `
        <li>Title</li>
        <li>List</li>
        <li>Markdown</li>
        <li>Image</li>
        <li>Video (local or youtube)</li>
        <li>Canvas (2D and 3D graphics)</li>`},
    {template: markdown, markdown: `
        # Markdown

        * You can make slides in [markdown](https://daringfireball.net/projects/markdown/)
        * Uses \`marked.min.js\` as markdown processor
    `},
    {template: image, title: "Image Slide (courtesy of Unsplash)", url: "https://images.unsplash.com/photo-1414115880398-afebc3d95efc?crop=entropy&dpr=2&fit=crop&fm=jpg&h=900&ixjsv=2.1.0&ixlib=rb-0.3.5&q=50&w=1600"},
    {template: youtube, title: "YouTube", id: "PUv66718DII"},
    {template: video, title: "MP4", videoSrc: "http://techslides.com/demos/sample-videos/small.mp4", thumbnailSrc: "http://perso.freelug.org/benw/rotor/colour.jpg"},
    {template: canvas, animation: true, render: (ctx,t) => {
        ctx.save();
            ctx.clearRect(-2000,-2000,4000,4000);
            ctx.rotate(t);
            ctx.strokeStyle = "#000";
            ctx.lineWidth=3;
            ctx.fillStyle = "#ff0";
            var rect = [-800, -800, 1600, 1600];
            ctx.fillRect(...rect);
            ctx.strokeRect(...rect);
            ctx.fillStyle = "#000";
            ctx.font = "200px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("Canvas", 0, 0);
        ctx.restore();
    }},
    {template: title, title: "Good riddance, Powerpoint!"},
]
