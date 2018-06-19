//Global variable for canvas
var canvas;

//SQLite Compiler
var sql = window.SQL;

//Global variable for database
var db;

//Global variable for data array
var data;

//Method used for initializing canvas - TO IMPLEMENT
function initPlayerCanvas() {
    canvas = new fabric.Canvas('playerCanvas');
    var serializedCanvas = document.getElementById('serializedCanvas');
    var serializedDb = document.getElementById('serializedDb');
    var serializedData = document.getElementById('serializedData');

    serializedCanvas.addEventListener('change', function(e) {
        var file = serializedCanvas.files[0];
        var textType = /text.*/;

        if (file.type.match(textType)) {
            var reader = new FileReader();
            reader.onload = function(e) {
                // JSON is loaded succesfully, loading canvas
                canvas.loadFromJSON(reader.result, canvas.renderAll.bind(canvas));
            }
            reader.readAsText(file);
            
        } else {
            console.log("File type not supported!");
        }
    })

    serializedDb.addEventListener('change', function(e) {
        var file = serializedDb.files[0];
        //console.log(file);
        var reader = new FileReader();
        reader.onload = function(e) {
            // JSON is loaded succesfully, loading db
            //console.log(reader.results);
            //var json = JSON.parse(reader.result);

            //db & db.close();

            db = new SQL.Database((e.target.result? new Uint8Array(e.target.result) : void 0));

            //console.log(db.exec("SELECT * FROM orcsorcs;")[0].values[0]);
            }
        reader.readAsArrayBuffer(file);
    })

    serializedData.addEventListener('change', function(e) {
        var file = serializedData.files[0];
        var textType = /text.*/;

        if (file.type.match(textType)) {
            var reader = new FileReader();
            reader.onload = function(e) {
                // JSON is loaded succesfully, loading data
                console.log(JSON.parse(reader.result));
                data = JSON.parse(reader.result);
            }
            reader.readAsText(file);
            
        } else {
            console.log("File type not supported!");
        }
    })
}

// Method used for setting up canvas, db and other info
function importData() {
    // Locking canvas elements position
    for (var i = 0; i < canvas._objects.length; i ++) {
        //console.log("Deselecing item #" + i);
        canvas.item(i).selectable = false;
        canvas.item(i).lockRotation = canvas.item(i).lockScalingX = canvas.item(i).lockScalingY = canvas.item(i).lockMovementX = canvas.item(i).lockMovementY = true;
        canvas.item(i).selection = false;
        canvas.discardActiveObject();
        canvas.renderAll();
        
    }

    //console.log(db.exec("SELECT * FROM sqlite_master WHERE type='table';"));

    //console.log(db.exec("SELECT * FROM sqlite_master WHERE type='table';"));

    console.log(db.exec("SELECT * FROM orcs;")[0].values[0]);
}
