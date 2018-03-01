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

//Touchscreen

var canvasOffset = canvas.offset();

canvas.on("touchstart", function(e) {
    // console.log(e.touches[0]);
    offsetX = e.touches[0].pageX - canvasOffset.left;
    offsetY = e.touches[0].pageY - canvasOffset.top;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    e.preventDefault();
});

canvas.on("touchmove", function(e) {
    offsetX = e.touches[0].pageX - canvasOffset.left;
    offsetY = e.touches[0].pageY - canvasOffset.top;
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    e.preventDefault();

    $('input[name="signature"]').val(canvas[0].toDataURL());
});

// canvas.on("touchup", function() {
//     canvas.unbind("mousemove");
//     var c = document.getElementById("canvas");
//     c.toDataURL();
//     $('input[name="signature"]').val(c.toDataURL());
// });

//body.appendChild(canvas);
