//TODO: allow touch

var Aim = function (elementId, options) {
    if ( ! (this instanceof Aim) ) {
        return new Aim(elementId, options);
    }

    this._options = options;
    this._obj = document.getElementById(elementId);

    this._init();
}

Aim.prototype._init = function () {
    var self = this,
        canvas = self.canvas = document.createElement('canvas'),
        ctx = self.ctx = canvas.getContext('2d'),
        sound = this._sound = document.getElementsByTagName('audio')[0],
        objDocOffset = self._getOffset(),
        objWinOffset = self._obj.getBoundingClientRect();

    //cache a draw function that's always bind to this object
    this._bindDraw = this._draw.bind(this);

    //overlay canvas
    document.body.appendChild(canvas);

    canvas.style.position = 'absolute';
    canvas.width = self._obj.width;
    canvas.height = self._obj.height;
    canvas.style.left = objDocOffset.left  + 'px';
    canvas.style.top = objDocOffset.top + 'px';

    canvas.style.cursor = 'none';

    this._nightVisionOn = true;
    self._isMoving = false;

    //center sniper goggles
    this._x = self._obj.width/2;
    this._y = self._obj.height/2;

    this._draw();

    canvas.addEventListener('mousedown', function canvasMouseDown(e) {
        //rewind sound in case of double clicks
        sound.currentTime = 0;
        sound.play();

        //prevent selection
        e.preventDefault();
    });

    canvas.addEventListener('mousemove', function canvasMouseMove(e) {
        self._x = e.pageX - objWinOffset.left;
        self._y = e.pageY - objWinOffset.top;

        if ( self._isMoving ) {
            return;
        }

        self._isMoving = true;
        self._draw();
    });

    canvas.addEventListener('mouseout', function canvasMouseOut() {
        self._isMoving = false;
    });
}

Aim.prototype._draw = function () {
    var canvas = this.canvas,
        ctx = this.ctx,
        x = this._x,
        y = this._y;


    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";

    ctx.beginPath();
    //non zero winding to allow the circle to be drilled in rect
    //see: http://blogs.adobe.com/webplatform/2013/01/30/winding-rules-in-canvas/
    ctx.arc(x, y, 100, 0, 2 * Math.PI);
    ctx.rect(canvas.width, 0, -canvas.width, canvas.height);

    //add fog to make it more realistic
    if ( !this._nightVisionOn ) {
        ctx.shadowColor = '#999';
        ctx.shadowBlur = 100;
    }else{
        ctx.shadowColor = 'rgba(0, 253, 39, 0.5)';
        ctx.shadowBlur = 800;
    }

    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.fill();


    //draw crosshair lines
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';

    ctx.beginPath();
    ctx.moveTo(x - 100, y);
    ctx.lineTo(x - 10,  y)
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y - 100);
    ctx.lineTo(x,  y - 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + 100,  y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y + 10);
    ctx.lineTo(x,  y + 100);
    ctx.stroke();

    //red aiming point
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 0, 0, 1)";
    ctx.arc(x, y, 2, 0, 2 * Math.PI);
    ctx.fill();

    if ( !this._isMoving ) {
        return;
    }

    requestAnimationFrame(this._bindDraw);
}

Aim.prototype.toggleNightVision = function () {
    this._nightVisionOn = !this._nightVisionOn;
}

Aim.prototype._getOffset = function () {
    var el = this._obj,
        x = 0,
        y = 0;

    while( el ) {
        x += el.offsetLeft;
        y += el.offsetTop;

        el = el.offsetParent;
    }

    return { left: x, top: y };
}


//init
window.imgAim = Aim('img')
