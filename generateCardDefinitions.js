
// importing the required Node.js modules
const fs = require('fs'); // File system module
const path = require('path'); // Path madoule for handling file paths

// Defining folder for images and creating an array to store card information
const cardImagesFolder = './images/cards';
const cardDefinitions = [];

// Reading the contents of the card images folder
fs.readdirSync(cardImagesFolder).forEach((file) => {

  // Checking if the file is a png
  if (path.extname(file) === '.png') {

    // Removing the '.png' to create a card ID
    const id = file.slice(0, -4);

    // Creating the path to the card image
    const imagePath = `/images/cards/${file}`;

    // Adding the card definition to an array
    cardDefinitions.push({ id, imagePath });
  }
});

// Writing that array to a JSOn file
fs.writeFileSync('cardDefinitions.json', JSON.stringify(cardDefinitions, null, 2));
// console.log(cardDefinitions)
