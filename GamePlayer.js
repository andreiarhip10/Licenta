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

var text;

var objectives;

var selects;
var selectResults = [];
var selectColumns = [];

var types = [];
var columns = [];
var records = [];

//Method used for initializing canvas - TO IMPLEMENT
function initPlayerCanvas() {
    canvas = new fabric.Canvas('playerCanvas');

    var oReq = new XMLHttpRequest();

    oReq.onload = function(e) {
        
        canvas.loadFromJSON(this.response, canvas.renderAll.bind(canvas));
        
        
        
    };
    // Server hosting the directories
    var address = "http://192.168.1.239:8887/Games/" + title;
    oReq.open("get", address + "/canvasJson.txt", true);
    oReq.send();

    var xhr = new XMLHttpRequest();
    xhr.open('GET', address + '/serializedDb.db', true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
        var uInt8Array = new Uint8Array(this.response);
        db = new SQL.Database(uInt8Array);
        //console.log(db.exec("SELECT * FROM orcs")[0].values[0]);
    };
    xhr.send();

    var xhr = new XMLHttpRequest();
    xhr.open('GET', address + '/dataJson.txt', true);
    xhr.responseType = 'json';
    xhr.onload = function(e) {
        entityPool = this.response;
        for (var i = 0; i < entityPool.length; i ++) {
            if (types.indexOf(entityPool[i].tableEntity.name) == -1) {
                types.push(entityPool[i].tableEntity.name);
                
                //console.log(types);
            }
        }
        for (var i = 0; i < types.length; i ++) {
            var exec = db.exec("SELECT * FROM " + types[i] + ";");
            //console.log(exec[0].columns, exec[0].values);
            columns.push(exec[0].columns);
            records.push(exec[0].values);

            $('#tablesModalContentClient').append("<p class='h3' style='text-align:center'><span class='badge badge-secondary'>" + types[i] + "</span></p>");
            $('#tablesModalContentClient').append("<table class='table table-striped table-dark' id='" + types[i] + "Table'><thead><tr><th scope='col'>#</th></tr></thead><tbody></tbody></table>");
            for (var j = 0; j < columns[i].length; j++) {
                $('#tablesModalContentClient th:last').after("<th scope='col'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button type='button' class='btn btn-outline-info' disabled>" + columns[i][j] + "</button></th>")
            }
            //console.log(records[i]);
            for (var j = 0; j < records[i].length; j ++) {
                var tableId = '#' + types[i] + 'Table';
                $(tableId).find('tbody').append("<tr><th scope='row'>" + (j + 1) + "</th></tr>")
                //console.log(records[i][j]);
                for (var k = columns[i].length - 1; k >= 0; k --) {
                    $('#tablesModalContentClient th:last').after("<td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + records[i][j][k] + "</td>")
                }
            }
        }
    }

    xhr.send();

    var req = new XMLHttpRequest();
    req.open('GET', address + '/infoJson.txt', true);
    req.responseType = 'json';
    req.onload = function(e) {
        //console.log(this.response);
        text = this.response[0];
        objectives = this.response[1];
        selects = this.response[2];
        $("#text").text(text);
        for (var i = 0; i < objectives.length; i ++) {
            $("#objectives").append("<li class='list-group-item list-group-item-primary' id='obj" + (i + 1) + "'>" + objectives[i] + "</li>");
        }
        for (var i = 0; i < selects.length; i ++) {
            selectResults.push((db.exec(selects[i]))[0].values[0]);
            selectColumns.push((db.exec(selects[i]))[0].columns);
        }
    }
    req.send();

    

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
            selectedItems.push(entityPool[i]);
        }
    }


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

        for (var i = 0; i < selectResults.length; i ++) {
            console.log(selectResults[i]);
            console.log(queryResult[0].values[0]);
            if (selectResults[i].length == queryResult[0].values[0].length) {
                var flag = true;
                for (var j = 0; j < selectResults[i].length; j ++) {
                    if (selectResults[i][j] != queryResult[0].values[0][j]) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    //console.log('ok');
                    $("#obj" + (i + 1)).after("<li class='list-group-item list-group-item-success'>" + inputText + "</li>")
                    objectives.splice(i, 1);
                }
            }
        
        }

        if (objectives.length == 0) {
            setTimeout(function() {
                window.alert("Congratulations! You have completed all the objectives.");
                $("#canvasCol").append("<p style='text-align: center;'><a href='GameSelector.php?completed=" + title + "'><button type='button' class='btn btn-outline-info btn-lg' style='margin-top: 25px;'>Go to game selection</button></a></p>")
            }, 3000);
            
        }
    }

    
    
    
}
