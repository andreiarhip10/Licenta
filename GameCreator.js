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

// Canvas entity class
class CanvasEntity {
    constructor(image, type, id) {
        this.image = image;
        this.type = type;
        this.id = id;
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
}

// Function used for selecting game background
function backgroundImage() {
    var selectedBackground = document.getElementById('backgroundSelect').value;
    var fakePath = selectedBackground.split('\\');
    path = fakePath[fakePath.length - 1];
    fabric.Image.fromURL(path, function (oImg) {
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

// Function used for adding entity
function addEntity(type) {

    /*var entity;
    var selectedImage = document.getElementById(type.id).value;
    var fakePath = selectedImage.split('\\');
    var path = fakePath[fakePath.length - 1];
    fabric.Image.fromURL(path, function (oImg) {
        entity = new CanvasEntity(oImg, type, id);
        entityPool.push(entity);
        document.getElementById(type.id + 'Lock').setAttribute('onclick', 'lockImage(' + id + ')');
        document.getElementById(type.id + 'Remove').setAttribute('onclick', 'removeEntity(' + id + ')');
        id = id + 1;
        canvas.add(oImg);
        console.log(entityPool);
    });*/

    var addInput = document.getElementById(type.id + 'Add').value;
    var tableEntity;
    for (var i = 0 ; i < tableEntities.length; i ++) {
        if (tableEntities[i].name == type.id) {
            tableEntity = tableEntities[i];
            break;
        }
    }
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
    console.log(insertMatch.test(addInput));
    var matchingInserts = insertMatch.exec(addInput);
    var record = [];
    for (var i = 1; i < matchingInserts.length; i ++) {
        record.push(matchingInserts[i]);
    }
    record.reverse();
    tableEntity.records.push(record);

    var tableId = '#' + type.id + 'Table';

    $(tableId).find('tbody').append("<tr><th scope='row'>" + tableEntity.records.length + "</th></tr>")
    for (var i = 0; i < record.length; i ++) {
        $('#tablesModalContent th:last').after("<td>" + record[i] + "</td>")
    }

    document.getElementById(type.id + 'Add').value = document.getElementById(type.id + 'Add').defaultValue;

    // TO IMPLEMENT - ADD DEFAULT IMAGE OPTION, DETECT PROPERTIES
}

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
    var selectedEntity;
    for (var i = 0; i < entityPool.length; i++) {
        if (entityPool[i].id == selectedId) {
            selectedEntity = entityPool[i];
            break;
        }
    }
    //console.log(selectedEntity);
    var selectedItem;
    for (var i = 0; i < canvas.getObjects().length; i++) {
        if (canvas.getObjects()[i] == selectedEntity.image) {
            selectedItem = canvas.getObjects()[i];
            break;
        }
    }
    selectedItem.selectable = false;
    selectedItem.lockRotation = selectedItem.lockScalingX = selectedItem.lockScalingY = selectedItem.lockMovementX = selectedItem.lockMovementY = true;
    selectedItem.selection = false;

    canvas.renderAll();
}

// Function used for adding entities to jumbotron
function addEntityType() {

    // Regex matching for entity input - TO IMPLEMENT - input verification, more data types, more ? characters
    var addEntityMatch = /CREATE TABLE (\w*)\s?\((\s?(\w*) (number|varchar2\(\d*\))\s?,?)*\);/;

    // Variable used to store the initial entity input
    var inputText = $('#entityInput').val();

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
        console.log('Column name: ' + matchingGroups[3] + '\tColumn type: ' + matchingGroups[4]);
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
    // Remove entity
    $('#entities').append("<button type='button' class='btn btn-secondary' onclick='removeEntity(" + id + ")' id='" + type + "Remove'>Remove Selected Entity</button>\t");
    // Set entity position
    $('#entities').append("<button type='button' class='btn btn-secondary' onclick='lockImage(" + id + ")' id='" + type + "Lock'>Set Entity Position</button>");


    /*$('#entities').append("<p><b>Choose image for " + type + ": </b></p>");
    $('#entities').append("<input class='custom-file' type='file' id='" + type + "'><br>");
    $('#entities').append("<span><button type='button' class='btn btn-primary' onclick='addEntity(" + type + ")'>Add</button>\t\t\t");
    $('#entities').append("<button type='button' class='btn btn-primary' onclick='removeEntity(" + id + ")' id='" + type + "Remove'>Remove</button>\t\t\t");
    $('#entities').append("<button type='button' class='btn btn-primary' onclick='lockImage(" + id + ")' id='" + type + "Lock'>Set Position</button></span><br><br>");*/


    document.getElementById('entityInput').value = document.getElementById('entityInput').defaultValue;
}