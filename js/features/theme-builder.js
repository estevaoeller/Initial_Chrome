export class ThemeBuilderManager {
  constructor() {
    this.presetSelect = null;
    this.builderContainer = null;
    this.previewMockup = null;

    // Custom Theme Color Inputs
    this.colorInputs = {
      '--bg': 'theme-bg',
      '--card': 'theme-card',
      '--text': 'theme-text',
      '--accent': 'theme-accent',
      '--section-bg-color': 'theme-section-bg',
      '--section-line-color': 'theme-section-line',
      '--icon-bg-color': 'theme-card-bg',
      '--icon-border-color': 'theme-card-border',
      '--bookmark-font-color': 'theme-card-text',
      '--filter-color': 'theme-filter-color',
    };

    // Opacity Inputs
    this.opacityInputs = {
      '--section-bg-opacity': 'theme-section-opacity',
      '--icon-bg-opacity': 'theme-card-opacity',
      '--filter-opacity': 'theme-filter-opacity',
    };
  }

  init(presetSelectId, builderContainerId, mockupId) {
    this.presetSelect = document.getElementById(presetSelectId);
    this.builderContainer = document.getElementById(builderContainerId);
    this.previewMockup = document.getElementById(mockupId);

    if (!this.presetSelect || !this.builderContainer || !this.previewMockup) {
      console.warn('Elementos do Theme Builder não encontrados no DOM.');
      return;
    }

    // Toggle visibility of builder
    this.presetSelect.addEventListener('change', () =>
      this.toggleBuilderVisibility(),
    );

    // Attach listeners to update mockup on the fly
    Object.keys(this.colorInputs).forEach((varName) => {
      const el = document.getElementById(this.colorInputs[varName]);
      if (el) {
        const hexText = document.getElementById(
          `${this.colorInputs[varName]}-hex`,
        );
        el.addEventListener('input', () => {
          if (hexText) hexText.textContent = el.value.toUpperCase();
          this.updateMockup();
        });
      }
    });

    Object.keys(this.opacityInputs).forEach((varName) => {
      const el = document.getElementById(this.opacityInputs[varName]);
      if (el) {
        const valText = document.getElementById(
          `${this.opacityInputs[varName]}-value`,
        );
        el.addEventListener('input', () => {
          if (valText) valText.textContent = Number(el.value).toFixed(2);
          this.updateMockup();
        });
      }
    });

    // Save theme button
    const saveBtn = document.getElementById('save-custom-theme-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveTheme());
    }

    // Delete theme button
    const deleteBtn = document.getElementById('delete-custom-theme-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.deleteTheme());
    }

    // Export theme button
    const exportBtn = document.getElementById('export-custom-theme-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportTheme());
    }

    // Import theme button
    const importBtn = document.getElementById('import-custom-theme-btn');
    const importInput = document.getElementById('import-custom-theme-file');
    if (importBtn && importInput) {
      importBtn.addEventListener('click', () => importInput.click());
      importInput.addEventListener('change', (e) => this.importTheme(e));
    }

    // Initial setup
    this.refreshSelectOptions();
  }

  toggleBuilderVisibility() {
    if (this.presetSelect.value === 'custom_builder') {
      this.builderContainer.style.display = 'block';
      this.updateMockup();
    } else {
      this.builderContainer.style.display = 'none';
    }
  }

  updateMockup() {
    if (!this.previewMockup) return;

    // Apply variables from inputs to the mockup container style
    Object.keys(this.colorInputs).forEach((varName) => {
      const el = document.getElementById(this.colorInputs[varName]);
      if (el) {
        this.previewMockup.style.setProperty(varName, el.value);
      }
    });

    Object.keys(this.opacityInputs).forEach((varName) => {
      const el = document.getElementById(this.opacityInputs[varName]);
      if (el) {
        this.previewMockup.style.setProperty(varName, el.value);
      }
    });
  }

  getCurrentThemeConfig(name) {
    const config = {
      name: name,
      variables: {},
    };

    Object.keys(this.colorInputs).forEach((varName) => {
      const el = document.getElementById(this.colorInputs[varName]);
      if (el) config.variables[varName] = el.value;
    });

    Object.keys(this.opacityInputs).forEach((varName) => {
      const el = document.getElementById(this.opacityInputs[varName]);
      if (el) config.variables[varName] = el.value;
    });

    return config;
  }

  saveTheme() {
    const themeNameInput = document.getElementById('custom-theme-name');
    const themeName = themeNameInput ? themeNameInput.value.trim() : '';

    if (!themeName) {
      alert('Por favor, digite um nome para o seu tema.');
      return;
    }

    // Prevent overwriting built-in themes
    const builtIns = ['light', 'dark', 'solar', 'minimal', 'custom_builder'];
    if (builtIns.includes(themeName.toLowerCase())) {
      alert('Este nome é reservado para temas padrões. Escolha outro nome.');
      return;
    }

    const config = this.getCurrentThemeConfig(themeName);

    chrome.storage.sync.get(['customThemes'], (result) => {
      const customThemes = result.customThemes || {};
      customThemes[themeName] = config;

      chrome.storage.sync.set({ customThemes }, () => {
        alert(`Tema "${themeName}" salvo com sucesso!`);
        if (themeNameInput) themeNameInput.value = '';
        this.refreshSelectOptions(themeName);
      });
    });
  }

  deleteTheme() {
    const selected = this.presetSelect.value;
    const builtIns = ['light', 'dark', 'solar', 'minimal', 'custom_builder'];

    if (builtIns.includes(selected)) {
      alert('Não é possível excluir temas padrões.');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o tema "${selected}"?`)) {
      chrome.storage.sync.get(
        ['customThemes', 'extensionSettings'],
        (result) => {
          const customThemes = result.customThemes || {};
          const settings = result.extensionSettings || {};

          delete customThemes[selected];

          // If deleted theme was active, fallback to light theme
          if (settings.themePreset === selected) {
            settings.themePreset = 'light';
          }

          chrome.storage.sync.set(
            { customThemes, extensionSettings: settings },
            () => {
              alert('Tema excluído com sucesso.');
              this.refreshSelectOptions('light');
            },
          );
        },
      );
    }
  }

  exportTheme() {
    const themeNameInput = document.getElementById('custom-theme-name');
    const tentativeName = themeNameInput ? themeNameInput.value.trim() : '';
    const themeName = tentativeName || 'meu-tema-customizado';

    const config = this.getCurrentThemeConfig(themeName);

    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `tema-${themeName.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  importTheme(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        if (!config.name || !config.variables) {
          throw new Error(
            'Configuração de tema inválida: nome ou variáveis faltando.',
          );
        }

        const themeName = config.name;

        chrome.storage.sync.get(['customThemes'], (result) => {
          const customThemes = result.customThemes || {};
          customThemes[themeName] = config;

          chrome.storage.sync.set({ customThemes }, () => {
            alert(`Tema "${themeName}" importado com sucesso!`);
            this.refreshSelectOptions(themeName);
          });
        });
      } catch (err) {
        console.error(err);
        alert('Erro ao importar arquivo de tema: arquivo JSON inválido.');
      }
    };
    reader.readAsText(file);
  }

  refreshSelectOptions(selectedToSet = null) {
    chrome.storage.sync.get(['customThemes', 'extensionSettings'], (result) => {
      const customThemes = result.customThemes || {};
      const settings = result.extensionSettings || {};
      const activeTheme = selectedToSet || settings.themePreset || 'light';

      // Clear dynamic custom options (keep built-ins)
      const selectEl = this.presetSelect;

      // Collect built-in option elements
      const builtInOptions = [];
      for (let i = 0; i < selectEl.options.length; i++) {
        const opt = selectEl.options[i];
        if (
          [
            'auto',
            'light',
            'dark',
            'solar',
            'minimal',
            'custom_builder',
          ].includes(opt.value)
        ) {
          builtInOptions.push({
            value: opt.value,
            text: opt.text,
          });
        }
      }

      // Rebuild dropdown
      selectEl.innerHTML = '';

      // Add standard options first
      builtInOptions.forEach((opt) => {
        if (opt.value !== 'custom_builder') {
          const option = document.createElement('option');
          option.value = opt.value;
          option.textContent = opt.text;
          selectEl.appendChild(option);
        }
      });

      // Add custom themes
      const customNames = Object.keys(customThemes);
      if (customNames.length > 0) {
        const group = document.createElement('optgroup');
        group.label = '🎨 Temas Personalizados';
        customNames.forEach((name) => {
          const option = document.createElement('option');
          option.value = name;
          option.textContent = `⭐ ${name}`;
          group.appendChild(option);
        });
        selectEl.appendChild(group);
      }

      // Put Custom Builder at the very bottom
      const builderOpt = builtInOptions.find(
        (o) => o.value === 'custom_builder',
      ) || { value: 'custom_builder', text: '🎨 Criar Tema Customizado...' };
      const option = document.createElement('option');
      option.value = builderOpt.value;
      option.textContent = builderOpt.text;
      selectEl.appendChild(option);

      // Set selected value
      selectEl.value = activeTheme;

      // Trigger visibility
      this.toggleBuilderVisibility();

      // Populate builder input fields with values if we selected a custom theme
      if (customThemes[activeTheme]) {
        const config = customThemes[activeTheme];
        Object.keys(this.colorInputs).forEach((varName) => {
          const el = document.getElementById(this.colorInputs[varName]);
          if (el && config.variables[varName]) {
            el.value = config.variables[varName];
            const hexText = document.getElementById(
              `${this.colorInputs[varName]}-hex`,
            );
            if (hexText) hexText.textContent = el.value.toUpperCase();
          }
        });

        Object.keys(this.opacityInputs).forEach((varName) => {
          const el = document.getElementById(this.opacityInputs[varName]);
          if (el && config.variables[varName] !== undefined) {
            el.value = config.variables[varName];
            const valText = document.getElementById(
              `${this.opacityInputs[varName]}-value`,
            );
            if (valText) valText.textContent = Number(el.value).toFixed(2);
          }
        });
        this.updateMockup();
      }
    });
  }
}
