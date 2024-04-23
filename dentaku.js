"use strict";

//maximum digits in entry
const MAX_DIGITS = 12;

let calc_screen_number = 0;
let decimal_power = 0;
let digits = 0;
let decimal_just_placed = false;

//Update the number on the display. Useful after input.
function updateCalcScreen() {
  //toFixed helps round out floating point inaccuracies to the user
  let out_string = calc_screen_number.toFixed(Math.abs(decimal_power));
  if (decimal_just_placed) {
    out_string += ".";
  }
  document.getElementById("calc_screen").innerText = out_string;
}

//append digit to the number on display, if it can fit
function appendDigit(num) {
  if (digits >= MAX_DIGITS) {
    return;
  }
  if (decimal_power == 0 && !decimal_just_placed) {
    calc_screen_number *= 10;
    calc_screen_number += num;
  } else if (decimal_power < 0 || decimal_just_placed) {
    decimal_just_placed = false;
    decimal_power--;
    num = num * Math.pow(10, decimal_power);
    calc_screen_number += num;
  }
  digits++;
  updateCalcScreen();
}

function clearEntry() {
  calc_screen_number = 0;
  decimal_power = 0;
  digits = 0;
  updateCalcScreen();
}

function handleDecimalButtonPress() {
  if (decimal_power == 0 && digits < MAX_DIGITS) {
    decimal_just_placed = true;
    updateCalcScreen();
  }
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
