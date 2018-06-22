<!DOCTYPE html>

<?php
    //path to directory to scan
    $directory = "Games/";
    
    //get all files in specified directory
    $files = glob($directory . "*");

    $availableGames = Array();
    
    //print each file name
    foreach($files as $file)
    {
        //check to see if the file is a folder/directory
        if(is_dir($file))
        {
            //echo str_replace($directory, "", $file);
            array_push($availableGames, str_replace($directory, "", $file));
        }
    }
?>

<html lang="en">
<head>
    <title>Game Selector</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
        crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" href="LandingPage.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js" integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN"
        crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
        crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
        crossorigin="anonymous"></script>
    <script src="LandingPage.js"></script>
</head>

<body>
    <div class="row">
        <div class="col"></div>
        <div class="col">
            <h2 class="display-4">Available Games</h2>
        </div>
        <div class="col"></div>
    </div>
    <div class="row">
    </div>
    <div class="row" id="row1">
    </div>
    <div class="row" id="row2">
    </div>
    <div class="row" id="row3">
    </div>
    
</body>


<?php
    echo '<script>';
    echo 'var availableGames = ' . json_encode($availableGames) . ';';
    echo 'console.log(availableGames);';
    echo 'var colCount = 1;';
    echo 'var rowCount = 1;';
    echo 'for (var i = 0; i < availableGames.length; i ++) {';
    echo "$('#row' + rowCount).append('<div class=\'col\'><a href=GamePlayer.php?game=' + availableGames[i] + '><div class=\'card style=\'width: 18rem;\'><img class=\'card-img-top\' src=\'entity-sample-1.png\'><div class=\'card-body\'><p class=\'card-text\'>' + availableGames[i] + '</p></div></div></a></div>');";
    echo "colCount ++;";
    echo "if (colCount >= 6) {";    
    echo "rowCount ++; colCount = 0;}}";
    echo "if (colCount < 6) {";
    echo "for (var i = colCount + 1; i < 6; i ++) {";
    echo "$('#row' + rowCount).append('<div class=\'col\'></div>');}}";
    echo '</script>';
?>

</html>