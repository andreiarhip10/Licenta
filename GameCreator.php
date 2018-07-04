<!DOCTYPE html>
<html lang="en">

<head>
    <title>Game Creator</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
        crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" href="GameCreator.css">
    <script src="https://cdn.rawgit.com/kripken/sql.js/master/js/sql.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/2.0.3/fabric.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.3.1.js"></script>
    <!--<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN"
        crossorigin="anonymous"></script>-->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
        crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
        crossorigin="anonymous"></script>
    <script src="GameCreator.js"></script>
</head>



<body onload="initCanvas()">

    <div class="row">
        <div class="col">
            <div class="jumbotron">
                <h2 class="display-4"> Game Editor </h2>
                <div class="input-group"><button id="titleButton" class="btn btn-info" data-toggle="tooltip" data-placement="top" title="This is how your game will be named and saved to the server.">Title</button>
                <input id="title" type="text" class="form-control" placeholder="Game title"><button id="textButton" class="btn btn-info" data-toggle="tooltip" data-placement="top" title="Here give the players some instructions, a background story or some other information you would like to include.">Game Text</button>
                <button id="objectivesButton" class="btn btn-info" data-toggle="tooltip" data-placement="top" title="Describe the tasks the player has to fulfill. For each objective, you will have to provide a valid answer, as a SELECT statement.">Objectives</button>
                <button id="viewButton" class="btn btn-info" data-toggle="tooltip" data-placement="top" title="View current tabels and run SELECT statements on the database.">View Database</button>
                <button id="createButton" class="btn btn-info" data-toggle="tooltip" data-placement="top" title="Add entities to the game using CREATE statements.">Create Entities</button>
                </div><textarea id="text" class="form-control" placeholder="Text to be displayed to the players"></textarea>
                <div id="objectives">
                    <p class="h5">Current objectives:<span style="float:right;"><button id="addObj" class="btn btn-info btn-sm" style="padding-top: 0px;padding-bottom: 0px;padding-right: 0px;padding-left: 0px;width: 23px;">-</button></span></p>
                    <ul id="objectivesList" class="list-group">
                    </ul>
                    <div id="addObjective">
                        <textarea id="objectiveText" class="form-control" placeholder="Objective text"></textarea>
                        <textarea id="objectiveSelect" class="form-control" placeholder="Corresponding SELECT solution"></textarea>
                        <button id="addObjectiveButton" class="btn btn-info">Add Objective</button>
                    </div>
                </div>
                <div id="viewData">
                    <p class="h5"><span><button type="button" class="btn btn-info" data-toggle="modal" data-target="#tables" id="showTables">Show Tables</button></span>Run queries on the database:<span style="float:right;"><button id="selRes" class="btn btn-info btn-sm" style="padding-top: 0px;padding-bottom: 0px;padding-right: 0px;padding-left: 0px;width: 23px;" data-toggle="tooltip" data-placement="top" title="Show/hide SELECT results.">-</button></span></p>
                    <div class="modal fade" id="tables" tabindex="-1" role="dialog" aria-labelledby="tablesLabel" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <p class="h3" class="modal-title" id="tablesLabel">Tables:</p>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body" id="tablesModalContent"></div>
                            </div>
                        </div>
                    </div>
                    <div class="input-group">
                        <textarea class="form-control" placeholder="SELECT Statement" id="selectInput" rows="2"></textarea>
                        <div class="input-group-append">
                            <button class="btn btn-outline-secondary" type="button" onclick="selectStatement()">Select</button>
                        </div>
                    </div>
                    <div id="selectResult"></div>
                </div>
                <div id="createTables">
                    <p class="h5">Define entities by creating tables:</p>
                    <div class="input-group">
                        <textarea class="form-control" placeholder="CREATE Statement" id="entityInput" rows="3"></textarea>
                        <div class="input-group-append">
                            <button class="btn btn-outline-secondary" type="button" onclick="addEntityType()">Create</button>
                        </div>
                    </div>
                </div>
                <div class='input-group mb-3' id="backgroundSection">
                    <div class='input-group-prepend'>
                        <span class='input-group-text'>Background Image</span>
                    </div>
                    <div class='custom-file'>
                        <input type='file' class='custom-file-input' id="backgroundSelect" onchange='backgroundImage()'>
                        <label class='custom-file-label' for='backgroundSelect' id='backgroundLabel'>Choose file</label>
                    </div>
                    <button type="button" class="btn btn-info" id='backgroundButton' onclick="backgroundImageLock()" style='margin-left: 5px' data-toggle="tooltip" data-placement="top" title="Set a permanent size and position for the background image.">Lock</button>
                    <button type="button" class="btn btn-info" id='backgroundRemoveButton' onclick="backgroundImageRemove()" style='margin-left: 5px'>Remove</button>
                </div>
                <div>
                    <button type="button" class="btn btn-info" id="finish" onclick="finish()">Finish Editing</button>
                </div>
            </div>
        </div>
        <div class="col">
            <canvas id="gameCanvas" height="500" width="780"></canvas>
            <div id="entities">
                <div class="jumbotron">
                    <p class="h5">Current entities:</p>
                    <div id="entityCarousel" class="carousel slide" data-ride="carousel">
                        <ol class="carousel-indicators">
                            <!--<li data-target="#entityCarousel" data-slide-to="0" class="active"></li>
                            <li data-target="#entityCarousel" data-slide-to="1"></li>
                            <li data-target="#entityCarousel" data-slide-to="2"></li>-->
                        </ol>
                        <div class="carousel-inner">
                            <!--<div class="carousel-item active">
                                <h2>hi man </h2>
                                <h2>hi man </h2>
                                <h2>hi man </h2>
                                <h2>hi man </h2>
                            </div>
                            <div class="carousel-item">
                                <h2>hi man </h2>
                            </div>
                            <div class="carousel-item">
                                <h2>hi man </h2>
                            </div>-->
                        </div>
                        <a class="carousel-control-prev" href="#entityCarousel" role="button" data-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="sr-only">Previous</span>
                        </a>
                        <a class="carousel-control-next" href="#entityCarousel" role="button" data-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="sr-only">Next</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    
</body>

</html>

<?php
    if ($_SERVER['REQUEST_URI'] != "/GameCreator/GameCreator.php") {

        $title = $_GET['title'];
        echo $title;
        $path = "Games/" . $title;
        mkdir($path);
        copy("C:\Users\Duda\Downloads\canvasJson.txt", "Games/" . $title . "/canvasJson.txt");
        copy("C:\Users\Duda\Downloads\serializedDb.db", "Games/" . $title . "/serializedDb.db");
        copy("C:\Users\Duda\Downloads\dataJson.txt", "Games/" . $title . "/dataJson.txt");
        copy("C:\Users\Duda\Downloads\infoJson.txt", "Games/" . $title . "/infoJson.txt");
        copy("C:\Users\Duda\Downloads\img.png", "Games/" . $title . "/img.png");
        unlink("C:\Users\Duda\Downloads\canvasJson.txt");
        unlink("C:\Users\Duda\Downloads\serializedDb.db");
        unlink("C:\Users\Duda\Downloads\dataJson.txt");
        unlink("C:\Users\Duda\Downloads\infoJson.txt");
        unlink("C:\Users\Duda\Downloads\img.png");
        // $cnv = $_GET['cnv'];
        // echo "<script>console.log(" . $cnv . ");</script>";
        //$db = $_GET['db'];
        //$data = $_GET['data'];
        
        //mkdir('Games/phptest');
        //file_put_contents('Games/phptest/canvasJson.txt', json_decode($cnv));
    }

    //$cnv = $_GET['canvasJson'];
    //echo $cnv;

    //echo $_GET['canvas'];
?>