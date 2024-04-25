"use strict";

//maximum digits in entry
const MAX_DIGITS = 12;

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

//Update the number on the display. Useful after input.
function updateMainOperand() {
  //toFixed helps round out floating point inaccuracies to the user
  let out_string = main_operand.toFixed(Math.abs(main_operand_decimal_power));
  if (decimal_just_placed) {
    out_string += ".";
  }
  document.getElementById("main_operand").innerText = out_string;
}

//append digit to the number on display, if it can fit
function appendDigit(num) {
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
  clearEntry();
}

function handleDecimalButtonPress() {
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
      //TODO: enqueue the result of the calculation into the additional operand buffer
      sendCalculation();
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

function sendCalculation() {
  let data = {};
  if (additional_operand != null) {
    data.additional_operand = additional_operand;
  }
  if (additional_operand_decimal_power != null) {
    data.additional_operand_decimal_power = additional_operand_decimal_power;
  }
  if (binary_operator != null) {
    data.binary_operator = binary_operator;
  }
  data.main_operand = main_operand;
  data.main_operand_decimal_power = main_operand_decimal_power;
  if (unary_operator != null) {
    data.unary_operator = unary_operator;
  }
  fakeSendCalculation(data);
  unary_operator = null;
  return;
}

//placeholder until we do actual network stuff
function fakeSendCalculation(data) {
  console.log(data);
  clearAll();
  document.getElementById("main_operand").innerText = "faked send";
}
