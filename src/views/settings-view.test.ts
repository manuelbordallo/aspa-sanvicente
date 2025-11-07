import { expect } from '@esm-bundle/chai';
import { fixture, html } from '@open-wc/testing';
import './settings-view';
import { SettingsView } from './settings-view';
import { settingsService } from '../services/settings-service';

describe('SettingsView', () => {
  it('should render the settings view', async () => {
    const el = await fixture<SettingsView>(
      html`<settings-view></settings-view>`
    );
    expect(el).to.exist;
  });

  it('should display the view title', async () => {
    const el = await fixture<SettingsView>(
      html`<settings-view></settings-view>`
    );
    const title = el.shadowRoot?.querySelector('.view-title');
    expect(title?.textContent?.trim()).to.equal('Configuración');
  });

  it('should display theme selector', async () => {
    const el = await fixture<SettingsView>(
      html`<settings-view></settings-view>`
    );
    const themeSelect = el.shadowRoot?.querySelector('ui-select[name="theme"]');
    expect(themeSelect).to.exist;
  });

  it('should display language selector', async () => {
    const el = await fixture<SettingsView>(
      html`<settings-view></settings-view>`
    );
    const languageSelect = el.shadowRoot?.querySelector(
      'ui-select[name="language"]'
    );
    expect(languageSelect).to.exist;
  });

  it('should display current course', async () => {
    const el = await fixture<SettingsView>(
      html`<settings-view></settings-view>`
    );
    const courseDisplay = el.shadowRoot?.querySelector(
      '.course-display, ui-input[name="currentCourse"]'
    );
    expect(courseDisplay).to.exist;
  });

  it('should load settings from service on connect', async () => {
    const settings = settingsService.getSettings();
    const el = await fixture<SettingsView>(
      html`<settings-view></settings-view>`
    );

    // Wait for component to initialize
    await el.updateComplete;

    const themeSelect = el.shadowRoot?.querySelector(
      'ui-select[name="theme"]'
    ) as any;
    expect(themeSelect?.value).to.equal(settings.theme);
  });
});
