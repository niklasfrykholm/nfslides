"use strict";

window.state = window.state || {};
state.aspectRatio = state.aspectRatio || (16/9);
state.currentSlide = state.currentSlide || 0;
state.view = state.view || "slide";
state.isPlaying = typeof state.isPlaying == "undefined" ? true : state.isPlaying;

// Applies the `style` object to the DOM `element`. Special keys:
// - `text`: Create a text node inside with value text.
// - `html`: Use value as innerHTML for node.
// - `attributes`: Apply supplied table as node attributes.
function applyStyle(e, style)
{
    for (k in style) {
        const v = style[k];
        if (k == "text")        e.appendChild(document.createTextNode(v));
        else if (k == "html")   e.innerHTML = v;
        else if (k == "attributes") {for (a in v) e[a] = v[a];}
        else                    e.style[k] = v;
    }
}

// Create a DOM element with style(s) from arguments.
function e(tag)
{
    const e = document.createElement(tag);
    [].forEach.call(arguments, style => applyStyle(e, style));
    return e;
}

// Return true if we should play animations
function isPlaying()
{
    return state.isPlaying && state.view == "slide";
}

// Render DOM for current state. This is called every time state changes.
function render()
{
    const body = document.getElementsByTagName("body")[0];
    applyStyle(body, {margin: "0px", padding: "0px", backgroundColor: "#ccc",
        fontFamily: "arial, sans-serif"});
    while (body.lastChild) body.removeChild(body.lastChild);

    const addDiv = function(body, arg)
    {
        return body.appendChild( e("div", {backgroundColor: "#fff", position: "absolute",
            overflow: "hidden", fontSize: arg.width/30}, arg) );
    };

    const centerDiv = function(body)
    {
        const r = state.aspectRatio;
        const win = {w: window.innerWidth, h: window.innerHeight};
        const sz = win.w / r > win.h ? {w: win.h * r, h: win.h} : {w: win.w, h: win.w / r};
        return addDiv(body, {height: sz.h, width: sz.w, top: (win.h - sz.h)/2, left: (win.w - sz.w)/2});
    };

    const showHelp = function(body)
    {
        const w = window.innerWidth;
        const keyboardShortcuts =
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
        const div = e("div", {html: keyboardShortcuts, fontSize: 13,
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
        const root = e("div", {});
        const w = 300 * state.aspectRatio, h = 300;
        let x = 0, y = 0;
        for (let i=0; i<slides.length; ++i) {
            const div = addDiv(root, {left: x, top: y, width: w, height: h});
            (slides[i].template || defaultTemplate)(div, slides[i]);
            x += w + 10;
            if (x + w + 10 > window.innerWidth)
                {x=0; y += h + 10;}
            div.onmousedown = () => {state.currentSlide = i; state.view = "slide";};
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
        const s = String.fromCharCode(evt.keyCode)
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
    const head = document.getElementsByTagName("head")[0];
    head.removeChild(head.appendChild(e("script",
        {attributes: {src: `${src}?${performance.now()}`, charset: "UTF-8"}})));
}

function reload()
{
    if (!state.canReload) return;
    require("index.js");
    render();
}

window.onload = render;
if (state.interval) window.clearInterval(state.interval);
if (window.location.href.startsWith("file://"))
    state.interval = window.setInterval(reload, 500);

// ------------------------------------------------------------
// Slide templates
// ------------------------------------------------------------

var baseStyle = {position: "absolute", overflow: "hidden", width: "100%", height: "100%"};

function addElements(div, arg)
{
    if (arg.imageUrl)
        div.appendChild( e("div", baseStyle, {width: "100%", height: "100%",
            backgroundImage: `url('${arg.imageUrl}')`, backgroundSize: "contain",
            backgroundPosition: "center", backgroundRepeat: "no-repeat"}));
    if (arg.video) {
        const video = arg.video;
        if (isPlaying()) {
            const player = video.youtubeId
                ? e("object", baseStyle, {attributes: {data: `http://www.youtube.com/embed/${video.youtubeId}?autoplay=1&showinfo=0&controls=0`}})
                : e("video", baseStyle, {attributes: {src: video.src, autoplay: true, loop: true}}) ;
            div.appendChild(player);
            state.canReload = false;
        } else {
            if (video.youtubeId && !video.thumbnailSrc)
                video.thumbnailSrc = `http://img.youtube.com/vi/${video.youtubeId}/0.jpg`;
            if (video.thumbnailSrc)
                div.appendChild( e("div", baseStyle, {
                    backgroundImage: `url('${video.thumbnailSrc}')`, backgroundSize: "contain",
                    backgroundPosition: "center", backgroundRepeat: "no-repeat"}));
        }
    }
    if (arg.canvas) {
        const sz = [div.style.width, div.style.height].map(e => parseFloat(e));
        const w = sz[0], h = sz[1];
        const canvas = div.appendChild(e("canvas", baseStyle, {attributes: {width:w, height:h}}));
        const ctx = canvas.getContext("2d");
        ctx.translate(w/2, h/2);
        ctx.scale(h/2000, h/2000);
        if (arg.canvas(ctx, 0) == "animate" && isPlaying()) {
            const start = Date.now();
            const animate = function() {
                if (document.getElementsByTagName("canvas")[0] != canvas) return;
                arg.canvas(ctx, (Date.now() - start)/1000.0);
                window.requestAnimationFrame(animate);
            };
            window.requestAnimationFrame(animate);
            state.canReload = false;
        }
    }
    if (arg.title)
        div.appendChild( e("div", baseStyle, {fontSize: "2em",
            top: "40%", textAlign: "center", text: arg.title}) );
    if (arg.subtitle)
        div.appendChild( e("div", baseStyle, {fontSize: "1em",
            top: "60%", textAlign: "center", text: arg.subtitle}) );
    if (arg.h1)
        div.appendChild( e("div", baseStyle, {fontSize: "1.5em",
            top: "10%", textAlign: "center", text: arg.h1} ));
    if (arg.ul) {
        const c = e("div", baseStyle, {left: "5%", width: "90%", top: "20%"});
        c.appendChild( e("ul", {html: arg.ul}) );
        div.appendChild(c);
    }
    if (arg.markdown) {
        const unindent = function(s) {
            s = s.replace(/^\s*\n/, ""); // Remove initial space
            const indent = s.match(/^\s*/)[0];
            const matchIndent = new RegExp(`^${indent}`, "mg");
            s = s.replace(matchIndent, "");
            return s;
        };

        if (typeof marked === "undefined") {
            require("marked.min.js");
            window.setTimeout(render, 50);
            return;
        }

        arg.html = marked(unindent(arg.markdown));
    }
    if (arg.html)
        div.appendChild( e("div", baseStyle, {left: "5%", width: "90%", top: "10%", html: arg.html}) );

    if (arg.caption)
        div.appendChild( e("div", baseStyle, {fontSize: "1em",
            top: "90%", textAlign: "center", text: arg.caption, color: "#fff",
            textShadow: "0px 0px 20px #000"} ));

    [].forEach.call(div.getElementsByTagName("h1"), e => applyStyle(e, {
        textAlign: "center", fontSize: "1.5em", marginTop: 0, fontWeight: "normal"}));
    [].forEach.call(div.getElementsByTagName("li"), e => applyStyle(e, {marginBottom: "0.4em"}));
}

function defaultTemplate(div, arg)
{
    addElements(div, arg);
}

// ------------------------------------------------------------
// Slides
// ------------------------------------------------------------

var slides = [
    {title: "nfslides", subtitle: "Niklas Frykholm, 15 Feb 2016"},
    {html: `
        <h1>nfslides — Minimalistic Slideshows</h1>
        <ul>
            <li>~140 lines of JavaScript in core</li>
            <li>ES6 — backwards compatibility is boring</li>
            <li>Hackable: Add your own templates, styles and effects</li>
            <li>Everything is code</li>
        </ul>`},
    {h1: "Features", ul: `
        <li>Auto-reload, just save in your text editor</li>
        <li>Keyboard interface: press <b>h</b> or <b>?</b> for help</li>
        <li>Toggle between 16:9 and 4:3: press <b>w</b></li>
        <li>Toggle between views: press <b>v</b></li>`},
    {h1: "Built-In Templates", ul: `
        <li>Title</li>
        <li>List</li>
        <li>Markdown</li>
        <li>Image</li>
        <li>Video (local or youtube)</li>
        <li>Canvas (2D and 3D graphics)</li>`},
    {markdown: `
        # Markdown

        * You can make slides in [markdown](https://daringfireball.net/projects/markdown/)
        * Uses \`marked.min.js\` as markdown processor
    `},
    {caption: "Image Slide (courtesy of Unsplash)", imageUrl: "https://images.unsplash.com/photo-1414115880398-afebc3d95efc?crop=entropy&dpr=2&fit=crop&fm=jpg&h=900&ixjsv=2.1.0&ixlib=rb-0.3.5&q=50&w=1600"},
    {caption: "YouTube", video: {youtubeId: "PUv66718DII"}},
    {caption: "MP4", video: {src: "http://techslides.com/demos/sample-videos/small.mp4", thumbnailSrc: "http://perso.freelug.org/benw/rotor/colour.jpg"}},
    {caption: "Canvas", canvas: (ctx,t) => {
        ctx.save();
            ctx.clearRect(-2000,-2000,4000,4000);
            ctx.rotate(t);
            ctx.strokeStyle = "#000";
            ctx.lineWidth=3;
            ctx.fillStyle = "#ff0";
            const rect = [-800, -800, 1600, 1600];
            ctx.fillRect(...rect);
            ctx.strokeRect(...rect);
        ctx.restore();
        return "animate";
    }},
    {title: "Good riddance, Powerpoint!", subtitle: "TTYN"},
]
