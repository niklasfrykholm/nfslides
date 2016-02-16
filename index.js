window.state = window.state || {};
state.aspectRatio = state.aspectRatio || (16/9);
state.currentSlide = state.currentSlide || 0;
state.view = state.view || "slide";

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
                <dt>w</dt>                  <dd>: Toggle aspect ratio (16:9/3:4)</dd>
                <dt>v</dt>                  <dd>: Toggle view (slides/list)</dd>
                <dt>r</dt>                  <dd>: Reload (when auto-reload is disabled)</dd>
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
        else if (s != "r")              return;
        render();
    }
}

function reload()
{
    if (!state.canReload) return;

    var script = document.createElement("script");
    script.src = "index.js?" + performance.now();
    var head = document.getElementsByTagName("head")[0];
    head.removeChild(head.appendChild(script));
    render();
}

window.onload = render;
if (state.interval) window.clearInterval(state.interval);
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

function youtube(div, arg)
{
    div.style.backgroundColor = "#000";
    div.appendChild(e("img", baseStyle, {
        attributes: {src: `http://img.youtube.com/vi/${arg.id}/0.jpg`}
    }));
    var playButton = div.appendChild(e("div", baseStyle, {height: 72, width: 72, left: "50%",
        top: "50%", marginLeft: -36, marginTop: -36,
        backgroundImage: "url('https://www.youtube.com/yt/brand/media/image/YouTube-icon-full_color.png')",
        backgroundRepeat: "no-repeat", backgroundSize: "contain", backgroundPosition: "center"}));
    var title = div.appendChild( e("div", baseStyle, {fontSize: "1em",
        top: "90%", textAlign: "center", text: arg.title || "", color: "#fff",
        textShadow: "0px 0px 20px #000"} ));

    div.onclick = function() {
        var player = e("object", baseStyle, {attributes: {data:
            `http://www.youtube.com/embed/${arg.id}?autoplay=1&showinfo=0&controls=0`}});
        player.onkeydown = function (evt) {
            if (evt.keyCode == 37)          state.currentSlide--;
            else if (evt.keyCode == 39)     state.currentSlide++;
            else return;
            render();
        };
        div.replaceChild(player, playButton);
        div.removeChild(title);
        state.canReload = false;
    };
}

function video(div, arg)
{
    div.style.backgroundColor = "#000";
    if (arg.url) div.appendChild( e("object", baseStyle, {attributes: {data: arg.url}}) );
    if (arg.src) div.appendChild( e("video", baseStyle, {attributes: {src: arg.src, autoplay: true, loop: true}}) );
    div.appendChild( e("div", baseStyle, {fontSize: "1em",
        top: "90%", textAlign: "center", text: arg.title || "", color: "#fff",
        textShadow: "0px 0px 20px #000"} ));
    // Auto-reload causes flickering in videos
    state.canReload = false;
}

function canvas(div, arg)
{
    var canvas = div.appendChild(e("canvas", baseStyle));
    var ctx = canvas.getContext("2d");
    arg.render(ctx);
}

// ------------------------------------------------------------
// Slides
// ------------------------------------------------------------

var slides = [
    {template: title, title: "nfslides", subtitle: "Niklas Frykholm, 15 Feb 2016"},
    {title: "nfslides -- Minimalistic Slideshows", html: `
        <li>~120 lines of JavaScript</li>
        <li>ES6-ish -- backwards compatibility is boring</li>
        <li>Hackable: Add your own templates, styles and effects</li>
        <li>Everything is code</li>
        <li>Auto-reload, just save in your text editor</li>`},
    {title: "Features", html: `
        <li>Keyboard interface: press <b>h</b> or <b>?</b> for help</li>
        <li>Toggle between 16:9 and 4:3: press <b>w</b></li>
        <li>Toggle between views: press <b>v</b></li>`},
    {title: "Built-In Templates", html: `
        <li>Title</li>
        <li>List</li>
        <li>Image</li>
        <li>Video (local or youtube)</li>
        <li>Canvas (2D and 3D graphics)</li>`},
    {template: image, title: "Image Slide (courtesy of Unsplash)", url: "https://images.unsplash.com/photo-1414115880398-afebc3d95efc?crop=entropy&dpr=2&fit=crop&fm=jpg&h=900&ixjsv=2.1.0&ixlib=rb-0.3.5&q=50&w=1600"},
    {template: youtube, title: "YouTube", id: "PUv66718DII"},
    {template: canvas, render: ctx => {
        ctx.strokeStyle = "1px #000";
        ctx.fillStyle = "#ff0";
        ctx.fillRect(50,50,50,50);
        ctx.strokeRect(50,50,50,50);
    }},
    {template: title, title: "Goodbye Powerpoint!"},
]
