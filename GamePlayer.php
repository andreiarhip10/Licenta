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
                <h2 class="display-4"> BD Game Player </h2> 
                <p class="lead"> Select serialized files for game <?php echo json_encode($title) ?>:</p>
                <form>
                    <div class="form-group">
                        <label for="serializedCanvas">Canvas:</label>
                        <input class="custom-file" type="file" id="serializedCanvas">
                        <label for="serializedDb">Database:</label>
                        <input class="custom-file" type="file" id="serializedDb">
                        <label for="serializedData">Data Array:</label>
                        <input class="custom-file" type="file" id="serializedData">
                    </div>
                </form>
                <button type="submit" class="btn btn-secondary" onclick="importData()">Import</button>
                <br><br>
                <p class="lead"> Execute queries on the database: </p>
                <div class="input-group">
                    <textarea class="form-control" placeholder="SELECT Statement" id="selectInputClient" rows="2"></textarea>
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" type="button" onclick="selectStatementClient()">Select</button>
                    </div>
                </div>

            </div>
        </div>
        <div class="col">
            <canvas id="playerCanvas" height="500" width="780"></canvas>
            <br>
            <div class="jumbotron" id="selectResultClient">
                <p class="lead">SELECT results:</p>
            </div>
        </div>
    </div>
</body>

</html>