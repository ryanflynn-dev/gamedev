const result = document.getElementById("output");
const check = document.getElementById("check");
const number = document.getElementById("number");

number.addEventListener("keyup", () => {
  if (number.value === "") {
    result.innerHTML = "Please enter a number";
  } else {
    result.innerHTML = checkPerfect(number.value);
  }
});
check.addEventListener("click", () => {
  if (number.value === "") {
    result.innerHTML = "Please enter a number";
  } else {
    result.innerHTML = checkPerfect(number.value);
  }
});

const checkPerfect = (number) => {
  let sum = 0;
  for (let i = 1; i < number - 1; i++) {
    if (number % i === 0) {
      sum += i;
    }
  }
  if (sum == number) {
    return `${number} is a perfect number`;
  } else if (sum === 1) {
    return `${number} is a prime number`;
  } else {
    {
      return `${number} is just a number`;
    }
  }
};
