<?php

$request_method = $_SERVER["REQUEST_METHOD"];
header('Content-Type: application/json; charset=utf-8');
$response = [];

//only accept POST requests
if (strtoupper($request_method) != 'POST') {
    header($_SERVER["SERVER_PROTOCOL"]." 405 Method Not Allowed");
    header("Allow: POST");
    $response["status"] = "error";
    $response["detail"] = "use POST";
    echo json_encode($response);

    die();
}

//attempt to read input
$input = file_get_contents("php://input");
if ($input === false) {
    header($_SERVER["SERVER_PROTOCOL"]." 500 Internal Server Error");
    $response["status"] = "error";
    echo json_encode($response);

    die();
}


try {
    $input_data = json_decode($input, true, 2, JSON_THROW_ON_ERROR);
}
catch (JsonException $e) {
    header($_SERVER["SERVER_PROTOCOL"]." 400 Bad Request");

    $response["status"] = "error";
    $response["detail"] = "JSON error";
    echo json_encode($response);

    die();
}

//for debugging. TODO remove when finished
$response["input_data"] = $input_data;

define("BINARY_OPERATOR_LIST", ["ADD", "SUBTRACT", "MULTIPLY", "DIVIDE"]);
define("UNARY_OPERATOR_LIST", ["SQUARE_ROOT", "PERCENT"]);

$additional_operand = null;
$binary_operator = null;
$main_operand = null;
$unary_operator = null;

if (isset($input_data['additional_operand'])) {
    $additional_operand =  $input_data['additional_operand'];
    if (!is_numeric($additional_operand)) {
        header($_SERVER["SERVER_PROTOCOL"]." 422 Unprocessable Content");
        $response["status"] = "error";
        $response["detail"] = "Additional_operand not a number";
        echo json_encode($response);
        die();
    }
}
if (isset($input_data['binary_operator'])) {
    $binary_operator = $input_data['binary_operator'];
    if (array_search($binary_operator, constant("BINARY_OPERATOR_LIST")) === false) {
        header($_SERVER["SERVER_PROTOCOL"]." 422 Unprocessable Content");
        $response["status"] = "error";
        $response["detail"] = "Invalid binary operator";

        echo json_encode($response);
        die();
    }
}
if (isset($input_data['main_operand'])) {
    $main_operand = $input_data['main_operand'];
    if (!is_numeric($main_operand)) {
        header($_SERVER["SERVER_PROTOCOL"]." 422 Unprocessable Content");
        $response["status"] = "error";
        $response["detail"] = "Main_operand not a number";
        echo json_encode($response);
        die();
    }
}
//if there is no main operand, that's an error
else {
    header($_SERVER["SERVER_PROTOCOL"]." 422 Unprocessable Content");
        $response["status"] = "error";
        $response["detail"] = "Missing main_operand";
        echo json_encode($response);
        die();
}
if (isset($input_data['unary_operator'])) {
    $unary_operator = $input_data['unary_operator'];
    if (array_search($unary_operator, constant("UNARY_OPERATOR_LIST")) === false) {
        header($_SERVER["SERVER_PROTOCOL"]." 422 Unprocessable Content");
        $response["status"] = "error";
        $response["detail"] = "Invalid unary operator";
        echo json_encode($response);
        die();
    }
}

//ok by now we should have all the things we need to process the request. let's do it

$result = null;

//check unary operator first.
switch ($unary_operator) {
    case "SQUARE_ROOT":
        $main_operand = sqrt($main_operand);
        break;
    case "PERCENT":
        //if there's no additional operand, we will just give a decimal as a result
        if ($additional_operand == null) {
            $additional_operand = 1;
        }
        //when we add or subtract, we need to first figure out the value of
        //x% of additional_operand.
        //when we multiply or divide, we just divide by 100 to get the decimal value
        switch($binary_operator) {
            case "SUBTRACT":
            case "ADD":
                $main_operand = $additional_operand * ($main_operand / 100);
                //$binary_operator = "MULTIPLY";
                break;
            case "MULTIPLY":
            case "DIVIDE":
            default:
                $main_operand = $main_operand / 100;
                break;
        }
        break;
}
switch ($binary_operator) {
    case "ADD":
        $result = $additional_operand + $main_operand;
        break;
    case "SUBTRACT":
        $result = $additional_operand - $main_operand;
        break;
    case "MULTIPLY":
        $result = $additional_operand * $main_operand;
        break;
    case "DIVIDE":
        try {
            $result = $additional_operand / $main_operand;
        }
        catch (DivisionByZeroError $e) {
            $result = NAN;
        }
        break;
    default:
        $result = $main_operand;
}


if (is_finite($result)) {
    header($_SERVER["SERVER_PROTOCOL"]." 200 OK");
    $response["status"] = "success";
    $response["result"] = $result;
}
else {
    header($_SERVER["SERVER_PROTOCOL"]." 422 Unprocessable Content");
    $response["status"] = "error";
    $response["detail"] = "Mathematical Error";
}

echo json_encode($response, JSON_THROW_ON_ERROR);

?>
