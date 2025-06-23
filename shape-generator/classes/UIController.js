import { getObjValueByPath, setObjValueByPath } from "../../utils.js";
import { UI_CONFIG, CONFIG } from "../config.js";

export class UIController {
  constructor(config, updateCallback = null) {
    this.config = config;
    this.controls = new Map();
    this.callback = updateCallback;
  }

  setUpdateCallback(callback) {
    this.callback = callback;
  }

  init() {
    this.setupSliders();
    this.setupToggles();
    this.setupButtons();
    // Add any additional UI setup here
    console.log("UIController initialized with config:", this.config);
  }

  setupToggles() {
    UI_CONFIG.toggles.forEach(({ id, path }) => {
      const toggle = document.getElementById(id);
      if (!toggle) {
        console.warn(`Toggle with id ${id} not found`);
        return;
      }
      toggle.checked = getObjValueByPath(this.config, path, false);
      console.log("set up toggle:", id, "with value:", toggle.checked);
      toggle.addEventListener("change", (e) => {
        console.log(`Toggle ${id} changed:`, e.target.checked);
        const value = e.target.checked;
        setObjValueByPath(this.config, path, value);
        this.controls.set(path, value);
        if (UI_CONFIG.toggles.find((t) => t.id === id)?.toggles) {
          UI_CONFIG.toggles
            .find((t) => t.id === id)
            .toggles.forEach((toggleId) => {
              const toggleElement = document.getElementById(toggleId);
              if (toggleElement) {
                toggleElement.disabled = !value;
              }
            });
        }
        if (this.callback) {
          this.callback(this.config);
        }
      });
    });
  }

  setupButtons() {
    UI_CONFIG.buttons.forEach(({ id }) => {
      const button = document.getElementById(id);
      if (!button) {
        console.warn(`Button with id ${id} not found`);
        return;
      }
      if (id === "randomize-dots") {
        button.addEventListener("click", () => {
          this.config.randomSeed = Math.floor(Math.random() * 1000000);
          console.log("Randomizing dots", this.config.randomSeed);

          if (this.callback) {
            this.callback(this.config);
          }
        });
      }
    });
  }

  setupSliders() {
    UI_CONFIG.sliders.forEach(({ id, label, path, min, max, step }) => {
      const slider = document.getElementById(id);
      if (!slider) {
        console.warn(`Slider with id ${id} not found`);
        return;
      }
      slider.min = min;
      slider.max = max;
      slider.step = step;
      slider.value = getObjValueByPath(this.config, path, 0);
      console.log("set up slider:", id, "with value:", slider.value);
      const labelELem = document.querySelector(`label[for="${id}"]`);
      if (labelELem) {
        labelELem.textContent = `${label}: ${slider.value}`;
      }
      slider.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        if (labelELem) {
          labelELem.textContent = `${label}: ${value}`;
        }
        setObjValueByPath(this.config, path, value);
        this.controls.set(path, value);
        if (this.callback) {
          this.callback(this.config);
        }
      });
    });
  }
}
