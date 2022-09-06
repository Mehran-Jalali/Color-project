//Global selection
const colorDivs = document.querySelectorAll(`.color`);
const generateBtn = document.querySelector(`.generate`);
const sliders = document.querySelectorAll(`input[type ='range']`);
const currentHexes = document.querySelectorAll(`.color h2`);
const popup = document.querySelector(`.copy-container`);
const clearContainer = document.querySelector(`.clear-container`);
const clearPopupBtn = document.querySelector(`.clear-library button`);
const adjustButton = document.querySelectorAll(`.adjust`);
const closeAdjustments = document.querySelectorAll(`.close-adjustment`);
const sliderContainer = document.querySelectorAll(`.sliders`);
const lockButton = document.querySelectorAll(`.lock`);
let initialColors;
// const saveBtn = document.querySelector(`.submit-save`);
//For local storage
let savedPalettes = [];

//Add eventlisteners
generateBtn.addEventListener("click", randomColors);
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControl);
});

lockButton.forEach((button, index) => {
  button.addEventListener("click", (e) => {
    lockLayer(e, index);
  });
});

colorDivs.forEach((div, index) => {
  div.addEventListener(`change`, () => {
    updateTextUI(index);
  });
});
currentHexes.forEach((hex) => {
  hex.addEventListener(`click`, () => {
    copyToClipboard(hex);
  });
});
popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove(`active`);
  popupBox.classList.remove(`active`);
});
clearPopupBtn.addEventListener(`click`, () => {
  clearLibrary();
  localStorage.clear();
});
clearContainer.addEventListener("transitionend", () => {
  const popupBox = clearContainer.children[0];
  clearContainer.classList.remove(`active`);
  popupBox.classList.remove(`active`);
  localStorage.clear();
  location.reload();
});
adjustButton.forEach((button, index) => {
  button.addEventListener(`click`, () => {
    openAdjustmentPanel(index);
  });
});
closeAdjustments.forEach((button, index) => {
  button.addEventListener(`click`, () => {
    sliderContainer[index].classList.remove(`active`);
  });
});

//Fanctions

//Color generator↓↓
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  initialColors = [];

  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    //push the first hextext to initialColors
    if (div.classList.contains(`locked`)) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }
    //Add the color to background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;

    // Check for text color contrast
    checkTextContrast(randomColor, hexText);
    //initial colorize sleders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(`.sliders input`);
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
  //Reset the Input
  resetInput();
  //Check for bottons contrast
  adjustButton.forEach((button, index) => {
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockButton[index]);
  });
}
function checkTextContrast(color, text) {
  const lum = chroma(color).luminance();
  if (lum > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}
function colorizeSliders(color, hue, brightness, saturation) {
  //scale saturation  s ==> saturation
  const noSat = color.set(`hsl.s`, 0);
  const fullSat = color.set(`hsl.s`, 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  // colorize the input
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )},${scaleSat(1)})`;

  //=========================

  //scale brightness  l ==> lightness
  const noBright = color.set(`hsl.l`, 0);
  const midBright = color.set(`hsl.l`, 0.5);
  const fullbright = color.set(`hsl.l`, 1);
  const scaleBright = chroma.scale([noBright, midBright, fullbright]);
  //colorize the input
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
    0
  )},${scaleBright(0.5)},${scaleBright(1)})`;

  //=========================

  //scale hue
  //don`t need any scale code because it`s a same on each one

  //colorize the input
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75) )`;
}

function hslControl(e) {
  const index =
    e.target.getAttribute(`data-hue`) ||
    e.target.getAttribute(`data-sat`) ||
    e.target.getAttribute(`data-bright`);

  let sliders = e.target.parentElement.querySelectorAll(`input[type="range"]`);

  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];
  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set(`hsl.s`, saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  //Colorize input and sliders
  colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector(`h2`);
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}
function resetInput() {
  const sliders = document.querySelectorAll(`.sliders input`);
  sliders.forEach((slider) => {
    if (slider.name === `hue`) {
      const hueColor = initialColors[slider.getAttribute(`data-hue`)];
      const hueValue = chroma(hueColor).hsl()[0];

      slider.value = Math.floor(hueValue);
    }
    if (slider.name === `brightness`) {
      const brightColor = initialColors[slider.getAttribute(`data-bright`)];
      const brightValue = chroma(brightColor).hsl()[2];

      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === `saturation`) {
      const satColor = initialColors[slider.getAttribute(`data-sat`)];
      const satValue = chroma(satColor).hsl()[1];

      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement(`textarea`);
  el.value = hex.innerText;
  document.body.appendChild(el);

  el.select();
  //Create a function called execCommand means execute the command that is copy here.
  document.execCommand("copy");
  document.body.removeChild(el);
  //popup animation
  const popupBox = popup.children[0];
  popup.classList.add(`active`);
  popupBox.classList.add(`active`);
}
function openAdjustmentPanel(index) {
  sliderContainer[index].classList.toggle(`active`);
}
function lockLayer(e, index) {
  const lockSVG = e.target.children[0];
  const activeBg = colorDivs[index];
  activeBg.classList.toggle("locked");

  if (lockSVG.classList.contains("fa-lock-open")) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}
//Implement Save To Palettes and Local Storage
const saveBtn = document.querySelector(`.save`);
const submitSave = document.querySelector(`.submit-save`);
const closeSave = document.querySelector(`.close-save`);
const saveContainer = document.querySelector(`.save-container`);
const saveInput = document.querySelector(`.save-container input`);
const libraryContainer = document.querySelector(`.library-container`);
const libraryBtn = document.querySelector(`.library`);
const closeLibraryBtn = document.querySelector(`.close-library`);
//
//Event Listeners
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener(`click`, savePalette);
libraryBtn.addEventListener(`click`, openLibrary);
closeLibraryBtn.addEventListener(`click`, closeLibrary);

function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add(`active`);
  popup.classList.add(`active`);
}
function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove(`active`);
  popup.classList.remove(`active`);
}
function savePalette(e) {
  saveContainer.classList.remove(`active`);
  popup.classList.remove(`active`);
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  let paletteNr;
  const paletteObjs = JSON.parse(localStorage.getItem(`palettes`));
  if (paletteObjs) {
    paletteNr = paletteObjs.length;
  } else {
    paletteNr = savedPalettes.length;
  }
  paletteObj = { name, colors, nr: paletteNr };
  savedPalettes.push(paletteObj);
  //save to Local storage
  saveToLocal(paletteObj);
  saveInput.value = ``;
  //Generate the palette for library
  const palette = document.createElement(`div`);
  palette.classList.add(`custom-palette`);
  const title = document.createElement(`h4`);
  title.innerText = paletteObj.name;
  const preview = document.createElement(`div`);
  preview.classList.add(`small-preview`);
  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement(`div`);
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement(`button`);
  paletteBtn.classList.add(`pick-palette-btn`);
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = `Select`;
  //Attach Event to the button
  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInput();
  });

  //Append to Library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);

  //And Finally
  libraryContainer.children[0].appendChild(palette);
}
function saveToLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem(`palettes`) === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem(`palettes`));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem(`palettes`, JSON.stringify(localPalettes));
}

function openLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.add(`active`);
  popup.classList.add(`active`);
}
function closeLibrary() {
  const popup = libraryContainer.children[0];
  libraryContainer.classList.remove(`active`);
  popup.classList.remove(`active`);
}
function getLocal() {
  if (localStorage.getItem(`palettes`) === null) {
    localPalettes = [];
  } else {
    const paletteObjs = JSON.parse(localStorage.getItem(`palettes`));
    savedPalettes = [...paletteObjs];
    paletteObjs.forEach((paletteObj) => {
      //Generate the palette for library
      const palette = document.createElement(`div`);
      palette.classList.add(`custom-palette`);
      const title = document.createElement(`h4`);
      title.innerText = paletteObj.name;
      const preview = document.createElement(`div`);
      preview.classList.add(`small-preview`);
      paletteObj.colors.forEach((smallColor) => {
        const smallDiv = document.createElement(`div`);
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement(`button`);
      paletteBtn.classList.add(`pick-palette-btn`);
      paletteBtn.classList.add(paletteObj.nr);
      paletteBtn.innerText = `Select`;
      //Attach Event to the button
      paletteBtn.addEventListener("click", (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjs[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInput();
      });

      //Append to Library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);

      //And Finally
      libraryContainer.children[0].appendChild(palette);
    });
  }
}

function clearLibrary() {
  const popupBox = clearContainer.children[0];
  clearContainer.classList.add(`active`);
  popupBox.classList.add(`active`);
  localStorage.clear();
}
getLocal();
randomColors();
