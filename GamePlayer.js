// Variable used for retrieving url
var URL = document.URL.toString();

// Game title
var title = "";

// Building game title
for (var i = parseInt(URL.indexOf('=')) + 1; i < URL.length; i ++) {
    title = title + URL[i];
}

//Global variable for canvas
var canvas;

//SQLite Compiler
var sql = window.SQL;

//Global variable for database
var db;

//Global variable for data array
var entityPool;

//Method used for initializing canvas - TO IMPLEMENT
function initPlayerCanvas() {
    canvas = new fabric.Canvas('playerCanvas');
    var serializedCanvas = document.getElementById('serializedCanvas');
    var serializedDb = document.getElementById('serializedDb');
    var serializedData = document.getElementById('serializedData');


    console.log("hi");

    var oReq = new XMLHttpRequest();
    console.log("hi2");

    oReq.onload = function() {

        console.log("hi3");
        
        response = this.responseText;
        //console.log(response);
        var file = new File([response], "cjs.txt");
        //console.log(file);
        var reader = new FileReader();
        reader.onload = function(e) {
            console.log(reader.result);
            canvas.loadFromJSON(reader.result, canvas.renderAll.bind(canvas));
        }
        reader.readAsText(file);
    };
    // Server hosting the directories
    oReq.open("get", "http://192.168.100.16:8887/canvasJson2.txt", true);
    oReq.send();

    /*var file = new File([response], "cjs.txt");

    var reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onloadend = function() {
        console.log(reader.result);
    }*/

    /*var reader = new FileReader();
    var result;
    reader.onload = function(e) {
        result = reader.result;
        console.log(result);
    }
    reader.readAsText(file);
    console.log(result);
    canvas.loadFromJSON(result, canvas.renderAll.bind(canvas));*/

    

    // TO IMPLEMENT - send game folder as parameter, create file objects

    // serializedCanvas.addEventListener('change', function(e) {
    //     var file = serializedCanvas.files[0];
    //     console.log(file);
    //     var textType = /text.*/;

    //     if (file.type.match(textType)) {
    //         var reader = new FileReader();
    //         reader.onload = function(e) {
    //             // JSON is loaded succesfully, loading canvas
    //             canvas.loadFromJSON(reader.result, canvas.renderAll.bind(canvas));
    //         }
    //         reader.readAsText(file);
            
    //     } else {
    //         console.log("File type not supported!");
    //     }
    // })

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
                //console.log(JSON.parse(reader.result));
                entityPool = JSON.parse(reader.result);
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

    //console.log(db.exec("SELECT * FROM orcs;")[0].values[0]);
}

// Method used for highlighting selected items and displaying the result
function selectStatementClient() {
    var inputText = $('#selectInputClient').val();
    var queryResult = db.exec(inputText);
    var selectedItems = [];

    //console.log(queryResult[0].columns + "   " + queryResult[0].values);
    for (var i = 0; i < entityPool.length; i ++) {
        var recordsFlag = false;
        if (queryResult[0] != undefined) {
            for (var rec = 0; rec < entityPool[i].tableEntity.records[0].length; rec ++) {
            //console.log(queryResult[0].values[0][rec] + "---DEBUG");}
            for (var j = 0; j < queryResult[0].values.length; j ++) {
                if (entityPool[i].tableEntity.records[0].includes(queryResult[0].values[j][rec]))
                {
                    recordsFlag = true;
                    break;
                }
            }
        }
        }
        
        if (recordsFlag) {
            console.log("Matching select");
            selectedItems.push(entityPool[i]);
        }
    }

    console.log(selectedItems);

    for (var j = 0; j < selectedItems.length; j ++)
    {
        //console.log(selectedItems[j].image);
        var imageHolder = canvas.item(selectedItems[j].id + 1);
        imageHolder.opacity = 0.5;
        canvas.renderAll();
    }
    setTimeout(function() {
        for (var j = 0; j < selectedItems.length; j ++)
        {
            var imageHolder = canvas.item(selectedItems[j].id + 1);
            imageHolder.opacity = 1;
            canvas.renderAll();
            setTimeout(function() {
                for (var j = 0; j < selectedItems.length; j ++)
                {
                    var imageHolder = canvas.item(selectedItems[j].id + 1);
                    imageHolder.opacity = 0.5;
                    canvas.renderAll();
                    setTimeout(function() {
                    for (var j = 0; j < selectedItems.length; j ++)
                    {
                        var imageHolder = canvas.item(selectedItems[j].id + 1);
                        imageHolder.opacity = 1;
                        canvas.renderAll();
                    }
                }, 500)
                }
            }, 500)
        }
    }, 500);

    
    $('#selectResultClient').empty();

    $('#selectResultClient').append("<table class='table table-striped table-dark' id='selectTableClient'><thead><tr><th scope='col'>#</th></tr></thead><tbody></tbody></table>");

    if (queryResult[0] != undefined) {
        for (var i = 0; i < queryResult[0].columns.length; i ++) {
        $('#selectResultClient th:last').after("<th scope='col'>" + queryResult[0].columns[i] + "</th>");

    }

        for (var i = 0; i < queryResult[0].values.length; i ++) {
            $('#selectTableClient').find('tbody').append("<tr><th scope='row'>" + (i + 1) + "</th></tr>");
            for (var j = queryResult[0].columns.length - 1; j >= 0; j --) {
                $('#selectTableClient th:last').after("<td>" + queryResult[0].values[i][j] + "</td>");
            }
        }
    }
    
    
}
