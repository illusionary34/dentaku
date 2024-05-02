"use strict";

//maximum digits in entry
const MAX_DIGITS = 15;

//additional operand is on the left side of a binary operator
let additional_operand = null;
let additional_operand_decimal_power = null;

//binary operator is typical algebraic operator
let binary_operator = null;
const binary_operator_list = ["ADD", "SUBTRACT", "MULTIPLY", "DIVIDE"];

//unary operator is for the main operand only
let unary_operator = null;
const unary_operator_list = ["SQUARE_ROOT", "PERCENT"];

//main operand is what we see on the calculator screen
let main_operand = 0;
let main_operand_decimal_power = 0;

//entry modifiers
let digits = 0;
let decimal_just_placed = false;

//when we just got our result, we need to handle input a little differently.
let result_just_received = false;

//memory value and grand total values
const memory_operator_list = ["CLEAR", "SET", "ADD", "SUBTRACT", "RECALL"];
let mem_val = 0;
let tax_rate = 0.1;
let grand_total = 0;

const rounding_mode_list = ["F", "CUT", "UP", "54"];
let rounding_mode = "F";
let rounding_power = -4;

//Update the number on the display. Useful after input.
function updateMainOperand() {
  let out_string = "";
  //toFixed helps round out floating point inaccuracies to the user
  if (main_operand_decimal_power != null) {
    out_string = main_operand.toFixed(Math.abs(main_operand_decimal_power));
  } else {
    out_string = main_operand.toString();
  }
  if (decimal_just_placed) {
    out_string += ".";
  }
  document.getElementById("main_operand").innerText = out_string;
}

function displayMessage(message) {
  document.getElementById("main_operand").innerText = message;
}

//append digit to the number on display, if it can fit
function appendDigit(num) {
  if (result_just_received == true) {
    clearEntry();
    result_just_received = false;
  }
  if (digits >= MAX_DIGITS) {
    return;
  }
  //make the number to append negative if the overall sign is negative
  //this is because we use addition. subtraction makes logic harder
  if (main_operand < 0) {
    num *= -1;
  }
  if (main_operand_decimal_power == 0 && !decimal_just_placed) {
    main_operand *= 10;
    main_operand += num;
  } else if (main_operand_decimal_power < 0 || decimal_just_placed) {
    decimal_just_placed = false;
    main_operand_decimal_power--;
    num = num * Math.pow(10, main_operand_decimal_power);
    main_operand += num;
  }
  digits++;
  updateMainOperand();
}

function removeDigit() {
  if (digits < 1) return;
  if (main_operand_decimal_power == 0) {
    main_operand /= 10;
    main_operand = Math.trunc(main_operand);
  } else {
    //multiply the number by 10^x where x is the amount of decimal digits
    //then divide by 10. then return the decimal by dividing by 10^x
    //probably not numerically stable but worth a shot
    let temp_value = main_operand;
    temp_value *= Math.pow(10, -1 * main_operand_decimal_power);
    temp_value /= 10;
    temp_value = Math.trunc(temp_value);
    main_operand_decimal_power++;
    temp_value *= Math.pow(10, main_operand_decimal_power);
    main_operand = temp_value;
  }
  updateMainOperand();
}

function clearEntry() {
  main_operand = 0;
  main_operand_decimal_power = 0;
  digits = 0;
  updateMainOperand();
}

function clearAll() {
  additional_operand = null;
  additional_operand_decimal_power = null;
  binary_operator = null;
  grand_total = 0;
  clearEntry();
}

function showGrandTotal() {
  clearEntry();
  main_operand = grand_total;
  updateMainOperand();
  result_just_received = true;
}

function handleDecimalButtonPress() {
  if (result_just_received == true) {
    clearEntry();
    result_just_received = false;
  }
  if (main_operand_decimal_power == 0 && digits < MAX_DIGITS) {
    decimal_just_placed = true;
    updateMainOperand();
  }
}

function handleChangeSign() {
  main_operand *= -1;
  updateMainOperand();
}

//Handle press of a number button
function handleNumberButtonPress(num) {
  //safeguard against bad input
  let input_type = typeof num;
  if (input_type != "number") {
    throw ValueError();
  }
  num = Math.trunc(num);
  appendDigit(num);
}

function handleBinaryOperator(operator) {
  //only take operators that are defined
  if (binary_operator_list.includes(operator)) {
    if (binary_operator == null && additional_operand == null) {
      additional_operand = main_operand;
      additional_operand_decimal_power = main_operand_decimal_power;
      binary_operator = operator;
      clearEntry();
    } else if (main_operand == 0) {
      binary_operator = operator;
    } else {
      sendCalculation();
      handleBinaryOperator(operator);
    }
  }
  //otherwise throw error and stop execution
  else {
    throw ValueError();
  }
}

function handleUnaryOperator(operator) {
  //only take operators that are defined
  if (unary_operator_list.includes(operator)) {
    unary_operator = operator;
    sendCalculation();
  } else {
    throw ValueError();
  }
}

function handleMemoryOperator(operator) {
  if (memory_operator_list.includes(operator)) {
    switch (operator) {
      case "CLEAR":
        mem_val = 0;
        break;
      case "SET":
        mem_val = main_operand;
        break;
      case "RECALL":
        main_operand = mem_val;
        main_operand_decimal_power = null;
        result_just_received = true;
        updateMainOperand();
        break;
      case "ADD":
        sendCalculation();
        mem_val += main_operand;
        break;
      case "SUBTRACT":
        sendCalculation();
        mem_val -= main_operand;
        break;
    }
  } else {
    throw ValueError();
  }
}

function getRoundingMode() {
  let mode = document.querySelector("input[name=rounding]:checked").value;
  if (rounding_mode_list.includes(mode)) {
    rounding_mode = mode;
  } else {
    throw ValueError();
  }
}

function updateRoundingPower() {
  let value = document.querySelector("input[name=decimals]:checked").value;
  value = Number(value);
  rounding_power = -1 * value;
}

//tax functions are just implemented on client side
function handleTaxIncluded() {
  handleBinaryOperator("MULTIPLY");
  main_operand = 1 + tax_rate;
  sendCalculation();
}

function handleTaxRemoved() {
  handleBinaryOperator("DIVIDE");
  main_operand = 1 + tax_rate;
  sendCalculation();
}

function handleSetTaxRate() {
  tax_rate = main_operand;
  clearEntry();
}

function sendCalculation() {
  getRoundingMode();
  updateRoundingPower();
  let data = {};
  if (additional_operand != null) {
    data.additional_operand = additional_operand;
  }
  /*
  if (additional_operand_decimal_power != null) {
    data.additional_operand_decimal_power = additional_operand_decimal_power;
  }
  */
  if (binary_operator != null) {
    data.binary_operator = binary_operator;
  }
  data.main_operand = main_operand;
  //data.main_operand_decimal_power = main_operand_decimal_power;
  if (unary_operator != null) {
    data.unary_operator = unary_operator;
  }
  let return_data = getResult(data);
  if (return_data.status == "success") {
    let result = return_data.result;
    switch (rounding_mode) {
      case "CUT":
        result = decimalAdjust("floor", result, rounding_power);
        break;
      case "UP":
        result = decimalAdjust("ceil", result, rounding_power);
        break;
      case "54":
        result = decimalAdjust("round", result, rounding_power);
      default:
    }
    if (rounding_mode != "F") {
      main_operand_decimal_power = rounding_power;
    } else {
      main_operand_decimal_power = null;
    }
    main_operand = result;
    grand_total += result;
    result_just_received = true;
    updateMainOperand();
  } else {
    displayMessage("Error");
    main_operand_decimal_power = null;
    main_operand = null;
  }
  unary_operator = null;
  binary_operator = null;
  additional_operand = null;
  additional_operand_decimal_power = null;
  return;
}

function getResult(data) {
  const request = new XMLHttpRequest();
  //make the request synchronous so that we wait for the result to come back
  request.open("POST", "/calculate.php", false);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(JSON.stringify(data));
  return JSON.parse(request.response);
}

//Taken from MDN. Link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor
/**
 * Adjusts a number to the specified digit.
 *
 * @param {"round" | "floor" | "ceil"} type The type of adjustment.
 * @param {number} value The number.
 * @param {number} exp The exponent (the 10 logarithm of the adjustment base).
 * @returns {number} The adjusted value.
 */
function decimalAdjust(type, value, exp) {
  type = String(type);
  if (!["round", "floor", "ceil"].includes(type)) {
    throw new TypeError(
      "The type of decimal adjustment must be one of 'round', 'floor', or 'ceil'.",
    );
  }
  exp = Number(exp);
  value = Number(value);
  if (exp % 1 !== 0 || Number.isNaN(value)) {
    return NaN;
  } else if (exp === 0) {
    return Math[type](value);
  }
  const [magnitude, exponent = 0] = value.toString().split("e");
  const adjustedValue = Math[type](`${magnitude}e${exponent - exp}`);
  // Shift back
  const [newMagnitude, newExponent = 0] = adjustedValue.toString().split("e");
  return Number(`${newMagnitude}e${+newExponent + exp}`);
}

function handleKeyPress(event) {
  let key = event.key;
  switch (key) {
    case "0":
      handleNumberButtonPress(0);
      break;
    case "1":
      handleNumberButtonPress(1);
      break;
    case "2":
      handleNumberButtonPress(2);
      break;
    case "3":
      handleNumberButtonPress(3);
      break;
    case "4":
      handleNumberButtonPress(4);
      break;
    case "5":
      handleNumberButtonPress(5);
      break;
    case "6":
      handleNumberButtonPress(6);
      break;
    case "7":
      handleNumberButtonPress(7);
      break;
    case "8":
      handleNumberButtonPress(8);
      break;
    case "9":
      handleNumberButtonPress(9);
      break;
    case "0":
      handleNumberButtonPress(0);
      break;
    case "/":
      //prevent the "/" key from opening quick search
      event.preventDefault();
      handleBinaryOperator("DIVIDE");
      break;
    case "*":
      handleBinaryOperator("MULTIPLY");
      break;
    case "-":
      handleBinaryOperator("SUBTRACT");
      break;
    case "+":
      handleBinaryOperator("ADD");
      break;
    case "Enter":
      sendCalculation();
      break;
    case ".":
      handleDecimalButtonPress();
      break;
    case "%":
      handleUnaryOperator("PERCENT");
      break;
    case "Escape":
      clearEntry();
      break;
    case "Backspace":
      removeDigit();
      break;
  }
}
