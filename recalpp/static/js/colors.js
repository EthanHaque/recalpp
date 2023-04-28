"use strict";

/**
 * Generates a random light color in the form of a string, e.g. "#A0C0F0"
 * @returns {string} - randomly generated light color
 */
function getRandomLightColor() {
    const hue = Math.floor(Math.random() * 360); // 0-359 degrees
    const saturation = Math.floor(Math.random() * 25) + 75; // 75-100%
    const lightness = Math.floor(Math.random() * 25) + 75; // 75-100%
    const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    return color;
  }

function darkenColor(color) {
    const amount = 50; // Adjust this value to make the color darker or lighter
    const [h, s, l] = color.match(/\d+/g); // Extract the HSL values
    const newL = Math.max(l - amount, 0); // Calculate the new lightness value
    return `hsl(${h}, ${s}%, ${newL}%)`; // Return the new color
  }

/**
 * Generates a desaturated color from the given color string by reducing its saturation.
 * @param {string} color - color to be desaturated in the format of a string, e.g. "#A0C0F0"
 * @param {number} amount - amount of desaturation to be applied, range from 0 to 1
 * @returns {string} - desaturated color in the same format as the input color string
 */
 function getDesaturatedColor(color, saturationPercentage) {
    const regex = /hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/;
    const matches = regex.exec(color);
    const hue = matches[1];
    const saturation = matches[2];
    const lightness = matches[3];
    const newSaturation = Math.max(0, saturation - saturationPercentage);
    const newColor = `hsl(${hue}, ${newSaturation}%, ${lightness}%)`;
    return newColor;
  }

  function saturateEvent(event, lightColor, darkColor) {
    event.el.style.backgroundColor = lightColor;
    event.el.style.borderColor = lightColor;
    event.el.style.textColor = darkColor;
  }

  