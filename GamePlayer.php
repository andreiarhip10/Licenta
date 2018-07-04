<!DOCTYPE html>

<?php
    $title = $_GET['game'];
?>

<html lang="en">

<head>
    <title>Game Player</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
        crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" href="GamePlayer.css">
    <script src="https://cdn.rawgit.com/kripken/sql.js/master/js/sql.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/2.0.3/fabric.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN"
        crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
        crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
        crossorigin="anonymous"></script>
    <script src="GamePlayer.js"></script>
</head>

<body onload="initPlayerCanvas()">
    <div class="row">
        <div class="col">
            <div class="jumbotron">
                <h2 class="display-4"><?php echo str_replace("\"", "", json_encode($title)) ?></h2> 
                <p class="lead" id="text"></p>
                <div>
                    <p class="h5">Objectives:</p>
                    <ul class='list-group' id='objectives'>
                    </ul>
                </div>
                <button type="button" class="btn btn-outline-info" data-toggle="modal" data-target="#tablesClient" id="showTablesClient" style='margin-top: 15px; margin-bottom: 15px'>Show Available Tables</button>
                <div class="modal fade" id="tablesClient" tabindex="-1" role="dialog" aria-labelledby="tablesLabel" aria-hidden="true">
                        <div class="modal-dialog" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <p class="h3" class="modal-title" id="tablesLabel">Tables:</p>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body" id="tablesModalContentClient"></div>
                            </div>
                        </div>
                </div>
                <p class="lead"> Execute queries on the database: </p>
                <div class="input-group">
                    <textarea class="form-control" placeholder="SELECT Statement" id="selectInputClient" rows="2"></textarea>
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" type="button" onclick="selectStatementClient()">Select</button>
                    </div>
                </div>
                <div id="selectResultClient" style='margin-top: 10px;'></div>
            </div>
        </div>
        <div class="col" id='canvasCol'>
            <canvas id="playerCanvas" height="500" width="780"></canvas>
        </div>
    </div>
</body>

</html>