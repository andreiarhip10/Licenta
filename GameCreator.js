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

// Table entity class - properties = a Map of all the columns the table has
class TableEntity {
    constructor(name, properties, records) {
        this.name = name;
        this.properties = properties;
        this.records = records;
    }
}


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
    });
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
function editImage(column, value) {
    if (document.getElementById(column + "-" + value + "Option") != null) {
        document.getElementById(column + "-" + value + "Option").remove();
    }
    if (document.getElementById(column + "-" + value + "Option") == null) {
        $("#" + column + "-" + value + "Prop").append("<input type='file' style='margin-left:20px' id='" + column + "-" + value + "Option'>");
    }
    if (document.getElementById(column + "-" + value + "AddImageButton") == null) {
        $("#" + column + "-" + value + "Prop").append("<button type='button' class='btn btn-secondary' style='float:right;margin-right:10px' id='" + column + "-" + value + "AddImageButton' \
        onclick='applyImage(\"" + column + "\", \"" + value + "\")'>Add Image</button>");
    }

    entityPool[id - 1].addedImages ++;
    
    //group._objects[1].set({top: 50});
}

// Method used for placing image to current entity in initial position
function applyImage(column, value) {

    console.log("CURRENT IMAGE: " + entityPool[id - 1].image);

    imgContainer = [];


    var img = fabric.util.object.clone(entityPool[id - 1].image);
    var group = new fabric.Group([img]);

    imgContainer.push(img);

    var newImage = document.getElementById(column + "-" + value + "Option").value;
    var fakePath = newImage.split('\\');
    var path = fakePath[fakePath.length - 1];
    fabric.Image.fromURL(path, function(img) {
        var addedImage = img.scale(0.1).set({ originX: 'center', originY: 'center' });

        imgContainer.push(addedImage);

        group.add(addedImage);
        canvas.remove(canvas.item(id));

        console.log(addedImage);

        //console.log(addedImage.angle);

        canvas.add(group);
    })



    if (document.getElementById(column + "-" + value + "MoveUp") == null) {
        $("#" + column + "-" + value + "Prop").append("<button type='button' class='btn btn-secondary btn-sm' style='float:right;margin-right:6px' id='" + column + "-" + value + "MoveUp' \
        onclick='moveUp\()'>&uarr;</button><button type='button' class='btn btn-secondary btn-sm' style='float:right;margin-right:2px' id='" + column + "-" + value + "MoveDown' \
        onclick='moveDown\()'>&darr;</button><button type='button' class='btn btn-secondary btn-sm' style='float:right;margin-right:2px' id='" + column + "-" + value + "MoveRight' \
        onclick='moveRight\()'>&rarr;</button><button type='button' class='btn btn-secondary btn-sm' style='float:right;margin-right:2px' id='" + column + "-" + value + "MoveLeft' \
        onclick='moveLeft\()'>&larr;</button><button type='button' class='btn btn-secondary btn-sm' style='float:left;margin-right:2px;margin-top:2px;margin-left:35%' id='" + column + "-" + value + "Increase' \
        onclick='increaseSize\()'>&#43;</button><button type='button' class='btn btn-secondary btn-sm' style='float:left;margin-right:2px;margin-top:2px' id='" + column + "-" + value + "Decrease' \
        onclick='decreaseSize\()'>&#45;</button><button type='button' class='btn btn-secondary btn-sm' style='float:left;margin-right:2px;margin-top:2px' id='" + column + "-" + value + "RotateLeft' \
        onclick='rotateLeft\()'>&#8630;</button><button type='button' class='btn btn-secondary btn-sm' style='float:left;margin-right:2px;margin-top:2px' id='" + column + "-" + value + "RotateRight' \
        onclick='rotateRight\()'>&#8631;</button><button type='button' class='btn btn-secondary btn-sm' style='float:left;margin-right:2px;margin-top:2px' id='" + column + "-" + value + "IncreaseWidth' \
        onclick='increaseWidth\()'>&#8596;</button><button type='button' class='btn btn-secondary btn-sm' style='float:left;margin-right:2px;margin-top:2px' id='" + column + "-" + value + "IncreaseHeight' \
        onclick='increaseHeight\()'>&#8597;</button></button><button type='button' class='btn btn-secondary btn-sm' style='float:left;margin-right:2px;margin-top:2px' id='" + column + "-" + value + "DecreaseWidth' \
        onclick='decreaseWidth\()'>&#10574;</button></button></button><button type='button' class='btn btn-secondary btn-sm' style='float:left;margin-right:2px;margin-top:2px' id='" + column + "-" + value + "DecreaseHeight' \
        onclick='decreaseHeight\()'>&#10577;</button></button></button><button type='button' class='btn btn-secondary btn-sm' style='float:right;margin-right:2px;margin-top:2px' id='" + column + "-" + value + "ClearEdit' \
        onclick='clearEdit\()'>&#169;</button>");
    }

    

    entityPool[id - 1].image = group;
    
}


// TO IMPLEMENT - VALIDATIONS
// Methods used for repositioning and resizing the added image
function moveUp() {

    var top = entityPool[id - 1].image.top;
    var left = entityPool[id - 1].image.left;

    canvas.remove(entityPool[id - 1].image);

    var img = imgContainer[1];

    var addedImgTop = img.top;

    img.set({
        top: addedImgTop - 10
    });

    var group = new fabric.Group([imgContainer[0], img]);

    group.set({
        top: top,
        left: left
    });

    canvas.add(group);  

    entityPool[id - 1].image = group;
}

function moveDown() {

    var top = entityPool[id - 1].image.top;
    var left = entityPool[id - 1].image.left;

    canvas.remove(entityPool[id - 1].image);

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

    canvas.add(group);  

    entityPool[id - 1].image = group;
}

function moveLeft() {

    var top = entityPool[id - 1].image.top;
    var left = entityPool[id - 1].image.left;

    canvas.remove(entityPool[id - 1].image);

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

    canvas.add(group);  

    entityPool[id - 1].image = group;
}

function moveRight() {

    var top = entityPool[id - 1].image.top;
    var left = entityPool[id - 1].image.left;

    canvas.remove(entityPool[id - 1].image);

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

    canvas.add(group);  

    entityPool[id - 1].image = group;
}


function increaseSize() {

    var top = entityPool[id - 1].image.top;
    var left = entityPool[id - 1].image.left;

    canvas.remove(entityPool[id - 1].image);

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

    canvas.add(group);  

    entityPool[id - 1].image = group;
}

function decreaseSize() {

    var top = entityPool[id - 1].image.top;
    var left = entityPool[id - 1].image.left;

    canvas.remove(entityPool[id - 1].image);

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

    canvas.add(group);  

    entityPool[id - 1].image = group;
}

function rotateLeft() {
    
    var top = entityPool[id - 1].image.top;
    var left = entityPool[id - 1].image.left;

    canvas.remove(entityPool[id - 1].image);

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

    canvas.add(group);  

    entityPool[id - 1].image = group;
}

function rotateRight() {
    
    var top = entityPool[id - 1].image.top;
    var left = entityPool[id - 1].image.left;

    canvas.remove(entityPool[id - 1].image);

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

    canvas.add(group);  

    entityPool[id - 1].image = group;
}

function increaseWidth() {

    var top = entityPool[id - 1].image.top;
    var left = entityPool[id - 1].image.left;

    canvas.remove(entityPool[id - 1].image);

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

    canvas.add(group);  

    entityPool[id - 1].image = group;
}

function increaseHeight() {

    var top = entityPool[id - 1].image.top;
    var left = entityPool[id - 1].image.left;

    canvas.remove(entityPool[id - 1].image);

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

    canvas.add(group);  

    entityPool[id - 1].image = group;
}

function decreaseWidth() {

    var top = entityPool[id - 1].image.top;
    var left = entityPool[id - 1].image.left;

    canvas.remove(entityPool[id - 1].image);

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

    canvas.add(group);  

    entityPool[id - 1].image = group;
}

function decreaseHeight() {

    var top = entityPool[id - 1].image.top;
    var left = entityPool[id - 1].image.left;

    canvas.remove(entityPool[id - 1].image);

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

    canvas.add(group);  

    entityPool[id - 1].image = group;
}

// TO IMPLEMENT - SAVE CHANGES TO SPECIAL ARRAY, IMPLEMENT CHECK METHOD FOR ADDING EXISTING PROPERTIES

function clearEdit() {

    var top = entityPool[id - 1].image.top;
    var left = entityPool[id - 1].image.left;

    canvas.remove(entityPool[id - 1].image);

    var img = imgContainer[1];

    img.set({
        originX: 'center',
        originY: 'center',
        top: img.get('height')/2,
        left: img.get('width')/2,
        scaleX: 0.1,
        scaleY: 0.1,
        angle: 0
    });

    var group = new fabric.Group([imgContainer[0], img]);

    group.set({
        top: top,
        left: left
    });

    canvas.add(group);  

    entityPool[id - 1].image = group;
}

// Function used for adding entity - add after specific ID
function addEntity(type) {

    var tableEntity;
    // Selecting the entity named after the type parameter
    for (var i = 0 ; i < tableEntities.length; i ++) {
        if (tableEntities[i].name == type.id) {
            tableEntity = jQuery.extend(true, {}, tableEntities[i]);
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

    var url = 'http://192.168.1.239:8887/' + path;
    
    fabric.Image.fromURL(url, function (oImg) {
        canvasEntity = new CanvasEntity(oImg, type, id, 0, tableEntity);
        entityPool.push(canvasEntity);
        document.getElementById(type.id + 'Lock').setAttribute('onclick', 'lockImage(' + id + ')');
        document.getElementById(type.id + 'Remove').setAttribute('onclick', 'removeEntity(' + id + ')');
        id = id + 1;
        canvas.add(oImg);
        //console.log(entityPool);
    });

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
    //console.log(record);
    tableEntity.records.push(record);

    var tableId = '#' + type.id + 'Table';

    // Inserting a record into table

    $(tableId).find('tbody').append("<tr><th scope='row'>" + tableEntity.records.length + "</th></tr>")
    for (var i = 0; i < record.length; i ++) {
        $('#tablesModalContent th:last').after("<td>&nbsp;&nbsp;" + record[i] + "</td>")
    }

    document.getElementById(type.id + 'Add').value = document.getElementById(type.id + 'Add').defaultValue;

    record.reverse();

    // TO IMPLEMENT - check for duplicate values


    // Adding edit button with options for each value a property can take
    for (var i = 0; i < columns.length; i ++) {
        record[i] = record[i].replace("'","").replace("'","");
        //console.log(record[i]);
        $("#" + columns[i] + "List").append("<li class='list-group-item' id='" + columns[i] + "-" + record[i] + "Prop'>" + record[i] + "<div class='dropdown' style='float:right'>\
        <button class='btn btn-secondary dropdown-toggle' type='button' id='" + columns[i] + "Dropdown' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>\
        Edit Value: </button><div class='dropdown-menu' aria-labelledby='" + columns[i] + "Dropdown'><button class='dropdown-item' onclick='editImage(\"" + columns[i] + "\", \"" + record[i] + "\")'>Add image</button></div></div></li>");
    }

    //console.log(db.exec("SELECT * FROM orcs")[0].columns);
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
    console.log(selectedId);
    var selectedEntity;
    for (var i = 0; i < entityPool.length; i++) {
        if (entityPool[i].id == selectedId) {
            selectedEntity = entityPool[i];
            break;
        }
    }
    //console.log(selectedEntity);
    var selectedItem;
    console.log(canvas.getObjects());
    for (var i = 0; i < canvas.getObjects().length; i++) {
        console.log("Object:   " + canvas.getObjects()[i]);
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
        //console.log('Column name: ' + matchingGroups[3] + '\tColumn type: ' + matchingGroups[4]);
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
    // Table(entity) name
    $('#entities').append("<p class='h3'><span class='badge badge-info'>" + type + "</span></p>");
    $('#entities').append("<p class='h5'>Choose default image for " + type + ":</p>");
    $('#entities').append("<input class='custom-file' type='file' id='" + type + "'><br>");
    $('#entities').append("<p class='h5'>Populate table " + type + ":</p>");
    // Add statement input
    $('#entities').append("<div class='input-group'><textarea class='form-control' placeholder='INSERT Statement' id='" + type + 
    "Add' rows='2'></textarea><div class='input-group-append'><button class='btn btn-outline-secondary' type='button' onclick='addEntity(" + type +
    ")'>Add</button></div></div><br>")

    // Modal that shows entity properties and allows editing for each possible value
    $('#entities').append("<button type='button' class='btn btn-secondary' data-toggle='modal' data-target='#properties' id='showProperties'>Current Properties</button>\
    <div class='modal fade' id='properties' tabindex='-1' role='dialog' aria-labelledby='propertiesLabel' aria-hidden='true'>\
    <div class='modal-dialog modal-lg' role='document'>\
    <div class='modal-content'>\
    <div class='modal-header'>\
    <p class='h3' class='modal-title' id='propertiesLabel'>Properties for table <span class='badge badge-info'>" + type + "</span> :</p>\
    <button type='button' class='close' data-dismiss='modal' aria-label='Close'>\
    <span aria-hidden='true'>&times;</span></button></div>\
    <div class='modal-body' id='propertiesModalContent'></div></div></div></div><br><br>");

    // Adding to the properties modal all the table's properties
    for (var i = 0; i < entityColumnNames.length; i ++) {
        $('#propertiesModalContent').append("<ul class='list-group' id='" + entityColumnNames[i] + "List'><li class='list-group-item list-group-item-dark'><center>" + entityColumnNames[i] + " Values:</center></li></ul><br>");
    }

    // Remove entity
    $('#entities').append("<button type='button' class='btn btn-secondary' onclick='removeEntity(" + id + ")' id='" + type + "Remove'>Remove Selected Entity</button>\t");
    // Set entity position
    $('#entities').append("<button type='button' class='btn btn-secondary' onclick='lockImage(" + id + ")' id='" + type + "Lock'>Set Entity Position</button>");

    document.getElementById('entityInput').value = document.getElementById('entityInput').defaultValue;
}

// Method used for executing select statements in the virtual database
function selectStatement() {
    var inputText = $('#selectInput').val();
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
    function download(content, fileName, contentType) {
        var a = document.createElement("a");
        var file = new Blob([content], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
    // TO IMPLEMENT - save to title directory
    download(serializedCanvas, 'canvasJson.txt', 'text/plain');
    download(serializedDb, 'serializedDb.db', 'application/octet-stream');
    download(serializedDataArray, 'dataJson.txt', 'text/plain');
    
}


