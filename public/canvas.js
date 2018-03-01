var canvas = $("#canvas");
var ctx;

var offsetX;
var offsetY;
ctx = document.getElementById("canvas").getContext("2d");

canvas.on("mousedown", function(e) {
    ctx.strokeStyle = "black";
    ctx.beginPath();

    canvas.on("mousemove", function(e) {
        offsetX = e.touches[0].offsetX;
        offsetY = e.touches[0].offsetY;
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

canvas.on("touchdown", function(e) {
    ctx.strokeStyle = "black";
    ctx.beginPath();

    canvas.on("touchmove", function(e) {
        offsetX = e.touches[0].offsetX;
        offsetY = e.touches[0].offsetY;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    });
});

// canvas.on("touchup", function() {
//     canvas.unbind("mousemove");
//     var c = document.getElementById("canvas");
//     c.toDataURL();
//     $('input[name="signature"]').val(c.toDataURL());
// });

//body.appendChild(canvas);
