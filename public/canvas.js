var canvas = $("#canvas");
var ctx;

var offsetX;
var offsetY;
ctx = document.getElementById("canvas").getContext("2d");

canvas.on("mousedown", function(e) {
    ctx.strokeStyle = "black";
    ctx.beginPath();

    canvas.on("mousemove", function(e) {
        offsetX = e.offsetX;
        offsetY = e.offsetY;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    });
});

canvas.on("mouseup", function() {
    canvas.unbind("mousemove");
    var c = document.getElementById("canvas");
    c.toDataURL();
    $('input[name="signature"]').val(c.toDataURL());
});

//body.appendChild(canvas);
