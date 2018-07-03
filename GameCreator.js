// Global variable for canvas
var canvas;

// Global variable for background image
var backgroundImage;

// Array used for storing entity types
var entityTypes = [];

// Global array with various entities
var entityPool = [];

// Table Entities
var tableEntities = [];

// Variable used for storing entity id's
var id = 0;

//SQLite compiler
var sql = window.SQL;

//Virtual database
var db = new sql.Database();

//Transient container for manipulating added images
var imgContainer = [];

// Canvas entity class
class CanvasEntity {
    constructor(image, type, id, addedImages, tableEntity) {
        this.image = image;
        this.type = type;
        this.id = id;
        this.addedImages = addedImages;
        this.tableEntity = tableEntity;
    }
}

// List to store all the preview canvases
var previewCanvasList = [];

// Table entity class - properties = a Map of all the columns the table has
class TableEntity {
    constructor(name, properties, records) {
        this.name = name;
        this.properties = properties;
        this.records = records;
    }
}

class Change {
    constructor(propertyType, propertyName, propertyValue, values) {
        this.propertyType = propertyType;
        this.propertyName = propertyName;
        this.propertyValue = propertyValue;
        this.values = values;
    }
}

class AddedFilter {
    constructor(type, name, value, filterNames) {
        this.type = type;
        this.name = name;
        this.value = value;
        this.filterNames = filterNames;
    }
}

class AddedDrawings {
    constructor(type, column, value, drawings, coordinates) {
        this.type = type;
        this.column = column;
        this.value = value;
        this.drawings = drawings;
        this.coordinates = coordinates;
    }
}

var changes = [];
var addedFilters = [];
var addedDrawingsList = [];

var title;


// Function used for initiating canvas
function initCanvas() {
    canvas = new fabric.Canvas('gameCanvas');
    /*sqlstr = "CREATE TABLE hello ( a integer, b varchar2 );"
    db.run(sqlstr);
    sqlstr2 = "INSERT INTO hello ( a, b ) VALUES ( 0, 'hello');"
    sqlstr2 += "INSERT INTO hello ( a, b ) VALUES ( 1, 'world');"
    db.run(sqlstr2);
    console.log(db.exec("SELECT * FROM hello"));*/
}

// Function used for selecting game background
function backgroundImage() {
    var selectedBackground = document.getElementById('backgroundSelect').value;
    var fakePath = selectedBackground.split('\\');
    path = fakePath[fakePath.length - 1];
    var url = 'http://192.168.1.239:8887/' + path;
    fabric.Image.fromURL(url, function (oImg) {
        canvas.add(oImg);
        backgroundImage = oImg;
    }, {crossOrigin: "Anonymous"});
}

// TO IMPLEMENT - full path

// Function used for locking background image
function backgroundImageLock() {
    canvas.item(0).selectable = false;
    canvas.item(0).lockRotation = canvas.item(0).lockScalingX = canvas.item(0).lockScalingY = canvas.item(0).lockMovementX = canvas.item(0).lockMovementY = true;
    canvas.item(0).selection = false;
    canvas.discardActiveObject();
    canvas.renderAll();
}

function backgroundImageRemove() {
    canvas.remove(canvas.item(0));
    canvas.renderAll();
    $("#backgroundSelect").val("");
}

// Function used for setting up a canvas entity's transparency - OBSOLETE
/*function transparency(column, value) {
    if (document.getElementById(column + "-" + value + "Option") != null) {
        document.getElementById(column + "-" + value + "Option").remove();
    }
    if (document.getElementById(column + "-" + value + "Option") == null) {
        $("#" + column + "-" + value + "Prop").append("<div class='dropdown' style='float:right;margin-right:2em' id='" + column + "-" + value + "Option'><button class='btn btn-secondary dropdown-toggle'\
        type='button' id='" + column + "-" + value + "Trans' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>Select Transparency</button>\
        <div class='dropdown-menu' aria-labelledby='" + column + "-" + value + "Trans'><button class='dropdown-item' onclick='changeTransparency(\"Normal\")'>Normal</button><button class='dropdown-item' onclick='changeTransparency(\"Low\")'>Low</button>\
        <button class='dropdown-item' onclick='changeTransparency(\"Very Low\")'>Very Low</button></div></div>");
    }
}

function changeTransparency(value) {
    if (value == 'Normal') {
        canvas.item(id).opacity = 1;
    }
    if (value == 'Low') {
        canvas.item(id).opacity = 0.66;
    }
    if (value == 'Very Low') {
        canvas.item(id).opacity = 0.33;
    }
}*/


// Function used for adding images to base image
function editImage(column, value, type) {
    if (document.getElementById(column + "-" + value + "Option") != null) {
        document.getElementById(column + "-" + value + "Option").remove();
    }
    if (document.getElementById(column + "-" + value + "Option") == null) {
        $("#" + column + "-" + value + "Prop").append("<input type='file' style='margin-left:20px' id='" + column + "-" + value + "Option' onchange='applyImage(\"" + column + "\", \"" + value + "\", \"" + type + "\")'>");
    }
    if (document.getElementById(column + "-" + value + "AddImageButton") == null) {
        $("#" + column + "-" + value + "Prop").append("<button type='button' class='btn btn-secondary' style='float:right;margin-right:10px' id='" + column + "-" + value + "AddImageButton' onclick='saveProperty(\"" + column + "\", \"" + value + "\", \"" + type + "\")'>Save Changes</button>");
    }

    entityPool[id - 1].addedImages ++;
    
    //group._objects[1].set({top: 50});
}

// REMOVE UNNECESSARY HTML
function filters(column, value, type) {
    $("#" + column + "-" + value + "Prop").append("<span><select id='" + column + "-" + value + "Filter' class='form-control form-control-sm d-inline' style='width:200px; margin-left: 15px'><option>Grayscale</option><option>Sepia</option><option>Brownie</option><option>Vintage</option><option>Kodachrome</option>\
    <option>Technicolor</option><option>Polaroid</option></select><button type='button' class='btn btn-secondary d-inline' style='margin-left:5px;' onclick='applyFilter(\"" + column + "\", \"" + value + "\", \"" + type + "\")'>Apply</button>\
    <button type='button' class='btn btn-secondary d-inline' style='margin-left:5px;' onclick='clearFilters(\"" + type + "\")'>Clear Filters</button>\
    <button type='button' class='btn btn-secondary d-inline float-right' style='margin-right:5px;' onclick='saveFilters(\"" + column + "\", \"" + value + "\", \"" + type + "\")'>Save Changes</button></span>")
}

function draw(column, value, type) {
    $("#" + column + "-" + value + "Prop").append("<span><input type='color' id='" + column + "-" + value + "Color' style='margin-left:15px;'>\
    <select id='" + column + "-" + value + "BrushSize'><option>Small</option><option>Medium</option><option>Large</option><option>Larger</option></select>\
    <button type='button' class='btn btn-secondary d-inline' style='margin-left:5px;' onclick='enableDrawingMode(\"" + column + "\", \"" + value + "\", \"" + type + "\")'>Draw</button>\
    <button type='button' class='btn btn-secondary d-inline' style='margin-left:5px;' onclick='disableDrawingMode(\"" + type + "\")'>Select</button>\
    <button type='button' class='btn btn-secondary d-inline' style='margin-left:5px;' onclick='setDrawingPosition(\"" + column + "\", \"" + value + "\", \"" + type + "\")'>Set</button>\
    <button type='button' class='btn btn-secondary d-inline' style='margin-left:5px;' onclick='clearDrawings(\"" + type + "\")'>Clear</button>\
    <button type='button' class='btn btn-secondary d-inline' style='margin-left:5px;' onclick='saveDrawings(\"" + column + "\", \"" + value + "\", \"" + type + "\")'>Save</button></span>")
}

function saveDrawings(column, value, type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
        }
    }

    var drawings = [];
    var coordinates = [];

    for (var i = 1; i < previewCanvas.getObjects()[0]._objects.length; i ++) {
        drawings.push(previewCanvas.getObjects()[0].item(i));
        var top = previewCanvas.getObjects()[0].item(i).top;
        var left = previewCanvas.getObjects()[0].item(i).left;
        coordinates.push(top, left);
    }

    var addedDrawings = new AddedDrawings(type, column, value, drawings, coordinates);
    addedDrawingsList.push(addedDrawings);

    for (var i = 0; i < entityPool.length; i ++) {
        if (entityPool[i].type.id == type && Array.from(entityPool[i].tableEntity.properties.keys()).includes(column)) {
            var index = Array.from(entityPool[i].tableEntity.properties.keys()).reverse().indexOf(column);
            if (entityPool[i].tableEntity.records[i][index] == value) {
                if (entityPool[i].image instanceof fabric.Image) {
                    for (var j = 0; j < addedDrawingsList.length; j ++) {
                        if (addedDrawingsList[j].type == type && addedDrawingsList[j].column == column && addedDrawingsList[j].value == value) {
                            canvas.remove(entityPool[i].image);
                            var group = new fabric.Group([entityPool[i].image])
                            for (var k = 0; k < addedDrawingsList[j].drawings.length; k ++) {

                                addedDrawingsList[j].drawings[k].set({top: addedDrawingsList[j].coordinates[2*k], left: addedDrawingsList[j].coordinates[2*k + 1]})
                                group.add(addedDrawingsList[j].drawings[k]);
                            }
                            canvas.add(group);
                            canvas.renderAll();
                            entityPool[i].image = group;
                        }
                        
                    }
                    
                } else {
                    for (var j = 0; j < addedDrawingsList.length; j ++) {
                        if (addedDrawingsList[j].type == type && addedDrawingsList[j].column == column && addedDrawingsList[j].value == value) {
                            for (var k = 0; k < addedDrawingsList[j].drawings.length; k ++) {
                                addedDrawingsList[j].drawings[k].set({top: addedDrawingsList[j].coordinates[2*k], left: addedDrawingsList[j].coordinates[2*k + 1]})
                                entityPool[i].image.add(addedDrawingsList[j].drawings[k]);
                            }
                            canvas.renderAll();
                        }
                        
                    }
                }
            }
        }
    }

    previewCanvas.clear();
    previewCanvas.renderAll();

    var url = 'http://192.168.1.239:8887/' + $("#" + type).val().substr(12);
    
    fabric.Image.fromURL(url, function (oImg) {
        previewCanvas.add(oImg);
    }, {crossOrigin: "Anonymous"});
}

function clearDrawings(type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
        }
    }

    previewCanvas.clear();

    var url = 'http://192.168.1.239:8887/' + $("#" + type).val().substr(12);
    
    fabric.Image.fromURL(url, function (oImg) {
        previewCanvas.add(oImg);
    }, {crossOrigin: "Anonymous"});
}

function enableDrawingMode(column, value, type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
        }
    }

    previewCanvas.freeDrawingBrush.width = 1;

    previewCanvas.isDrawingMode = true;
    previewCanvas.freeDrawingBrush.color = $("#" + column + "-" + value + "Color").val();
    //console.log($("#" + column + "-" + value + "BrushSize").val())
    switch($("#" + column + "-" + value + "BrushSize").val()) {
        case "Small":
            previewCanvas.freeDrawingBrush.width = parseInt(1);
        case "Medium":
            previewCanvas.freeDrawingBrush.width = parseInt(5);
        case "Large":
            previewCanvas.freeDrawingBrush.width = parseInt(10);
        case "Larger":
            previewCanvas.freeDrawingBrush.width = parseInt(15);
    }

    //console.log(previewCanvas.freeDrawingBrush.width);
}

function disableDrawingMode(type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
        }
    }

    previewCanvas.isDrawingMode = false;
    console.log(previewCanvas.getObjects());
}

function setDrawingPosition(column, value, type) {
    
    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
        }
    }

    var group = new fabric.Group([previewCanvas.getObjects()[0]]);

    for (var i = 1; i < previewCanvas.getObjects().length; i ++) {
        var top = previewCanvas.getObjects()[0].top + previewCanvas.getObjects()[i].top;
        var left = previewCanvas.getObjects()[0].left + previewCanvas.getObjects()[i].left;
        previewCanvas.getObjects()[i].set({ top: top, left: left})
        group.add(previewCanvas.getObjects()[i]);
    }

    previewCanvas.clear();
    previewCanvas.add(group);
    previewCanvas.renderAll();



}

function saveFilters(column, value, type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
        }
    }

    var filters = [];

    for (var i = 0; i < previewCanvas.getObjects()[0].filters.length; i ++) {
        filters.push(previewCanvas.getObjects()[0].filters[i].type);
    }

    for (var i = 0; i < entityPool.length; i ++) {
        if (entityPool[i].type.id == type && Array.from(entityPool[i].tableEntity.properties.keys()).includes(column)) {
            var index = Array.from(entityPool[i].tableEntity.properties.keys()).reverse().indexOf(column);
            if (entityPool[i].tableEntity.records[i][index] == value) {
                if (entityPool[i].image instanceof fabric.Image) {
                    for (var j = 0; j < filters.length; j ++) {
                        switch (filters[j]) {
                            case 'Grayscale':
                                entityPool[i].image.filters.push(new fabric.Image.filters.Grayscale());
                                break;
                            case 'Sepia':
                                entityPool[i].image.filters.push(new fabric.Image.filters.Sepia());
                                break;
                            case 'Brownie':
                                entityPool[i].image.filters.push(new fabric.Image.filters.Brownie());
                                break;
                            case 'Vintage':
                                entityPool[i].image.filters.push(new fabric.Image.filters.Vintage());
                                break;
                            case 'Kodachrome':
                                entityPool[i].image.filters.push(new fabric.Image.filters.Kodachrome());
                                break;
                            case 'Technicolor':
                                entityPool[i].image.filters.push(new fabric.Image.filters.Technicolor());
                                break;
                            case 'Polaroid':
                                entityPool[i].image.filters.push(new fabric.Image.filters.Polaroid());
                                break; 
                        }
                    }
                    entityPool[i].image.applyFilters();
                    canvas.renderAll();
                } 
            }
        }
    }

    addedFilters.push(new AddedFilter(type, column, value, filters));

    previewCanvas.clear();
    previewCanvas.renderAll();

    var url = 'http://192.168.1.239:8887/' + $("#" + type).val().substr(12);
    
    fabric.Image.fromURL(url, function (oImg) {
        previewCanvas.add(oImg);
    }, {crossOrigin: "Anonymous"});
    
    
}

function applyFilter(column, value, type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
        }
    }

    var obj = previewCanvas.getObjects()[0];
    switch($("#" + column + "-" + value + "Filter").val()) {
        case 'Grayscale':
            obj.filters.push(new fabric.Image.filters.Grayscale());
            obj.applyFilters();
            previewCanvas.renderAll();
            break;
        case 'Sepia':
            obj.filters.push(new fabric.Image.filters.Sepia());
            obj.applyFilters();
            previewCanvas.renderAll();
            break;
        case 'Brownie':
            obj.filters.push(new fabric.Image.filters.Brownie());
            obj.applyFilters();
            previewCanvas.renderAll();
            break;
        case 'Vintage':
            obj.filters.push(new fabric.Image.filters.Vintage());
            obj.applyFilters();
            previewCanvas.renderAll();
            break;
        case 'Kodachrome':
            obj.filters.push(new fabric.Image.filters.Kodachrome());
            obj.applyFilters();
            previewCanvas.renderAll();
            break;
        case 'Technicolor':
            obj.filters.push(new fabric.Image.filters.Technicolor());
            obj.applyFilters();
            previewCanvas.renderAll();
            break;
        case 'Polaroid':
            obj.filters.push(new fabric.Image.filters.Polaroid());
            obj.applyFilters();
            previewCanvas.renderAll();
            break;
    }
    
}

function clearFilters(type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
        }
    }

    var obj = previewCanvas.getObjects()[0];

    obj.filters = [];
    obj.applyFilters();
    previewCanvas.renderAll();
}

function saveProperty(column, value, type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
        }
    }

    var addedImage = previewCanvas.getObjects()[0]._objects[1];

    //console.log(addedImage.get('top'), addedImage.get('left'), addedImage.get('angle'), addedImage.get('scaleX'), addedImage.get('scaleY'));

    var values = [addedImage.get('top'), addedImage.get('left'), addedImage.get('angle'), addedImage.get('scaleX'), addedImage.get('scaleY')];
    var change = new Change(type, column, value, values);
    changes.push(change);
    applyChange(change);
}


function applyChange(change) {
    for (var i = 0; i < entityPool.length; i ++) {
        console.log(entityPool[i].type.id, change.propertyType);
        console.log(Array.from(entityPool[i].tableEntity.properties.keys()), change.propertyName);
        if (entityPool[i].type.id == change.propertyType && Array.from(entityPool[i].tableEntity.properties.keys()).includes(change.propertyName)) {
            var index = Array.from(entityPool[i].tableEntity.properties.keys()).reverse().indexOf(change.propertyName);
            if (entityPool[i].tableEntity.records[i][index] == change.propertyValue) {
                console.log("Found matching record.")
                if (entityPool[i].image instanceof fabric.Image) {
                    var img = fabric.util.object.clone(entityPool[i].image)
                    canvas.remove(entityPool[i].image);
                    var group = new fabric.Group([img]);
                    var newImage = document.getElementById(change.propertyName + "-" + change.propertyValue + "Option").value;
                    var fakePath = newImage.split('\\');
                    var path = fakePath[fakePath.length - 1];
                    var URL = "http://192.168.1.239:8887/" + path;
                    fabric.Image.fromURL(URL, function(img) {

                        var addedImage = img.set({ originX: 'center', originY: 'center', top: change.values[0], left: change.values[1], angle: change.values[2], scaleX: change.values[3], scaleY: change.values[4] });

                        group.add(addedImage);
                        group.setCoords();

                        canvas.add(group);

                        canvas.renderAll();
                    }, {crossOrigin: "Anonymous"})

                    entityPool[i].image = group;
                } else {
                    var newImage = document.getElementById(change.propertyName + "-" + change.propertyValue + "Option").value;
                    var fakePath = newImage.split('\\');
                    var path = fakePath[fakePath.length - 1];
                    var URL = "http://192.168.1.239:8887/" + path;
                    var group = entityPool[i].image;
                    fabric.Image.fromURL(URL, function(img) {
                        var addedImage = img.set({ originX: 'center', originY: 'center', top: change.values[0], left: change.values[1], angle: change.values[2], scaleX: change.values[3], scaleY: change.values[4] });
                        group.add(addedImage);
                        group.setCoords();
                        canvas.renderAll();
                    }, {crossOrigin: "Anonymous"})
                }
                

            }
        }
    }

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(change.propertyType)) {
            previewCanvas = previewCanvasList[i];
        }
    }


    previewCanvas.clear();
    previewCanvas.renderAll();

    var url = 'http://192.168.1.239:8887/' + $("#" + change.propertyType).val().substr(12);
    
    fabric.Image.fromURL(url, function (oImg) {
        previewCanvas.add(oImg);
    }, {crossOrigin: "Anonymous"});

}

// Method used for placing image to current entity in initial position
function applyImage(column, value, type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
        }
    }

    imgContainer = [];

    //console.log(previewCanvas.getObjects()[0]);

    var img = fabric.util.object.clone(previewCanvas.getObjects()[0]);
    var group = new fabric.Group([img]);

    imgContainer.push(img);

    var newImage = document.getElementById(column + "-" + value + "Option").value;
    var fakePath = newImage.split('\\');
    var path = fakePath[fakePath.length - 1];
    var URL = "http://192.168.1.239:8887/" + path;

    fabric.Image.fromURL(path, function(img) {
        var addedImage = img.scale(0.1).set({ originX: 'center', originY: 'center' });

        imgContainer.push(addedImage);

        group.add(addedImage);

        previewCanvas.add(group);
    });

    //console.log(imgContainer);

    


    /*var img = fabric.util.object.clone(entityPool[id - 1].image);
    canvas.remove(entityPool[id - 1].image);
    var group = new fabric.Group([img]);

    imgContainer.push(img);

    var newImage = document.getElementById(column + "-" + value + "Option").value;
    var fakePath = newImage.split('\\');
    var path = fakePath[fakePath.length - 1];
    fabric.Image.fromURL(path, function(img) {
        var addedImage = img.scale(0.1).set({ originX: 'center', originY: 'center' });

        imgContainer.push(addedImage);

        group.add(addedImage);
        //canvas.remove(canvas.item(id));

        console.log(addedImage);

        //console.log(addedImage.angle);

        canvas.add(group);
    })*/



    if (document.getElementById(column + "-" + value + "MoveUp") == null) {
        $("#" + column + "-" + value + "Prop").append("<div class='btn-toolbar' role='toolbar' aria-label='Added image controls.' style='margin-top:5px;'><div class='btn-group mr-2' role='group' aria-label='Movement'>\
        <button type='button' class='btn btn-secondary btn-sm' id='" + column + "-" + value + "MoveUp' \
        onclick='moveUp(\"" + type + "\")' data-toggle='tooltip' data-placement='bottom' title='Move up.'>&uarr;</button><button type='button' class='btn btn-secondary btn-sm' id='" + column + "-" + value + "MoveDown' \
        onclick='moveDown(\"" + type + "\")' data-toggle='tooltip' data-placement='bottom' title='Move down'>&darr;</button><button type='button' class='btn btn-secondary btn-sm' id='" + column + "-" + value + "MoveRight' \
        onclick='moveRight(\"" + type + "\")' data-toggle='tooltip' data-placement='bottom' title='Move right'>&rarr;</button><button type='button' class='btn btn-secondary btn-sm' id='" + column + "-" + value + "MoveLeft' \
        onclick='moveLeft(\"" + type + "\")' data-toggle='tooltip' data-placement='bottom' title='Move left'>&larr;</button></div><div class='btn-group mr-2' role='group' aria-label='Size'><button type='button' class='btn btn-secondary btn-sm' id='" + column + "-" + value + "Increase' \
        onclick='increaseSize(\"" + type + "\")' data-toggle='tooltip' data-placement='bottom' title='Increase size'>&#43;</button><button type='button' class='btn btn-secondary btn-sm' id='" + column + "-" + value + "Decrease' \
        onclick='decreaseSize(\"" + type + "\")' data-toggle='tooltip' data-placement='bottom' title='Decrease size'>&#45;</button></div><div class='btn-group mr-2' role='group' aria-label='Rotation'><button type='button' class='btn btn-secondary btn-sm' id='" + column + "-" + value + "RotateLeft' \
        onclick='rotateLeft(\"" + type + "\")' data-toggle='tooltip' data-placement='bottom' title='Rotate left'>&#8630;</button><button type='button' class='btn btn-secondary btn-sm' id='" + column + "-" + value + "RotateRight' \
        onclick='rotateRight(\"" + type + "\")' data-toggle='tooltip' data-placement='bottom' title='Rotate right'>&#8631;</button></div><div class='btn-group mr-2' role='group' aria-label='Width/Height'><button type='button' class='btn btn-secondary btn-sm' id='" + column + "-" + value + "IncreaseWidth' \
        onclick='increaseWidth(\"" + type + "\")' data-toggle='tooltip' data-placement='bottom' title='Increase width'>&#8596;</button><button type='button' class='btn btn-secondary btn-sm' id='" + column + "-" + value + "IncreaseHeight' \
        onclick='increaseHeight(\"" + type + "\")' data-toggle='tooltip' data-placement='bottom' title='Increase height'>&#8597;</button></button><button type='button' class='btn btn-secondary btn-sm' id='" + column + "-" + value + "DecreaseWidth' \
        onclick='decreaseWidth(\"" + type + "\")' data-toggle='tooltip' data-placement='bottom' title='Decrease width'>&#10574;</button></button></button><button type='button' class='btn btn-secondary btn-sm' id='" + column + "-" + value + "DecreaseHeight' \
        onclick='decreaseHeight(\"" + type + "\")' data-toggle='tooltip' data-placement='bottom' title='Decrease height'>&#10577;</button></div><div class='btn-group mr-2' role='group' aria-label='Clear'></button></button><button type='button' class='btn btn-secondary btn-sm' id='" + column + "-" + value + "ClearEdit' \
        onclick='clearEdit(\"" + type + "\")' data-toggle='tooltip' data-placement='bottom' title='Reset'>&#169;</button></div></div>");
    }

    $('[data-toggle="tooltip"]').tooltip();

    

    previewCanvas.getObjects()[0] = group;

    //console.log(previewCanvas.getObjects());
    
}


// TO IMPLEMENT - VALIDATIONS
// Methods used for repositioning and resizing the added image
function moveUp(type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
            break;
        }
    }

    //console.log(previewCanvas.getObjects());

    //var img = previewCanvas.getObjects()[0];

    var top = previewCanvas.getObjects()[0].top;
    var left = previewCanvas.getObjects()[0].left;

    previewCanvas.remove(previewCanvas.getObjects()[0]);

    img = imgContainer[1];

    var addedImgTop = img.top;

    img.set({
        top: addedImgTop - 10
    });

    var group = new fabric.Group([imgContainer[0], img]);

    group.set({
        top: top,
        left: left
    });

    previewCanvas.add(group);

    //previewCanvas.remove(previewCanvas.getObjects()[1])  

    //console.log(previewCanvas.getObjects());

    previewCanvas.getObjects()[0] = group;
}

function moveDown(type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
            break;
        }
    }

    var top = previewCanvas.getObjects()[0].top;
    var left = previewCanvas.getObjects()[0].left;

    previewCanvas.remove(previewCanvas.getObjects()[0]);

    var img = imgContainer[1];

    var addedImgTop = img.top;

    img.set({
        top: addedImgTop + 10
    });

    var group = new fabric.Group([imgContainer[0], img]);

    group.set({
        top: top,
        left: left
    });

    previewCanvas.add(group);  

    previewCanvas.getObjects()[0] = group;
}

function moveLeft(type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
            break;
        }
    }

    var top = previewCanvas.getObjects()[0].top;
    var left = previewCanvas.getObjects()[0].left;

    previewCanvas.remove(previewCanvas.getObjects()[0]);

    var img = imgContainer[1];

    var addedImgLeft = img.left;

    img.set({
        left: addedImgLeft - 10
    });

    var group = new fabric.Group([imgContainer[0], img]);

    group.set({
        top: top,
        left: left
    });

    previewCanvas.add(group);  

    previewCanvas.getObjects()[0] = group;
}

function moveRight(type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
            break;
        }
    }

    var top = previewCanvas.getObjects()[0].top;
    var left = previewCanvas.getObjects()[0].left;

    previewCanvas.remove(previewCanvas.getObjects()[0]);

    var img = imgContainer[1];

    var addedImgLeft = img.left;

    img.set({
        left: addedImgLeft + 10
    });

    var group = new fabric.Group([imgContainer[0], img]);

    group.set({
        top: top,
        left: left
    });

    previewCanvas.add(group);  

    previewCanvas.getObjects()[0] = group;
}


function increaseSize(type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
            break;
        }
    }

    var top = previewCanvas.getObjects()[0].top;
    var left = previewCanvas.getObjects()[0].left;

    previewCanvas.remove(previewCanvas.getObjects()[0]);

    var img = imgContainer[1];

    var addedImgScaleX = img.scaleX;
    var addedImgScaleY = img.scaleY;

    img.set({
        scaleX: addedImgScaleX + 0.1,
        scaleY: addedImgScaleY + 0.1,
    });

    var group = new fabric.Group([imgContainer[0], img]);

    group.set({
        top: top,
        left: left
    });

    previewCanvas.add(group);  

    previewCanvas.getObjects()[0] = group;
}

function decreaseSize(type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
            break;
        }
    }

    var top = previewCanvas.getObjects()[0].top;
    var left = previewCanvas.getObjects()[0].left;

    previewCanvas.remove(previewCanvas.getObjects()[0]);

    var img = imgContainer[1];

    var addedImgScaleX = img.scaleX;
    var addedImgScaleY = img.scaleY;

    img.set({
        scaleX: addedImgScaleX - 0.1,
        scaleY: addedImgScaleY - 0.1,
    });

    var group = new fabric.Group([imgContainer[0], img]);

    group.set({
        top: top,
        left: left
    });

    previewCanvas.add(group);  

    previewCanvas.getObjects()[0] = group;
}

function rotateLeft(type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
            break;
        }
    }
    
    var top = previewCanvas.getObjects()[0].top;
    var left = previewCanvas.getObjects()[0].left;

    previewCanvas.remove(previewCanvas.getObjects()[0]);

    var img = imgContainer[1];

    var angle = img.angle;

    img.set({
        angle: angle - 15
    });

    var group = new fabric.Group([imgContainer[0], img]);

    group.set({
        top: top,
        left: left
    });

    previewCanvas.add(group);  

    previewCanvas.getObjects()[0] = group;
}

function rotateRight(type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
            break;
        }
    }
    
    var top = previewCanvas.getObjects()[0].top;
    var left = previewCanvas.getObjects()[0].left;

    previewCanvas.remove(previewCanvas.getObjects()[0]);

    var img = imgContainer[1];

    var angle = img.angle;

    img.set({
        angle: angle + 15
    });

    var group = new fabric.Group([imgContainer[0], img]);

    group.set({
        top: top,
        left: left
    });

    previewCanvas.add(group);  

    previewCanvas.getObjects()[0] = group;
}

function increaseWidth(type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
            break;
        }
    }

    var top = previewCanvas.getObjects()[0].top;
    var left = previewCanvas.getObjects()[0].left;

    previewCanvas.remove(previewCanvas.getObjects()[0]);

    var img = imgContainer[1];

    var scaleX = img.scaleX;

    img.set({
        scaleX: scaleX + 0.1
    });

    var group = new fabric.Group([imgContainer[0], img]);

    group.set({
        top: top,
        left: left
    });

    previewCanvas.add(group);  

    previewCanvas.getObjects()[0] = group;
}

function increaseHeight(type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
            break;
        }
    }

    var top = previewCanvas.getObjects()[0].top;
    var left = previewCanvas.getObjects()[0].left;

    previewCanvas.remove(previewCanvas.getObjects()[0]);

    var img = imgContainer[1];

    var scaleY = img.scaleY;

    img.set({
        scaleY: scaleY + 0.1
    });

    var group = new fabric.Group([imgContainer[0], img]);

    group.set({
        top: top,
        left: left
    });

    previewCanvas.add(group);  

    previewCanvas.getObjects()[0] = group;
}

function decreaseWidth(type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
            break;
        }
    }

    var top = previewCanvas.getObjects()[0].top;
    var left = previewCanvas.getObjects()[0].left;

    previewCanvas.remove(previewCanvas.getObjects()[0]);

    var img = imgContainer[1];

    var scaleX = img.scaleX;

    img.set({
        scaleX: scaleX - 0.1
    });

    var group = new fabric.Group([imgContainer[0], img]);

    group.set({
        top: top,
        left: left
    });

    previewCanvas.add(group);  

    previewCanvas.getObjects()[0] = group;
}

function decreaseHeight(type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
            break;
        }
    }

    var top = previewCanvas.getObjects()[0].top;
    var left = previewCanvas.getObjects()[0].left;

    previewCanvas.remove(previewCanvas.getObjects()[0]);

    var img = imgContainer[1];

    var scaleY = img.scaleY;

    img.set({
        scaleY: scaleY - 0.1
    });

    var group = new fabric.Group([imgContainer[0], img]);

    group.set({
        top: top,
        left: left
    });

    previewCanvas.add(group);  

    previewCanvas.getObjects()[0] = group;
}

function clearEdit(type) {

    var previewCanvas;

    for (var i = 0; i < previewCanvasList.length; i ++) {
        if (previewCanvasList[i].lowerCanvasEl.id.endsWith(type)) {
            previewCanvas = previewCanvasList[i];
            break;
        }
    }

    var top = previewCanvas.getObjects()[0].top;
    var left = previewCanvas.getObjects()[0].left;

    previewCanvas.remove(previewCanvas.getObjects()[0]);

    var img = imgContainer[1];

    img.set({
        originX: 'center',
        originY: 'center',
        top: 0,
        left: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        angle: 0
    });

    var group = new fabric.Group([imgContainer[0], img]);

    group.set({
        top: top,
        left: left
    });

    previewCanvas.add(group);  

    previewCanvas.getObjects()[0] = group;
}

// Function used for adding entity - add after specific ID
function addEntity(type) {

    var tableEntity;
    // Selecting the entity named after the type parameter
    for (var i = 0 ; i < tableEntities.length; i ++) {
        if (tableEntities[i].name == type.id) {
            //tableEntity = jQuery.extend(true, {}, tableEntities[i]);      // CAREFUL - MIGHT BREAK
            tableEntity = tableEntities[i];
            break;
        }
    }

    var canvasEntity;
    var selectedImage = document.getElementById(type.id).value;
    var fakePath = selectedImage.split('\\');
    var path = fakePath[fakePath.length - 1];

    //console.log(path);
    /*var imgId = 'imgFor' + type.id;
    $('body').append("<img id=\'" + imgId + "\' src=\'http://192.168.1.239:8887/" + path + "\' style='display: none;'/>");
    
    var hiddenImg = document.getElementById(imgId);
    var imgInstance;
    hiddenImg.addEventListener('load', function() {
        width = this.naturalWidth;
        height = this.naturalHeight;
        imgInstance = new fabric.Image(this, {
            top: 250,
            left: 390,
            width: this.naturalWidth,
            height: this.naturalHeight
        })
        canvasEntity = new CanvasEntity(imgInstance, type, id, 0, tableEntity);
        entityPool.push(canvasEntity);
        document.getElementById(type.id + 'Lock').setAttribute('onclick', 'lockImage(' + id + ')');
        document.getElementById(type.id + 'Remove').setAttribute('onclick', 'removeEntity(' + id + ')');
        id = id + 1;
        canvas.add(imgInstance);
    })*/
    //console.log(imgInstance);

    var addInput = document.getElementById(type.id + 'Add').value;

    // Running the insert statement
    db.run(addInput);

    
    // Building insert regex - OBSOLETE - using SQL Library
    var insertRegex = "INSERT INTO " + tableEntity.name + "\\s?\\(\\s?";
    var columns = [];
    var columnIterator = tableEntity.properties.keys();
    var column = columnIterator.next().value;
    while (column != undefined) {
        columns.push(column);
        column = columnIterator.next().value;
    }
    columns.reverse();
    for (var i = 0; i < columns.length; i ++) {
        insertRegex += columns[i];
        if (i < columns.length - 1) {
            insertRegex += "\\s?,\\s?";
        }
    }
    insertRegex += "\\s?\\) VALUES\\s?\\(\\s?";
    for (var i = 0; i < columns.length; i ++) {
        insertRegex += "(.*)";                                     //  TO IMPLEMENT ACCEPTED TYPE ACCORDING TO PROPERTIES MAP
        if (i < columns.length - 1) {
            insertRegex += "\\s?,\\s?";
        }
    }
    insertRegex += "\\s?\\);";
    var insertMatch = new RegExp(insertRegex);
    //console.log(insertMatch.test(addInput));
    var matchingInserts = insertMatch.exec(addInput);
    var record = [];
    for (var i = 1; i < matchingInserts.length; i ++) {
        record.push(matchingInserts[i].trim());                     // TO IMPLEMENT - could delete user input
    }

    record.reverse();
    
    tableEntity.records.push(record);

    var tableId = '#' + type.id + 'Table';

    // Inserting a record into table

    $(tableId).find('tbody').append("<tr><th scope='row'>" + tableEntity.records.length + "</th></tr>")
    for (var i = 0; i < record.length; i ++) {
        $('#tablesModalContent th:last').after("<td>&nbsp;&nbsp;" + record[i] + "</td>")
    }

    document.getElementById(type.id + 'Add').value = document.getElementById(type.id + 'Add').defaultValue;

    record.reverse();

    
    //console.log(tableEntities);

    // Adding edit button with options for each value a property can take
    for (var i = 0; i < columns.length; i ++) {

        record[i] = record[i].replace("'","").replace("'","");

        if (tableEntity.records.length == 1) {
            $("#" + columns[i] + "List").append("<li class='list-group-item' id='" + columns[i] + "-" + record[i] + "Prop'>" + record[i] + "<div class='dropdown' style='float:right'>\
            <button class='btn btn-secondary dropdown-toggle' type='button' id='" + columns[i] + "Dropdown' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>\
            Edit Value: </button><div class='dropdown-menu' aria-labelledby='" + columns[i] + "Dropdown'><button class='dropdown-item' onclick='editImage(\"" + columns[i] + "\", \"" + record[i] + "\", \"" + type.id + "\")'>Add image</button>\
            <button class='dropdown-item' onclick='filters(\"" + columns[i] + "\", \"" + record[i] + "\", \"" + type.id + "\")'>Apply filter</button>\
            <button class='dropdown-item' onclick='draw(\"" + columns[i] + "\", \"" + record[i] + "\", \"" + type.id + "\")'>Add drawings</button></div></div></li>");
        }

        for (var j = 0; j < tableEntity.records.length - 1; j ++) {
            if (!tableEntity.records[j].includes(record[i])) {
                $("#" + columns[i] + "List").append("<li class='list-group-item' id='" + columns[i] + "-" + record[i] + "Prop'>" + record[i] + "<div class='dropdown' style='float:right'>\
                <button class='btn btn-secondary dropdown-toggle' type='button' id='" + columns[i] + "Dropdown' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>\
                Edit Value: </button><div class='dropdown-menu' aria-labelledby='" + columns[i] + "Dropdown'><button class='dropdown-item' onclick='editImage(\"" + columns[i] + "\", \"" + record[i] + "\", \"" + type.id + "\")'>Add image</button>\
                <button class='dropdown-item' onclick='filters(\"" + columns[i] + "\", \"" + record[i] + "\", \"" + type.id + "\")'>Apply filter</button>\
                <button class='dropdown-item' onclick='draw(\"" + columns[i] + "\", \"" + record[i] + "\", \"" + type.id + "\")'>Add drawings</button></div></div></li>");
            }
        }
    }

    var url = 'http://192.168.1.239:8887/' + path;
    
    fabric.Image.fromURL(url, function (oImg) {
        canvasEntity = new CanvasEntity(oImg, type, id, 0, tableEntity);
        entityPool.push(canvasEntity);
        //document.getElementById(type.id + 'Lock').setAttribute('onclick', 'lockImage(' + id + ')');
        //document.getElementById(type.id + 'Remove').setAttribute('onclick', 'removeEntity(' + id + ')');
        id = id + 1;
        
        canvas.add(oImg);
        for (var i = 0; i < addedFilters.length; i ++) {
            if (addedFilters[i].type == type.id && columns.includes(addedFilters[i].name)) {
                
                var index = columns.indexOf(addedFilters[i].name);
                if (addedFilters[i].value == record[index]) {
                    for (var j = 0; j < addedFilters[i].filterNames.length; j ++) {
                        switch (addedFilters[i].filterNames[j]) {
                            case 'Grayscale':
                                oImg.filters.push(new fabric.Image.filters.Grayscale());
                                break;
                            case 'Sepia':
                                oImg.filters.push(new fabric.Image.filters.Sepia());
                                break;
                            case 'Brownie':
                                oImg.filters.push(new fabric.Image.filters.Brownie());
                                break;
                            case 'Vintage':
                                oImg.filters.push(new fabric.Image.filters.Vintage());
                                break;
                            case 'Kodachrome':
                                oImg.filters.push(new fabric.Image.filters.Kodachrome());
                                break;
                            case 'Technicolor':
                                oImg.filters.push(new fabric.Image.filters.Technicolor());
                                break;
                            case 'Polaroid':
                                oImg.filters.push(new fabric.Image.filters.Polaroid());
                                break; 
                        }
                    }
                    oImg.applyFilters();
                    canvas.renderAll();
                }
            }
        }
        /*oImg.filters.push(new fabric.Image.filters.Sepia());
        oImg.applyFilters();*/
        for (var i = 0; i < changes.length; i ++) {
            if (changes[i].propertyType == type.id && columns.includes(changes[i].propertyName)) {
                var index = columns.indexOf(changes[i].propertyName);
                if (changes[i].propertyValue == record[index]) {
                    applyChange(changes[i]);
                    canvas.renderAll();
                }
            }
        }

        for (var i = 0; i < addedDrawingsList.length; i ++) {
            if (addedDrawingsList[i].type == type.id && columns.includes(addedDrawingsList[i].column)) {
                var index = columns.indexOf(addedDrawingsList[i].column);
                if (addedDrawingsList[i].value == record[index]) {
                    if (canvasEntity.image instanceof fabric.Image) {
                        var img = fabric.util.object.clone(canvasEntity.image)
                        canvas.remove(canvasEntity.image);
                        var group = new fabric.Group([img])
                        for (var k = 0; k < addedDrawingsList[i].drawings.length; k ++) {

                            addedDrawingsList[i].drawings[k].set({top: addedDrawingsList[i].coordinates[2*k], left: addedDrawingsList[i].coordinates[2*k + 1]})
                            group.add(addedDrawingsList[i].drawings[k]);
                        }
                        canvas.add(group);
                        canvas.renderAll();
                        canvasEntity.image = group;
                    } else {
                        for (var k = 0; k < addedDrawingsList[i].drawings.length; k ++) {

                            addedDrawingsList[i].drawings[k].set({top: addedDrawingsList[i].coordinates[2*k], left: addedDrawingsList[i].coordinates[2*k + 1]})
                            canvasEntity.image.add(addedDrawingsList[i].drawings[k]);
                        }
                        canvas.renderAll();
                    }
                }
            }
        }
        //console.log(entityPool);
    },  {crossOrigin: "Anonymous"});

    

    


}

// TO IMPLEMENT - DELETE CURRENT PROPERTIES ON REMOVE

// Function used for removing entity
function removeEntity(selectedId) {
    for (var i = 0; i < canvas.getObjects().length; i++) {
        if (entityPool[i].id == selectedId) {
            canvas.remove(entityPool[i].image);
            entityPool.splice(i, 1);
            break;
        }
    }
}

// 1 - TO IMPLEMENT - SELECTED-BASED LOCK (instead of current id)

// Function used for setting image position
function lockImage(selectedId) {
    //console.log(selectedId);
    var selectedEntity;
    for (var i = 0; i < entityPool.length; i++) {
        if (entityPool[i].id == selectedId) {
            selectedEntity = entityPool[i];
            break;
        }
    }
    //console.log(selectedEntity);
    var selectedItem;
    //console.log(canvas.getObjects());
    for (var i = 0; i < canvas.getObjects().length; i++) {
        //console.log("Object:   " + canvas.getObjects()[i]);
        //console.log(canvas.getObjects()[i]._objects);
        if (canvas.getObjects()[i] == selectedEntity.image || canvas.getObjects()[i]._objects != undefined) {
            //console.log(canvas.getObjects()[i]._objects);
            selectedItem = canvas.getObjects()[i];
            break;
        }
    }
    //console.log(selectedItem);
    selectedItem.selectable = false;
    selectedItem.lockRotation = selectedItem.lockScalingX = selectedItem.lockScalingY = selectedItem.lockMovementX = selectedItem.lockMovementY = true;
    selectedItem.selection = false;

    canvas.renderAll();
}

// Function used for adding entities to jumbotron
function addEntityType() {

    // Regex matching for entity input - TO IMPLEMENT - input verification, more data types, more ? characters
    var addEntityMatch = /CREATE TABLE (\w*)\s?\((\s?(\w*) (.*?)\s?,?)*\);/;

    // Variable used to store the initial entity input
    var inputText = $('#entityInput').val();

    // Running the SQL for the create statement on the virtual database
    db.run(inputText);

    // Array that stores the last matched groups from the input
    var matchingGroups = addEntityMatch.exec(inputText);

    // Table name
    var type = $('#entityInput').val().replace(addEntityMatch, '$1');

    // TableEntity instance
    var entity = new TableEntity(type, new Map(), new Array());

    tableEntities.push(entity);

    // While we can still match column names and types, the matchingGroups array and inputText variable are updated and the regex is verified
    // With each iteration, we also update the TableEntities's properites Map
    while (matchingGroups[3] != undefined) {
        entity.properties.set(matchingGroups[3], matchingGroups[4]);
        inputText = inputText.replace(matchingGroups[2], "");
        matchingGroups = addEntityMatch.exec(inputText);
    }

    // Column names (properties's keys) iterator
    var entityColumnNamesIterator = entity.properties.keys();
    var columnName = entityColumnNamesIterator.next().value;
    // Array storing column names in order
    var entityColumnNames = [];

    // Building entityColumnNames array
    while (columnName != undefined) {
        entityColumnNames.push(columnName);
        columnName = entityColumnNamesIterator.next().value;
    }

    entityColumnNames.reverse();

    // Building entityColumnTypes in a similar way, this way extracting the values from the map
    var entityColumnTypeIterator = entity.properties.values();
    var columnType = entityColumnTypeIterator.next().value;
    var entityColumnTypes = [];
    while (columnType != undefined) {
        entityColumnTypes.push(columnType);
        columnType = entityColumnTypeIterator.next().value;
    }
    entityColumnTypes.reverse();

    // If succesful, add entity type to entityTypes array
    entityTypes.push(entity);

    //Creating table for entity
    $('#tablesModalContent').append("<p class='h3' style='text-align:center'><span class='badge badge-secondary'>" + type + "</span></p>");
    $('#tablesModalContent').append("<table class='table table-striped table-dark' id='" + type + "Table'><thead><tr><th scope='col'>#</th></tr></thead><tbody></tbody></table>");
    for (var i = 0; i < entityColumnNames.length; i++) {
        $('#tablesModalContent th:last').after("<th scope='col'><button type='button' class='btn btn-light' data-toggle='tooltip' title='" + entityColumnTypes[i] + "' disabled>" + entityColumnNames[i] + "</button></th>")
    }

    // Adding a section for each entity
    if (entityTypes.length == 1) {
        $('#entityCarousel').find('.carousel-indicators').append("<li data-target='#entityCarousel' data-slide-to=\"0\" class='active'></li>");
        $('#entityCarousel').find('.carousel-inner').append("<div class='carousel-item active'><p><span class='badge badge-info' style='font-size:30px'>" + type + "</span><span style='float:right;margin-right:5px;display:inline-block;'>\
        <button id='assignButton" + type +  "\' class='btn btn-success' data-toggle='tooltip' data-placement='top' title='Select a default picture for the current entity.'>Assign Image</button>\
        <button id='insertButton" + type +  "\' class='btn btn-success' style='margin-left:5px;' data-toggle='tooltip' data-placement='top' title='Run INSERT statements to add elements to the database.'>Insert Data</button>\
        <button type='button' class='btn btn-success' data-toggle='modal' data-target='#properties" + type + "\' id='showProperties' style='margin-left:5px;'><a data-toggle='tooltip' data-placement='top' title='View and edit look of every property.'>Current Properties</a></button></span></p>\
        <div class='input-group mb-3' id='imageInput" + type + "\'><div class='input-group-prepend'><span class='input-group-text'>Default Image</span></div><div class='custom-file'><input type='file' class='custom-file-input' id='" + type + "\'><label class='custom-file-label' for='" + type + "\' id='label" + type + "\'>Choose file</label></div></div>\
        <div class='input-group' id='insertSection" + type + "\'><textarea class='form-control' placeholder='INSERT Statement' id='" + type + "Add' rows='2'></textarea><div class='input-group-append'><button class='btn btn-outline-secondary' type='button' onclick='addEntity(" + type + ")'>INSERT</button></div>\
        <button type='button' class='btn btn-success' onclick='lockImage(" + id + ")' id='" + type + "Lock' style='margin-left: 5px; margin-right:5px' data-toggle='tooltip' data-placement='top' title='Set a permanent position for the current entity.'>Lock</button>\
        <button type='button' class='btn btn-success' onclick='removeEntity(" + id + ")' id='" + type + "Remove' data-toggle='tooltip' data-placement='top' title='Removes the current entity from the canvas and the database.'>Remove</button></div></div>");

        $('body').append("<div class='modal' id='properties" + type + "\' tabindex='-1' role='dialog' aria-labelledby='propertiesLabel' aria-hidden='true'>\
        <div class='modal-dialog modal-lg' role='document'>\
        <div class='modal-content'>\
        <div class='modal-header'>\
        <p class='h3' class='modal-title' id='propertiesLabel'>Properties for table <span class='badge badge-info'>" + type + "</span> :</p>\
        <button type='button' class='close' data-dismiss='modal' aria-label='Close'>\
        <span aria-hidden='true'>&times;</span></button></div>\
        <div class='modal-body' id='propertiesModalContent" + type + "\'></div></div></div></div><br><br>");

        $("#propertiesModalContent" + type).append("<p class='h4' style='text-align:center'>Preview:</p><canvas id='previewCanvas" + type + "\' height='200' width='300' style='margin-left:80%'></canvas>")

        for (var i = 0; i < entityColumnNames.length; i ++) {
            $('#propertiesModalContent' + type).append("<ul class='list-group' id='" + entityColumnNames[i] + "List'><li class='list-group-item list-group-item-dark'><center>" + entityColumnNames[i] + " Values:</center></li></ul><br>");
        }
        

    } else {
        $('#entityCarousel').find('.carousel-indicators').append("<li data-target='#entityCarousel' data-slide-to=\"" + (entityTypes.length - 1) + "\"></li>");
        $('#entityCarousel').find('.carousel-inner').append("<div class='carousel-item'><p><span class='badge badge-info' style='font-size:30px'>" + type + "</span><span style='float:right;margin-right:5px;display:inline-block;'>\
        <button id='assignButton" + type +  "\' class='btn btn-success' data-toggle='tooltip' data-placement='top' title='Select a default picture for the current entity.'>Assign Image</button>\
        <button id='insertButton" + type +  "\' class='btn btn-success' style='margin-left:5px;' data-toggle='tooltip' data-placement='top' title='Run INSERT statements to add elements to the database.'>Insert Data</button>\
        <button type='button' class='btn btn-success' data-toggle='modal' data-target='#properties" + type + "\' id='showProperties' style='margin-left:5px;'><a data-toggle='tooltip' data-placement='top' title='View and edit look of every property.'>Current Properties</a></button></span></p>\
        <div class='input-group mb-3' id='imageInput" + type + "\'><div class='input-group-prepend'><span class='input-group-text'>Default Image</span></div><div class='custom-file'><input type='file' class='custom-file-input' id='" + type + "\'><label class='custom-file-label' for='" + type + "\' id='label" + type + "\'>Choose file</label></div></div>\
        <div class='input-group' id='insertSection" + type + "\'><textarea class='form-control' placeholder='INSERT Statement' id='" + type + "Add' rows='2'></textarea><div class='input-group-append'><button class='btn btn-outline-secondary' type='button' onclick='addEntity(" + type + ")'>INSERT</button></div>\
        <button type='button' class='btn btn-success' onclick='lockImage(" + id + ")' id='" + type + "Lock' style='margin-left: 5px; margin-right:5px' data-toggle='tooltip' data-placement='top' title='Set a permanent position for the current entity.'>Lock</button>\
        <button type='button' class='btn btn-success' onclick='removeEntity(" + id + ")' id='" + type + "Remove' data-toggle='tooltip' data-placement='top' title='Removes the current entity from the canvas and the database.'>Remove</button></div></div>");

        $('body').append("<div class='modal' id='properties" + type + "\' tabindex='-1' role='dialog' aria-labelledby='propertiesLabel' aria-hidden='true'>\
        <div class='modal-dialog modal-lg' role='document'>\
        <div class='modal-content'>\
        <div class='modal-header'>\
        <p class='h3' class='modal-title' id='propertiesLabel'>Properties for table <span class='badge badge-info'>" + type + "</span> :</p>\
        <button type='button' class='close' data-dismiss='modal' aria-label='Close'>\
        <span aria-hidden='true'>&times;</span></button></div>\
        <div class='modal-body' id='propertiesModalContent" + type + "\'></div></div></div></div><br><br>");

        $("#propertiesModalContent" + type).append("<p class='h4' style='text-align:center'>Preview:</p><canvas id='previewCanvas" + type + "\' height='200' width='300' style='margin-left:80%'></canvas>")

        for (var i = 0; i < entityColumnNames.length; i ++) {
            $('#propertiesModalContent' + type).append("<ul class='list-group' id='" + entityColumnNames[i] + "List'><li class='list-group-item list-group-item-dark'><center>" + entityColumnNames[i] + " Values:</center></li></ul><br>");
        }
        
    }

    $('[data-toggle="tooltip"]').tooltip();

    var assignId = "#assignButton" + type;
    var imgId = "#imageInput" + type;

    $(document).ready(function() {
        $(assignId).click(function() {
            $(imgId).fadeToggle();
        });
    });

    var insertId = "#insertButton" + type;
    var insertSectionId = "#insertSection" + type;

    $(document).ready(function() {
        $(insertId).click(function() {
            $(insertSectionId).fadeToggle();
        });
    });

    $("#" + type).change(function() {
        $("#label" + type).text($("#" + type).val().toString().substr(12));
        var previewCanvas = new fabric.Canvas('previewCanvas' + type);
        previewCanvasList.push(previewCanvas);

        var url = 'http://192.168.1.239:8887/' + $("#" + type).val().substr(12);
    
        fabric.Image.fromURL(url, function (oImg) {
            previewCanvas.add(oImg);
        }, {crossOrigin: "Anonymous"});

    })

    $('#entityInput').val("");
}

// Method used for executing select statements in the virtual database
function selectStatement() {
    var inputText = $('#selectInput').val();
    $('#selectInput').val("");
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

    for (var j = 0; j < selectedItems.length; j ++)
    {
        console.log(selectedItems[j]);
        selectedItems[j].image.opacity = 0.5;
        var imageHolder = selectedItems[j].image;
        canvas.remove(selectedItems[j].image);
        canvas.add(imageHolder);
    }
    setTimeout(function() {
        for (var j = 0; j < selectedItems.length; j ++)
        {
            selectedItems[j].image.opacity = 1;
            var imageHolder = selectedItems[j].image;
            canvas.remove(selectedItems[j].image);
            canvas.add(imageHolder);
            setTimeout(function() {
                for (var j = 0; j < selectedItems.length; j ++)
                {
                    selectedItems[j].image.opacity = 0.5;
                    var imageHolder = selectedItems[j].image;
                    canvas.remove(selectedItems[j].image);
                    canvas.add(imageHolder);
                    setTimeout(function() {
                    for (var j = 0; j < selectedItems.length; j ++)
                    {
                        selectedItems[j].image.opacity = 1;
                        var imageHolder = selectedItems[j].image;
                        canvas.remove(selectedItems[j].image);
                        canvas.add(imageHolder);
                    }
                }, 500)
                }
            }, 500)
        }
    }, 500);

    console.log(selectedItems);
    
    $('#selectResult').empty();

    $('#selectResult').append("<table class='table table-striped table-dark' id='selectTable'><thead><tr><th scope='col'>#</th></tr></thead><tbody></tbody></table>");

    if (queryResult[0] != undefined) {
        for (var i = 0; i < queryResult[0].columns.length; i ++) {
        $('#selectResult th:last').after("<th scope='col'>" + queryResult[0].columns[i] + "</th>");

    }

        for (var i = 0; i < queryResult[0].values.length; i ++) {
            $('#selectTable').find('tbody').append("<tr><th scope='row'>" + (i + 1) + "</th></tr>");
            for (var j = queryResult[0].columns.length - 1; j >= 0; j --) {
                $('#selectTable th:last').after("<td>" + queryResult[0].values[i][j] + "</td>");
            }
        }
    }

    
    
}


//Method used for serializing the data and send it - TO IMPLEMENT - SEND TO SERVER INSTEAD OF SAVING LOCALLY
function finish() {

    // FOR CANVAS SERIALIZATION
    /*var serializedCanvas = JSON.stringify(canvas);
    console.log(JSON.stringify(canvas));
    canvas.clear();
    canvas.loadFromJSON(serializedCanvas, canvas.renderAll.bind(canvas));*/

    // FOR DB SERIALIZATION
    /*console.log(db.exec("SELECT * FROM orcs;")[0].values[0]);
    var serializedDb = db.export();
    var deserializedDb = new sql.Database(serializedDb);
    console.log(deserializedDb.exec("SELECT * FROM orcs;")[0].values[0]);*/

    var serializedCanvas = JSON.stringify(canvas);
    var serializedDb = db.export();
    //var dbJson = JSON.stringify(serializedDb);
    var serializedDataArray = JSON.stringify(entityPool);

    title = $("#title").val();
    //var canvasPackage = new Blob([serializedCanvas], {type: 'text/plain'});
    // dbPackage = new Blob([serializedDb], {type: 'application/octet-stream'});
    // dataPackage = new Blob([serializedDataArray], {type: 'text/plain'});

    
    function download(content, fileName, contentType) {
        var a = document.createElement("a");
        var file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
    // TO IMPLEMENT - save to title directory with AJAX POST
    download(serializedCanvas, 'canvasJson.txt', 'text/plain');
    download(serializedDb, 'serializedDb.db', 'application/octet-stream');
    download(serializedDataArray, 'dataJson.txt', 'text/plain');

    setTimeout(function(){ 
        window.location.href = "http://localhost:8181/GameCreator/GameCreator.php?title=" + title;
    }, 7000);

    
    
}


/// jQuery and JS manipulation of HTML elements
$(document).ready(function() {
    $("#titleButton").click(function() {
        $("#title").fadeToggle();
    });
});

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

$(document).ready(function() {
    $("#textButton").click(function() {
        $("#text").fadeToggle();
    });
});

$(document).ready(function() {
    $("#objectivesButton").click(function() {
        $("#objectives").fadeToggle();
    });
});

$(document).ready(function() {
    $("#addObj").click(function() {
        $("#addObjective").fadeToggle();
        console.log($("#addObj")[0].lastChild);
        if ($("#addObj")[0].lastChild.nodeValue == "+") {
            $("#addObj")[0].lastChild.nodeValue = "-";
        } else {
            $("#addObj")[0].lastChild.nodeValue = "+";
        }
    });
});

var objectives = [];
var selects = [];

$(document).ready(function() {
    $("#addObjectiveButton").click(function() {
        var objText = $("#objectiveText").val();
        var objSelect = $("#objectiveSelect").val();
        objectives.push(objText);
        selects.push(objSelect);
        console.log(objectives, selects);
        $("#objectivesList").append("<li id=\'li" + objectives.length + "\' class='list-group-item list-group-item-info'>" + objText + "<span style='float:right;'><button class='btn btn-info btn-sm' style='padding-top: 0px;padding-bottom: 0px;padding-right: 0px;padding-left: 0px;width: 23px;' onclick=removeLi(\"" + objectives.length + "\")>X</button></span></li><li class='list-group-item list-group-item-light'>" + objSelect + "</li>")
        $("#objectiveText").val('');
        $("#objectiveSelect").val('');
    });
});

function removeLi(number) {
    var li = "li" + number;
    var id = "#" + li;
    $(id).next().remove();
    $(id).remove();
    objectives.splice(number - 1, 1);
    selects.splice(number - 1, 1);
    console.log(objectives, selects);
}

$(document).ready(function() {
    $("#viewButton").click(function() {
        $("#viewData").fadeToggle();
    });
});

$(document).ready(function() {
    $("#selRes").click(function() {
        $("#selectResult").fadeToggle();
        if ($("#selRes")[0].lastChild.nodeValue == "+") {
            $("#selRes")[0].lastChild.nodeValue = "-";
        } else {
            $("#selRes")[0].lastChild.nodeValue = "+";
        }
    });
});

$(document).ready(function() {
    $("#createButton").click(function() {
        $("#createTables").fadeToggle();
    });
});

$(document).ready(function() {
    $("#backgroundSelect").change(function() {
        $("#backgroundLabel").text($("#backgroundSelect").val().substr(12));
    })
})


