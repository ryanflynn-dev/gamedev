// Number line
// <| -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 |>
//                                     a   b

const a = 2;
const b = 3;

// This is how to get a whole number between two numbers
// abs(a) = |a|
// dis(a, b) = |a - b|
function dis(a, b) {
  return Math.abs(a - b);
}
console.log("Distance: ", dis(a, b)); // return a positive number ==> 1

// This is how to get the Sign of two numbers
// sign(a) = a/|a|
function disSign(a, b) {
  return Math.sign(a - b); // return a negative number ==> -1
}
console.log("Sign: ", disSign(a, b));
// this can be useful for knowing the direction or which side a number is on

// This is how to get a random number
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
console.log("Random Number: ", getRandomNumber(-5, 5)); // Random number between -5 and 5

//VECTORS
const A = { x: 3, y: 1 };
const B = { x: -2, y: 2 };

// This is how you add two vectors
function addVector(A, B) {
  // C = A + B (-1, 3)
  const C = { x: A.x + B.x, y: A.y + B.y };
  return C;
}
console.log("Add Vector: ", addVector(A, B)); // {x: -1, y: 3}

// This is how you get an offset from two vectors
function offsetVector(A, B) {
  // D = A - B
  // from B to A
  const D = { x: A.x - B.x, y: A.y - B.y };
  return D;
}
console.log("Offset Vector: ", offsetVector(A, B)); // {x: 7, y: 1}

// This is how you get the length of a vector
// Length(A,B) = √x²+y²
function getVectorLength(A) {
  const length = Math.sqrt(Math.pow(A.x, 2) + Math.pow(A.y, 2));
  return length;
}

// This is how you get the distance between two vectors
// dist(A,B) = ||B-A||
function getVectorDistance(A, B) {
  const distance = getVectorLength(offsetVector(A, B));
  return distance;
}
console.log("Vector Distance: ", getVectorDistance(A, B));

// This is how you get a normalised vector
// direction/normalise(A) = A/||A||
function normaliseVector(A) {
  const normalised = {
    x: A.x / getVectorLength(A),
    y: A.y / getVectorLength(A),
  };
  return normalised;
}
console.log("Normalised Vector: ", normaliseVector(A));

// This is how to get the dot product of two vectors
function getDotProduct(A, B) {
  const dotProduct = A.x * B.x + A.y * B.y;
  return dotProduct;
}
